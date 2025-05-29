const mongoose = require('mongoose');
const config = require('./Config/db.json');

async function diagnoseBackend() {
  console.log('🔍 Diagnostic du backend...');
  
  try {
    // 1. Test de connexion à MongoDB
    console.log('\n1. Test de connexion MongoDB...');
    await mongoose.connect(config.url);
    console.log('✅ MongoDB connecté');
    
    // 2. Test des modèles
    console.log('\n2. Test des modèles...');
    try {
      const Utilisateur = require('./Models/Utilisateur');
      const Role = require('./Models/Role');
      console.log('✅ Modèles chargés');
      
      // Test de requête simple
      const userCount = await Utilisateur.countDocuments();
      const roleCount = await Role.countDocuments();
      console.log(`✅ ${userCount} utilisateurs, ${roleCount} rôles en base`);
      
    } catch (modelError) {
      console.log('❌ Erreur modèles:', modelError.message);
    }
    
    // 3. Test des routes
    console.log('\n3. Test des routes...');
    try {
      const express = require('express');
      const app = express();
      
      // Test de chargement des routes
      const Userrouter = require('./Routes/UtilisateurRoute');
      const Rolerouter = require('./Routes/RolesRoute');
      console.log('✅ Routes chargées');
      
    } catch (routeError) {
      console.log('❌ Erreur routes:', routeError.message);
    }
    
    // 4. Test des contrôleurs
    console.log('\n4. Test des contrôleurs...');
    try {
      const UtilisateurController = require('./Controller/UtilisateurController');
      const RoleController = require('./Controller/RoleController');
      console.log('✅ Contrôleurs chargés');
      
    } catch (controllerError) {
      console.log('❌ Erreur contrôleurs:', controllerError.message);
    }
    
    // 5. Test des middlewares
    console.log('\n5. Test des middlewares...');
    try {
      const { verifierToken, verifierPermission } = require('./MiddleWare/Auth');
      console.log('✅ Middlewares chargés');
      
    } catch (middlewareError) {
      console.log('❌ Erreur middlewares:', middlewareError.message);
    }
    
    // 6. Test de l'environnement
    console.log('\n6. Variables d\'environnement...');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Défini' : 'Non défini');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Défini' : 'Non défini');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Défini' : 'Non défini');
    console.log('MONGODB_URL:', process.env.MONGODB_URL ? 'Défini' : 'Non défini');
    
    // 7. Test de création d'un serveur simple
    console.log('\n7. Test serveur simple...');
    const express = require('express');
    const testApp = express();
    const testServer = testApp.listen(3001, () => {
      console.log('✅ Serveur test démarré sur port 3001');
      testServer.close();
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Diagnostic terminé');
  }
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error.message);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée:', reason);
});

diagnoseBackend();
