const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Utilisateur = require('../Models/Utilisateur');
const config = require('../Config/db.json');
const router = express.Router();

// Configuration de l'envoi d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'votre-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'votre-mot-de-passe'
  }
});

// Login (cette fonction peut être déplacée vers UtilisateurController)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Rechercher l'utilisateur par email
    const utilisateur = await Utilisateur.findOne({ email }).populate("role");
    
    if (!utilisateur) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Vérifier si le compte est actif
    if (!utilisateur.actif) {
      return res.status(403).json({ message: "Compte désactivé. Contactez l'administrateur" });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, utilisateur.password);
    
    if (!isValidPassword) {
      // Incrémenter le compteur de tentatives de connexion
      utilisateur.tentativesConnexion += 1;
      
      // Désactiver le compte après 5 tentatives
      if (utilisateur.tentativesConnexion >= 5) {
        utilisateur.actif = false;
      }
      
      await utilisateur.save();
      
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Réinitialiser le compteur de tentatives de connexion
    utilisateur.tentativesConnexion = 0;
    utilisateur.dernierConnexion = new Date();
    await utilisateur.save();

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: utilisateur._id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role
      },
      config.jwtSecret,
      { expiresIn: '8h' }
    );

    // Renvoyer les informations de l'utilisateur sans le mot de passe
    const userWithoutPassword = { ...utilisateur.toObject() };
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
});

module.exports = router;