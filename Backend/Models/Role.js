const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: {
    gestionUtilisateurs: { type: Boolean, default: false },
    gestionRoles: { type: Boolean, default: false },
    gestionClients: { type: Boolean, default: false },
    gestionFournisseurs: { type: Boolean, default: false },
    gestionFactures: { type: Boolean, default: false },
    gestionComptabilite: { type: Boolean, default: false },
    gestionBilans: { type: Boolean, default: false },
    gestionDeclarations: { type: Boolean, default: false },
    rapportsAvances: { type: Boolean, default: false },
    parametresSysteme: { type: Boolean, default: false }
  },
  dateCreation: { type: Date, default: Date.now },
  actif: { type: Boolean, default: true }
});

// Méthode pour vérifier si un rôle a une permission spécifique
RoleSchema.methods.aPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Méthode pour accorder une permission
RoleSchema.methods.accorderPermission = function(permission) {
  if (this.permissions.hasOwnProperty(permission)) {
    this.permissions[permission] = true;
    return this.save();
  }
  return Promise.reject(new Error('Permission invalide'));
};

// Méthode pour révoquer une permission
RoleSchema.methods.revoquerPermission = function(permission) {
  if (this.permissions.hasOwnProperty(permission)) {
    this.permissions[permission] = false;
    return this.save();
  }
  return Promise.reject(new Error('Permission invalide'));
};

module.exports = mongoose.model("Role", RoleSchema);
