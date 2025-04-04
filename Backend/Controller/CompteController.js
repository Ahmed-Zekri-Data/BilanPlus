const CompteComptable = require("../Models/CompteComptable");
const EcritureComptable = require("../Models/EcritureComptable");

// READ - Récupérer tous les comptes
const getComptes = async (req, res) => {
  try {
    const comptes = await CompteComptable.find();
    res.json(comptes);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// CREATE - Ajouter un compte
const createCompte = async (req, res) => {
  try {
    const { numeroCompte, nom, type, solde } = req.body;
    if (!numeroCompte || !nom || !type) {
      return res.status(400).json({ message: "Numéro, Nom et Type sont requis" });
    }
    const compte = new CompteComptable({ numeroCompte, nom, type, solde: solde || 0 });
    await compte.save();
    res.status(201).json(compte);
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 11000) {
      // Vérifier si l'erreur concerne un duplicata sur numeroCompte
      if (err.errmsg && err.errmsg.includes('index: numeroCompte_1')) {
        return res.status(400).json({ message: `Le numéro de compte "${req.body.numeroCompte}" existe déjà.` });
      }
    }
    res.status(400).json({ message: "Impossible d'ajouter le compte", error: err.message });
  }
};  

// UPDATE - Mettre à jour un compte
const updateCompte = async (req, res) => {
    try {
      const { id } = req.params;
      const { numeroCompte, nom, type, solde } = req.body;
  
      const compte = await CompteComptable.findById(id);
      if (!compte) return res.status(404).json({ message: "Compte introuvable" });
  
      if (numeroCompte) compte.numeroCompte = numeroCompte;
      if (nom) compte.nom = nom;
      if (type) compte.type = type;
      if (solde !== undefined) compte.solde = solde; // Ajout de la mise à jour du solde
  
      await compte.save();
      res.json(compte);
    } catch (err) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
  };

// DELETE - Supprimer un compte
const deleteCompte = async (req, res) => {
  try {
    const { id } = req.params;
    // Vérifier si le compte est utilisé dans des écritures
    const ecritures = await EcritureComptable.find({ "lignes.compte": id });
    if (ecritures.length > 0) {
      return res.status(400).json({ message: "Impossible de supprimer : compte utilisé dans des écritures" });
    }
    const compte = await CompteComptable.findByIdAndDelete(id);
    if (!compte) return res.status(404).json({ message: "Compte introuvable" });
    res.json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

module.exports = { getComptes, createCompte, updateCompte, deleteCompte };