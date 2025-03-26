var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var path = require("path");
const cors = require("cors"); // Ajoute cette ligne pour importer cors
var TVArouter = require("./Routes/TVAroute");
var Userrouter = require("./Routes/Utilisateur");
var Rolerouter = require("./Routes/Roleroute");
var PRODrouter = require("./Routes/Produitroute");
var MSrouter = require("./Routes/MSroute");
const fournisseurRoutes = require("./Routes/fournisseurRoutes");
const commandeRoutes = require("./Routes/commandesRoutes");
var DFrouter = require("./Routes/DeclarationFiscaleRoute");
var CompteRouter = require("./Routes/CompteRoute");
var EcritureRouter = require("./Routes/EcritureRoute");

// Connexion à la base de données
var mongo = require("mongoose");
var config = require("./Config/db.json");
mongo
  .connect(config.url)
  .then(() => console.log("database connected"))
  .catch(() => console.log("database not connected"));

var app = express();

// Ajoute CORS pour autoriser les requêtes depuis Angular
app.use(cors({
  origin: "http://localhost:4200" // Autorise uniquement les requêtes depuis http://localhost:4200
}));

// Configuration des vues (Twig)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

// Middleware pour parser le JSON
app.use(bodyParser.json());

// Routes
app.use("/TVA", TVArouter);
app.use("/user", Userrouter);
app.use("/role", Rolerouter);
app.use("/DF", DFrouter);
app.use("/PRODUIT", PRODrouter); // Route pour les produits
app.use("/MS", MSrouter);
app.use("/fournisseurs", fournisseurRoutes);
app.use("/commandes", commandeRoutes);
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);

// Création et démarrage du serveur
const server = http.createServer(app);
server.listen(3000, () => console.log("Serveur démarré sur le port 3000"));

module.exports = app;