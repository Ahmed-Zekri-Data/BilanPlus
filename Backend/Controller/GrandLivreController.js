const EcritureComptable = require("../Models/EcritureComptable");
const CompteComptable = require("../Models/CompteComptable");

// Récupérer le grand livre (toutes les écritures groupées par compte)
const getGrandLivre = async (req, res) => {
  try {
    const { compteId, dateDebut, dateFin } = req.query;
    
    // Construire les filtres
    let filter = {};
    
    if (compteId) {
      filter["lignes.compte"] = compteId;
    }
    
    if (dateDebut || dateFin) {
      filter.date = {};
      if (dateDebut) filter.date.$gte = new Date(dateDebut);
      if (dateFin) filter.date.$lte = new Date(dateFin);
    }
    
    // Récupérer tous les comptes pour organiser le grand livre
    const comptes = await CompteComptable.find().sort({ numeroCompte: 1 });
    
    // Récupérer toutes les écritures concernées
    const ecritures = await EcritureComptable.find(filter)
      .sort({ date: 1 })
      .populate("lignes.compte");
    
    // Organiser les données par compte
    const grandLivre = [];
    
    for (const compte of comptes) {
      // Si un compteId est spécifié et ne correspond pas, passer au suivant
      if (compteId && compte._id.toString() !== compteId) {
        continue;
      }
      
      // Chercher toutes les lignes d'écritures concernant ce compte
      const mouvements = [];
      let soldeProgressif = compte.solde;
      let totalDebit = 0;
      let totalCredit = 0;
      
      // Obtenir le solde initial (à la date de début si spécifiée)
      if (dateDebut) {
        // Calculer le solde initial à la date de début
        const ecrituresAvantDateDebut = await EcritureComptable.find({
          date: { $lt: new Date(dateDebut) },
          "lignes.compte": compte._id
        }).populate("lignes.compte");
        
        for (const ecriture of ecrituresAvantDateDebut) {
          for (const ligne of ecriture.lignes) {
            if (ligne.compte._id.toString() === compte._id.toString()) {
              if (ligne.nature === 'débit') {
                if (compte.type === 'actif' || compte.type === 'charge') {
                  soldeProgressif += ligne.montant;
                } else {
                  soldeProgressif -= ligne.montant;
                }
              } else { // crédit
                if (compte.type === 'actif' || compte.type === 'charge') {
                  soldeProgressif -= ligne.montant;
                } else {
                  soldeProgressif += ligne.montant;
                }
              }
            }
          }
        }
      }
      
      for (const ecriture of ecritures) {
        for (const ligne of ecriture.lignes) {
          if (ligne.compte._id.toString() === compte._id.toString()) {
            let debit = 0;
            let credit = 0;
            
            if (ligne.nature === 'débit') {
              debit = ligne.montant;
              totalDebit += debit;
              
              if (compte.type === 'actif' || compte.type === 'charge') {
                soldeProgressif += debit;
              } else {
                soldeProgressif -= debit;
              }
            } else { // crédit
              credit = ligne.montant;
              totalCredit += credit;
              
              if (compte.type === 'actif' || compte.type === 'charge') {
                soldeProgressif -= credit;
              } else {
                soldeProgressif += credit;
              }
            }
            
            mouvements.push({
              date: ecriture.date,
              libelle: ecriture.libelle,
              debit,
              credit,
              solde: soldeProgressif
            });
          }
        }
      }
      
      // N'ajouter le compte que s'il a des mouvements (sauf si explicitement demandé)
      if (mouvements.length > 0 || compteId) {
        grandLivre.push({
          compte: {
            _id: compte._id,
            numeroCompte: compte.numeroCompte,
            nom: compte.nom,
            type: compte.type,
            soldeInitial: compte.solde
          },
          mouvements,
          totaux: {
            debit: totalDebit,
            credit: totalCredit,
            solde: soldeProgressif
          }
        });
      }
    }
    
    res.status(200).json(grandLivre);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération du grand livre : " + error.message 
    });
  }
};

module.exports = {
  getGrandLivre
};