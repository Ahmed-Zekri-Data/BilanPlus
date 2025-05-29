const CompteComptable = require("../Models/CompteComptable");
const EcritureComptable = require("../Models/EcritureComptable");

// Structure des comptes du compte de résultat
const STRUCTURE_RESULTAT = {
  charges: {
    chargesExploitation: {
      title: "Charges d'exploitation",
      comptes: ['60', '61', '62', '63', '64', '65'],
    },
    chargesFinancieres: {
      title: "Charges financières",
      comptes: ['66'],
    },
    chargesExceptionnelles: {
      title: "Charges exceptionnelles",
      comptes: ['67'],
    },
    impotsSurLesBenefices: {
      title: "Impôts sur les bénéfices",
      comptes: ['69'],
    }
  },
  produits: {
    produitsExploitation: {
      title: "Produits d'exploitation",
      comptes: ['70', '71', '72', '74', '75'],
    },
    produitsFinanciers: {
      title: "Produits financiers",
      comptes: ['76'],
    },
    produitsExceptionnels: {
      title: "Produits exceptionnels",
      comptes: ['77'],
    }
  }
};

// Récupérer le compte de résultat
const getResultat = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    
    // Validation des dates
    if (!dateDebut || !dateFin) {
      return res.status(400).json({ 
        message: "Les dates de début et de fin sont requises pour le compte de résultat" 
      });
    }
    
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    // Récupérer tous les comptes de charges et produits
    const comptes = await CompteComptable.find({
      type: { $in: ['charge', 'produit'] }
    });
    
    // Récupérer toutes les écritures de la période concernée
    const ecritures = await EcritureComptable.find({
      date: { $gte: debut, $lte: fin }
    }).populate("lignes.compte");
    
    // Calculer le solde de chaque compte pour la période
    const soldesComptes = {};
    comptes.forEach(compte => {
      soldesComptes[compte._id.toString()] = {
        _id: compte._id,
        numeroCompte: compte.numeroCompte,
        nom: compte.nom,
        type: compte.type,
        solde: 0
      };
    });
    
    // Mettre à jour les soldes avec les écritures
    ecritures.forEach(ecriture => {
      ecriture.lignes.forEach(ligne => {
        const compteId = ligne.compte._id.toString();
        
        // Vérifier si c'est un compte de charge ou produit
        if (soldesComptes[compteId]) {
          const compte = soldesComptes[compteId];
          
          if (ligne.nature === 'débit') {
            if (compte.type === 'charge') {
              compte.solde += ligne.montant; // Les charges augmentent au débit
            } else {
              compte.solde -= ligne.montant; // Les produits diminuent au débit
            }
          } else { // crédit
            if (compte.type === 'charge') {
              compte.solde -= ligne.montant; // Les charges diminuent au crédit
            } else {
              compte.solde += ligne.montant; // Les produits augmentent au crédit
            }
          }
        }
      });
    });
    
    // Organiser le compte de résultat
    const resultat = {
      charges: {},
      produits: {},
      totalCharges: 0,
      totalProduits: 0,
      resultatNet: 0,
      periode: {
        debut,
        fin
      }
    };
    
    // Remplir les catégories de charges
    Object.keys(STRUCTURE_RESULTAT.charges).forEach(categorie => {
      const cat = STRUCTURE_RESULTAT.charges[categorie];
      resultat.charges[categorie] = {
        title: cat.title,
        comptes: [],
        total: 0
      };
      
      // Filtrer les comptes appartenant à cette catégorie
      Object.values(soldesComptes).forEach(compte => {
        if (compte.type === 'charge') {
          const prefixe = compte.numeroCompte.substring(0, 2);
          if (cat.comptes.includes(prefixe)) {
            resultat.charges[categorie].comptes.push(compte);
            resultat.charges[categorie].total += compte.solde;
            resultat.totalCharges += compte.solde;
          }
        }
      });
    });
    
    // Remplir les catégories de produits
    Object.keys(STRUCTURE_RESULTAT.produits).forEach(categorie => {
      const cat = STRUCTURE_RESULTAT.produits[categorie];
      resultat.produits[categorie] = {
        title: cat.title,
        comptes: [],
        total: 0
      };
      
      // Filtrer les comptes appartenant à cette catégorie
      Object.values(soldesComptes).forEach(compte => {
        if (compte.type === 'produit') {
          const prefixe = compte.numeroCompte.substring(0, 2);
          if (cat.comptes.includes(prefixe)) {
            resultat.produits[categorie].comptes.push(compte);
            resultat.produits[categorie].total += compte.solde;
            resultat.totalProduits += compte.solde;
          }
        }
      });
    });
    
    // Calculer le résultat net
    resultat.resultatNet = resultat.totalProduits - resultat.totalCharges;
    
    res.status(200).json(resultat);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération du compte de résultat : " + error.message 
    });
  }
};

module.exports = {
  getResultat
};