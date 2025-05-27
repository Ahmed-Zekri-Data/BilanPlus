const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const Produit = require('../Models/Produit');

const mouvementStockValidators = {
    addMS: [
        body('produit')
            .notEmpty().withMessage('L\'ID du produit est requis')
            .isMongoId().withMessage('L\'ID du produit doit être un ObjectId valide')
            .custom(async (value) => {
                const produit = await Produit.findById(value);
                if (!produit) {
                    throw new Error('Produit non trouvé');
                }
                return true;
            }),
        body('type')
            .notEmpty().withMessage('Le type de mouvement est requis')
            .isIn(['entrée', 'sortie']).withMessage('Le type doit être "entrée" ou "sortie"'),
        body('quantite')
            .notEmpty().withMessage('La quantité est requise')
            .isInt({ min: 1 }).withMessage('La quantité doit être un entier positif supérieur à 0'),
        body('date')
            .optional()
            .isISO8601().withMessage('La date doit être au format ISO 8601')
    ],
    updateMS: [
        body('produit')
            .optional()
            .isMongoId().withMessage('L\'ID du produit doit être un ObjectId valide')
            .custom(async (value) => {
                if (value) {
                    const produit = await Produit.findById(value);
                    if (!produit) {
                        throw new Error('Produit non trouvé');
                    }
                }
                return true;
            }),
        body('type')
            .optional()
            .isIn(['entrée', 'sortie']).withMessage('Le type doit être "entrée" ou "sortie"'),
        body('quantite')
            .optional()
            .isInt({ min: 1 }).withMessage('La quantité doit être un entier positif supérieur à 0'),
        body('date')
            .optional()
            .isISO8601().withMessage('La date doit être au format ISO 8601')
    ],
    getById: [
        param('id')
            .isMongoId().withMessage('ID invalide')
    ],
    deleteMS: [
        param('id')
            .isMongoId().withMessage('ID invalide')
    ]
};

module.exports = mouvementStockValidators;