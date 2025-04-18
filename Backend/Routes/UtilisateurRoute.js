const express = require("express");
const router = express.Router();
const utilisateurController = require("../Controller/UtilisateurController");
const { verifierToken, verifierAdmin } = require("../MiddleWare/Auth");

console.log("utilisateurController disponible, méthodes:", Object.keys(utilisateurController));

router.post("/request-reset-password", utilisateurController.requestPasswordReset);
router.post("/reset-password", utilisateurController.resetPassword);

router.get("/getall", verifierToken, utilisateurController.getAllUsers);
router.get("/activite", verifierToken, verifierAdmin, utilisateurController.analyserActiviteUtilisateurs);
router.get("/export-csv", verifierToken, verifierAdmin, utilisateurController.exportUsersToCSV);
router.get("/:id", verifierToken, utilisateurController.getUserById);
router.post("/add", verifierToken, verifierAdmin, utilisateurController.createUser);
router.put("/:id", verifierToken, verifierAdmin, utilisateurController.updateUser);
router.delete("/:id", verifierToken, verifierAdmin, utilisateurController.deleteUser);
router.put("/reset-attempts/:id", verifierToken, verifierAdmin, utilisateurController.resetLoginAttempts);
router.put("/update-password/:id", verifierToken, utilisateurController.updatePassword);

module.exports = router;