const CompteComptable = require("../Models/CompteComptable");
const EcritureComptable = require("../Models/EcritureComptable");

// Récupérer les données pour le tableau de bord
const getDashboardData = async (req, res) => {
  try {
    // Récupérer les statistiques générales
    const totalComptes = await CompteComptable.countDocuments();
    const totalEcritures = await EcritureComptable.countDocuments();
    
    // Dernière écriture comptable
    const derniereEcriture = await EcritureComptable.findOne()
      .sort({ date: -1 })
      .populate("lignes.compte");
    
    // Calculer les soldes par type de compte
    const comptes = await CompteComptable.find();
    
    let totalActif = 0;
    let totalPassif = 0;
    let totalCharges = 0;
    let totalProduits = 0;
    
    // Récupérer toutes les écritures pour calculer les soldes réels
    const ecritures = await EcritureComptable.find().populate("lignes.compte");
    
    // Map pour stocker les soldes calculés
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
    
    // Calculer les soldes réels en fonction des écritures
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
    
    // Calculer les totaux par type
    Object.values(soldesComptes).forEach(compte => {
      switch(compte.type) {
        case 'actif':
          totalActif += compte.solde;
          break;
        case 'passif':
          totalPassif += compte.solde;
          break;
        case 'charge':
          totalCharges += compte.solde;
          break;
        case 'produit':
          totalProduits += compte.solde;
          break;
      }
    });
    
    // Calculer le résultat
    const resultatPeriode = totalProduits - totalCharges;
    
    // Récupérer les 5 dernières écritures
    const dernieresEcritures = await EcritureComptable.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("lignes.compte");
    
    // Calculer le nombre d'écritures par mois (6 derniers mois)
    const sixMoisDerniers = [];
    const maintenant = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const moisDate = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const moisSuivantDate = new Date(maintenant.getFullYear(), maintenant.getMonth() - i + 1, 0);
      
      const count = await EcritureComptable.countDocuments({
        date: { $gte: moisDate, $lte: moisSuivantDate }
      });
      
      sixMoisDerniers.push({
        mois: moisDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
        count
      });
    }
    
    res.status(200).json({
      statistiques: {
        totalComptes,
        totalEcritures,
        totalActif,
        totalPassif,
        totalCharges,
        totalProduits,
        resultatPeriode
      },
      derniereEcriture,
      dernieresEcritures,
      sixMoisDerniers
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération des données du tableau de bord : " + error.message 
    });
  }
};

module.exports = {
  getDashboardData
};