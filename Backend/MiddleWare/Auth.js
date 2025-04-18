require("dotenv").config();
const jwt = require("jsonwebtoken");
const Utilisateur = require("../Models/Utilisateur");
const Role = require("../Models/Role");

console.log('Auth.js: Loaded JWT_SECRET:', process.env.JWT_SECRET); // Debug

const verifierToken = async (req, res, next) => {
  try {
    console.log('VerifierToken: Checking headers:', req.headers);
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log('VerifierToken: Authorization header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ message: "Accès refusé, en-tête Authorization manquant" });
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Accès refusé, format de token invalide (Bearer requis)" });
    }
    const token = authHeader.replace("Bearer ", "");
    console.log('VerifierToken: Token extracted:', token);
    if (!token) {
      return res.status(401).json({ message: "Accès refusé, token manquant" });
    }
    
    console.log('VerifierToken: Verifying token with JWT_SECRET:', process.env.JWT_SECRET);
    let decoded;
    try {
      const secret = process.env.JWT_SECRET || 'default-secret-for-debugging'; // Fallback for debugging
      if (!process.env.JWT_SECRET) {
        console.error('VerifierToken: JWT_SECRET is undefined, using fallback');
      }
      decoded = jwt.verify(token, secret);
      console.log('VerifierToken: Token decoded successfully:', decoded);
    } catch (verifyErr) {
      console.error('VerifierToken: Token verification failed:', verifyErr.message, verifyErr.stack);
      throw verifyErr;
    }
    
    const utilisateur = await Utilisateur.findById(decoded.id).populate('role');
    if (!utilisateur) {
      return res.status(401).json({ message: "Utilisateur non trouvé ou supprimé" });
    }
    if (!utilisateur.actif) {
      return res.status(403).json({ message: "Compte désactivé. Contactez l'administrateur" });
    }
    
    req.user = utilisateur;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expiré" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Token invalide" });
    }
    console.error("Erreur vérification token détaillée:", error.message, error.stack);
    return res.status(500).json({ message: "Erreur serveur lors de l'authentification" });
  }
};

const verifierAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }
  if (req.user.role && req.user.role.permissions && req.user.role.permissions.parametresSysteme) {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé - Droits d'administrateur requis" });
  }
};

const verifierPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }
    if (req.user.role && req.user.role.permissions && req.user.role.permissions[permission]) {
      next();
    } else {
      res.status(403).json({ 
        message: `Accès refusé - Permission ${permission} requise`,
        required: permission
      });
    }
  };
};

module.exports = { 
  verifierToken, 
  verifierAdmin,
  verifierPermission
};