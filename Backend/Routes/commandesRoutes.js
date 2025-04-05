const express = require('express');
const router = express.Router();
const CommandeAchat = require('../Models/CommandeAchat');

// GET toutes les commandes
router.get('/', async (req, res) => {
  try {
    const commandes = await CommandeAchat.find()
      .populate('fournisseurID'); // Peupler uniquement fournisseurID, produit est optionnel
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer une nouvelle commande
router.post('/', async (req, res) => {
  const commande = new CommandeAchat({
    produit: req.body.produit || null, // Optionnel, peut être null si pas encore défini
    quantite: req.body.quantite,
    prix: req.body.prix,
    statut: req.body.statut || 'en attente', // Valeur par défaut
    fournisseurID: req.body.fournisseurID
  });
  try {
    const newCommande = await commande.save();
    res.status(201).json(newCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour une commande
router.put('/:id', async (req, res) => {
  try {
    const commande = await CommandeAchat.findById(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    commande.produit = req.body.produit || commande.produit;
    commande.quantite = req.body.quantite || commande.quantite;
    commande.prix = req.body.prix || commande.prix;
    commande.statut = req.body.statut || commande.statut;
    commande.fournisseurID = req.body.fournisseurID || commande.fournisseurID;

    const updatedCommande = await commande.save();
    res.json(updatedCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE supprimer une commande
router.delete('/:id', async (req, res) => {
  try {
    const commande = await CommandeAchat.findById(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    await commande.remove();
    res.json({ message: 'Commande supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;