const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Utilisateur = require('../Models/Utilisateur');
const router = express.Router();

// Configuration de l'envoi d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const utilisateur = new Utilisateur({ nom, email, motDePasse: hashedPassword, role });
    await utilisateur.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de l\'inscription', error: err.message });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const isMatch = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign({ id: utilisateur._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    utilisateur.resetToken = resetToken;
    utilisateur.resetTokenExpiration = Date.now() + 3600000; // Expire dans 1 heure
    await utilisateur.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de mot de passe',
      text: `Vous avez demandé une réinitialisation de mot de passe. Cliquez sur ce lien : http://localhost:4200/reset-password/${resetToken}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Lien de réinitialisation envoyé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du lien', error: err.message });
  }
});

module.exports = router;