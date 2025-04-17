const express = require("express");
const router = express.Router();
const utilisateurController = require("../Controller/UtilisateurController");
const { verifierToken, verifierAdmin } = require("../MiddleWare/Auth");

// Debug: Log the controller to verify exports
console.log("utilisateurController:", utilisateurController);

// Routes publiques
router.post("/login", utilisateurController.login);
router.post("/request-reset-password", utilisateurController.requestPasswordReset);
router.post("/reset-password", utilisateurController.resetPassword);

// Routes protégées
router.get("/getall", verifierToken, utilisateurController.getAllUsers);
router.get("/activite", verifierToken, verifierAdmin, utilisateurController.analyserActiviteUtilisateurs);
router.get("/export-csv", verifierToken, verifierAdmin, utilisateurController.exporterUtilisateursCSV);
router.get("/getbyid/:id", verifierToken, utilisateurController.getUserById);
router.post("/add", verifierToken, verifierAdmin, utilisateurController.createUser);
router.put("/update/:id", verifierToken, utilisateurController.updateUser);
router.delete("/delete/:id", verifierToken, verifierAdmin, utilisateurController.deleteUser);

module.exports = router;