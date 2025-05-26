const express = require('express');
const router = express.Router();
const {
  createDevis,
  getCommandeDetails,
  getAllDevis,
  acceptDevis,
  rejectDevis
} = require("../Controller/devisController");

// Route pour obtenir les détails d'une commande et vérifier le fournisseur
router.get("/:commandeId/:fournisseurId", getCommandeDetails);

// Route pour créer un devis
router.post("/:commandeId/:fournisseurId", createDevis);

// Route pour obtenir tous les devis
router.get("/", getAllDevis);

router.put("/:id/accept", acceptDevis);
router.put("/:id/reject", rejectDevis);


module.exports = router;