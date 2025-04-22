const express = require('express');
const router = express.Router();
const { addProduit, getall, getbyid, deleteproduit, updateproduit } = require('../Controller/ProduitController');
const produitValidators = require('../validators/validateproduct');

router.post('/', produitValidators.addProduit, addProduit);
router.get('/', getall);
router.get('/:id', produitValidators.getById, getbyid);
router.delete('/:id', produitValidators.deleteProduit, deleteproduit);
router.put('/:id', produitValidators.updateProduit, updateproduit);

module.exports = router;