const express = require('express');
const router = express.Router();
const {
  createCommande,
  getAllCommandes,
  updateCommande,
  deleteCommande,
  updateStatut,
  getCommandeById,
  getCommandesWithFilters,
  getProductCategories
} = require("../Controller/commandeController");

router.post("/", createCommande);
router.get("/", getCommandesWithFilters);
router.get("/all", getAllCommandes);
router.get("/categories", getProductCategories);
router.put("/:id", updateCommande);
router.put("/updateStatut/:id", updateStatut); 
router.delete("/:id", deleteCommande);
router.get("/:id", getCommandeById);

module.exports = router;