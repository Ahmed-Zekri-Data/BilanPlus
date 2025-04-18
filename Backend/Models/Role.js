const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  nom: { 
    type: String, 
    required: true, 
    unique: true, // This creates a unique index
    trim: true
  },
  description: { 
    type: String 
  },
  permissions: {
    gestionUtilisateurs: { 
      type: Boolean, 
      default: false 
    },
    gestionRoles: { 
      type: Boolean, 
      default: false 
    },
    gestionClients: { 
      type: Boolean, 
      default: false 
    },
    gestionFournisseurs: { 
      type: Boolean, 
      default: false 
    },
    gestionFactures: { 
      type: Boolean, 
      default: false 
    },
    gestionComptabilite: { 
      type: Boolean, 
      default: false 
    },
    gestionBilans: { 
      type: Boolean, 
      default: false 
    },
    gestionDeclarations: { 
      type: Boolean, 
      default: false 
    },
    rapportsAvances: { 
      type: Boolean, 
      default: false 
    },
    parametresSysteme: { 
      type: Boolean, 
      default: false 
    }
  },
  dateCreation: { 
    type: Date, 
    default: Date.now 
  },
  actif: { 
    type: Boolean, 
    default: true 
  }
});

// Méthode pour vérifier si un rôle a une permission spécifique
RoleSchema.methods.hasPermission = function(permissionName) {
  return this.permissions && this.permissions[permissionName] === true;
};

// Création d'un rôle admin par défaut
RoleSchema.statics.createDefaultAdmin = async function() {
  try {
    const adminExists = await this.findOne({ nom: "Administrateur" });
    
    if (!adminExists) {
      const adminRole = new this({
        nom: "Administrateur",
        description: "Accès complet au système",
        permissions: {
          gestionUtilisateurs: true,
          gestionRoles: true,
          gestionClients: true,
          gestionFournisseurs: true,
          gestionFactures: true,
          gestionComptabilite: true,
          gestionBilans: true,
          gestionDeclarations: true,
          rapportsAvances: true,
          parametresSysteme: true
        }
      });
      
      await adminRole.save();
      console.log("Rôle Administrateur créé avec succès");
    }
  } catch (error) {
    console.error("Erreur lors de la création du rôle Administrateur:", error);
  }
};

module.exports = mongoose.model("Role", RoleSchema);