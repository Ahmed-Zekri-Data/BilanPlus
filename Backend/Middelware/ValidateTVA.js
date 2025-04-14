const yup = require("yup");
const mongoose = require("mongoose");
const DeclarationFiscaleController = require("../Controller/DeclarationFiscaleController");

// Schéma de validation pour TVA
const tvaSchema = yup.object().shape({
    taux: yup
        .number()
        .required("Le taux est obligatoire")
        .oneOf([7, 13, 19], "Le taux doit être 7, 13 ou 19"),
    montant: yup
        .number()
        .required("Le montant est obligatoire")
        .min(0, "Le montant doit être positif ou nul"),
    declaration: yup
        .mixed()
        .required("La déclaration est obligatoire")
        .test("is-valid-declaration", "La déclaration doit être un ObjectId valide ou un objet avec un _id valide", (value) => {
            if (typeof value === "string") {
                return mongoose.isValidObjectId(value);
            }
            if (typeof value === "object" && value._id) {
                return mongoose.isValidObjectId(value._id);
            }
            return false;
        })
        .test("declaration-exists", "La déclaration spécifiée n'existe pas", async (value) => {
            try {
                const id = typeof value === "string" ? value : value._id;
                await DeclarationFiscaleController.findDeclarationById(id);
                return true;
            } catch (error) {
                return false;
            }
        })
        .transform((value) => {
            return typeof value === "string" ? value : value._id;
        }),
});

// Middleware pour valider les données avec Yup
const validateTVA = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        if (typeof req.body.declaration === "object" && req.body.declaration._id) {
            req.body.declaration = req.body.declaration._id;
        }
        next();
    } catch (error) {
        res.status(400).json({ errors: error.errors });
    }
};

// Exporter le middleware de validation
module.exports = {
    validateTVA: validateTVA(tvaSchema),
    tvaSchema,
};