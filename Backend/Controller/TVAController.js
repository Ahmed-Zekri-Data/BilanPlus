const TVA = require("../Models/TVA");
const TvaService = require("../Services/TVAService");

// Ajouter une TVA
async function addTVA(req, res) {
    try {
        // Vérifier si les données requises sont présentes
        if (!req.body.taux || !req.body.montant) {
            return res.status(400).json({
                success: false,
                message: "Données incomplètes",
                errors: ["Veuillez saisir un taux et un montant de TVA valides"]
            });
        }

        // Créer la nouvelle TVA avec les données fournies
        const newTVA = new TVA({
            taux: req.body.taux,
            montant: req.body.montant,
            declarations: req.body.declarations || []
        });

        // Sauvegarder la TVA
        await newTVA.save();

        // Récupérer la TVA avec les déclarations peuplées pour l'inclure dans la réponse
        const tvaWithDeclarations = await TVA.findById(newTVA._id).populate("declarations");

        // Réponse avec succès
        res.status(201).json({
            success: true,
            message: "TVA ajoutée avec succès.",
            data: tvaWithDeclarations
        });
    } catch (err) {
        // Gérer les différents types d'erreurs
        console.error("Erreur lors de l'ajout de la TVA:", err);

        // Erreurs de validation MongoDB
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => {
                if (error.path === 'taux') {
                    return `Taux de TVA : ${error.message}`;
                } else if (error.path === 'declarations') {
                    return `Déclarations fiscales : ${error.message}`;
                } else {
                    return error.message;
                }
            });

            return res.status(400).json({
                success: false,
                message: "Validation échouée",
                errors: errors
            });
        }

        // Erreur de référence (déclarations non trouvées)
        if (err.name === 'ReferenceError' || err.message.includes('declarations')) {
            return res.status(400).json({
                success: false,
                message: "Déclarations fiscales invalides",
                errors: ["Une ou plusieurs déclarations fiscales sélectionnées n'existent pas ou ne sont pas valides"]
            });
        }

        // Erreur de duplication (si applicable)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplication détectée",
                errors: ["Une TVA avec ces caractéristiques existe déjà"]
            });
        }

        // Autres erreurs
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'ajout de la TVA",
            errors: [err.message || "Une erreur inattendue s'est produite"]
        });
    }
}

// Récupérer toutes les TVA
async function getall(req, res) {
    try {
        const getTVA = await TVA.find().populate("declarations");
        res.status(200).json(getTVA);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Récupérer une TVA par ID
async function getbyid(req, res) {
    try {
        const getonetva = await TVA.findById(req.params.id).populate("declarations");
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
        // Vérifier si l'ID est valide
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "ID de TVA manquant",
                errors: ["Veuillez fournir l'identifiant de la TVA à mettre à jour"]
            });
        }

        // Vérifier si les données requises sont présentes
        if (req.body.taux === undefined && req.body.montant === undefined && req.body.declarations === undefined) {
            return res.status(400).json({
                success: false,
                message: "Aucune donnée à mettre à jour",
                errors: ["Veuillez fournir au moins un champ à mettre à jour (taux, montant ou déclarations)"]
            });
        }

        // Vérifier la validité des données fournies
        if (req.body.taux !== undefined) {
            const validTaux = [7, 13, 19];
            if (isNaN(req.body.taux) || !validTaux.includes(Number(req.body.taux))) {
                return res.status(400).json({
                    success: false,
                    message: "Taux de TVA invalide",
                    errors: ["Le taux de TVA doit être 7%, 13% ou 19%"]
                });
            }
        }

        // Vérifier si le montant est valide
        if (req.body.montant !== undefined) {
            if (isNaN(req.body.montant) || Number(req.body.montant) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Montant de TVA invalide",
                    errors: ["Le montant de TVA doit être un nombre positif"]
                });
            }
        }

        // Mettre à jour la TVA
        const TVAupdated = await TVA.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("declarations");

        // Vérifier si la TVA existe
        if (!TVAupdated) {
            return res.status(404).json({
                success: false,
                message: "TVA non trouvée",
                errors: ["Aucune TVA trouvée avec l'identifiant fourni"]
            });
        }

        // Réponse avec succès
        res.status(200).json({
            success: true,
            message: "TVA mise à jour avec succès.",
            data: TVAupdated
        });
    } catch (err) {
        // Gérer les différents types d'erreurs
        console.error("Erreur lors de la mise à jour de la TVA:", err);

        // Erreurs de validation MongoDB
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => {
                if (error.path === 'taux') {
                    return `Taux de TVA : ${error.message}`;
                } else if (error.path === 'declarations') {
                    return `Déclarations fiscales : ${error.message}`;
                } else {
                    return error.message;
                }
            });

            return res.status(400).json({
                success: false,
                message: "Validation échouée",
                errors: errors
            });
        }

        // Erreur de cast (ID invalide)
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "ID de TVA invalide",
                errors: ["L'identifiant de TVA fourni n'est pas valide"]
            });
        }

        // Erreur de référence (déclarations non trouvées)
        if (err.name === 'ReferenceError' || err.message.includes('declarations')) {
            return res.status(400).json({
                success: false,
                message: "Déclarations fiscales invalides",
                errors: ["Une ou plusieurs déclarations fiscales sélectionnées n'existent pas ou ne sont pas valides"]
            });
        }

        // Autres erreurs
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de la TVA",
            errors: [err.message || "Une erreur inattendue s'est produite"]
        });
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