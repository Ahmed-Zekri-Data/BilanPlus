const yup = require("yup");
const mongoose = require("mongoose");
const CompteComptableController = require("../Controller/CompteController");

// Schéma de validation pour DeclarationFiscale
const declarationFiscaleSchema = yup.object().shape({
    periode: yup
        .string()
        .required("La période est obligatoire")
        .matches(/^\d{4}-\d{2}-\d{2} - \d{4}-\d{2}-\d{2}$/, "La période doit être au format YYYY-MM-DD - YYYY-MM-DD"),
    montantTotal: yup
        .number()
        .required("Le montant total est obligatoire")
        .min(0, "Le montant total ne peut pas être négatif"),
    statut: yup
        .string()
        .required("Le statut est obligatoire")
        .oneOf(["brouillon", "soumise", "validée", "payé", "rejeté"], "Statut invalide"),
    compteComptable: yup
        .mixed()
        .required("Le compte comptable est obligatoire")
        .test("is-valid-compteComptable", "Le compte comptable doit être un ObjectId valide ou un objet avec un _id valide", (value) => {
            if (typeof value === "string") {
                return mongoose.isValidObjectId(value);
            }
            if (typeof value === "object" && value._id) {
                return mongoose.isValidObjectId(value._id);
            }
            return false;
        })
        .test("compteComptable-exists", "Le compte comptable spécifié n'existe pas", async (value) => {
            try {
                const id = typeof value === "string" ? value : value._id;
                await CompteComptableController.findCompteById(id);
                return true;
            } catch (error) {
                return false;
            }
        })
        .transform((value) => {
            return typeof value === "string" ? value : value._id;
        }),
    type: yup
        .string()
        .required("Le type de déclaration est obligatoire")
        .oneOf(["mensuelle", "trimestrielle", "annuelle"], "Type de déclaration invalide"),
    totalTVACollectee: yup
        .number()
        .required("Le total TVA collectée est obligatoire")
        .min(0, "Le total TVA collectée ne peut pas être négatif"),
    totalTVADeductible: yup
        .number()
        .required("Le total TVA déductible est obligatoire")
        .min(0, "Le total TVA déductible ne peut pas être négatif"),
    totalTVADue: yup
        .number()
        .required("Le total TVA due est obligatoire"),
    totalTCL: yup
        .number()
        .required("Le total TCL est obligatoire")
        .min(0, "Le total TCL ne peut pas être négatif"),
    totalDroitTimbre: yup
        .number()
        .required("Le total droit de timbre est obligatoire")
        .min(0, "Le total droit de timbre ne peut pas être négatif"),
});

// Middleware pour valider les données avec Yup
const validateDeclarationFiscale = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        if (typeof req.body.compteComptable === "object" && req.body.compteComptable._id) {
            req.body.compteComptable = req.body.compteComptable._id;
        }
        next();
    } catch (error) {
        res.status(400).json({ errors: error.errors });
    }
};

// Exporter le middleware de validation
module.exports = {
    validateDeclarationFiscale: validateDeclarationFiscale(declarationFiscaleSchema),
    declarationFiscaleSchema,
};