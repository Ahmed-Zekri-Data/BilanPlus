const CompteComptable = require("../Models/CompteComptable");
const EcritureComptable = require("../Models/EcritureComptable");

// Récupérer la balance comptable
const getBalance = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    
    // Récupérer tous les comptes
    const comptes = await CompteComptable.find().sort({ numeroCompte: 1 });
    
    // Construire le filtre de dates pour les écritures
    let dateFilter = {};
    if (dateFin) dateFilter.date = { $lte: new Date(dateFin) };
    
    // Récupérer toutes les écritures concernées par la période
    const ecritures = await EcritureComptable.find(dateFilter)
      .populate("lignes.compte");
    
    // Préparer la balance
    const balance = [];
    let totalDebit = 0;
    let totalCredit = 0;
    let totalSoldeDebiteur = 0;
    let totalSoldeCrediteur = 0;
    
    // Pour chaque compte, calculer les totaux
    for (const compte of comptes) {
      let debitInitial = 0;
      let creditInitial = 0;
      let debitPeriode = 0;
      let creditPeriode = 0;
      
      // Traiter chaque écriture pour ce compte
      for (const ecriture of ecritures) {
        // Considérer seulement les écritures dans la période spécifiée
        const dateEcriture = new Date(ecriture.date);
        
        // Filtrer les écritures avant la date de début si spécifiée
        const estAvantDateDebut = dateDebut && dateEcriture < new Date(dateDebut);
        
        for (const ligne of ecriture.lignes) {
          if (ligne.compte._id.toString() === compte._id.toString()) {
            if (ligne.nature === 'débit') {
              if (estAvantDateDebut) {
                debitInitial += ligne.montant;
              } else {
                debitPeriode += ligne.montant;
              }
            } else { // crédit
              if (estAvantDateDebut) {
                creditInitial += ligne.montant;
              } else {
                creditPeriode += ligne.montant;
              }
            }
          }
        }
      }
      
      // Calculer les soldes
      const soldeInitial = debitInitial - creditInitial;
      const mouvementDebit = debitPeriode;
      const mouvementCredit = creditPeriode;
      const soldeDebit = soldeInitial + mouvementDebit - mouvementCredit > 0 ? 
                         soldeInitial + mouvementDebit - mouvementCredit : 0;
      const soldeCredit = soldeInitial + mouvementDebit - mouvementCredit < 0 ? 
                          Math.abs(soldeInitial + mouvementDebit - mouvementCredit) : 0;
      
      // N'ajouter à la balance que si le compte a des mouvements ou un solde
      if (soldeInitial !== 0 || mouvementDebit !== 0 || mouvementCredit !== 0) {
        balance.push({
          compte: {
            _id: compte._id,
            numeroCompte: compte.numeroCompte,
            nom: compte.nom,
            type: compte.type
          },
          soldeInitial,
          mouvementDebit,
          mouvementCredit,
          soldeDebit,
          soldeCredit
        });
        
        // Ajouter aux totaux
        totalDebit += mouvementDebit;
        totalCredit += mouvementCredit;
        totalSoldeDebiteur += soldeDebit;
        totalSoldeCrediteur += soldeCredit;
      }
    }
    
    res.status(200).json({
      balance,
      totaux: {
        debit: totalDebit,
        credit: totalCredit,
        soldeDebiteur: totalSoldeDebiteur,
        soldeCrediteur: totalSoldeCrediteur
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération de la balance : " + error.message 
    });
  }
};

module.exports = {
  getBalance
};