const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

const config = require("./Config/db.json");

// Importation des routes
const TVArouter = require("./Routes/TVAroute");
const Userrouter = require("./Routes/Utilisateur");
const Rolerouter = require("./Routes/Roleroute");
const PRODrouter = require("./Routes/Produitroute");
const MSrouter = require("./Routes/MSroute");
const DFrouter = require("./Routes/DeclarationFiscaleRoute");
const CompteRouter = require("./Routes/CompteRoute");
const EcritureRouter = require("./Routes/EcritureRoute");
const fournisseurRoutes = require("./Routes/fournisseurRoutes");
const commandeRoutes = require("./Routes/commandesRoutes");
const clientRoutes = require("./Routes/clientRoutes");
const factureRoutes = require("./Routes/factureRoutes");
const devisRoutes = require("./Routes/DevisRoute"); // ajouté pour fusion
const JournalRouter = require("./Routes/JournalRoute");
const GrandLivreRouter = require("./Routes/GrandLivreRoute");
const BalanceRouter = require("./Routes/BalanceRoute");
const BilanRouter = require("./Routes/BilanRoute");
const ResultatRouter = require("./Routes/ResultatRoute");
const DashboardRouter = require("./Routes/DashboardRoute");
const froutes = require("./Routes/fiscaliteRoutes"); // Fiscalité (Déclarations et TVA)

const app = express();

// Connexion à la base de données
mongoose
  .connect(config.url)
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err));

// Middleware CORS pour autoriser les requêtes du frontend Angular
app.use(cors({
  origin: 'http://localhost:4200'
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");
app.use(bodyParser.json());

// Configuration des routes
app.use("/TVA", TVArouter);
app.use("/user", Userrouter);
app.use("/role", Rolerouter);
app.use("/PRODUIT", PRODrouter);
app.use("/MS", MSrouter);
app.use("/DF", DFrouter);
app.use("/produits", PRODrouter);
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);
app.use("/fournisseurs", fournisseurRoutes);
app.use("/commandes", commandeRoutes);
app.use("/clients", clientRoutes);
app.use("/factures", factureRoutes);
app.use("/devis", devisRoutes);
app.use("/journal", JournalRouter);
app.use("/grand-livre", GrandLivreRouter);
app.use("/balance", BalanceRouter);
app.use("/bilan", BilanRouter);
app.use("/resultat", ResultatRouter);
app.use("/dashboard", DashboardRouter);
app.use("/fiscalite", froutes);

const server = http.createServer(app);

server.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});

module.exports = app;
