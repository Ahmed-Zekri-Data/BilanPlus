const TVA = require("../Models/TVA");

// Ajouter une TVA
async function addTVA(req, res) {
    try {
        const newTVA = new TVA({
            taux: req.body.taux,
            montant: req.body.montant,
            declaration: req.body.declaration,
        });
        await newTVA.save();
        res.status(201).json({ message: "TVA ajoutée", data: newTVA });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de l'ajout de la TVA", error: err.message });
    }
}

// Récupérer toutes les TVA
async function getall(req, res) {
    try {
        const getTVA = await TVA.find().populate("declaration");
        res.status(200).json(getTVA);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Récupérer une TVA par ID
async function getbyid(req, res) {
    try {
        const getonetva = await TVA.findById(req.params.id).populate("declaration");
        if (!getonetva) {
            return res.status(404).json({ message: "TVA non trouvée" });
        }
        res.status(200).json(getonetva);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Supprimer une TVA
async function deleteTVA(req, res) {
    try {
        const TVAdeleted = await TVA.findByIdAndDelete(req.params.id);
        if (!TVAdeleted) {
            return res.status(404).json({ message: "TVA non trouvée" });
        }
        res.status(200).json({ message: "TVA supprimée" });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la suppression", error: err.message });
    }
}

// Mettre à jour une TVA
async function updateTVA(req, res) {
    try {
        const TVAupdated = await TVA.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!TVAupdated) {
            return res.status(404).json({ message: "TVA non trouvée" });
        }
        res.status(200).json({ message: "TVA mise à jour", data: TVAupdated });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
}

module.exports = { addTVA, getall, getbyid, deleteTVA, updateTVA };