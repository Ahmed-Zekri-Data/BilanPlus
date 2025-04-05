const Facture = require("../models/Facture");

// ✅ Ajouter une facture
exports.createFacture = async (req, res) => {
    try {
        const facture = new Facture(req.body);
        await facture.save();
        res.status(201).json(facture);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Récupérer toutes les factures
exports.getAllFactures = async (req, res) => {
    try {
        const factures = await Facture.find().populate("client").populate("produits").populate("tva");
        res.json(factures);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Récupérer une facture par ID
exports.getFactureById = async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id).populate("client").populate("produits").populate("tva");
        if (!facture) return res.status(404).json({ message: "Facture non trouvée" });
        res.json(facture);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Modifier une facture
exports.updateFacture = async (req, res) => {
    try {
        const facture = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!facture) return res.status(404).json({ message: "Facture non trouvée" });
        res.json(facture);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Supprimer une facture
exports.deleteFacture = async (req, res) => {
    try {
        const facture = await Facture.findByIdAndDelete(req.params.id);
        if (!facture) return res.status(404).json({ message: "Facture non trouvée" });
        res.json({ message: "Facture supprimée avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
