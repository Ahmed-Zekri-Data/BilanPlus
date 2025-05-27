var express = require("express");
const cors = require('cors'); // Keep CORS for frontend communication
var http = require("http");
var bodyParser = require("body-parser");
var path = require("path");
var JournalRouter = require("./Routes/JournalRoute");
// Import all routes
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
var GrandLivreRouter = require("./Routes/GrandLivreRoute");
var BalanceRouter = require("./Routes/BalanceRoute");
var BilanRouter = require("./Routes/BilanRoute");
var ResultatRouter = require("./Routes/ResultatRoute");
var DashboardRouter = require("./Routes/DashboardRoute");
var AdvancedReportsRouter = require("./Routes/AdvancedReportsRoute");
/*var indexRouter = require("./Routes/index");
var { add } = require('./Controller/chatController');*/

// Connection to database
var mongo = require("mongoose");
var config = require("./Config/db.json");
mongo
  .connect(config.url)
  .then(() => console.log("database connected"))
  .catch(() => console.log("database not connected "));

/*************************************** */

var app = express();

// Add CORS middleware to allow requests from Angular frontend
app.use(cors({
  origin: 'http://localhost:4200' // Autorise uniquement les requêtes depuis ton frontend Angular
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(bodyParser.json());

// Define all routes
app.use("/TVA", TVArouter);
app.use("/user", Userrouter);
app.use("/role", Rolerouter);
app.use("/DF", DFrouter);
app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);
app.use("/PRODUIT", PRODrouter);
app.use("/MS", MSrouter);
app.use("/fournisseurs", fournisseurRoutes);
app.use("/commandes", commandeRoutes);
app.use("/journal", JournalRouter);
app.use("/grand-livre", GrandLivreRouter);
app.use("/balance", BalanceRouter);
app.use("/bilan", BilanRouter);
app.use("/resultat", ResultatRouter);
app.use("/dashboard", DashboardRouter);
app.use("/reports", AdvancedReportsRouter);

/*app.use("/index", indexRouter);*/

const server = http.createServer(app, console.log("server run"));

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

// Start server on port 3000 (you can change to 4000 if preferred)
server.listen(4000);

module.exports = app;