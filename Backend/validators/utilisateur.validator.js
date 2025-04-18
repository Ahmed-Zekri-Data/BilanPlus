const { body, param, validationResult } = require('express-validator');

const extractValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Erreur de validation des données", 
      errors: errors.array()
    });
  }
  next();
};

const validateCreateUser = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
  body('email').trim().notEmpty().withMessage('L\'email est requis').isEmail().withMessage('Format d\'email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role').notEmpty().withMessage('Le rôle est requis').isMongoId().withMessage('ID de rôle invalide'),
  extractValidationErrors
];

const validateUpdateUser = [
  param('id').isMongoId().withMessage('ID d\'utilisateur invalide'),
  body('nom').optional().trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('prenom').optional().trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('email').optional().trim().isEmail().withMessage('Format d\'email invalide'),
  body('role').optional().isMongoId().withMessage('ID de rôle invalide'),
  extractValidationErrors
];

module.exports = {
  validateCreateUser,
  validateUpdateUser
};