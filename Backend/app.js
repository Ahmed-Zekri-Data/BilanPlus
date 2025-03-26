var express = require("express");
const cors = require('cors'); // Déjà importé, c’est bien
var http = require("http");
var bodyParser = require("body-parser");
var path = require("path");
var TVArouter = require("./Routes/TVAroute");
var Userrouter = require("./Routes/Utilisateur");
var Rolerouter = require("./Routes/Roleroute");
var DFrouter = require("./Routes/DeclarationFiscaleRoute");
var CompteRouter = require("./Routes/CompteRoute");
var EcritureRouter = require("./Routes/EcritureRoute");
var PRODrouter = require("./Routes/ProduitRoute"); // Ajouté depuis la deuxième partie
var MSrouter = require("./Routes/MSroute"); // Ajouté depuis la deuxième partie
var fournisseurRoutes = require("./Routes/FournisseurRoute"); // Ajouté depuis la deuxième partie
var commandeRoutes = require("./Routes/CommandeRoute"); // Ajouté depuis la deuxième partie

/*var indexRouter = require("./Routes/index");
var {add} = require('./Controller/chatController')*/

// Connexion à la base de données
var mongo = require("mongoose");
var config = require("./Config/db.json");
mongo
  .connect(config.url)
  .then(() => console.log("database connected"))
  .catch(() => console.log("database not connected "));

var app = express();

// Ajout du middleware CORS pour autoriser les requêtes depuis localhost:4200
app.use(cors({
  origin: 'http://localhost:4200' // Autorise uniquement les requêtes depuis ton frontend Angular
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(bodyParser.json());

// Routes
app.use("/TVA", TVArouter);
app.use("/user", Userrouter);
app.use("/role", Rolerouter);
app.use("/DF", DFrouter);
app.use("/PRODUIT", PRODrouter); // Ajouté depuis la deuxième partie
app.use("/MS", MSrouter); // Ajouté depuis la deuxième partie
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);
app.use("/fournisseurs", fournisseurRoutes); // Ajouté depuis la deuxième partie
app.use("/commandes", commandeRoutes); // Ajouté depuis la deuxième partie

/*app.use("/index", indexRouter);*/

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

// Démarrage du serveur
server.listen(3000, () => console.log("Server running on port 3000"));

module.exports = app;