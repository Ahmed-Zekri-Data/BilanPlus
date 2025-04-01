const express = require('express');
const router = express.Router();
const {
  createCommande,
  getAllCommandes,
  updateCommande,
  deleteCommande,
  updateStatut
} = require("../Controller/commandeController");

router.post("/", createCommande);
router.get("/", getAllCommandes);
router.put("/:id", updateCommande);
router.put("/updateStatut/:id", updateStatut); 
router.delete("/:id", deleteCommande);

module.exports = router;