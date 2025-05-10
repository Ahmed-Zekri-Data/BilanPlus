const express = require('express');
const router = express.Router();
const {
  addProduit,
  getall,
  getbyid,
  deleteproduit,
  updateproduit,
  searchByCategorie
} = require('../Controller/produitController');

router.post('/', addProduit);
router.get('/', getall);
router.get('/:id', getbyid);
router.delete('/:id', deleteproduit);
router.put('/:id', updateproduit);
router.get('/search-by-categorie/:categorie', searchByCategorie);

module.exports = router; 