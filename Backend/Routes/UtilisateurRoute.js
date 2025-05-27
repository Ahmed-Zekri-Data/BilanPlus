const express = require('express');
const router = express.Router();
const UtilisateurController = require('../Controller/UtilisateurController');
const { verifierToken, verifierAdmin, verifierPermission } = require('../MiddleWare/Auth');
const { validateCreateUser, validateUpdateUser } = require('../Validators/utilisateur.validator');

router.get('/getall', verifierToken, verifierPermission('gererUtilisateursEtRoles'), UtilisateurController.getAllUsers);
router.get('/:id', verifierToken, verifierPermission('gererUtilisateursEtRoles'), UtilisateurController.getUserById);
router.post('/login', UtilisateurController.login);
router.post('/add', verifierToken, verifierPermission('gererUtilisateursEtRoles'), validateCreateUser, UtilisateurController.createUser);
router.put('/:id', verifierToken, verifierPermission('gererUtilisateursEtRoles'), validateUpdateUser, UtilisateurController.updateUser);
router.delete('/:id', verifierToken, verifierAdmin, UtilisateurController.deleteUser);
router.post('/reset-attempts/:id', verifierToken, verifierAdmin, UtilisateurController.resetLoginAttempts);
router.patch('/toggle-status/:id', verifierToken, verifierPermission('gererUtilisateursEtRoles'), UtilisateurController.toggleUserStatus);
router.put('/update-password/:id', verifierToken, UtilisateurController.updatePassword);
// Routes pour la réinitialisation de mot de passe
router.post('/request-reset-password', UtilisateurController.requestPasswordReset);
router.post('/request-password-reset', UtilisateurController.requestPasswordReset); // Route alternative pour compatibilité
router.post('/reset-password', UtilisateurController.resetPassword);
router.get('/activite', verifierToken, verifierAdmin, UtilisateurController.analyserActiviteUtilisateurs);
router.get('/export-csv', verifierToken, verifierPermission('gererUtilisateursEtRoles'), UtilisateurController.exportUsersToCSV);

// Routes pour l'authentification à deux facteurs
router.post('/enable-2fa/:id', verifierToken, verifierPermission('gererUtilisateursEtRoles'), UtilisateurController.enableTwoFactor);
router.post('/disable-2fa/:id', verifierToken, verifierPermission('gererUtilisateursEtRoles'), UtilisateurController.disableTwoFactor);
router.post('/verify-2fa/:id', verifierToken, UtilisateurController.verifyTwoFactor);

module.exports = router;