const express = require('express');
const router = express.Router();
const UtilisateurController = require('../Controller/UtilisateurController');
const { verifierToken, verifierAdmin, verifierPermission } = require('../MiddleWare/Auth');
const { validateCreateUser, validateUpdateUser } = require('../Validators/utilisateur.validator');

router.get('/getall', verifierToken, verifierPermission('gestionUtilisateurs'), UtilisateurController.getAllUsers);
router.get('/:id', verifierToken, verifierPermission('gestionUtilisateurs'), UtilisateurController.getUserById);
router.post('/login', UtilisateurController.login);
router.post('/add', verifierToken, verifierPermission('gestionUtilisateurs'), validateCreateUser, UtilisateurController.createUser);
router.put('/:id', verifierToken, verifierPermission('gestionUtilisateurs'), validateUpdateUser, UtilisateurController.updateUser);
router.delete('/:id', verifierToken, verifierAdmin, UtilisateurController.deleteUser);
router.post('/reset-attempts/:id', verifierToken, verifierAdmin, UtilisateurController.resetLoginAttempts);
router.put('/update-password/:id', verifierToken, UtilisateurController.updatePassword);
router.post('/request-reset-password', UtilisateurController.requestPasswordReset);
router.post('/reset-password', UtilisateurController.resetPassword);
router.get('/activite', verifierToken, verifierAdmin, UtilisateurController.analyserActiviteUtilisateurs);
router.get('/export-csv', verifierToken, verifierAdmin, UtilisateurController.exportUsersToCSV);

module.exports = router;