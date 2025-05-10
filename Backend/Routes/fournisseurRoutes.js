const express = require("express");
const router = express.Router();
const fournisseurController = require("../Controller/fournisseurController");

// 📌 Route pour récupérer tous les fournisseurs
router.get("/", fournisseurController.getAllFournisseurs);

// 📌 Route pour ajouter un fournisseur
router.post("/", fournisseurController.createFournisseur);

// 📌 Route pour modifier un fournisseur par ID
router.put("/:id", fournisseurController.updateFournisseur);


router.delete("/:id", fournisseurController.deleteFournisseur);


router.get('/search', fournisseurController.searchFournisseurs);


router.get('/categorie/:categorie', fournisseurController.getFournisseursByCategorie);


router.get('/:id', fournisseurController.getFournisseurById);


module.exports = router;
