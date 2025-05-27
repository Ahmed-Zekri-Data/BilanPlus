const CompteComptable = require("../Models/CompteComptable");
const EcritureComptable = require("../Models/EcritureComptable");

// Récupérer tous les comptes comptables
const getComptes = async (req, res) => {
    try {
        const comptes = await CompteComptable.find();
        res.json(comptes);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

// Récupérer un compte comptable par ID
const getById = async (req, res) => {
    try {
        const compte = await CompteComptable.findById(req.params.id);
        if (!compte) {
            return res.status(404).json({ message: "Compte comptable non trouvé" });
        }
        res.status(200).json(compte);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
};

// Fonction utilitaire pour vérifier l'existence d'un compte par ID
const findCompteById = async (id) => {
    try {
        const compte = await CompteComptable.findById(id);
        if (!compte) {
            throw new Error("Compte comptable non trouvé");
        }
        return compte;
    } catch (err) {
        throw new Error(err.message);
    }
};

// Ajouter un compte comptable
const createCompte = async (req, res) => {
    try {
        const { numeroCompte, nom, type } = req.body;
        if (!numeroCompte || !nom || !type) {
            return res.status(400).json({ message: "Numéro, Nom et Type sont requis" });
        }
        const compte = new CompteComptable({ numeroCompte, nom, type });
        await compte.save();
        res.status(201).json(compte);
    } catch (err) {
        res.status(400).json({ message: "Impossible d'ajouter le compte", error: err.message });
    }
};


// Mettre à jour un compte comptable
const updateCompte = async (req, res) => {
    try {
        const { id } = req.params;
        const { numeroCompte, nom, type, solde } = req.body;

        const compte = await CompteComptable.findById(id);
        if (!compte) return res.status(404).json({ message: "Compte introuvable" });

        if (numeroCompte) compte.numeroCompte = numeroCompte;
        if (nom) compte.nom = nom;
        if (type) compte.type = type;
        if (solde !== undefined) compte.solde = solde;

        await compte.save();
        res.json(compte);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
};

// Supprimer un compte comptable
const deleteCompte = async (req, res) => {
    try {
        const { id } = req.params;
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

module.exports = { getComptes, getById, findCompteById, createCompte, updateCompte, deleteCompte };