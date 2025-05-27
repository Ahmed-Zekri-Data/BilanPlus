// Script de démarrage simple pour identifier les problèmes
console.log('🚀 Démarrage simple du backend...');

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error('❌ ERREUR NON CAPTURÉE:', error.message);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMESSE REJETÉE:', reason);
});

try {
  // Charger dotenv
  require("dotenv").config();
  console.log('✅ Variables d\'environnement chargées');
  
  // Modules de base
  const express = require("express");
  const http = require("http");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const mongoose = require("mongoose");
  console.log('✅ Modules de base chargés');
  
  // Modèles
  const Utilisateur = require('./Models/Utilisateur');
  const Role = require('./Models/Role');
  console.log('✅ Modèles chargés');
  
  // Routes principales seulement
  const Userrouter = require("./Routes/UtilisateurRoute");
  const Rolerouter = require("./Routes/RolesRoute");
  console.log('✅ Routes principales chargées');
  
  // Connexion MongoDB
  const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/BilanPlus';
  console.log('🔗 Connexion à MongoDB:', mongoUrl);
  
  mongoose.connect(mongoUrl)
    .then(async () => {
      console.log("✅ MongoDB connecté");
      
      // Initialisation simple des rôles
      try {
        await Role.createDefaultRoles();
        console.log('✅ Rôles initialisés');
      } catch (err) {
        console.log('⚠️ Erreur rôles:', err.message);
      }
      
      // Configuration Express
      const app = express();
      
      app.use(cors({
        origin: 'http://localhost:4200',
      }));
      
      app.use(bodyParser.json());
      
      // Routes essentielles
      app.use("/user", Userrouter);
      app.use("/roles", Rolerouter);
      
      // Route de test
      app.get('/test', (req, res) => {
        res.json({ 
          message: 'Backend fonctionne !', 
          timestamp: new Date().toISOString() 
        });
      });
      
      // Démarrage du serveur
      const PORT = process.env.PORT || 3000;
      const server = http.createServer(app);
      
      server.listen(PORT, () => {
        console.log(`✅ Serveur démarré sur le port ${PORT}`);
        console.log(`🌐 Test: http://localhost:${PORT}/test`);
        
        // Test de santé
        setTimeout(() => {
          console.log('💓 Backend toujours en vie après 5 secondes');
        }, 5000);
      });
      
      server.on('error', (error) => {
        console.error('❌ Erreur serveur:', error.message);
      });
      
    })
    .catch((err) => {
      console.error("❌ Erreur MongoDB:", err.message);
    });
    
} catch (error) {
  console.error('❌ Erreur fatale:', error.message);
  console.error('Stack:', error.stack);
}
