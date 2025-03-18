const mongoose = require("mongoose");
const EcritureComptable = require("../Models/EcritureComptable");
const CompteComptable = require("../Models/CompteComptable");

// READ - Récupérer toutes les écritures
const getEcritures = async (req, res) => {
  try {
    const ecritures = await EcritureComptable.find().populate("lignes.compte");
    res.json(ecritures);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// CREATE - Ajouter une écriture (déjà bon, pas de changement)
const createEcriture = async (req, res) => {
  try {
    const { libelle, lignes } = req.body;

    if (!libelle) {
      return res.status(400).json({ message: "Le libellé est requis" });
    }
    if (!lignes) {
      return res.status(400).json({ message: "Les lignes sont requises" });
    }
    if (lignes.length < 2) {
      return res.status(400).json({ message: "Il faut au moins 2 lignes (débit et crédit)" });
    }

    const totalDebit = lignes.reduce((sum, ligne) => 
      ligne.nature === "débit" ? sum + ligne.montant : sum, 0);
    const totalCredit = lignes.reduce((sum, ligne) => 
      ligne.nature === "crédit" ? sum + ligne.montant : sum, 0);
    if (totalDebit !== totalCredit) {
      return res.status(400).json({ message: "L’écriture n’est pas équilibrée : Débit (" + totalDebit + ") ≠ Crédit (" + totalCredit + ")" });
    }

    for (const ligne of lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (!compte) {
        return res.status(404).json({ message: `Compte ${ligne.compte} introuvable` });
      }
      if (ligne.nature === "crédit" && compte.type === "actif") {
        if (compte.solde - ligne.montant < 0) {
          return res.status(400).json({ message: `Pas assez d’argent sur ${compte.nom} (solde : ${compte.solde})` });
        }
      }
    }

    const ecriture = new EcritureComptable({ libelle, lignes });
    await ecriture.save();

    for (const ligne of lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (ligne.nature === "débit") {
        compte.solde += ligne.montant;
      } else if (ligne.nature === "crédit") {
        compte.solde -= ligne.montant;
      }
      await compte.save();
    }

    res.status(201).json(ecriture);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de l’ajout de l’écriture", error: err.message });
  }
};

// UPDATE - Mettre à jour une écriture (version sans transactions)
const updateEcriture = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, lignes } = req.body;

    const ecriture = await EcritureComptable.findById(id).populate("lignes.compte");
    if (!ecriture) return res.status(404).json({ message: "Écriture introuvable" });

    // Restaurer les soldes avant mise à jour
    for (const ligne of ecriture.lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (ligne.nature === "débit") compte.solde -= ligne.montant;
      else if (ligne.nature === "crédit") compte.solde += ligne.montant;
      await compte.save();
    }

    // Mettre à jour les champs
    if (libelle) ecriture.libelle = libelle;
    if (lignes) {
      const totalDebit = lignes.reduce((sum, ligne) => 
        ligne.nature === "débit" ? sum + ligne.montant : sum, 0);
      const totalCredit = lignes.reduce((sum, ligne) => 
        ligne.nature === "crédit" ? sum + ligne.montant : sum, 0);
      if (totalDebit !== totalCredit) {
        return res.status(400).json({ message: "L’écriture n’est pas équilibrée : Débit ≠ Crédit" });
      }

      // Vérifier les soldes pour les nouveaux crédits
      for (const ligne of lignes) {
        const compte = await CompteComptable.findById(ligne.compte);
        if (!compte) return res.status(404).json({ message: `Compte ${ligne.compte} introuvable` });
        if (ligne.nature === "crédit" && compte.type === "actif") {
          if (compte.solde - ligne.montant < 0) {
            return res.status(400).json({ message: `Pas assez d’argent sur ${compte.nom} (solde : ${compte.solde})` });
          }
        }
      }
      ecriture.lignes = lignes;
    }

    // Mettre à jour les soldes avec les nouvelles valeurs
    for (const ligne of (lignes || ecriture.lignes)) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (ligne.nature === "débit") compte.solde += ligne.montant;
      else if (ligne.nature === "crédit") compte.solde -= ligne.montant;
      await compte.save();
    }

    await ecriture.save();
    res.json(ecriture);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la mise à jour", error: err.message });
  }
};

// DELETE - Supprimer une écriture (version sans transactions)
const deleteEcriture = async (req, res) => {
  try {
    const { id } = req.params;
    const ecriture = await EcritureComptable.findById(id).populate("lignes.compte");
    if (!ecriture) return res.status(404).json({ message: "Écriture introuvable" });

    // Restaurer les soldes
    for (const ligne of ecriture.lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (ligne.nature === "débit") compte.solde -= ligne.montant;
      else if (ligne.nature === "crédit") compte.solde += ligne.montant;
      await compte.save();
    }

    await EcritureComptable.findByIdAndDelete(id);
    res.json({ message: "Écriture supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

module.exports = { getEcritures, createEcriture, updateEcriture, deleteEcriture };