const express = require("express");
const router = express.Router();
const AdvancedReportsController = require("../Controller/AdvancedReportsController");

// Route pour le tableau de flux de trésorerie
router.get("/cash-flow", AdvancedReportsController.getCashFlowStatement);

// Route pour les ratios financiers
router.get("/financial-ratios", AdvancedReportsController.getFinancialRatios);

// Route pour les rapports comparatifs
router.get("/comparative", AdvancedReportsController.getComparativeReport);

module.exports = router;
