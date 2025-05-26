const CompteComptable = require("../Models/CompteComptable");
const EcritureComptable = require("../Models/EcritureComptable");

// Structure des comptes du bilan
const STRUCTURE_BILAN = {
  actif: {
    immobilisations: {
      title: "Immobilisations",
      comptes: ['20', '21', '22', '23', '27', '28'],
    },
    stocksEtEnCours: {
      title: "Stocks et en-cours",
      comptes: ['31', '32', '33', '34', '35', '37'],
    },
    creancesEtComptesDerattaches: {
      title: "Créances et comptes de rattachés",
      comptes: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'],
    },
    disponibilites: {
      title: "Disponibilités",
      comptes: ['50', '51', '52', '53', '54', '58'],
    }
  },
  passif: {
    capitauxPropres: {
      title: "Capitaux propres",
      comptes: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    },
    provisions: {
      title: "Provisions pour risques et charges",
      comptes: ['15'],
    },
    dettes: {
      title: "Dettes",
      comptes: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'],
    },
    comptesDeTresorerie: {
      title: "Comptes de trésorerie",
      comptes: ['50', '51', '52', '53', '54', '58'],
    }
  }
};

// Récupérer le bilan comptable
const getBilan = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Récupérer tous les comptes
    const comptes = await CompteComptable.find();
    
    // Filtre pour les écritures jusqu'à la date spécifiée
    const dateFiltre = date ? new Date(date) : new Date();
    
    // Récupérer toutes les écritures jusqu'à la date spécifiée
    const ecritures = await EcritureComptable.find({
      date: { $lte: dateFiltre }
    }).populate("lignes.compte");
    
    // Calculer le solde de chaque compte
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
        const compte = soldesComptes[compteId];
        
        if (ligne.nature === 'débit') {
          if (compte.type === 'actif' || compte.type === 'charge') {
            compte.solde += ligne.montant;
          } else {
            compte.solde -= ligne.montant;
          }
        } else { // crédit
          if (compte.type === 'actif' || compte.type === 'charge') {
            compte.solde -= ligne.montant;
          } else {
            compte.solde += ligne.montant;
          }
        }
      });
    });
    
    // Organiser le bilan
    const bilan = {
      actif: {},
      passif: {},
      totalActif: 0,
      totalPassif: 0,
      date: dateFiltre
    };
    
    // Remplir les catégories d'actif
    Object.keys(STRUCTURE_BILAN.actif).forEach(categorie => {
      const cat = STRUCTURE_BILAN.actif[categorie];
      bilan.actif[categorie] = {
        title: cat.title,
        comptes: [],
        total: 0
      };
      
      // Filtrer les comptes appartenant à cette catégorie
      Object.values(soldesComptes).forEach(compte => {
        if (compte.type === 'actif') {
          const prefixe = compte.numeroCompte.substring(0, 2);
          if (cat.comptes.includes(prefixe)) {
            bilan.actif[categorie].comptes.push(compte);
            bilan.actif[categorie].total += compte.solde;
            bilan.totalActif += compte.solde;
          }
        }
      });
    });
    
    // Remplir les catégories de passif
    Object.keys(STRUCTURE_BILAN.passif).forEach(categorie => {
      const cat = STRUCTURE_BILAN.passif[categorie];
      bilan.passif[categorie] = {
        title: cat.title,
        comptes: [],
        total: 0
      };
      
      // Filtrer les comptes appartenant à cette catégorie
      Object.values(soldesComptes).forEach(compte => {
        if (compte.type === 'passif') {
          const prefixe = compte.numeroCompte.substring(0, 2);
          if (cat.comptes.includes(prefixe)) {
            bilan.passif[categorie].comptes.push(compte);
            bilan.passif[categorie].total += compte.solde;
            bilan.totalPassif += compte.solde;
          }
        }
      });
    });
    
    res.status(200).json(bilan);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération du bilan : " + error.message 
    });
  }
};

module.exports = {
  getBilan
};