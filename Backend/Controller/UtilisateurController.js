const Utilisateur = require('../Models/Utilisateur');
const Role = require('../Models/Role');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../Config/db.json');
const mongoose = require('mongoose');
const fs = require('fs');
const createTransporter = require('../emailConfig');

exports.getAllUsers = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find().select('-password').populate('role');
    res.status(200).json({ utilisateurs });
  } catch (err) {
    console.error('Erreur getAllUsers:', err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs", error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id).select('-password').populate('role');
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json({ utilisateur });
  } catch (err) {
    console.error('Erreur getUserById:', err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'utilisateur", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login: Received request with body:', req.body);
    const { email, password } = req.body;
    console.log('Login: Email:', email, 'Password:', password);

    if (!email || !password) {
      console.log('Login: Missing email or password');
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Récupérer l'adresse IP et le navigateur
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const navigateur = req.headers['user-agent'];

    console.log('Login: Searching for user with email:', email);
    const utilisateur = await Utilisateur.findOne({ email }).populate("role");
    if (!utilisateur) {
      console.log('Login: User not found for email:', email);
      // Enregistrer la tentative de connexion échouée pour un utilisateur inconnu
      try {
        await require('../Models/Audit').LoginHistory.logLogin(
          null,
          false,
          ip,
          navigateur,
          `Tentative de connexion avec un email inconnu: ${email}`
        );
      } catch (auditErr) {
        console.error('Erreur lors de l\'enregistrement de la tentative de connexion:', auditErr);
        // Ne pas bloquer le processus si l'audit échoue
      }
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    console.log('Login: User found:', utilisateur.email, 'Actif:', utilisateur.actif);
    if (!utilisateur.actif) {
      console.log('Login: User account is inactive:', email);
      return res.status(403).json({ message: "Compte désactivé. Contactez l'administrateur" });
    }

    console.log('Login: Checking for motDePasse field (temporary fix)...');
    let passwordToCompare = utilisateur.password;
    if (!passwordToCompare && utilisateur.motDePasse) {
      console.log('Login: Found motDePasse instead of password, converting...');
      passwordToCompare = await bcrypt.hash(utilisateur.motDePasse, 10);
      utilisateur.password = passwordToCompare;
      utilisateur.motDePasse = undefined;
      await utilisateur.save();
      console.log('Login: Converted motDePasse to password for user:', email);
    }

    if (!passwordToCompare) {
      console.log('Login: No password field found for user:', email);
      return res.status(500).json({ message: "Erreur: champ mot de passe manquant" });
    }

    console.log('Login: Comparing password for user:', email);
    const isValidPassword = await bcrypt.compare(password, passwordToCompare);
    console.log('Login: Password comparison result:', isValidPassword);
    if (!isValidPassword) {
      utilisateur.tentativesConnexion += 1;
      console.log('Login: Incrementing tentativesConnexion to:', utilisateur.tentativesConnexion);
      if (utilisateur.tentativesConnexion >= 5) {
        utilisateur.actif = false;
        console.log('Login: Deactivating account due to too many attempts:', email);
      }

      // Enregistrer la tentative de connexion échouée
      try {
        await utilisateur.logLogin(false, ip, navigateur, "Mot de passe incorrect");

        // Enregistrer dans l'historique global
        await require('../Models/Audit').LoginHistory.logLogin(
          utilisateur._id,
          false,
          ip,
          navigateur,
          "Mot de passe incorrect"
        );
      } catch (auditErr) {
        console.error('Erreur lors de l\'enregistrement de la tentative de connexion:', auditErr);
        // Ne pas bloquer le processus si l'audit échoue
      }

      await utilisateur.save();
      console.log('Login: Updated user after failed login attempt:', utilisateur);
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    utilisateur.tentativesConnexion = 0;
    utilisateur.dernierConnexion = new Date();

    // Enregistrer la connexion réussie
    try {
      await utilisateur.logLogin(true, ip, navigateur, "Connexion réussie");

      // Enregistrer dans l'historique global
      await require('../Models/Audit').LoginHistory.logLogin(
        utilisateur._id,
        true,
        ip,
        navigateur,
        "Connexion réussie"
      );
    } catch (auditErr) {
      console.error('Erreur lors de l\'enregistrement de la connexion réussie:', auditErr);
      // Ne pas bloquer le processus si l'audit échoue
    }

    await utilisateur.save();

    console.log('Login: Signing token with jwtSecret:', config.jwtSecret);
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
    console.log('Login: Generated token:', token);

    const userWithoutPassword = { ...utilisateur.toObject() };
    delete userWithoutPassword.password;
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Erreur login détaillée:", err.message, err.stack);
    res.status(500).json({ message: "Erreur serveur lors de la connexion", error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, telephone, adresse } = req.body;
    if (!nom || !prenom || !email || !password || !role) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    // Validate role ID
    if (!mongoose.Types.ObjectId.isValid(role)) {
      return res.status(400).json({ message: "ID de rôle invalide" });
    }
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }

    const existingUser = await Utilisateur.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const utilisateur = new Utilisateur({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role,
      telephone,
      adresse,
      actif: true,
      tentativesConnexion: 0,
      preferences: { theme: 'light', langue: 'fr', notificationsEmail: true },
      dateCreation: new Date()
    });

    const savedUser = await utilisateur.save();
    const userWithoutPassword = { ...savedUser.toObject() };
    delete userWithoutPassword.password;
    res.status(201).json({ message: "Utilisateur créé", utilisateur: userWithoutPassword });
  } catch (err) {
    console.error('Erreur createUser:', err);
    res.status(500).json({ message: "Erreur serveur lors de la création de l'utilisateur", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const { nom, prenom, email, role, telephone, adresse, actif, password } = req.body;
    if (nom) utilisateur.nom = nom;
    if (prenom) utilisateur.prenom = prenom;
    if (email) utilisateur.email = email;
    if (role) {
      if (!mongoose.Types.ObjectId.isValid(role)) {
        return res.status(400).json({ message: "ID de rôle invalide" });
      }
      const roleExists = await Role.findById(role);
      if (!roleExists) {
        return res.status(404).json({ message: "Rôle non trouvé" });
      }
      utilisateur.role = role;
    }
    if (telephone) utilisateur.telephone = telephone;
    if (adresse) utilisateur.adresse = adresse;
    if (actif !== undefined) utilisateur.actif = actif;

    // Mise à jour du mot de passe si fourni
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      utilisateur.password = hashedPassword;
    }

    const updatedUser = await utilisateur.save();
    const userWithoutPassword = { ...updatedUser.toObject() };
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      utilisateur: userWithoutPassword
    });
  } catch (err) {
    console.error('Erreur updateUser:', err);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour de l'utilisateur",
      error: err.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json({ message: "Utilisateur supprimé" });
  } catch (err) {
    console.error('Erreur deleteUser:', err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'utilisateur", error: err.message });
  }
};

exports.resetLoginAttempts = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });
    utilisateur.tentativesConnexion = 0;
    utilisateur.actif = true;
    await utilisateur.save();

    // Enregistrer l'action
    await utilisateur.logAction("Réinitialisation des tentatives de connexion", `Réinitialisé par ${req.user.nom} ${req.user.prenom}`);

    // Enregistrer dans l'audit global
    await require('../Models/Audit').AuditLog.logAction(
      req.user._id,
      "Réinitialisation des tentatives de connexion",
      `Réinitialisation des tentatives de connexion pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom} (${utilisateur.email})`,
      req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      req.headers['user-agent']
    );

    res.status(200).json({ message: "Tentatives de connexion réinitialisées et compte réactivé" });
  } catch (err) {
    console.error('Erreur resetLoginAttempts:', err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    console.log('toggleUserStatus: Requête reçue', req.params.id, req.body);

    // Utiliser updateOne au lieu de findById + save pour éviter les problèmes de concurrence
    const result = await Utilisateur.updateOne(
      { _id: req.params.id },
      { $set: { actif: req.body.actif } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé ou supprimé" });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Aucune modification n'a été effectuée" });
    }

    // Récupérer l'utilisateur mis à jour pour la réponse
    const utilisateur = await Utilisateur.findById(req.params.id).select('-password');
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé après mise à jour" });
    }

    const actionType = req.body.actif ? "Activation du compte" : "Désactivation du compte";

    // Enregistrer dans l'audit global sans utiliser la méthode logAction
    try {
      const AuditLog = require('../Models/Audit').AuditLog;
      const auditLog = new AuditLog({
        utilisateur: req.user._id,
        action: actionType,
        details: `${actionType} pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom} (${utilisateur.email})`,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        navigateur: req.headers['user-agent'],
        date: new Date()
      });

      // Sauvegarder l'audit en arrière-plan sans attendre
      auditLog.save().catch(err => {
        console.error('Erreur lors de l\'enregistrement de l\'audit en arrière-plan:', err);
      });

      console.log('toggleUserStatus: Action enregistrée dans l\'audit global');
    } catch (auditErr) {
      console.error('toggleUserStatus: Erreur lors de l\'enregistrement dans l\'audit global:', auditErr);
      // Ne pas bloquer le processus si l'enregistrement dans l'audit échoue
    }

    res.status(200).json({
      message: req.body.actif ? "Utilisateur activé avec succès" : "Utilisateur désactivé avec succès",
      utilisateur: {
        _id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        actif: utilisateur.actif
      }
    });
  } catch (err) {
    console.error('Erreur toggleUserStatus:', err);
    res.status(500).json({ message: "Erreur serveur lors de la modification du statut de l'utilisateur", error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isValidPassword = await bcrypt.compare(oldPassword, utilisateur.password);
    if (!isValidPassword) return res.status(401).json({ message: "Ancien mot de passe incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    utilisateur.password = hashedPassword;
    await utilisateur.save();
    res.status(200).json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error('Erreur updatePassword:', err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    console.log('requestPasswordReset: Début de la demande de réinitialisation');
    const { email } = req.body;
    console.log('requestPasswordReset: Email reçu:', email);

    if (!email) {
      console.log('requestPasswordReset: Email manquant dans la requête');
      return res.status(400).json({ message: "L'adresse email est requise" });
    }

    // Recherche de l'utilisateur
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      console.log('requestPasswordReset: Aucun utilisateur trouvé avec cet email:', email);
      // Pour des raisons de sécurité, ne pas indiquer que l'email n'existe pas
      return res.status(200).json({ message: "Si un compte avec cet email existe, un lien de réinitialisation sera envoyé" });
    }

    console.log('requestPasswordReset: Utilisateur trouvé:', utilisateur.email);

    // Génération du token de réinitialisation
    const resetToken = jwt.sign({ id: utilisateur._id }, config.jwtSecret, { expiresIn: '1h' });
    console.log('requestPasswordReset: Token généré, longueur:', resetToken.length);

    // Mise à jour de l'utilisateur avec le token
    utilisateur.resetPasswordToken = resetToken;
    utilisateur.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await utilisateur.save();
    console.log('requestPasswordReset: Token sauvegardé dans la base de données');

    // Création du lien de réinitialisation (utiliser l'URL du frontend)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    console.log('requestPasswordReset: Lien de réinitialisation:', resetLink);

    // Préparation de l'email
    try {
      console.log('requestPasswordReset: Création du transporteur email');
      const transporter = createTransporter();

      const mailOptions = {
        from: `"BilanPlus" <${process.env.EMAIL_USER}>`,
        to: utilisateur.email,
        subject: 'Réinitialisation de votre mot de passe - BilanPlus',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://i.imgur.com/YourLogo.png" alt="BilanPlus Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: #1E3A8A; text-align: center;">Réinitialisation de mot de passe</h2>
            <p>Bonjour ${utilisateur.prenom},</p>
            <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte BilanPlus.</p>
            <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #1E3A8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Réinitialiser mon mot de passe</a>
            </div>
            <p>Ou copiez et collez ce lien dans votre navigateur :</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">${resetLink}</p>
            <p><strong>Ce lien est valide pendant 1 heure.</strong></p>
            <p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} BilanPlus. Tous droits réservés.</p>
            </div>
          </div>
        `,
      };

      console.log('requestPasswordReset: Envoi de l\'email à', utilisateur.email);
      await transporter.sendMail(mailOptions);
      console.log('requestPasswordReset: Email envoyé avec succès à', utilisateur.email);

      // Enregistrer l'action dans l'audit
      try {
        const AuditLog = require('../Models/Audit').AuditLog;
        const auditLog = new AuditLog({
          utilisateur: utilisateur._id,
          action: "Demande de réinitialisation de mot de passe",
          details: `Demande de réinitialisation de mot de passe pour l'utilisateur ${utilisateur.email}`,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          navigateur: req.headers['user-agent'],
          date: new Date()
        });

        auditLog.save().catch(err => {
          console.error('Erreur lors de l\'enregistrement de l\'audit:', err);
        });
      } catch (auditErr) {
        console.error('Erreur lors de l\'enregistrement de l\'audit:', auditErr);
      }

      res.status(200).json({ message: "Lien de réinitialisation envoyé par email" });
    } catch (emailErr) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailErr);

      // Annuler les modifications si l'email n'a pas pu être envoyé
      utilisateur.resetPasswordToken = undefined;
      utilisateur.resetPasswordExpires = undefined;
      await utilisateur.save();

      throw emailErr; // Relancer l'erreur pour qu'elle soit capturée par le bloc catch principal
    }
  } catch (err) {
    console.error('Erreur requestPasswordReset:', err);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email de réinitialisation", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    console.log('resetPassword: Début de la réinitialisation du mot de passe');
    const { token, newPassword, email } = req.body;

    if (!token || !newPassword) {
      console.log('resetPassword: Token ou nouveau mot de passe manquant');
      return res.status(400).json({ message: "Le token et le nouveau mot de passe sont requis" });
    }

    console.log('resetPassword: Vérification du token');
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
      console.log('resetPassword: Token vérifié, ID utilisateur:', decoded.id);
    } catch (jwtErr) {
      console.error('resetPassword: Erreur de vérification du token:', jwtErr);
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    // Recherche de l'utilisateur avec le token
    console.log('resetPassword: Recherche de l\'utilisateur avec le token');
    const utilisateur = await Utilisateur.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!utilisateur) {
      console.log('resetPassword: Aucun utilisateur trouvé avec ce token ou token expiré');
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    console.log('resetPassword: Utilisateur trouvé:', utilisateur.email);

    // Vérification de la complexité du mot de passe
    if (newPassword.length < 8) {
      console.log('resetPassword: Mot de passe trop court');
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    // Hachage et enregistrement du nouveau mot de passe
    console.log('resetPassword: Hachage du nouveau mot de passe');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    utilisateur.password = hashedPassword;
    utilisateur.resetPasswordToken = undefined;
    utilisateur.resetPasswordExpires = undefined;

    // Réinitialisation des tentatives de connexion et activation du compte
    utilisateur.tentativesConnexion = 0;
    utilisateur.actif = true;

    await utilisateur.save();
    console.log('resetPassword: Mot de passe mis à jour avec succès');

    // Enregistrer l'action dans l'audit
    try {
      const AuditLog = require('../Models/Audit').AuditLog;
      const auditLog = new AuditLog({
        utilisateur: utilisateur._id,
        action: "Réinitialisation de mot de passe",
        details: `Mot de passe réinitialisé pour l'utilisateur ${utilisateur.email}`,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        navigateur: req.headers['user-agent'],
        date: new Date()
      });

      auditLog.save().catch(err => {
        console.error('Erreur lors de l\'enregistrement de l\'audit:', err);
      });
    } catch (auditErr) {
      console.error('Erreur lors de l\'enregistrement de l\'audit:', auditErr);
    }

    // Envoi d'un email de confirmation
    try {
      console.log('resetPassword: Envoi d\'un email de confirmation');
      const transporter = createTransporter();

      const mailOptions = {
        from: `"BilanPlus" <${process.env.EMAIL_USER}>`,
        to: utilisateur.email,
        subject: 'Confirmation de réinitialisation de mot de passe - BilanPlus',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://i.imgur.com/YourLogo.png" alt="BilanPlus Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: #1E3A8A; text-align: center;">Mot de passe réinitialisé avec succès</h2>
            <p>Bonjour ${utilisateur.prenom},</p>
            <p>Votre mot de passe a été réinitialisé avec succès.</p>
            <p>Si vous n'êtes pas à l'origine de cette action, veuillez contacter immédiatement notre support.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" style="background-color: #1E3A8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Se connecter</a>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} BilanPlus. Tous droits réservés.</p>
            </div>
          </div>
        `,
      };

      transporter.sendMail(mailOptions).catch(err => {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', err);
      });
    } catch (emailErr) {
      console.error('Erreur lors de la préparation de l\'email de confirmation:', emailErr);
      // Ne pas bloquer la réponse si l'email échoue
    }

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error('Erreur resetPassword:', err);
    res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe", error: err.message });
  }
};

exports.analyserActiviteUtilisateurs = async (req, res) => {
  try {
    const totalUtilisateurs = await Utilisateur.countDocuments();
    const utilisateursActifs = await Utilisateur.countDocuments({ actif: true });
    const utilisateursInactifs = totalUtilisateurs - utilisateursActifs;
    const nouveauxUtilisateurs = await Utilisateur.countDocuments({
      dateCreation: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const activiteParRole = await Utilisateur.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'roleInfo' } },
      { $unwind: '$roleInfo' },
      { $project: { nomRole: '$roleInfo.nom', count: 1 } }
    ]);

    res.status(200).json({
      totalUtilisateurs,
      utilisateursActifs,
      utilisateursInactifs,
      nouveauxUtilisateurs,
      activiteParRole
    });
  } catch (err) {
    console.error('Erreur analyserActiviteUtilisateurs:', err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.exportUsersToCSV = async (req, res) => {
  try {
    console.log('exportUsersToCSV: Début de l\'exportation');

    // Récupérer les utilisateurs avec leurs rôles
    const utilisateurs = await Utilisateur.find().populate('role');
    console.log(`exportUsersToCSV: ${utilisateurs.length} utilisateurs trouvés`);

    // Enregistrer l'action dans l'audit (sans bloquer le processus)
    if (req.user && req.user._id) {
      try {
        const AuditLog = require('../Models/Audit').AuditLog;
        const auditLog = new AuditLog({
          utilisateur: req.user._id,
          action: "Exportation des utilisateurs",
          details: `Exportation de la liste des utilisateurs en CSV (${utilisateurs.length} utilisateurs)`,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          navigateur: req.headers['user-agent'],
          date: new Date()
        });

        // Sauvegarder l'audit en arrière-plan sans attendre
        auditLog.save().catch(err => {
          console.error('Erreur lors de l\'enregistrement de l\'audit en arrière-plan:', err);
        });
      } catch (auditErr) {
        console.error('Erreur lors de l\'enregistrement de l\'action d\'exportation:', auditErr);
        // Ne pas bloquer le processus si l'enregistrement de l'audit échoue
      }
    }

    // Créer les en-têtes CSV
    const headers = ['Nom', 'Prenom', 'Email', 'Role', 'Actif', 'DateCreation', 'DernierConnexion', 'Telephone', 'Adresse'];

    // Créer les lignes CSV
    const rows = utilisateurs.map(user => {
      try {
        const roleName = user.role ?
          (typeof user.role === 'object' ? user.role.nom : user.role) :
          'Non défini';

        return [
          user.nom || '',
          user.prenom || '',
          user.email || '',
          roleName,
          user.actif ? 'Oui' : 'Non',
          user.dateCreation ? new Date(user.dateCreation).toLocaleString() : 'N/A',
          user.dernierConnexion ? new Date(user.dernierConnexion).toLocaleString() : 'Jamais',
          user.telephone || '',
          user.adresse || ''
        ].map(field => {
          // Échapper les champs qui contiennent des virgules ou des guillemets
          if (field && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',');
      } catch (userErr) {
        console.error('Erreur lors de la création de la ligne CSV pour l\'utilisateur:', userErr, user);
        return Array(headers.length).fill('').join(',');
      }
    });

    // Assembler le CSV complet
    const csvContent = [headers.join(','), ...rows].join('\n');
    console.log('exportUsersToCSV: CSV généré avec succès');

    // Définir les en-têtes pour le téléchargement
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=utilisateurs.csv');

    // Envoyer le contenu CSV directement au client
    res.send(csvContent);
    console.log('exportUsersToCSV: CSV envoyé au client');

  } catch (err) {
    console.error('Erreur exportUsersToCSV:', err);
    res.status(500).json({ message: "Erreur serveur lors de l'exportation des utilisateurs", error: err.message });
  }
};

// Activer l'authentification à deux facteurs
exports.enableTwoFactor = async (req, res) => {
  try {
    const userId = req.params.id;
    const { method } = req.body;

    if (!method || !['app', 'sms', 'email'].includes(method)) {
      return res.status(400).json({ message: "Méthode d'authentification à deux facteurs invalide" });
    }

    const utilisateur = await Utilisateur.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Générer un secret pour l'authentification à deux facteurs
    const crypto = require('crypto');
    const secret = crypto.randomBytes(20).toString('hex');

    utilisateur.authentificationDeuxFacteurs = {
      active: true,
      secret,
      methode: method
    };

    await utilisateur.save();

    // Enregistrer l'action
    await utilisateur.logAction("Activation de l'authentification à deux facteurs", `Méthode: ${method}`);

    // Enregistrer dans l'audit global
    await require('../Models/Audit').AuditLog.logAction(
      req.user._id,
      "Activation de l'authentification à deux facteurs",
      `Activation de l'authentification à deux facteurs pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom} (${utilisateur.email}) avec la méthode ${method}`,
      req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      req.headers['user-agent']
    );

    res.status(200).json({
      message: "Authentification à deux facteurs activée",
      method,
      // Ne pas renvoyer le secret dans la réponse pour des raisons de sécurité
      // Dans une implémentation réelle, il faudrait générer un QR code pour l'application
    });
  } catch (err) {
    console.error('Erreur enableTwoFactor:', err);
    res.status(500).json({ message: "Erreur serveur lors de l'activation de l'authentification à deux facteurs", error: err.message });
  }
};

// Désactiver l'authentification à deux facteurs
exports.disableTwoFactor = async (req, res) => {
  try {
    const userId = req.params.id;

    const utilisateur = await Utilisateur.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    utilisateur.authentificationDeuxFacteurs = {
      active: false
    };

    await utilisateur.save();

    // Enregistrer l'action
    await utilisateur.logAction("Désactivation de l'authentification à deux facteurs", "");

    // Enregistrer dans l'audit global
    await require('../Models/Audit').AuditLog.logAction(
      req.user._id,
      "Désactivation de l'authentification à deux facteurs",
      `Désactivation de l'authentification à deux facteurs pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom} (${utilisateur.email})`,
      req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      req.headers['user-agent']
    );

    res.status(200).json({ message: "Authentification à deux facteurs désactivée" });
  } catch (err) {
    console.error('Erreur disableTwoFactor:', err);
    res.status(500).json({ message: "Erreur serveur lors de la désactivation de l'authentification à deux facteurs", error: err.message });
  }
};

// Vérifier un code d'authentification à deux facteurs
exports.verifyTwoFactor = async (req, res) => {
  try {
    const userId = req.params.id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Code requis" });
    }

    const utilisateur = await Utilisateur.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (!utilisateur.authentificationDeuxFacteurs || !utilisateur.authentificationDeuxFacteurs.active) {
      return res.status(400).json({ message: "L'authentification à deux facteurs n'est pas activée pour cet utilisateur" });
    }

    // Dans une implémentation réelle, il faudrait vérifier le code avec une bibliothèque comme speakeasy
    // Pour cet exemple, nous allons simplement vérifier si le code est "123456"
    const isValidCode = code === "123456";

    if (!isValidCode) {
      // Enregistrer l'action
      await utilisateur.logAction("Échec de vérification du code d'authentification à deux facteurs", "");

      return res.status(401).json({ message: "Code invalide" });
    }

    // Enregistrer l'action
    await utilisateur.logAction("Vérification réussie du code d'authentification à deux facteurs", "");

    res.status(200).json({ message: "Code vérifié avec succès" });
  } catch (err) {
    console.error('Erreur verifyTwoFactor:', err);
    res.status(500).json({ message: "Erreur serveur lors de la vérification du code d'authentification à deux facteurs", error: err.message });
  }
};