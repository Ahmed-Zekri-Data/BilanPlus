const Utilisateur = require("../Models/Utilisateur");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configuration du transporteur email
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
      .populate("role", "nom description permissions");

    res.status(200).json(utilisateurs);
  } catch (err) {
    console.error("Erreur getAllUsers:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
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
    console.error("Erreur getUserById:", err);
    res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
};

// Login
exports.login = async (req, res) => {
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
      process.env.JWT_SECRET,
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
};

// Création d'utilisateur
exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, telephone, adresse } = req.body;

    // Validation des données
    if (!nom || !prenom || !email || !password || !role) {
      return res.status(400).json({ 
        message: "Veuillez fournir tous les champs obligatoires (nom, prénom, email, mot de passe, rôle)" 
      });
    }

    // Vérifier si l'email existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur
    const newUser = new Utilisateur({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role,
      telephone,
      adresse
    });

    // Sauvegarder l'utilisateur
    const savedUser = await newUser.save();

    // Retourner l'utilisateur sans le mot de passe
    const userWithoutPassword = { ...savedUser.toObject() };
    delete userWithoutPassword.password;

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création de l'utilisateur" });
  }
};

// Mise à jour d'un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { nom, prenom, email, role, telephone, adresse, actif } = req.body;
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== utilisateur.email) {
      const emailExistant = await Utilisateur.findOne({ email });
      if (emailExistant) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    // Mettre à jour les champs
    if (nom) utilisateur.nom = nom;
    if (prenom) utilisateur.prenom = prenom;
    if (email) utilisateur.email = email;
    if (role) utilisateur.role = role;
    if (telephone !== undefined) utilisateur.telephone = telephone;
    if (adresse !== undefined) utilisateur.adresse = adresse;
    if (actif !== undefined) utilisateur.actif = actif;

    // Sauvegarder les modifications
    const updatedUser = await utilisateur.save();

    // Retourner l'utilisateur sans le mot de passe
    const userWithoutPassword = { ...updatedUser.toObject() };
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Erreur updateUser:", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

// Suppression d'un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer l'utilisateur
    await Utilisateur.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Utilisateur supprimé avec succès"
    });
  } catch (err) {
    console.error("Erreur deleteUser:", err);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
};

// Réinitialisation des tentatives de connexion
exports.resetLoginAttempts = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Réinitialiser les tentatives et réactiver le compte
    utilisateur.tentativesConnexion = 0;
    utilisateur.actif = true;
    await utilisateur.save();

    res.status(200).json({
      message: "Tentatives de connexion réinitialisées avec succès"
    });
  } catch (err) {
    console.error("Erreur resetLoginAttempts:", err);
    res.status(500).json({ message: "Erreur lors de la réinitialisation des tentatives de connexion" });
  }
};

// Mise à jour du mot de passe
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Validation des données
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mot de passe actuel et nouveau mot de passe requis" });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier que l'utilisateur connecté est bien le propriétaire du compte ou un admin
    if (req.user.id !== userId && !req.user.role.permissions.parametresSysteme) {
      return res.status(403).json({ message: "Non autorisé à modifier ce mot de passe" });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, utilisateur.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    utilisateur.password = hashedPassword;
    await utilisateur.save();

    res.status(200).json({
      message: "Mot de passe mis à jour avec succès"
    });
  } catch (err) {
    console.error("Erreur updatePassword:", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe" });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    console.log('RequestPasswordReset: Received request with body:', req.body);
    
    const { email } = req.body;
    console.log('RequestPasswordReset: Email provided:', email);
    
    if (!email) {
      console.log('RequestPasswordReset: Email is missing');
      return res.status(400).json({ message: "L'email est requis" });
    }
    
    console.log('RequestPasswordReset: Searching for user with email:', email);
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      console.log('RequestPasswordReset: User not found for email:', email);
      return res.status(200).json({ 
        message: "Si un compte avec cet email existe, un lien de réinitialisation sera envoyé" 
      });
    }
    
    console.log('RequestPasswordReset: User found:', utilisateur.email);
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    console.log('RequestPasswordReset: Generated token:', resetToken);
    
    utilisateur.resetPasswordToken = resetToken;
    utilisateur.resetPasswordExpires = resetTokenExpiry;
    console.log('RequestPasswordReset: Saving user with new token');
    await utilisateur.save();
    
    console.log('RequestPasswordReset: Constructing reset URL');
    const resetUrl = `${req.protocol || 'http'}://${req.get('host') || 'localhost:3000'}/reset-password/${resetToken}`;
    console.log('RequestPasswordReset: Reset URL:', resetUrl);
    
    // Email sending skipped to avoid SMTP errors
    console.log('RequestPasswordReset: Email sending skipped for testing');
    
    res.status(200).json({
      message: "Si un compte avec cet email existe, un lien de réinitialisation sera envoyé"
    });
  } catch (err) {
    console.error("Erreur requestPasswordReset détaillée:", err.message, err.stack);
    res.status(500).json({ message: "Erreur lors de la demande de réinitialisation du mot de passe", error: err.message });
  }
};

// Réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token et nouveau mot de passe requis" });
    }
    
    // Rechercher l'utilisateur avec le token valide
    const utilisateur = await Utilisateur.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!utilisateur) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }
    
    // Vérifier la complexité du mot de passe
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }
    
    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mettre à jour l'utilisateur
    utilisateur.password = hashedPassword;
    utilisateur.resetPasswordToken = undefined;
    utilisateur.resetPasswordExpires = undefined;
    
    await utilisateur.save();
    
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("Erreur resetPassword:", err);
    res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe" });
  }
};

// Analyse de l'activité des utilisateurs
exports.analyserActiviteUtilisateurs = async (req, res) => {
  try {
    const derniereMois = new Date();
    derniereMois.setMonth(derniereMois.getMonth() - 1);
    
    const stats = {
      totalUtilisateurs: await Utilisateur.countDocuments(),
      actifs: await Utilisateur.countDocuments({ actif: true }),
      inactifs: await Utilisateur.countDocuments({ actif: false }),
      nouveaux: await Utilisateur.countDocuments({ dateCreation: { $gte: derniereMois } }),
      connexionsRecentes: await Utilisateur.countDocuments({ dernierConnexion: { $gte: derniereMois } })
    };
    
    res.status(200).json(stats);
  } catch (err) {
    console.error("Erreur analyserActiviteUtilisateurs:", err);
    res.status(500).json({ message: "Erreur lors de l'analyse de l'activité des utilisateurs" });
  }
};

// Export des utilisateurs au format CSV
exports.exportUsersToCSV = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find()
      .select("-password")
      .populate("role", "nom");
    
    let csv = "ID,Nom,Prénom,Email,Rôle,Actif,Date Création\n";
    
    utilisateurs.forEach(user => {
      csv += `${user._id},${user.nom},${user.prenom},${user.email},${user.role ? user.role.nom : 'N/A'},${user.actif},${user.dateCreation}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=utilisateurs.csv');
    res.status(200).send(csv);
  } catch (err) {
    console.error("Erreur exportUsersToCSV:", err);
    res.status(500).json({ message: "Erreur lors de l'export des utilisateurs en CSV" });
  }
};