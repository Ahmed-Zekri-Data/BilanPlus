const express = require('express');
const router = express.Router();
const {
    getAllFournisseurs,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    getFournisseursByCategorie,
    getFournisseurById,
    searchFournisseurs,
    getFournisseursWithFilters
} = require('../Controller/fournisseurController');

// Get all fournisseurs (avec filtres avancés)
router.get('/', getFournisseursWithFilters);

// Search fournisseurs
router.get('/search', searchFournisseurs);

// Get fournisseurs by category
router.get('/categorie/:categorie', getFournisseursByCategorie);

// Get single fournisseur
router.get('/:id', getFournisseurById);

// Create new fournisseur
router.post('/', createFournisseur);

// Update fournisseur
router.put('/:id', updateFournisseur);

// Delete fournisseur
router.delete('/:id', deleteFournisseur);

module.exports = router; 