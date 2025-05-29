const jwt = require("jsonwebtoken");
const config = require("../Config/db.json");
const Utilisateur = require("../Models/Utilisateur");
const Role = require("../Models/Role");

const verifierToken = async (req, res, next) => {
  try {
    console.log('VerifierToken: Checking headers:', req.headers);
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log('VerifierToken: Authorization header:', authHeader);

    // Mode développement - Créer un utilisateur fictif avec des permissions d'administrateur
    // Cela permet de contourner la vérification du token pour le développement
    const isDevelopmentMode = process.env.NODE_ENV === 'development' && false; // Désactiver le mode développement

    if (isDevelopmentMode) {
      console.log('VerifierToken: Mode développement activé, authentification simulée');

      // Créer un utilisateur fictif avec des permissions d'administrateur
      const mockUser = {
        _id: '1',
        email: 'admin@example.com',
        nom: 'Admin',
        prenom: 'Dev',
        role: {
          _id: '1',
          nom: 'Administrateur Système',
          permissions: {
            accesComplet: true,
            gererUtilisateursEtRoles: true,
            configurerSysteme: true,
            validerEcritures: true,
            cloturerPeriodes: true,
            genererEtatsFinanciers: true,
            superviserComptes: true,
            saisirEcritures: true,
            gererFactures: true,
            suivrePaiements: true,
            gererTresorerie: true,
            analyserDepensesRecettes: true,
            genererRapportsPerformance: true,
            comparerBudgetRealise: true,
            saisirNotesFrais: true,
            consulterBulletinsPaie: true,
            soumettreRemboursements: true,
            accesFacturesPaiements: true,
            telechargerDocuments: true,
            communiquerComptabilite: true
          }
        },
        actif: true,
        dernierConnexion: new Date()
      };

      req.user = mockUser;
      return next();
    }

    // Mode production - Vérification normale du token
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

    console.log('VerifierToken: Verifying token with jwtSecret:', config.jwtSecret);
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
      console.log('VerifierToken: Token decoded successfully:', decoded);
    } catch (verifyErr) {
      console.error('VerifierToken: Token verification failed:', verifyErr.message, verifyErr.stack);
      throw verifyErr;
    }

    const utilisateur = await Utilisateur.findById(decoded.id).populate('role').catch(err => {
      console.error('VerifierToken: Error fetching user:', err);
      return null;
    });
    if (!utilisateur) {
      return res.status(401).json({ message: "Utilisateur non trouvé ou supprimé" });
    }
    if (!utilisateur.role) {
      return res.status(401).json({ message: "Rôle de l'utilisateur non trouvé" });
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
    return res.status(500).json({ message: "Erreur serveur lors de l'authentification", error: error.message });
  }
};

const verifierAdmin = (req, res, next) => {
  // Mode développement - Autoriser toutes les requêtes
  const isDevelopmentMode = process.env.NODE_ENV === 'development' && false; // Désactiver le mode développement

  if (isDevelopmentMode) {
    console.log('verifierAdmin: Mode développement activé, accès administrateur accordé');
    return next();
  }

  // Mode production - Vérification normale des permissions
  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }
  if (req.user.role && req.user.role.permissions && req.user.role.permissions.accesComplet) {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé - Droits d'administrateur requis" });
  }
};

const verifierPermission = (permission) => {
  return (req, res, next) => {
    // Mode développement - Autoriser toutes les requêtes
    const isDevelopmentMode = process.env.NODE_ENV === 'development' && false; // Désactiver le mode développement

    if (isDevelopmentMode) {
      console.log(`verifierPermission: Mode développement activé, permission '${permission}' accordée`);
      return next();
    }

    // Mode production - Vérification normale des permissions
    if (!req.user) {
      console.error('verifierPermission: Utilisateur non authentifié');
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    console.log('verifierPermission: Vérification de la permission', permission);
    console.log('verifierPermission: Utilisateur', req.user._id, req.user.email);
    console.log('verifierPermission: Rôle', req.user.role ? req.user.role._id : 'Aucun rôle');

    // Vérifier si l'utilisateur a un accès complet (admin)
    if (req.user.role && req.user.role.permissions && req.user.role.permissions.accesComplet) {
      console.log('verifierPermission: Utilisateur avec accès complet, permission accordée');
      return next();
    }

    // Vérifier la permission spécifique
    if (req.user.role && req.user.role.permissions && req.user.role.permissions[permission]) {
      console.log('verifierPermission: Permission accordée');
      next();
    } else {
      console.error('verifierPermission: Permission refusée', {
        utilisateur: req.user._id,
        role: req.user.role ? req.user.role._id : 'Aucun rôle',
        permissionRequise: permission,
        permissionsDisponibles: req.user.role && req.user.role.permissions ? Object.keys(req.user.role.permissions).filter(key => req.user.role.permissions[key]) : []
      });

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