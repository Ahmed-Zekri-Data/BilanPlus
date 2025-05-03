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
const bcrypt = require('bcrypt');
const Utilisateur = require('./Models/Utilisateur');
const Role = require('./Models/Role');
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
const { errorHandlers } = require("./MiddleWare/errorHandler");

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/BilanPlus')
  .then(async () => {
    console.log("Database connected");
    await initializeRolesAndAdmin();
  })
  .catch((err) => console.error("Database not connected:", err));

async function initializeRolesAndAdmin() {
  try {
    console.log('Début de initializeRolesAndAdmin()');
    // Créer les rôles par défaut
    await Role.createDefaultRoles();
    console.log('Rôles par défaut créés ou vérifiés');

    // Créer l'utilisateur admin
    let adminRole = await Role.findOne({ nom: 'Administrateur Système' });
    if (!adminRole) {
      throw new Error('Rôle Administrateur Système non trouvé après création');
    }

    // Forcer la recréation de admin@bilanplus.com
    await Utilisateur.deleteOne({ email: 'admin@bilanplus.com' });
    console.log('Ancien utilisateur admin@bilanplus.com supprimé (s\'il existait)');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Utilisateur({
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@bilanplus.com',
      password: hashedPassword,
      role: adminRole._id,
      actif: true,
      tentativesConnexion: 0,
      dateCreation: new Date(),
      preferences: { theme: 'light', langue: 'fr', notificationsEmail: true }
    });
    await admin.save();
    console.log('Utilisateur admin@bilanplus.com créé avec succès');
  } catch (err) {
    console.error('Erreur lors de l\'initialisation:', err);
  }
}

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(bodyParser.json());

app.use("/TVA", TVArouter);
app.use("/user", Userrouter);
app.use("/role", Rolerouter);
app.use("/DF", DFrouter);
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);
app.use("/PRODUIT", PRODrouter);
app.use("/MS", MSrouter);
app.use("/produits", PRODrouter);
app.use("/fournisseurs", fournisseurRoutes);
app.use("/commandes", commandeRoutes);

app.use(errorHandlers);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;