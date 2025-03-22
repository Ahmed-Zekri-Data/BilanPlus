var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var path = require("path");
const cors = require("cors"); // Déclaré une seule fois ici
var mongo = require("mongoose");
var config = require("./Config/db.json");

// Importation des routes
var TVArouter = require("./Routes/TVAroute");
var Userrouter = require("./Routes/Utilisateur");
var Rolerouter = require("./Routes/Roleroute");
var PRODrouter = require("./Routes/Produitroute");
var MSrouter = require("./Routes/MSroute");
var DFrouter = require("./Routes/DeclarationFiscaleRoute");
var CompteRouter = require("./Routes/CompteRoute");
var EcritureRouter = require("./Routes/EcritureRoute");
const fournisseurRoutes = require("./Routes/fournisseurRoutes");
const commandeRoutes = require("./Routes/commandesRoutes");

// Connexion à la base de données
mongo
  .connect(config.url)
  .then(() => console.log("database connected"))
  .catch(() => console.log("database not connected "));

// Initialisation de l'application Express
var app = express();

// Middleware CORS pour autoriser les requêtes depuis localhost:4200 (frontend Angular)
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
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);
app.use("/fournisseurs", fournisseurRoutes);
app.use("/commandes", commandeRoutes);

// Création et démarrage du serveur
const server = http.createServer(app, console.log("server run"));
server.listen(3000);

module.exports = app;