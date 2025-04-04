var express = require("express");
var cors = require("cors"); // Middleware CORS pour autoriser les requêtes depuis le frontend
var http = require("http");
var bodyParser = require("body-parser");
var path = require("path");

// Importation des routes
var TVArouter = require("./Routes/TVAroute");
var Userrouter = require("./Routes/Utilisateur");
var Rolerouter = require("./Routes/Roleroute");
var DFrouter = require("./Routes/DeclarationFiscaleRoute");
var CompteRouter = require("./Routes/CompteRoute");
var EcritureRouter = require("./Routes/EcritureRoute");
var PRODrouter = require("./Routes/Produitroute");
var MSrouter = require("./Routes/MSroute");
const fournisseurRoutes = require("./Routes/fournisseurRoutes");
const commandeRoutes = require("./Routes/commandesRoutes");

// Connexion à la base de données
var mongoose = require("mongoose");
var config = require("./Config/db.json");
mongoose
  .connect(config.url)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database not connected:", err));

// Initialisation de l'application Express
var app = express();

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
app.use("/DF", DFrouter);
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);
app.use("/PRODUIT", PRODrouter);
app.use("/MS", MSrouter);
app.use("/produits", PRODrouter); // Added from main
app.use("/fournisseurs", fournisseurRoutes);
app.use("/commandes", commandeRoutes);
// app.use("/clients", clientRoutes);
// app.use("/factures", factureRoutes);

const server = http.createServer(app);

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

server.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});

module.exports = app;