const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const TVArouter = require("./Routes/TVAroute");
const Userrouter = require("./Routes/UtilisateurRoute");
const Rolerouter = require("./Routes/Rolesroute");
const PRODrouter = require("./Routes/Produitroute");
const MSrouter = require("./Routes/MSroute");
const DFrouter = require("./Routes/DeclarationFiscaleRoute");
const CompteRouter = require("./Routes/CompteRoute");
const EcritureRouter = require("./Routes/EcritureRoute");
const fournisseurRoutes = require("./Routes/fournisseurRoutes");
const commandeRoutes = require("./Routes/commandesRoutes");
const clientRoutes = require("./Routes/clientRoutes");
const factureRoutes = require("./Routes/factureRoutes");
const config = require("./Config/db.json");

// Connexion à la base de données
mongoose
  .connect(config.url)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database not connected:", err));

const app = express();

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
app.use("/produits", PRODrouter);
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