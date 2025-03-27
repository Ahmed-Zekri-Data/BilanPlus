const express = require("express");
const router = express.Router();
const factureController = require("../Controller/factureController");

router.post("/", factureController.createFacture);       // Ajouter une facture
router.get("/", factureController.getAllFactures);       // Lister toutes les factures
router.get("/:id", factureController.getFactureById);    // Récupérer une facture par ID
router.put("/:id", factureController.updateFacture);     // Modifier une facture
router.delete("/:id", factureController.deleteFacture);  // Supprimer une facture

module.exports = router;
