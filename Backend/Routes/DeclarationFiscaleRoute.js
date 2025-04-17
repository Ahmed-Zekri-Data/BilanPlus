const express = require("express");
const route = express.Router();
const DFC = require("../Controller/DeclarationFiscaleController");
const { validateDeclarationFiscale } = require("../Middelware/ValidateDeclarationfiscale")
const yup = require("yup");
const mongoose = require("mongoose");

// Middleware pour valider l'ID d'une déclaration dans req.params
const validateDeclarationId = async (req, res, next) => {
    try {
        const idSchema = yup
            .string()
            .required("L'ID de la déclaration est obligatoire")
            .test("is-valid-objectid", "ID de déclaration invalide (doit être un ObjectId valide)", (value) => {
                return mongoose.isValidObjectId(value);
            });
        await idSchema.validate(req.params.id);
        next();
    } catch (error) {
        res.status(400).json({ errors: error.errors });
    }
};

// Routes avec validation
route.post("/addDeclaration", validateDeclarationFiscale, DFC.addDF);
route.get("/getallDF", DFC.getall);
route.get("/getDFbyid/:id", validateDeclarationId, DFC.getbyid);
route.delete("/deleteDF/:id", validateDeclarationId, DFC.deleteDF);
route.put("/updateDF/:id", validateDeclarationId, validateDeclarationFiscale, DFC.updateDF);
route.post('/declaration/generer', DFC.genererDeclarationFiscale);
route.get('/declaration/formulaire/:declarationId', DFC.genererFormulaireOfficiel);
route.post('/declaration/verification-delais', DFC.verifierDelaisDeclaration);
route.put('/declaration/soumettre/:declarationId', DFC.soumettreDeclaration);
module.exports = route;