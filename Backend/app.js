const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

// Import routes
const TVArouter = require("./Routes/TVAroute");
const Userrouter = require("./Routes/Utilisateur");
const Rolerouter = require("./Routes/Roleroute");
const DFrouter = require("./Routes/DeclarationFiscaleRoute");
const CompteRouter = require("./Routes/CompteRoute");
const EcritureRouter = require("./Routes/EcritureRoute");
const PRODrouter = require("./Routes/Produitroute");
const MSrouter = require("./Routes/MSroute");
const fournisseurRoutes = require("./Routes/fournisseurRoutes");
const commandeRoutes = require("./Routes/commandesRoutes");
const JournalRouter = require("./Routes/JournalRoute");
const GrandLivreRouter = require("./Routes/GrandLivreRoute");
const BalanceRouter = require("./Routes/BalanceRoute");
const BilanRouter = require("./Routes/BilanRoute");
const ResultatRouter = require("./Routes/ResultatRoute");
const DashboardRouter = require("./Routes/DashboardRoute");
const clientRoutes = require("./Routes/clientRoutes");
const factureRoutes = require("./Routes/factureRoutes");
const froutes = require("./Routes/fiscaliteRoutes"); // Kept from Gestion_des_Déclarations_et_TVA

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
app.use("/journal", JournalRouter);
app.use("/grand-livre", GrandLivreRouter);
app.use("/balance", BalanceRouter);
app.use("/bilan", BilanRouter);
app.use("/resultat", ResultatRouter);
app.use("/dashboard", DashboardRouter);
app.use("/clients", clientRoutes);
app.use("/factures", factureRoutes);
app.use("/fiscalite", froutes); // Kept from Gestion_des_Déclarations_et_TVA

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

// Start server
server.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});

module.exports = app;