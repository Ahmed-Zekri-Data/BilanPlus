const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schéma pour les logs d'audit généraux
const AuditLogSchema = new Schema({
  utilisateur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Utilisateur", 
    required: true 
  },
  action: { 
    type: String, 
    required: true 
  },
  details: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  ip: { 
    type: String 
  },
  navigateur: { 
    type: String 
  }
});

// Schéma pour l'historique des connexions
const LoginHistorySchema = new Schema({
  utilisateur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Utilisateur", 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  ip: { 
    type: String, 
    required: true 
  },
  navigateur: { 
    type: String 
  },
  reussite: { 
    type: Boolean, 
    required: true 
  },
  details: { 
    type: String 
  }
});

// Méthode statique pour enregistrer une action d'audit
AuditLogSchema.statics.logAction = async function(userId, action, details, ip, navigateur) {
  try {
    const auditLog = new this({
      utilisateur: userId,
      action,
      details,
      ip,
      navigateur
    });
    return await auditLog.save();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'action d'audit:", error);
    throw error;
  }
};

// Méthode statique pour enregistrer une tentative de connexion
LoginHistorySchema.statics.logLogin = async function(userId, reussite, ip, navigateur, details = '') {
  try {
    const loginHistory = new this({
      utilisateur: userId,
      reussite,
      ip,
      navigateur,
      details
    });
    return await loginHistory.save();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la tentative de connexion:", error);
    throw error;
  }
};

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
const LoginHistory = mongoose.model("LoginHistory", LoginHistorySchema);

module.exports = {
  AuditLog,
  LoginHistory
};
