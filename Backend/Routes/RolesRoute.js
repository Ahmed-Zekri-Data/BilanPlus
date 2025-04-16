const express = require("express");
const router = express.Router();
const roleController = require("../Controller/RoleController");
const { verifierToken, verifierAdmin } = require("../MiddleWare/Auth");

// Toutes les routes nécessitent un token et un rôle admin
router.get("/", verifierToken, roleController.getAllRoles);
router.get("/stats", verifierToken, verifierAdmin, roleController.getUtilisateursParRole);
router.get("/permissions", verifierToken, verifierAdmin, roleController.analyserUtilisationPermissions);
router.get("/:id", verifierToken, roleController.getRoleById);
router.post("/", verifierToken, verifierAdmin, roleController.createRole);
router.put("/:id", verifierToken, verifierAdmin, roleController.updateRole);
router.delete("/:id", verifierToken, verifierAdmin, roleController.deleteRole);

module.exports = router;
