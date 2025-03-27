const express = require("express");
const router = express.Router();
const clientController = require("../Controller/clientController");

router.post("/", clientController.createClient);  // Ajouter un client
router.get("/", clientController.getAllClients);  // Récupérer tous les clients
router.get("/:id", clientController.getClientById);  // Récupérer un client par ID
router.put("/:id", clientController.updateClient);  // Modifier un client
router.delete("/:id", clientController.deleteClient);  // Supprimer un client

module.exports = router;
// tous les routes fonctionnent dans postman
// tous les Cruds fonctionnent