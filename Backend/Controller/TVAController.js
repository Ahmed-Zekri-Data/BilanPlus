const TVA = require("../models/TVA");
const { body, param, validationResult } = require("express-validator");
const DeclarationFiscale = require("../models/DeclarationFiscale");

// Validation middleware pour chaque méthode
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    };
};

exports.addTVA = [
    // Validations
    body("taux")
        .isFloat({ min: 0 })
        .isIn([7, 13, 19])
        .withMessage("Le taux doit être 7, 13 ou 19"),
    body("montant")
        .isFloat({ min: 0 })
        .withMessage("Le montant doit être positif ou nul"),
    body("declaration")
        .isMongoId()
        .withMessage("ID de déclaration invalide")
        .custom(async (value) => {
            const declaration = await DeclarationFiscale.findById(value);
            if (!declaration) {
                throw new Error("La déclaration spécifiée n'existe pas");
            }
            return true;
        }),
    // Contrôleur
    validate([]), // Applique les validations ci-dessus
    async (req, res) => {
        try {
            const tva = new TVA({
                taux: req.body.taux,
                montant: req.body.montant,
                declaration: req.body.declaration,
            });
            await tva.save();
            res.status(201).json(tva);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de l'ajout de la TVA", error: error.message });
        }
    }
];

exports.getall = async (req, res) => {
    try {
        const tvas = await TVA.find().populate("declaration");
        res.status(200).json(tvas);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération", error: error.message });
    }
};

exports.getbyid = [
    param("id")
        .isMongoId()
        .withMessage("ID invalide"),
    validate([]),
    async (req, res) => {
        try {
            const tva = await TVA.findById(req.params.id).populate("declaration");
            if (!tva) return res.status(404).json({ message: "TVA non trouvée" });
            res.status(200).json(tva);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la récupération", error: error.message });
        }
    }
];

exports.deleteTVA = [
    param("id")
        .isMongoId()
        .withMessage("ID invalide"),
    validate([]),
    async (req, res) => {
        try {
            const tva = await TVA.findByIdAndDelete(req.params.id);
            if (!tva) return res.status(404).json({ message: "TVA non trouvée" });
            res.status(200).json({ message: "TVA supprimée" });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
        }
    }
];

exports.updateTVA = [
    param("id")
        .isMongoId()
        .withMessage("ID invalide"),
    body("taux")
        .optional()
        .isFloat({ min: 0 })
        .isIn([7, 13, 19])
        .withMessage("Le taux doit être 7, 13 ou 19"),
    body("montant")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Le montant doit être positif ou nul"),
    body("declaration")
        .optional()
        .isMongoId()
        .withMessage("ID de déclaration invalide"),
    validate([]),
    async (req, res) => {
        try {
            const tva = await TVA.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!tva) return res.status(404).json({ message: "TVA non trouvée" });
            res.status(200).json(tva);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
        }
    }
];