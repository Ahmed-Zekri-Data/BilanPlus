const Utilisateur = require("../Models/Utilisateur");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../Config/db.json");
const nodemailer = require("nodemailer");

// Configuration du transporteur email (à adapter selon votre configuration)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'votre-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'votre-mot-de-passe'
  }
});

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find()
      .select("-password")
      .populate("role", "nom description");
    
    res.status(200).json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtenir un utilisateur par son ID
exports.getUserById = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id)
      .select("-password")
      .populate("role", "nom description permissions");
    
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(utilisateur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const { 
      nom, prenom, email, password, role, telephone, 
      adresse, preferences 
    } = req.body;
    
    // Vérifier si l'email existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    
    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Création de l'utilisateur
    const newUser = new Utilisateur({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role,
      telephone,
      adresse,
      preferences
    });
    
    await newUser.save();
    
    // Envoyer un email de bienvenue
    const mailOptions = {
      from: process.env.EMAIL_USER || 'votre-email@gmail.com',
      to: email,
      subject: 'Bienvenue sur BilanPlus',
      html: `
        <h1>Bienvenue sur BilanPlus, ${prenom} ${nom} !</h1>
        <p>Votre compte a été créé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter en utilisant votre email et le mot de passe que vous avez fourni.</p>
      `
    };
    
    transporter.sendMail(mailOptions);
    
    res.status(201).json({ 
      message: "Utilisateur créé avec succès",
      utilisateur: {
        id: newUser._id,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { 
      nom, prenom, email, role, telephone, 
      adresse, actif, preferences 
    } = req.body;
    
    // Vérifier si on essaie de mettre à jour l'email et s'il existe déjà
    if (email) {
      const utilisateurExistant = await Utilisateur.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      
      if (utilisateurExistant) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }
    
    const updateData = {
      nom, prenom, email, role, telephone, adresse, actif, preferences
    };
    
    // Supprimer les champs undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");
    
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json({ 
      message: "Utilisateur mis à jour avec succès",
      utilisateur
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer un utilisateur (désactivation)
exports.deleteUser = async (req, res) => {
  try {
    // Au lieu de supprimer, nous désactivons l'utilisateur
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    );
    
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json({ message: "Utilisateur désactivé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Connexion utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findOne({ email })
      .populate("role", "nom permissions");
    
    if (!utilisateur) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    
    // Vérifier si le compte est actif
    if (!utilisateur.actif) {
      return res.status(403).json({ message: "Ce compte a été désactivé" });
    }
    
    // Vérifier si le compte est verrouillé
    if (utilisateur.estVerrouille()) {
      return res.status(403).json({ 
        message: "Compte verrouillé. Veuillez réinitialiser votre mot de passe" 
      });
    }
    
    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, utilisateur.password);
    
    if (!validPassword) {
      // Incrémenter les tentatives de connexion
      utilisateur.tentativesConnexion += 1;
      await utilisateur.save();
      
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    
    // Réinitialiser les tentatives de connexion et mettre à jour la dernière connexion
    utilisateur.tentativesConnexion = 0;
    utilisateur.dernierConnexion = new Date();
    await utilisateur.save();
    
    // Générer un token JWT
    const token = jwt.sign(
      { 
        id: utilisateur._id,
        role: utilisateur.role.nom,
        permissions: utilisateur.role.permissions
      },
      config.jwtSecret,
      { expiresIn: "8h" }
    );
    
    res.status(200).json({
      message: "Connexion réussie",
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role.nom,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Demande de réinitialisation de mot de passe
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const utilisateur = await Utilisateur.findOne({ email });
    
    if (!utilisateur) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return res.status(200).json({ 
        message: "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé" 
      });
    }
    
    // Générer un token de réinitialisation
    const token = await utilisateur.genererTokenReinitialisation();
    
    // Envoyer l'email de réinitialisation
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'votre-email@gmail.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe BilanPlus',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    };
    
    transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé" 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const utilisateur = await Utilisateur.findOne({
      tokenReinitialisation: token,
      dateExpirationToken: { $gt: Date.now() }
    });
    
    if (!utilisateur) {
      return res.status(400).json({ 
        message: "Le lien de réinitialisation est invalide ou a expiré" 
      });
    }
    
    // Hachage du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mise à jour du mot de passe et réinitialisation des tentatives
    utilisateur.password = hashedPassword;
    utilisateur.tokenReinitialisation = undefined;
    utilisateur.dateExpirationToken = undefined;
    utilisateur.tentativesConnexion = 0;
    
    await utilisateur.save();
    
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Méthode métier 1: Analyser l'activité des utilisateurs
exports.analyserActiviteUtilisateurs = async (req, res) => {
  try {
    const joursPasses = req.query.jours || 30;
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - joursPasses);
    
    const stats = await Utilisateur.aggregate([
      {
        $match: {
          dernierConnexion: { $gte: dateDebut }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$dernierConnexion" }
          },
          nombreConnexions: { $sum: 1 },
          utilisateurs: { $push: { id: "$_id", nom: "$nom", prenom: "$prenom" } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Statistiques par rôle
    const statsParRole = await Utilisateur.aggregate([
      {
        $match: {
          dernierConnexion: { $gte: dateDebut }
        }
      },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "roleInfo"
        }
      },
      {
        $unwind: "$roleInfo"
      },
      {
        $group: {
          _id: "$roleInfo.nom",
          count: { $sum: 1 },
          utilisateurs: { $push: { id: "$_id", nom: "$nom", prenom: "$prenom" } }
        }
      }
    ]);
    
    res.status(200).json({
      message: "Statistiques d'activité des utilisateurs récupérées avec succès",
      connexionsParJour: stats,
      connexionsParRole: statsParRole
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Méthode métier 2: Exporter les données utilisateurs en format CSV
exports.exporterUtilisateursCSV = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find()
      .select("-password -__v")
      .populate("role", "nom description");
    
    // Création de l'en-tête CSV
    let csv = "ID,Nom,Prénom,Email,Téléphone,Adresse,Rôle,Actif,Date de création,Dernière connexion\n";
    
    // Ajout des données utilisateur
    utilisateurs.forEach(user => {
      const dateCreation = user.dateCreation ? new Date(user.dateCreation).toLocaleString() : '';
      const dernierConnexion = user.dernierConnexion ? new Date(user.dernierConnexion).toLocaleString() : '';
      
      csv += `${user._id},${user.nom},${user.prenom},${user.email},${user.telephone || ''},`;
      csv += `"${user.adresse || ''}",${user.role.nom},${user.actif},${dateCreation},${dernierConnexion}\n`;
    });
    
    // Configuration de la réponse pour le téléchargement du fichier
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=utilisateurs.csv');
    
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};