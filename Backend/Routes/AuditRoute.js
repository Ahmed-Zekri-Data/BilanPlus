const express = require('express');
const router = express.Router();
const AuditController = require('../Controller/AuditController');
const { verifierToken, verifierAdmin, verifierPermission } = require('../MiddleWare/Auth');

// Toutes les routes nécessitent un token et une permission spécifique
router.get('/logs', verifierToken, verifierPermission('gererUtilisateursEtRoles'), AuditController.getAuditLogs);
router.get('/login-history/:userId', verifierToken, verifierPermission('gererUtilisateursEtRoles'), AuditController.getLoginHistory);
router.get('/user-actions/:userId', verifierToken, verifierPermission('gererUtilisateursEtRoles'), AuditController.getUserActions);
router.post('/log', verifierToken, AuditController.logAction);
router.get('/export-csv', verifierToken, verifierPermission('gererUtilisateursEtRoles'), AuditController.exportAuditLogsToCSV);

module.exports = router;
