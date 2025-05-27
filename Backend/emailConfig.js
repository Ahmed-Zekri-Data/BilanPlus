const nodemailer = require('nodemailer');

const createTransporter = () => {
  console.log('emailConfig.js: Création du transporteur email...');

  // Vérification des variables d'environnement
  if (!process.env.EMAIL_HOST) {
    console.error('emailConfig.js: EMAIL_HOST manquant');
    throw new Error('Variable d\'environnement EMAIL_HOST manquante');
  }

  if (!process.env.EMAIL_PORT) {
    console.error('emailConfig.js: EMAIL_PORT manquant');
    throw new Error('Variable d\'environnement EMAIL_PORT manquante');
  }

  if (!process.env.EMAIL_USER) {
    console.error('emailConfig.js: EMAIL_USER manquant');
    throw new Error('Variable d\'environnement EMAIL_USER manquante');
  }

  if (!process.env.EMAIL_PASS) {
    console.error('emailConfig.js: EMAIL_PASS manquant');
    throw new Error('Variable d\'environnement EMAIL_PASS manquante');
  }

  console.log('emailConfig.js: Configuration email:');
  console.log('- HOST:', process.env.EMAIL_HOST);
  console.log('- PORT:', process.env.EMAIL_PORT);
  console.log('- USER:', process.env.EMAIL_USER);
  console.log('- PASS: [MASQUÉ]');

  // Création du transporteur
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_PORT === '465', // true pour le port 465, false pour les autres ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Ne pas échouer en cas de certificat non valide
      rejectUnauthorized: false
    },
    debug: true, // Activer le débogage
    logger: true // Activer la journalisation
  });

  // Vérification de la connexion
  console.log('emailConfig.js: Vérification de la connexion au serveur SMTP...');
  transporter.verify(function(error, success) {
    if (error) {
      console.error('emailConfig.js: Erreur de connexion au serveur SMTP:', error);
    } else {
      console.log('emailConfig.js: Connexion au serveur SMTP établie avec succès');
    }
  });

  return transporter;
};

module.exports = createTransporter;