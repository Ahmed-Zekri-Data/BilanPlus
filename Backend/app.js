const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Utilisateur = require('./Models/Utilisateur');
const Role = require('./Models/Role'); // Ensure this is included
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
const authRoutes = require("./Routes/AuthRoutes");
require("dotenv").config();
console.log('app.js: Loaded JWT_SECRET:', process.env.JWT_SECRET);
const { errorHandlers } = require("./MiddleWare/errorHandler");

// async function createAdmin() {
//   try {
//     let adminRole = await Role.findOne({ nom: 'Administrateur' });
//     if (!adminRole) {
//       adminRole = new Role({
//         nom: 'Administrateur',
//         description: 'Accès complet au système',
//         permissions: {
//           gestionUtilisateurs: true,
//           gestionRoles: true,
//           gestionClients: true,
//           gestionFournisseurs: true,
//           gestionFactures: true,
//           gestionComptabilite: true,
//           gestionBilans: true,
//           gestionDeclarations: true,
//           rapportsAvances: true,
//           parametresSysteme: true
//         }
//       });
//       await adminRole.save();
//       console.log('Rôle Administrateur créé');
//     }

//     const adminUser = await Utilisateur.findOne({ email: 'admin@bilanplus.com' });
//     if (!adminUser) {
//       const hashedPassword = await bcrypt.hash('admin123', 10);
//       const admin = new Utilisateur({
//         nom: 'Admin',
//         prenom: 'Super',
//         email: 'admin@bilanplus.com',
//         password: hashedPassword,
//         role: adminRole._id,
//         actif: true
//       });
//       await admin.save();
//       console.log('Utilisateur admin créé');
//     } else {
//       console.log('Utilisateur admin existe déjà');
//     }
//   } catch (err) {
//     console.error('Erreur lors de la création de l\'admin:', err);
//   }
// }

mongoose
  .connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/BilanPlus')
  .then(async () => {
    console.log("Database connected");
    //await createAdmin();
  })
  .catch((err) => console.error("Database not connected:", err));

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
app.use("/auth", authRoutes);

app.use(errorHandlers);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;