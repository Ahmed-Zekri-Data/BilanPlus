const EcritureComptable = require("../Models/EcritureComptable");

// Récupérer le journal comptable avec filtres optionnels par date
const getJournal = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    
    // Construire le filtre de date
    let dateFilter = {};
    if (dateDebut) dateFilter["date"] = { $gte: new Date(dateDebut) };
    if (dateFin) dateFilter["date"] = { ...dateFilter["date"], $lte: new Date(dateFin) };
    
    // Récupérer les écritures triées par date
    const journal = await EcritureComptable.find(dateFilter)
      .sort({ date: 1 })
      .populate("lignes.compte");
    
    // Calculer les totaux pour information
    const totalDebit = journal.reduce((total, ecriture) => {
      return total + ecriture.lignes
        .filter(ligne => ligne.nature === 'débit')
        .reduce((sum, ligne) => sum + ligne.montant, 0);
    }, 0);
    
    const totalCredit = journal.reduce((total, ecriture) => {
      return total + ecriture.lignes
        .filter(ligne => ligne.nature === 'crédit')
        .reduce((sum, ligne) => sum + ligne.montant, 0);
    }, 0);
    
    res.status(200).json({
      journal,
      totaux: {
        debit: totalDebit,
        credit: totalCredit
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération du journal : " + error.message 
    });
  }
};

module.exports = {
  getJournal
};