// Ajouter à Backend/Routes/fiscaliteRoutes.js
const dashboardController = require('../Controller/DashboardFiscalController');
const express = require("express");
const router = express.Router();
// Routes Dashboard Fiscal
router.get('/dashboard/:annee', dashboardController.getDashboardFiscal);

// Routes Simulations
router.post('/simulation/volume-activite', dashboardController.simulerChangementVolumeActivite);
router.post('/simulation/regime-imposition', dashboardController.simulerChangementRegimeImposition);
router.post('/simulation/investissement', dashboardController.simulerImpactInvestissement);

module.exports = router;