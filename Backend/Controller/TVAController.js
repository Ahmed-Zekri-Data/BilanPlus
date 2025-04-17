const TVA = require("../Models/TVA");
const TvaService = require("../Services/TVAService");

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

// Calculer TVA pour une facture
async function calculerTVAFacture(req, res) {
    try {
        const { factureId } = req.params;
        const resultatTVA = await TvaService.calculerTVAFacture(factureId);
        return res.status(200).json({
            success: true,
            data: resultatTVA
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Calculer TVA déductible
async function calculerTVADeductible(req, res) {
    try {
        const { dateDebut, dateFin } = req.body;
        if (!dateDebut || !dateFin) {
            return res.status(400).json({
                success: false,
                message: 'Les dates de début et de fin sont requises'
            });
        }
        const resultatTVA = await TvaService.calculerTVADeductible(new Date(dateDebut), new Date(dateFin));
        return res.status(200).json({
            success: true,
            data: resultatTVA
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Réconciliation TVA
async function reconciliationTVA(req, res) {
    try {
        const { dateDebut, dateFin } = req.body;
        if (!dateDebut || !dateFin) {
            return res.status(400).json({
                success: false,
                message: 'Les dates de début et de fin sont requises'
            });
        }
        const bilanTVA = await TvaService.reconciliationTVA(new Date(dateDebut), new Date(dateFin));
        return res.status(200).json({
            success: true,
            data: bilanTVA
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Vérifier régime forfaitaire
async function verifierRegimeForfaitaire(req, res) {
    try {
        const { entreprise, chiffreAffairesAnnuel } = req.body;
        if (!entreprise || chiffreAffairesAnnuel === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Les informations de l\'entreprise et le chiffre d\'affaires sont requis'
            });
        }
        const resultat = TvaService.verifierEligibiliteRegimeForfaitaire(entreprise, chiffreAffairesAnnuel);
        return res.status(200).json({
            success: true,
            data: {
                entreprise: entreprise.nom || entreprise.raisonSociale,
                chiffreAffairesAnnuel,
                estEligible: resultat,
                message: resultat
                    ? 'L\'entreprise est éligible au régime forfaitaire'
                    : 'L\'entreprise n\'est pas éligible au régime forfaitaire'
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    addTVA,
    getall,
    getbyid,
    deleteTVA,
    updateTVA,
    calculerTVAFacture,
    calculerTVADeductible,
    reconciliationTVA,
    verifierRegimeForfaitaire
};