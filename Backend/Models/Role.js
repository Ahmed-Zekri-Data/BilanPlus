const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  nom: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  description: { 
    type: String 
  },
  permissions: {
    gererUtilisateursEtRoles: { type: Boolean, default: false }, // Admin: Manage users and roles
    configurerSysteme: { type: Boolean, default: false }, // Admin: Configure system
    accesComplet: { type: Boolean, default: false }, // Admin: Full access
    validerEcritures: { type: Boolean, default: false }, // Resp. Comptable: Validate entries
    cloturerPeriodes: { type: Boolean, default: false }, // Resp. Comptable: Close periods
    genererEtatsFinanciers: { type: Boolean, default: false }, // Resp. Comptable: Generate financial statements
    superviserComptes: { type: Boolean, default: false }, // Resp. Comptable: Supervise accounts
    saisirEcritures: { type: Boolean, default: false }, // Comptable: Enter accounting entries
    gererFactures: { type: Boolean, default: false }, // Comptable: Manage invoices
    suivrePaiements: { type: Boolean, default: false }, // Comptable: Track payments
    gererTresorerie: { type: Boolean, default: false }, // Comptable: Manage treasury
    analyserDepensesRecettes: { type: Boolean, default: false }, // Contrôleur: Analyze expenses/revenues
    genererRapportsPerformance: { type: Boolean, default: false }, // Contrôleur: Generate performance reports
    comparerBudgetRealise: { type: Boolean, default: false }, // Contrôleur: Compare budget vs actual
    saisirNotesFrais: { type: Boolean, default: false }, // Employé: Enter expense notes
    consulterBulletinsPaie: { type: Boolean, default: false }, // Employé: View payslips
    soumettreRemboursements: { type: Boolean, default: false }, // Employé: Submit reimbursements
    accesFacturesPaiements: { type: Boolean, default: false }, // Client/Fournisseur: Access invoices/payments
    telechargerDocuments: { type: Boolean, default: false }, // Client/Fournisseur: Download documents
    communiquerComptabilite: { type: Boolean, default: false } // Client/Fournisseur: Communicate with accounting
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

// Création des rôles par défaut
RoleSchema.statics.createDefaultRoles = async function() {
  try {
    const rolesToCreate = [
      {
        nom: "Administrateur Système",
        description: "Accès complet au système",
        permissions: {
          gererUtilisateursEtRoles: true,
          configurerSysteme: true,
          accesComplet: true
        }
      },
      {
        nom: "Responsable Comptable",
        description: "Supervise les opérations comptables",
        permissions: {
          validerEcritures: true,
          cloturerPeriodes: true,
          genererEtatsFinanciers: true,
          superviserComptes: true
        }
      },
      {
        nom: "Comptable",
        description: "Gère les opérations comptables quotidiennes",
        permissions: {
          saisirEcritures: true,
          gererFactures: true,
          suivrePaiements: true,
          gererTresorerie: true
        }
      },
      {
        nom: "Contrôleur de Gestion",
        description: "Analyse les performances financières",
        permissions: {
          analyserDepensesRecettes: true,
          genererRapportsPerformance: true,
          comparerBudgetRealise: true
        }
      },
      {
        nom: "Employé",
        description: "Utilisateur standard avec accès limité",
        permissions: {
          saisirNotesFrais: true,
          consulterBulletinsPaie: true,
          soumettreRemboursements: true
        }
      },
      {
        nom: "Client ou Fournisseur",
        description: "Accès limité pour clients et fournisseurs",
        permissions: {
          accesFacturesPaiements: true,
          telechargerDocuments: true,
          communiquerComptabilite: true
        }
      }
    ];

    for (const role of rolesToCreate) {
      const exists = await this.findOne({ nom: role.nom });
      if (!exists) {
        const newRole = new this(role);
        await newRole.save();
        console.log(`Rôle ${role.nom} créé avec succès`);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la création des rôles par défaut:", error);
  }
};

module.exports = mongoose.model("Role", RoleSchema);