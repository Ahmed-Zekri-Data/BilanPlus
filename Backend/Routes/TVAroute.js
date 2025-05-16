const express = require("express");
const route = express.Router();
const TVAController = require("../Controller/TVAController");
const { validateTVA } = require("../Middelware/ValidateTVA");
const tclController = require('../Controller/TCLController');
const droitTimbreController = require('../Controller/DroitTimbreController');
const yup = require("yup");
const mongoose = require("mongoose");

// Middleware pour valider l'ID d'une TVA dans req.params
const validateTVAId = async (req, res, next) => {
    try {
        const idSchema = yup
            .string()
            .required("L'ID de la TVA est obligatoire")
            .test("is-valid-objectid", "ID de TVA invalide (doit être un ObjectId valide)", (value) => {
                return mongoose.isValidObjectId(value);
            });
        await idSchema.validate(req.params.id);
        next();
    } catch (error) {
        res.status(400).json({ errors: error.errors });
    }
};

// Routes avec validation
route.post("/addTVA", validateTVA, TVAController.addTVA);
route.get("/getallTVA", TVAController.getall);
route.get("/getTVAbyid/:id", validateTVAId, TVAController.getbyid);
route.delete("/deleteTVA/:id", validateTVAId, TVAController.deleteTVA);
route.put("/updateTVA/:id", validateTVAId, validateTVA, TVAController.updateTVA);
route.get('/tva/facture/:factureId', TVAController.calculerTVAFacture);
route.post('/tva/deductible', TVAController.calculerTVADeductible);
route.post('/tva/reconciliation', TVAController.reconciliationTVA);
route.post('/tva/regime-forfaitaire', TVAController.verifierRegimeForfaitaire);

// Routes TCL
route.post('/tcl/calculer', tclController.calculerTCL);
route.post('/tcl/par-commune', tclController.calculerTCLParCommune);
route.post('/tcl/exoneration', tclController.verifierExonerationTCL);

// Routes Droit de Timbre
route.get('/droit-timbre/facture/:factureId', droitTimbreController.calculerDroitTimbreFacture);
route.post('/droit-timbre/periode', droitTimbreController.calculerDroitTimbrePeriode);
route.post('/droit-timbre/rapport', droitTimbreController.genererRapportDroitTimbre);





module.exports = route;