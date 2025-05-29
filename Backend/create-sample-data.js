// Script pour créer des données d'exemple
const mongoose = require("mongoose");

// Modèles simplifiés
const CompteComptable = require("./Models/CompteComptable");
const EcritureComptable = require("./Models/EcritureComptable");

// Configuration de la base de données
const config = require("./Config/db.json");

async function createSampleData() {
  try {
    // Connexion à la base de données
    await mongoose.connect(config.url);
    console.log("Connecté à la base de données");

    // Supprimer les données existantes
    await CompteComptable.deleteMany({});
    await EcritureComptable.deleteMany({});
    console.log("Données existantes supprimées");

    // Créer les comptes
    const comptes = [
      { numeroCompte: "101", nom: "Capital social", type: "passif", solde: 0 },
      { numeroCompte: "201", nom: "Immobilisations corporelles", type: "actif", solde: 0 },
      { numeroCompte: "301", nom: "Stocks de marchandises", type: "actif", solde: 0 },
      { numeroCompte: "411", nom: "Clients", type: "actif", solde: 0 },
      { numeroCompte: "512", nom: "Banque", type: "actif", solde: 0 },
      { numeroCompte: "401", nom: "Fournisseurs", type: "passif", solde: 0 },
      { numeroCompte: "164", nom: "Emprunts", type: "passif", solde: 0 },
      { numeroCompte: "601", nom: "Achats de marchandises", type: "charge", solde: 0 },
      { numeroCompte: "621", nom: "Personnel extérieur", type: "charge", solde: 0 },
      { numeroCompte: "701", nom: "Ventes de marchandises", type: "produit", solde: 0 },
      { numeroCompte: "706", nom: "Prestations de services", type: "produit", solde: 0 }
    ];

    const comptesCreated = await CompteComptable.insertMany(comptes);
    console.log(`${comptesCreated.length} comptes créés`);

    // Créer un mapping des comptes par numéro
    const comptesMap = {};
    comptesCreated.forEach(compte => {
      comptesMap[compte.numeroCompte] = compte._id;
    });

    // Créer les écritures
    const ecritures = [
      {
        libelle: "Apport en capital",
        date: new Date("2025-01-01"),
        lignes: [
          { compte: comptesMap["512"], montant: 100000, nature: "débit" },
          { compte: comptesMap["101"], montant: 100000, nature: "crédit" }
        ]
      },
      {
        libelle: "Achat matériel informatique",
        date: new Date("2025-01-15"),
        lignes: [
          { compte: comptesMap["201"], montant: 50000, nature: "débit" },
          { compte: comptesMap["512"], montant: 50000, nature: "crédit" }
        ]
      },
      {
        libelle: "Achat stock initial",
        date: new Date("2025-01-20"),
        lignes: [
          { compte: comptesMap["301"], montant: 20000, nature: "débit" },
          { compte: comptesMap["401"], montant: 20000, nature: "crédit" }
        ]
      },
      {
        libelle: "Ventes du mois",
        date: new Date("2025-01-31"),
        lignes: [
          { compte: comptesMap["411"], montant: 80000, nature: "débit" },
          { compte: comptesMap["701"], montant: 80000, nature: "crédit" }
        ]
      },
      {
        libelle: "Coût des marchandises vendues",
        date: new Date("2025-01-31"),
        lignes: [
          { compte: comptesMap["601"], montant: 15000, nature: "débit" },
          { compte: comptesMap["301"], montant: 15000, nature: "crédit" }
        ]
      },
      {
        libelle: "Salaires du mois",
        date: new Date("2025-01-31"),
        lignes: [
          { compte: comptesMap["621"], montant: 25000, nature: "débit" },
          { compte: comptesMap["512"], montant: 25000, nature: "crédit" }
        ]
      },
      {
        libelle: "Emprunt bancaire",
        date: new Date("2025-02-15"),
        lignes: [
          { compte: comptesMap["512"], montant: 30000, nature: "débit" },
          { compte: comptesMap["164"], montant: 30000, nature: "crédit" }
        ]
      }
    ];

    const ecrituresCreated = await EcritureComptable.insertMany(ecritures);
    console.log(`${ecrituresCreated.length} écritures créées`);

    console.log("Données d'exemple créées avec succès !");
    
    // Afficher un résumé
    console.log("\n=== RÉSUMÉ DES DONNÉES ===");
    console.log("Comptes créés:");
    comptesCreated.forEach(compte => {
      console.log(`- ${compte.numeroCompte}: ${compte.nom} (${compte.type})`);
    });
    
    console.log("\nÉcritures créées:");
    ecrituresCreated.forEach(ecriture => {
      console.log(`- ${ecriture.libelle} (${ecriture.date.toISOString().split('T')[0]})`);
    });

  } catch (error) {
    console.error("Erreur lors de la création des données:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Déconnecté de la base de données");
  }
}

// Exécuter le script
createSampleData();
