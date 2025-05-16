const yup = require("yup");
const mongoose = require("mongoose");
const DeclarationFiscale = require("../Models/DeclarationFiscale");

// Schéma de validation pour TVA
const tvaSchema = yup.object().shape({
    taux: yup
        .number()
        .required("Veuillez saisir un taux de TVA valide")
        .typeError("Le taux de TVA doit être un nombre (7, 13 ou 19)")
        .oneOf([7, 13, 19], "Le taux de TVA doit être 7%, 13% ou 19%"),
    montant: yup
        .number()
        .required("Veuillez saisir un montant de TVA valide")
        .typeError("Le montant de TVA doit être un nombre (ex: 150.50)")
        .min(0, "Le montant de TVA doit être un nombre positif (ex: 150.50 DT)"),
    declarations: yup
        .array()
        .of(
            yup.mixed()
                .test("is-valid-declaration", "L'identifiant de la déclaration fiscale n'est pas valide. Veuillez sélectionner une déclaration existante.", (value) => {
                    // Si la valeur est null ou undefined, c'est valide
                    if (value === null || value === undefined || value === '') {
                        return true;
                    }
                    // Sinon, vérifier si c'est un ObjectId valide
                    if (typeof value === "string") {
                        return mongoose.isValidObjectId(value);
                    }
                    if (typeof value === "object" && value._id) {
                        return mongoose.isValidObjectId(value._id);
                    }
                    return false;
                })
                .test("declaration-exists", "La déclaration fiscale sélectionnée n'existe pas dans la base de données. Veuillez sélectionner une déclaration existante.", async (value) => {
                    // Si la valeur est null ou undefined, c'est valide
                    if (value === null || value === undefined || value === '') {
                        return true;
                    }
                    try {
                        const id = typeof value === "string" ? value : value._id;
                        const declaration = await DeclarationFiscale.findById(id);
                        return !!declaration; // Retourne true si la déclaration existe, false sinon
                    } catch (error) {
                        return false;
                    }
                })
                .transform((value) => {
                    if (value === null || value === undefined || value === '') {
                        return null;
                    }
                    return typeof value === "string" ? value : value._id;
                })
        )
        .nullable()
        .default([]),
});

// Middleware pour valider les données avec Yup
const validateTVA = async (req, res, next) => {
    try {
        // Valider les données avec le schéma
        await tvaSchema.validate(req.body, { abortEarly: false });

        // Transformer les déclarations si ce sont des objets
        if (req.body.declarations && Array.isArray(req.body.declarations)) {
            req.body.declarations = req.body.declarations.map(decl => {
                if (typeof decl === "object" && decl._id) {
                    return decl._id;
                }
                return decl;
            });
        }

        // Passer au middleware suivant
        next();
    } catch (error) {
        // Renvoyer les erreurs de validation avec des messages plus clairs
        let errors = [];

        if (error.inner && error.inner.length > 0) {
            // Yup validation errors
            errors = error.inner.map(err => {
                // Personnaliser les messages d'erreur selon le champ
                if (err.path === 'taux') {
                    return `Taux de TVA : ${err.message}`;
                } else if (err.path === 'montant') {
                    return `Montant de TVA : ${err.message}`;
                } else if (err.path === 'declarations') {
                    return `Déclarations fiscales : ${err.message}`;
                } else {
                    return err.message;
                }
            });
        } else if (error.errors) {
            // Autres erreurs avec un tableau d'erreurs
            errors = error.errors;
        } else {
            // Erreur simple
            errors = [error.message || "Une erreur est survenue lors de la validation des données"];
        }

        // Ajouter un message d'aide général
        errors.push("Veuillez vérifier les données saisies et réessayer.");

        res.status(400).json({
            success: false,
            message: "Validation échouée",
            errors: errors
        });
    }
};

// Exporter le middleware de validation
module.exports = {
    validateTVA,
    tvaSchema,
};