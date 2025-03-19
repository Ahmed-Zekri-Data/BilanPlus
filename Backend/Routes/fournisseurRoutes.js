const express = require("express");
const router = express.Router();
const fournisseurController = require("../Controller/fournisseurController");

// 📌 Route pour récupérer tous les fournisseurs
router.get("/", fournisseurController.getAllFournisseurs);

// 📌 Route pour ajouter un fournisseur
router.post("/", fournisseurController.createFournisseur);

// 📌 Route pour modifier un fournisseur par ID
router.put("/:id", fournisseurController.updateFournisseur);

// 📌 Route pour supprimer un fournisseur par ID
router.delete("/:id", fournisseurController.deleteFournisseur);

module.exports = router;
