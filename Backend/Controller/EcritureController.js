const EcritureComptable = require("../Models/EcritureComptable");
const CompteComptable = require("../Models/CompteComptable");

// Récupérer toutes les écritures
const getEcritures = async (req, res) => {
  try {
    const ecritures = await EcritureComptable.find().populate("lignes.compte");
    res.status(200).json(ecritures);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des écritures : " + error.message });
  }
};

// Créer une nouvelle écriture
const createEcriture = async (req, res) => {
  try {
    const { libelle, date, lignes } = req.body;

    // Validation des données
    if (!libelle || !lignes || !Array.isArray(lignes) || lignes.length === 0) {
      return res.status(400).json({ message: "Données invalides : libelle et lignes sont requis." });
    }

    // Calculer la somme des débits et des crédits
    const totalDebit = lignes
      .filter((ligne) => ligne.nature === "débit")
      .reduce((sum, ligne) => sum + (ligne.montant || 0), 0);
    const totalCredit = lignes
      .filter((ligne) => ligne.nature === "crédit")
      .reduce((sum, ligne) => sum + (ligne.montant || 0), 0);

    // Vérifier l’équilibrage
    if (totalDebit !== totalCredit) {
      return res.status(400).json({
        message: `L’écriture n’est pas équilibrée : débit (${totalDebit}) ≠ crédit (${totalCredit})`,
      });
    }

    // Vérifier que tous les comptes existent
    for (const ligne of lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (!compte) {
        return res.status(404).json({ message: `Compte avec ID ${ligne.compte} non trouvé.` });
      }
    }

    // Créer l’écriture comptable
    const nouvelleEcriture = new EcritureComptable({
      libelle,
      date: date || Date.now(),
      lignes,
    });
    await nouvelleEcriture.save();

    // Mettre à jour les soldes des comptes
    for (const ligne of lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      // Convention : un débit diminue le solde, un crédit l’augmente (à ajuster selon tes besoins)
      if (ligne.nature === "débit") {
        compte.solde -= ligne.montant;
      } else if (ligne.nature === "crédit") {
        compte.solde += ligne.montant;
      }
      await compte.save();
    }

    // Renvoyer l’écriture avec les comptes peuplés
    const ecriturePeuplee = await EcritureComptable.findById(nouvelleEcriture._id).populate("lignes.compte");
    res.status(201).json(ecriturePeuplee);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l’écriture : " + error.message });
  }
};

// Mettre à jour une écriture
const updateEcriture = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, date, lignes } = req.body;

    // Validation des données
    if (!libelle || !lignes || !Array.isArray(lignes) || lignes.length === 0) {
      return res.status(400).json({ message: "Données invalides : libelle et lignes sont requis." });
    }

    // Récupérer l’écriture existante
    const ecritureExistante = await EcritureComptable.findById(id);
    if (!ecritureExistante) {
      return res.status(404).json({ message: "Écriture non trouvée." });
    }

    // Annuler l’impact de l’ancienne écriture sur les soldes
    for (const ligne of ecritureExistante.lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (ligne.nature === "débit") {
        compte.solde += ligne.montant; // Annuler le débit (augmenter le solde)
      } else if (ligne.nature === "crédit") {
        compte.solde -= ligne.montant; // Annuler le crédit (diminuer le solde)
      }
      await compte.save();
    }

    // Calculer la somme des débits et des crédits pour la nouvelle écriture
    const totalDebit = lignes
      .filter((ligne) => ligne.nature === "débit")
      .reduce((sum, ligne) => sum + (ligne.montant || 0), 0);
    const totalCredit = lignes
      .filter((ligne) => ligne.nature === "crédit")
      .reduce((sum, ligne) => sum + (ligne.montant || 0), 0);

    // Vérifier l’équilibrage
    if (totalDebit !== totalCredit) {
      return res.status(400).json({
        message: `L’écriture n’est pas équilibrée : débit (${totalDebit}) ≠ crédit (${totalCredit})`,
      });
    }

    // Vérifier que tous les comptes existent
    for (const ligne of lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (!compte) {
        return res.status(404).json({ message: `Compte avec ID ${ligne.compte} non trouvé.` });
      }
    }

    // Mettre à jour l’écriture
    ecritureExistante.libelle = libelle;
    ecritureExistante.date = date || ecritureExistante.date;
    ecritureExistante.lignes = lignes;
    await ecritureExistante.save();

    // Mettre à jour les soldes des comptes avec la nouvelle écriture
    for (const ligne of lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (ligne.nature === "débit") {
        compte.solde -= ligne.montant;
      } else if (ligne.nature === "crédit") {
        compte.solde += ligne.montant;
      }
      await compte.save();
    }

    // Renvoyer l’écriture mise à jour avec les comptes peuplés
    const ecriturePeuplee = await EcritureComptable.findById(id).populate("lignes.compte");
    res.status(200).json(ecriturePeuplee);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l’écriture : " + error.message });
  }
};

// Supprimer une écriture
const deleteEcriture = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer l’écriture existante
    const ecriture = await EcritureComptable.findById(id);
    if (!ecriture) {
      return res.status(404).json({ message: "Écriture non trouvée." });
    }

    // Annuler l’impact de l’écriture sur les soldes
    for (const ligne of ecriture.lignes) {
      const compte = await CompteComptable.findById(ligne.compte);
      if (ligne.nature === "débit") {
        compte.solde += ligne.montant; // Annuler le débit
      } else if (ligne.nature === "crédit") {
        compte.solde -= ligne.montant; // Annuler le crédit
      }
      await compte.save();
    }

    // Supprimer l’écriture
    await EcritureComptable.findByIdAndDelete(id);
    res.status(200).json({ message: "Écriture supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l’écriture : " + error.message });
  }
};

module.exports = {
  getEcritures,
  createEcriture,
  updateEcriture,
  deleteEcriture,
};