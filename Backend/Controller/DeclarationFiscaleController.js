const DeclarationFiscale = require("../models/DeclarationFiscale");
const { body, param, validationResult } = require("express-validator");

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

exports.addDF = [
    body("periode")
        .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
        .withMessage("La période doit être au format YYYY-MM (ex. 2025-03)"),
    body("montantTotal")
        .isFloat({ min: 0 })
        .withMessage("Le montant total doit être positif ou nul"),
    body("statut")
        .isIn(["brouillon", "soumis", "payé", "rejeté"])
        .withMessage("Statut invalide"),
    body("compteComptable")
        .isMongoId()
        .withMessage("ID de compte comptable invalide"),
    validate([]),
    async (req, res) => {
        try {
            const declaration = new DeclarationFiscale({
                periode: req.body.periode,
                montantTotal: req.body.montantTotal,
                statut: req.body.statut,
                compteComptable: req.body.compteComptable,
            });
            await declaration.save();
            res.status(201).json(declaration);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de l'ajout de la déclaration", error: error.message });
        }
    }
];

exports.getall = async (req, res) => {
    try {
        const declarations = await DeclarationFiscale.find().populate("compteComptable");
        res.status(200).json(declarations);
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
            const declaration = await DeclarationFiscale.findById(req.params.id).populate("compteComptable");
            if (!declaration) return res.status(404).json({ message: "Déclaration non trouvée" });
            res.status(200).json(declaration);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la récupération", error: error.message });
        }
    }
];

exports.deleteDF = [
    param("id")
        .isMongoId()
        .withMessage("ID invalide"),
    validate([]),
    async (req, res) => {
        try {
            const declaration = await DeclarationFiscale.findByIdAndDelete(req.params.id);
            if (!declaration) return res.status(404).json({ message: "Déclaration non trouvée" });
            res.status(200).json({ message: "Déclaration supprimée" });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
        }
    }
];

exports.updateDF = [
    param("id")
        .isMongoId()
        .withMessage("ID invalide"),
    body("periode")
        .optional()
        .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
        .withMessage("La période doit être au format YYYY-MM"),
    body("montantTotal")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Le montant total doit être positif ou nul"),
    body("statut")
        .optional()
        .isIn(["brouillon", "soumis", "payé", "rejeté"])
        .withMessage("Statut invalide"),
    body("compteComptable")
        .optional()
        .isMongoId()
        .withMessage("ID de compte comptable invalide"),
    validate([]),
    async (req, res) => {
        try {
            const declaration = await DeclarationFiscale.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!declaration) return res.status(404).json({ message: "Déclaration non trouvée" });
            res.status(200).json(declaration);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
        }
    }
];