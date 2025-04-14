const express = require("express");
const route = express.Router();
const TVAController = require("../Controller/TVAController");
const { validateTVA } = require("../Middelware/ValidateTVA");
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

module.exports = route;