// Script de débogage pour identifier les erreurs de crash
console.log('🔍 Démarrage du mode debug...');

// Capturer toutes les erreurs non gérées
process.on('uncaughtException', (error) => {
  console.error('❌ ERREUR NON CAPTURÉE:', error.message);
  console.error('Stack trace:', error.stack);
  console.error('Type:', error.name);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMESSE REJETÉE:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Wrapper pour capturer les erreurs lors du chargement des modules
function safeRequire(modulePath) {
  try {
    console.log(`📦 Chargement du module: ${modulePath}`);
    const module = require(modulePath);
    console.log(`✅ Module chargé: ${modulePath}`);
    return module;
  } catch (error) {
    console.error(`❌ Erreur lors du chargement de ${modulePath}:`, error.message);
    throw error;
  }
}

try {
  // 1. Charger dotenv en premier
  console.log('\n1. Chargement de dotenv...');
  safeRequire("dotenv").config();
  console.log('✅ Variables d\'environnement chargées');

  // 2. Charger les modules de base
  console.log('\n2. Chargement des modules de base...');
  const express = safeRequire("express");
  const http = safeRequire("http");
  const bodyParser = safeRequire("body-parser");
  const path = safeRequire("path");
  const cors = safeRequire("cors");
  const mongoose = safeRequire("mongoose");
  const bcrypt = safeRequire('bcrypt');

  // 3. Charger les modèles
  console.log('\n3. Chargement des modèles...');
  const Utilisateur = safeRequire('./Models/Utilisateur');
  const Role = safeRequire('./Models/Role');

  // 4. Charger les routes
  console.log('\n4. Chargement des routes...');
  const TVArouter = safeRequire("./Routes/TVAroute");
  const Userrouter = safeRequire("./Routes/UtilisateurRoute");
  const Rolerouter = safeRequire("./Routes/RolesRoute");
  const PRODrouter = safeRequire("./Routes/Produitroute");
  const MSrouter = safeRequire("./Routes/MSroute");
  const DFrouter = safeRequire("./Routes/DeclarationFiscaleRoute");
  const CompteRouter = safeRequire("./Routes/CompteRoute");
  const EcritureRouter = safeRequire("./Routes/EcritureRoute");
  const fournisseurRoutes = safeRequire("./Routes/fournisseurRoutes");
  const commandeRoutes = safeRequire("./Routes/commandesRoutes");
  const AuditRouter = safeRequire("./Routes/AuditRoute");

  // 5. Charger les middlewares
  console.log('\n5. Chargement des middlewares...');
  const { errorHandlers } = safeRequire("./MiddleWare/errorHandler");
  const nodemailer = safeRequire('nodemailer');

  // 6. Configuration de la base de données
  console.log('\n6. Connexion à la base de données...');
  const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/BilanPlus';
  console.log('URL MongoDB:', mongoUrl);

  mongoose.connect(mongoUrl)
    .then(async () => {
      console.log("✅ Base de données connectée");

      // 7. Initialisation des rôles et admin
      console.log('\n7. Initialisation des rôles et admin...');
      try {
        await Role.createDefaultRoles();
        console.log('✅ Rôles par défaut créés');

        let adminRole = await Role.findOne({ nom: 'Administrateur Système' });
        if (adminRole) {
          console.log('✅ Rôle administrateur trouvé');
        } else {
          console.log('⚠️ Rôle administrateur non trouvé');
        }
      } catch (initError) {
        console.error('❌ Erreur lors de l\'initialisation:', initError.message);
      }

      // 8. Configuration de l'application Express
      console.log('\n8. Configuration de l\'application Express...');
      const app = express();

      app.use(cors({
        origin: 'http://localhost:4200',
      }));

      app.set("views", path.join(__dirname, "views"));
      app.set("view engine", "twig");

      app.use(bodyParser.json());

      // 9. Configuration des routes
      console.log('\n9. Configuration des routes...');
      app.use("/TVA", TVArouter);
      app.use("/user", Userrouter);
      app.use("/roles", Rolerouter);
      app.use("/DF", DFrouter);
      app.use("/comptes", CompteRouter);
      app.use("/ecritures", EcritureRouter);
      app.use("/PRODUIT", PRODrouter);
      app.use("/MS", MSrouter);
      app.use("/produits", PRODrouter);
      app.use("/fournisseurs", fournisseurRoutes);
      app.use("/commandes", commandeRoutes);
      app.use("/audit", AuditRouter);

      // 10. Configuration de l'email
      console.log('\n10. Configuration de l\'email...');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'votre.email@gmail.com',
          pass: process.env.EMAIL_PASS || 'votre-mot-de-passe-app'
        }
      });

      app.post('/api/send-email', async (req, res) => {
        try {
          const { to, subject, text, html } = req.body;
          const mailOptions = {
            from: '"Bilan+" <noreply@bilanplus.com>',
            to: to,
            subject: subject,
            text: text,
            html: html
          };

          const result = await transporter.sendMail(mailOptions);
          res.json({
            success: true,
            message: `Email envoyé avec succès à ${to}`,
            messageId: result.messageId
          });
        } catch (error) {
          console.error('Erreur email:', error);
          res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'email: ' + error.message
          });
        }
      });

      app.use(errorHandlers);

      // 11. Démarrage du serveur
      console.log('\n11. Démarrage du serveur...');
      const PORT = process.env.PORT || 3000;
      const server = http.createServer(app);

      server.listen(PORT, () => {
        console.log(`✅ Serveur démarré avec succès sur le port ${PORT}`);
        console.log(`🌐 URL: http://localhost:${PORT}`);
        console.log('🎯 Backend prêt à recevoir des requêtes !');
      });

      server.on('error', (error) => {
        console.error('❌ Erreur du serveur:', error.message);
        if (error.code === 'EADDRINUSE') {
          console.error(`💡 Le port ${PORT} est déjà utilisé. Essayez un autre port.`);
        }
      });

    })
    .catch((err) => {
      console.error("❌ Erreur de connexion à la base de données:", err.message);
      console.error("Stack:", err.stack);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ ERREUR FATALE lors du démarrage:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
