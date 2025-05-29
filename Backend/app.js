require("dotenv").config();
console.log('app.js: Loaded JWT_SECRET:', process.env.JWT_SECRET);
console.log('app.js: Loaded EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('app.js: Loaded EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('app.js: Loaded EMAIL_USER:', process.env.EMAIL_USER);
console.log('app.js: Loaded EMAIL_PASS:', process.env.EMAIL_PASS);

const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const Utilisateur = require("./Models/Utilisateur");
const Role = require("./Models/Role");
const config = require("./Config/db.json");
const { errorHandlers } = require("./MiddleWare/errorHandler");

// Importation des routes
const TVArouter = require("./Routes/TVAroute");
const Userrouter = require("./Routes/UtilisateurRoute");
const Rolerouter = require("./Routes/RolesRoute");
const PRODrouter = require("./Routes/Produitroute");
const MSrouter = require("./Routes/MSroute");
const DFrouter = require("./Routes/DeclarationFiscaleRoute");
const CompteRouter = require("./Routes/CompteRoute");
const EcritureRouter = require("./Routes/EcritureRoute");
const fournisseurRoutes = require("./Routes/fournisseurRoutes");
const commandeRoutes = require("./Routes/commandesRoutes");
const AuditRouter = require("./Routes/AuditRoute");
const clientRoutes = require("./Routes/clientRoutes");
const factureRoutes = require("./Routes/factureRoutes");
const devisRoutes = require("./Routes/DevisRoute");
const JournalRouter = require("./Routes/JournalRoute");
const GrandLivreRouter = require("./Routes/GrandLivreRoute");
const BalanceRouter = require("./Routes/BalanceRoute");
const BilanRouter = require("./Routes/BilanRoute");
const ResultatRouter = require("./Routes/ResultatRoute");
const DashboardRouter = require("./Routes/DashboardRoute");
const AdvancedReportsRouter = require("./Routes/AdvancedReportsRoute");
const froutes = require("./Routes/fiscaliteRoutes");

const app = express();

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URL || config.url || "mongodb://127.0.0.1:27017/BilanPlus")
  .then(async () => {
    console.log("✅ Database connected successfully");
    await initializeRolesAndAdmin();
  })
  .catch((err) => console.error("❌ Database connection failed:", err));

// Initialisation des rôles et de l'utilisateur admin
async function initializeRolesAndAdmin() {
  try {
    console.log("Début de initializeRolesAndAdmin()");
    await Role.createDefaultRoles();
    console.log("Rôles par défaut créés ou vérifiés");

    let adminRole = await Role.findOne({ nom: "Administrateur Système" });
    if (!adminRole) {
      throw new Error("Rôle Administrateur Système non trouvé après création");
    }

    await Utilisateur.deleteOne({ email: "admin@bilanplus.com" });
    console.log("Ancien utilisateur admin@bilanplus.com supprimé (s'il existait)");

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new Utilisateur({
      nom: "Admin",
      prenom: "Super",
      email: "admin@bilanplus.com",
      password: hashedPassword,
      role: adminRole._id,
      actif: true,
      tentativesConnexion: 0,
      dateCreation: new Date(),
      preferences: { theme: "light", langue: "fr", notificationsEmail: true },
    });

    await admin.save();
    console.log("Utilisateur admin@bilanplus.com créé avec succès");
  } catch (err) {
    console.error("Erreur lors de l'initialisation:", err);
  }
}

// Configuration express
app.use(cors({ origin: "http://localhost:4200" }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");
app.use(bodyParser.json());

// Routes API
app.use("/TVA", TVArouter);
app.use("/user", Userrouter);
app.use("/roles", Rolerouter);
app.use("/DF", DFrouter);
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);
app.use("/PRODUIT", PRODrouter);
app.use("/produits", PRODrouter);
app.use("/MS", MSrouter);
app.use("/fournisseurs", fournisseurRoutes);
app.use("/commandes", commandeRoutes);
app.use("/audit", AuditRouter);
app.use("/clients", clientRoutes);
app.use("/factures", factureRoutes);
app.use("/devis", devisRoutes);
app.use("/journal", JournalRouter);
app.use("/grand-livre", GrandLivreRouter);
app.use("/balance", BalanceRouter);
app.use("/bilan", BilanRouter);
app.use("/resultat", ResultatRouter);
app.use("/dashboard", DashboardRouter);
app.use("/reports", AdvancedReportsRouter);
app.use("/fiscalite", froutes);

// Route pour envoi d'e-mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "votre.email@gmail.com",
    pass: process.env.EMAIL_PASS || "votre-mot-de-passe-app"
  }
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    console.log("Envoi d'email vers:", to);

    const mailOptions = {
      from: '"Bilan+" <noreply@bilanplus.com>',
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès:", result.messageId);

    res.json({
      success: true,
      message: `Email envoyé avec succès à ${to}`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de l'email: " + error.message,
      error: error.message,
    });
  }
});

// Middleware d’erreurs global
app.use(errorHandlers);

// Création et lancement du serveur
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Le port ${PORT} est déjà utilisé.`);
    const newPort = parseInt(PORT) + 1;
    console.log(`🔄 Tentative sur le port ${newPort}...`);
    server.listen(newPort, () => {
      console.log(`✅ Serveur démarré sur le port ${newPort}`);
      console.log(`🌐 URL: http://localhost:${newPort}`);
    });
  } else {
    console.error("❌ Erreur du serveur:", error.message);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

module.exports = app;
