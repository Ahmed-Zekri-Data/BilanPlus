// Script de démarrage propre pour éviter les conflits de port
console.log('🚀 Démarrage propre du backend...');

const net = require('net');

// Fonction pour vérifier si un port est disponible
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

// Fonction pour trouver un port disponible
async function findAvailablePort(startPort = 3000) {
  console.log(`🔍 Recherche d'un port disponible à partir de ${startPort}...`);
  
  for (let port = startPort; port < startPort + 10; port++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      console.log(`✅ Port ${port} disponible`);
      return port;
    } else {
      console.log(`❌ Port ${port} occupé`);
    }
  }
  throw new Error('Aucun port disponible trouvé');
}

async function startServer() {
  try {
    // 1. Trouver un port disponible
    const PORT = await findAvailablePort(3000);
    
    // 2. Mettre à jour la variable d'environnement
    process.env.PORT = PORT;
    
    console.log(`🎯 Utilisation du port ${PORT}`);
    console.log('📦 Chargement de l\'application...');
    
    // 3. Charger et démarrer l'application principale
    require('./app.js');
    
    console.log('');
    console.log('🎉 ================================');
    console.log('✅ BACKEND DÉMARRÉ AVEC SUCCÈS !');
    console.log('🎉 ================================');
    console.log('');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🧪 Test: http://localhost:${PORT}/test`);
    console.log('');
    console.log('🔑 Comptes de test:');
    console.log('  admin@bilanplus.com / admin123');
    console.log('  myriammoncer42@gmail.com / password123');
    console.log('');
    console.log('🎯 Backend prêt à recevoir des requêtes !');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error('❌ ERREUR NON CAPTURÉE:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMESSE REJETÉE:', reason);
  process.exit(1);
});

// Démarrer le serveur
startServer();
