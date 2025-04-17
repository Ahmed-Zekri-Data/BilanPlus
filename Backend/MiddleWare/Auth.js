const jwt = require("jsonwebtoken");
const config = require("../Config/db.json"); // Import db.json for jwtSecret

const verifierToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("AUTHORIZATION HEADER:", authHeader);

  if (!authHeader) {
    console.log("No Authorization header found.");
    return res.status(401).json({ message: "Accès refusé, en-tête Authorization manquant" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    console.log("Invalid Authorization header format. Expected: Bearer <token>");
    return res.status(401).json({ message: "Accès refusé, format de token invalide (Bearer requis)" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    console.log("Token is empty after extracting.");
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }

  console.log("Using jwtSecret for verification:", config.jwtSecret);

  try {
    const verified = jwt.verify(token, config.jwtSecret); // Use config.jwtSecret
    req.utilisateur = verified;
    console.log("Token verified successfully:", verified);
    next();
  } catch (err) {
    console.error("TOKEN verification failed:", err.message);
    return res.status(401).json({ message: "Token invalide" }); // Use 401 for unauthorized
  }
};

const verifierAdmin = (req, res, next) => {
  if (req.utilisateur && req.utilisateur.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
};

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

const loggerActions = (action) => {
  return (req, res, next) => {
    const utilisateurId = req.utilisateur.id;
    const date = new Date();
    console.log(`[${date.toISOString()}] Utilisateur ${utilisateurId} - Action: ${action}`);
    next();
  };
};

module.exports = { verifierToken, verifierAdmin, verifierPermission, loggerActions };