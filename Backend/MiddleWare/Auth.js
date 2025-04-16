const jwt = require("jsonwebtoken");
const config = require("../Config/db.json");

const verifierToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }
  try {
    const verified = jwt.verify(token, config.jwtSecret);
    req.utilisateur = verified; // Use 'utilisateur' to match your controller
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide" });
  }
};

const verifierAdmin = (req, res, next) => {
  if (req.utilisateur && req.utilisateur.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
};

// Vérifier les permissions spécifiques
const verifierPermission = (permission) => {
  return (req, res, next) => {
    const permissions = req.utilisateur.permissions;
    if (!permissions || !permissions[permission]) {
      return res.status(403).json({ 
        message: `Accès refusé. Vous n'avez pas la permission ${permission}` 
      });
    }
    next();
  };
};

// Logger les actions des utilisateurs
const loggerActions = (action) => {
  return (req, res, next) => {
    const utilisateurId = req.utilisateur.id;
    const date = new Date();
    console.log(`[${date.toISOString()}] Utilisateur ${utilisateurId} - Action: ${action}`);
    next();
  };
};

module.exports = { verifierToken, verifierAdmin, verifierPermission, loggerActions };