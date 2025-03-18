const CompteComptable = require("../Models/CompteComptable");

// READ - Récupérer tous les comptes
const getComptes = async (req, res) => {
  try {
    const comptes = await CompteComptable.find();
    res.json(comptes);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// CREATE - Ajouter un compte
const createCompte = async (req, res) => {
  try {
    const { nom, type } = req.body;
    if (!nom || !type) {
      return res.status(400).json({ message: "Nom et Type requis" });
    }
    const compte = new CompteComptable({ nom, type });
    await compte.save();
    res.status(201).json(compte);
  } catch (err) {
    res.status(400).json({ message: "Impossible d'ajouter le compte" });
  }
};

// UPDATE - Mettre à jour un compte
const updateCompte = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, type, solde } = req.body;

    const compte = await CompteComptable.findById(id);
    if (!compte) return res.status(404).json({ message: "Compte introuvable" });

    if (nom) compte.nom = nom;
    if (type) compte.type = type;
    if (solde !== undefined) compte.solde = solde;

    await compte.save();
    res.json(compte);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la mise à jour" });
  }
};

// DELETE - Supprimer un compte
const deleteCompte = async (req, res) => {
  try {
    const { id } = req.params;
    const compte = await CompteComptable.findByIdAndDelete(id);
    if (!compte) return res.status(404).json({ message: "Compte introuvable" });
    res.json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getComptes, createCompte, updateCompte, deleteCompte };