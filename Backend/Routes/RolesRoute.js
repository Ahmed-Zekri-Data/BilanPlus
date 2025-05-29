const express = require("express");
const router = express.Router();
const roleController = require("../Controller/RoleController");
const { verifierToken, verifierAdmin, verifierPermission } = require("../MiddleWare/Auth");

// Routes pour les rôles
// Certaines routes nécessitent la permission gererUtilisateursEtRoles
router.get("/", verifierToken, roleController.getAllRoles);
router.get("/stats", verifierToken, verifierPermission('gererUtilisateursEtRoles'), roleController.getUtilisateursParRole);
router.get("/permissions", verifierToken, verifierPermission('gererUtilisateursEtRoles'), roleController.analyserUtilisationPermissions);
router.get("/:id", verifierToken, roleController.getRoleById);
router.post("/", verifierToken, verifierPermission('gererUtilisateursEtRoles'), roleController.createRole);
router.put("/:id", verifierToken, verifierPermission('gererUtilisateursEtRoles'), roleController.updateRole);
router.delete("/:id", verifierToken, verifierPermission('gererUtilisateursEtRoles'), roleController.deleteRole);

module.exports = router;
