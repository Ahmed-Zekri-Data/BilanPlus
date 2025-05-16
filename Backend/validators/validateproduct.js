const { body, param, query } = require('express-validator');

const produitValidators = {
    addProduit: [
        body('nom')
            .trim()
            .notEmpty().withMessage('Le nom du produit est requis')
            .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
        body('categorie')
            .trim()
            .notEmpty().withMessage('La catégorie est requise')
            .isLength({ min: 2 }).withMessage('La catégorie doit contenir au moins 2 caractères'),
        body('prix')
            .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif')
            .notEmpty().withMessage('Le prix est requis'),
        body('stock')
            .isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif')
            .notEmpty().withMessage('Le stock est requis'),
        body('seuilAlerte')
            .optional()
            .isInt({ min: 0 }).withMessage('Le seuil d\'alerte doit être un nombre entier positif')
    ],
    updateProduit: [
        body('nom')
            .optional()
            .trim()
            .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
        body('categorie')
            .optional()
            .trim()
            .isLength({ min: 2 }).withMessage('La catégorie doit contenir au moins 2 caractères'),
        body('prix')
            .optional()
            .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
        body('stock')
            .optional()
            .isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif'),
        body('seuilAlerte')
            .optional()
            .isInt({ min: 0 }).withMessage('Le seuil d\'alerte doit être un nombre entier positif')
    ],
    getById: [
        param('id')
            .isMongoId().withMessage('ID invalide')
    ],
    deleteProduit: [
        param('id')
            .isMongoId().withMessage('ID invalide')
    ],
    getall: [
        query('sort')
            .optional()
            .isIn(['asc', 'desc']).withMessage('Le paramètre sort doit être "asc" ou "desc"')
    ]
};

module.exports = produitValidators;