const express = require('express');
const router = express.Router();
const DeclarationFiscaleController = require('../Controller/DeclarationFiscaleController');

// Routes
router.post('/add', DeclarationFiscaleController.addDF);
router.get('/all', DeclarationFiscaleController.getall);
router.get('/check-exists', DeclarationFiscaleController.checkDeclarationExists); // Nouvelle route pour vérifier l'existence d'une déclaration
router.get('/:id', DeclarationFiscaleController.getbyid);
router.delete('/:id', DeclarationFiscaleController.deleteDF);
router.put('/:id', DeclarationFiscaleController.updateDF);
router.post('/declaration/generer', DeclarationFiscaleController.genererDeclarationFiscale);
router.post('/declaration/soumettre/:declarationId', DeclarationFiscaleController.soumettreDeclaration);

module.exports = router;