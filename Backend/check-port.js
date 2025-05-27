const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port disponible
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Port occupé
    });
  });
}

async function findAvailablePort(startPort = 3000, maxAttempts = 10) {
  console.log('🔍 Recherche d\'un port disponible...');
  
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const isAvailable = await checkPort(port);
    
    if (isAvailable) {
      console.log(`✅ Port ${port} disponible`);
      return port;
    } else {
      console.log(`❌ Port ${port} occupé`);
    }
  }
  
  console.log(`❌ Aucun port disponible trouvé entre ${startPort} et ${startPort + maxAttempts - 1}`);
  return null;
}

async function killProcessOnPort(port) {
  console.log(`🔍 Recherche des processus sur le port ${port}...`);
  
  try {
    const { exec } = require('child_process');
    
    // Commande pour trouver le processus utilisant le port
    const command = `netstat -ano | findstr :${port}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`⚠️ Aucun processus trouvé sur le port ${port}`);
        return;
      }
      
      const lines = stdout.split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
          const pid = parts[4];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      });
      
      if (pids.size > 0) {
        console.log(`🔍 Processus trouvés: ${Array.from(pids).join(', ')}`);
        
        pids.forEach(pid => {
          exec(`taskkill /F /PID ${pid}`, (killError, killStdout, killStderr) => {
            if (killError) {
              console.log(`❌ Erreur lors de l'arrêt du processus ${pid}:`, killError.message);
            } else {
              console.log(`✅ Processus ${pid} arrêté`);
            }
          });
        });
      } else {
        console.log(`⚠️ Aucun processus trouvé sur le port ${port}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche des processus:', error.message);
  }
}

async function main() {
  console.log('🔧 Utilitaire de gestion des ports\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  const port = parseInt(args[1]) || 3000;
  
  switch (command) {
    case 'check':
      console.log(`🔍 Vérification du port ${port}...`);
      const isAvailable = await checkPort(port);
      if (isAvailable) {
        console.log(`✅ Port ${port} disponible`);
      } else {
        console.log(`❌ Port ${port} occupé`);
      }
      break;
      
    case 'find':
      const availablePort = await findAvailablePort(port);
      if (availablePort) {
        console.log(`\n🎯 Port recommandé: ${availablePort}`);
      }
      break;
      
    case 'kill':
      await killProcessOnPort(port);
      break;
      
    case 'clean':
      console.log('🧹 Nettoyage de tous les processus Node.js...');
      const { exec } = require('child_process');
      exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
        if (error) {
          console.log('⚠️ Aucun processus Node.js trouvé ou erreur:', error.message);
        } else {
          console.log('✅ Tous les processus Node.js arrêtés');
          console.log(stdout);
        }
      });
      break;
      
    default:
      console.log('📋 Utilisation:');
      console.log('  node check-port.js check [port]    - Vérifier si un port est disponible');
      console.log('  node check-port.js find [port]     - Trouver un port disponible');
      console.log('  node check-port.js kill [port]     - Arrêter le processus sur un port');
      console.log('  node check-port.js clean           - Arrêter tous les processus Node.js');
      console.log('\nExemples:');
      console.log('  node check-port.js check 3000');
      console.log('  node check-port.js find 3000');
      console.log('  node check-port.js kill 3000');
      console.log('  node check-port.js clean');
  }
}

main().catch(console.error);
