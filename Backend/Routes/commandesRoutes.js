const express = require('express');
const router = express.Router();
const {
  createCommande,
  notifySuppliers,
  getCommandesWithFilters,
  getProductCategories,
  getAllProduits,
  updateCommande,
  deleteCommande,
  getAllCommandes,
  getCommandeById,
  updateStatut
} = require("../Controller/commandeController");

// Routes pour les commandes
router.post("/", createCommande);
router.post("/notify", notifySuppliers);
router.get("/", getCommandesWithFilters);
router.get("/all", getAllCommandes);
router.get("/categories", getProductCategories);
router.get("/produits", getAllProduits);
router.put("/:id", updateCommande);
router.put("/updateStatut/:id", updateStatut); 
router.delete("/:id", deleteCommande);
router.get("/:id", getCommandeById);

module.exports = router;