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
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Méthode pour vérifier si un utilisateur est admin
UtilisateurSchema.methods.isAdmin = function() {
  return this.role && 
         this.role.permissions && 
         this.role.permissions.parametresSysteme === true;
};

// Méthode pour vérifier si l'utilisateur a une permission spécifique
UtilisateurSchema.methods.hasPermission = function(permissionName) {
  return this.role && 
         this.role.permissions && 
         this.role.permissions[permissionName] === true;
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