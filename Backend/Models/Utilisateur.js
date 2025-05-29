const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UtilisateurSchema = new Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // This creates a unique index
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dernierConnexion: {
    type: Date
  },
  actif: {
    type: Boolean,
    default: true
  },
  tentativesConnexion: {
    type: Number,
    default: 0
  },
  telephone: {
    type: String
  },
  adresse: {
    type: String
  },
  photo: {
    type: String // URL de l'image de profil
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true
  },
  preferences: {
    theme: {
      type: String,
      default: "light"
    },
    langue: {
      type: String,
      default: "fr"
    },
    notificationsEmail: {
      type: Boolean,
      default: true
    }
  },

  // Historique et audit
  historiqueConnexions: [{
    date: { type: Date, default: Date.now },
    ip: { type: String },
    navigateur: { type: String },
    reussite: { type: Boolean },
    details: { type: String }
  }],

  dernieresActions: [{
    action: { type: String },
    date: { type: Date, default: Date.now },
    details: { type: String }
  }],

  // Sécurité avancée
  authentificationDeuxFacteurs: {
    active: { type: Boolean, default: false },
    secret: { type: String },
    methode: {
      type: String,
      enum: ['app', 'sms', 'email'],
      default: 'email'
    }
  },

  // Gestion des mots de passe
  expirationMotDePasse: { type: Date },
  politiqueMotDePasse: {
    longueurMinimum: { type: Number, default: 8 },
    exigerMajuscule: { type: Boolean, default: true },
    exigerChiffre: { type: Boolean, default: true },
    exigerCaractereSpecial: { type: Boolean, default: true },
    dureeValiditeJours: { type: Number, default: 90 }
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Méthode pour vérifier si un utilisateur est admin
UtilisateurSchema.methods.isAdmin = function() {
  return this.role &&
         this.role.permissions &&
         this.role.permissions.accesComplet === true;
};

// Méthode pour vérifier si l'utilisateur a une permission spécifique
UtilisateurSchema.methods.hasPermission = function(permissionName) {
  return this.role &&
         this.role.permissions &&
         this.role.permissions[permissionName] === true;
};

// Méthode pour enregistrer une connexion
UtilisateurSchema.methods.logLogin = function(reussite, ip, navigateur, details = '') {
  const connexion = {
    date: new Date(),
    ip,
    navigateur,
    reussite,
    details
  };

  // Initialiser le tableau s'il n'existe pas
  if (!this.historiqueConnexions) {
    this.historiqueConnexions = [];
  }

  // Limiter à 50 entrées maximum
  if (this.historiqueConnexions.length >= 50) {
    this.historiqueConnexions.pop(); // Supprimer la plus ancienne
  }

  this.historiqueConnexions.unshift(connexion); // Ajouter au début
  return this.save();
};

// Méthode pour enregistrer une action
UtilisateurSchema.methods.logAction = function(action, details) {
  const nouvelleAction = {
    action,
    date: new Date(),
    details
  };

  // Initialiser le tableau s'il n'existe pas
  if (!this.dernieresActions) {
    this.dernieresActions = [];
  }

  // Limiter à 50 entrées maximum
  if (this.dernieresActions.length >= 50) {
    this.dernieresActions.pop(); // Supprimer la plus ancienne
  }

  this.dernieresActions.unshift(nouvelleAction); // Ajouter au début
  return this.save();
};

// Méthode pour créer un objet utilisateur sans le mot de passe
UtilisateurSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexation pour améliorer les performances
UtilisateurSchema.index({ role: 1 }); // Keep this if you query by role frequently

module.exports = mongoose.model("Utilisateur", UtilisateurSchema);