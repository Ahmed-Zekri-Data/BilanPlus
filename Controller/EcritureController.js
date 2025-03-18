const EcritureComptable = require("../Models/EcritureComptable");
const CompteComptable = require("../Models/CompteComptable");

// READ - Récupérer toutes les écritures
const getEcritures = async (req, res) => {
  try {
    const ecritures = await EcritureComptable.find().populate("compte");
    res.json(ecritures);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// CREATE - Ajouter une écriture
const createEcriture = async (req, res) => {
  try {
    const { compte, montant, nature } = req.body;

    if (!compte || !montant || !nature) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const compteExiste = await CompteComptable.findById(compte);
    if (!compteExiste) return res.status(404).json({ message: "Compte introuvable" });

    const ecriture = new EcritureComptable({ compte, montant, nature });
    await ecriture.save();

    if (nature === "débit") compteExiste.solde += montant;
    else if (nature === "crédit") compteExiste.solde -= montant;
    await compteExiste.save();

    res.status(201).json(ecriture);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de l'ajout de l'écriture" });
  }
};

// UPDATE - Mettre à jour une écriture
const updateEcriture = async (req, res) => {
  try {
    const { id } = req.params;
    const { compte, montant, nature } = req.body;

    const ecriture = await EcritureComptable.findById(id).populate("compte");
    if (!ecriture) return res.status(404).json({ message: "Écriture introuvable" });

    if (ecriture.nature === "débit") ecriture.compte.solde -= ecriture.montant;
    else if (ecriture.nature === "crédit") ecriture.compte.solde += ecriture.montant;

    if (compte) {
      const compteExiste = await CompteComptable.findById(compte);
      if (!compteExiste) return res.status(404).json({ message: "Compte introuvable" });
      ecriture.compte = compte;
    }
    if (montant) ecriture.montant = montant;
    if (nature) ecriture.nature = nature;

    const nouveauCompte = await CompteComptable.findById(ecriture.compte);
    if (ecriture.nature === "débit") nouveauCompte.solde += ecriture.montant;
    else if (ecriture.nature === "crédit") nouveauCompte.solde -= ecriture.montant;
    await nouveauCompte.save();

    await ecriture.save();
    res.json(ecriture);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la mise à jour" });
  }
};

// DELETE - Supprimer une écriture
const deleteEcriture = async (req, res) => {
  try {
    const { id } = req.params;
    const ecriture = await EcritureComptable.findById(id).populate("compte");
    if (!ecriture) return res.status(404).json({ message: "Écriture introuvable" });

    if (ecriture.nature === "débit") ecriture.compte.solde -= ecriture.montant;
    else if (ecriture.nature === "crédit") ecriture.compte.solde += ecriture.montant;
    await ecriture.compte.save();

    await EcritureComptable.findByIdAndDelete(id);
    res.json({ message: "Écriture supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getEcritures, createEcriture, updateEcriture, deleteEcriture };