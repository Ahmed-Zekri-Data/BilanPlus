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
var PRODrouter = require("./Routes/ProduitRoute"); // Ajouté depuis la deuxième partie
var MSrouter = require("./Routes/MSroute"); // Ajouté depuis la deuxième partie
var fournisseurRoutes = require("./Routes/FournisseurRoute"); // Ajouté depuis la deuxième partie
var commandeRoutes = require("./Routes/CommandeRoute"); // Ajouté depuis la deuxième partie


const clientRoutes = require("./Routes/clientRoutes");
const factureRoutes = require("./Routes/factureRoutes");

const produitRoutes = require("./Routes/Produitroute"); // Assurez-vous du bon chemin


/*var indexRouter = require("./Routes/index");
var {add} = require('./Controller/chatController')*/


// Connexion à la base de données
var mongo = require("mongoose");
var config = require("./Config/db.json");

mongo
  .connect(config.url)
  .then(() => console.log("database connected"))

  .catch(() => console.log("database not connected "));

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
app.use("/produits", produitRoutes);


/*app.use("/index", indexRouter);*/
app.use(express.json()); // Important pour lire le JSON dans le body des requêtes


app.use("/PRODUIT", PRODrouter); // Ajouté depuis la deuxième partie
app.use("/MS", MSrouter); // Ajouté depuis la deuxième partie
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);
app.use("/fournisseurs", fournisseurRoutes); // Ajouté depuis la deuxième partie
app.use("/commandes", commandeRoutes); // Ajouté depuis la deuxième partie

/*app.use("/index", indexRouter);*/

app.use("/clients", clientRoutes);
app.use("/factures", factureRoutes);

const server = http.createServer(app);
console.log("server run");
// Création du serveur HTTP
const server = http.createServer(app);

// Configuration de Socket.IO (commentée)
/*const io = require("socket.io")(server);
io.on("connection", (socket) => {
  console.log("user connecte");

  socket.on("typing", (data) => {
    console.log("notre message serveur:" + data);
    socket.broadcast.emit("typing", data);
  });
  socket.on("aaaaa", (data) => {
    console.log("notre message serveur:" + data);
    add(data);
    io.emit("aaaaa", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnect");
  });
});*/  
server.listen(3000);
});*/

// Démarrage du serveur
server.listen(3000, () => console.log("Server running on port 3000"));

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
