// Middleware pour gérer les erreurs d'authentification JWT
const handleJwtError = (err, req, res, next) => {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Token invalide", 
        error: err.message 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expiré", 
        error: err.message 
      });
    }
    
    next(err);
  };
  
  // Middleware pour gérer les erreurs MongoDB
  const handleMongoError = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Erreur de validation", 
        error: err.message 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: "Format d'ID invalide", 
        error: err.message 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Violation de contrainte d'unicité", 
        error: `Champ en double: ${JSON.stringify(err.keyValue)}` 
      });
    }
    
    next(err);
  };
  
  // Middleware pour gérer toutes les autres erreurs
  const handleGenericError = (err, req, res, next) => {
    console.error("Erreur non gérée:", err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || "Erreur serveur interne";
    
    // En production, ne pas exposer les détails de l'erreur
    const errorDetails = process.env.NODE_ENV === 'production'
      ? {} 
      : { stack: err.stack };
    
    res.status(statusCode).json({ 
      message,
      ...errorDetails
    });
  };
  
  // Middleware pour l'enregistrement des erreurs
  const logError = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Erreur:`, {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user ? req.user.id : 'non authentifié'
    });
    
    next(err);
  };
  
  module.exports = {
    handleJwtError,
    handleMongoError,
    handleGenericError,
    logError,
    
    // Fonction qui combine tous les middleware d'erreur dans le bon ordre
    errorHandlers: [
      logError,
      handleJwtError,
      handleMongoError,
      handleGenericError
    ]
  };