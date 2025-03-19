// routes/commandesRoutes.js
const express = require('express');
const router = express.Router();
const commandeController = require('../Controller/commandeController');

router.post('/', commandeController.createCommande);          // Créer une commande
router.get('/', commandeController.getAllCommandes);         // Lister toutes les commandes
router.get('/:id', commandeController.getCommandeById);      // Récupérer une commande par ID
router.put('/:id', commandeController.updateCommande);       // Mettre à jour une commande
router.delete('/:id', commandeController.deleteCommande);    // Supprimer une commande

module.exports = router;