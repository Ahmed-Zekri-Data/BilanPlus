
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

/*var indexRouter = require("./Routes/index");
var{add}=require('./Controller/chatController')*/
//connection to database
var mongo = require("mongoose");
var config = require("./Config/db.json");
mongo
  .connect(config.url)
  .then(() => console.log("database connected"))
  .catch(() => console.log("database not connected "));
/*************************************** */

var app = express();

// Ajout du middleware CORS pour autoriser les requêtes depuis localhost:4200
app.use(cors({
  origin: 'http://localhost:4200' // Autorise uniquement les requêtes depuis ton frontend Angular
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(bodyParser.json());
app.use("/TVA", TVArouter);

app.use("/user", Userrouter);
app.use("/role", Rolerouter);

app.use("/DF", DFrouter);

/*app.use("/index", indexRouter);*/

app.use("/comptes", CompteRouter);
app.use("/ecritures", EcritureRouter);

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

server.listen(3000);

module.exports = app;
  var express = require("express");
  var http = require("http");
  var bodyParser = require("body-parser");
  var path = require("path");
  var TVArouter = require ("./Routes/TVAroute")

  var Userrouter = require ("./Routes/Utilisateur")
  var Rolerouter = require ("./Routes/Roleroute")


  var PRODrouter = require ("./Routes/Produitroute")
  var MSrouter = require("./Routes/MSroute")


  const fournisseurRoutes = require("./Routes/fournisseurRoutes");
  const commandeRoutes = require("./Routes/commandesRoutes");
  
  


  var DFrouter = require("./Routes/DeclarationFiscaleRoute")

  var CompteRouter = require("./Routes/CompteRoute");
  var EcritureRouter = require("./Routes/EcritureRoute");
  const cors = require('cors');



  /*var indexRouter = require("./Routes/index");
  var{add}=require('./Controller/chatController')*/
  //connection to database
  var mongo = require("mongoose");
  var config = require("./Config/db.json");
  mongo
    .connect(config.url)
    .then(() => console.log("database connected"))
    .catch(() => console.log("database not connected "));

  var app = express();
  app.use(cors({
    origin: 'http://localhost:4200' // Autorise uniquement les requêtes depuis ton frontend Angular
  }));
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "twig");

  app.use(bodyParser.json());
  app.use("/TVA",TVArouter);

  app.use("/user",Userrouter);
  app.use("/role",Rolerouter);

  app.use("/DF",DFrouter)

  app.use("/PRODUIT",PRODrouter);
  app.use("/MS",MSrouter);


  /*app.use("/index", indexRouter);*/

  
  app.use("/comptes", CompteRouter);
  app.use("/ecritures", EcritureRouter);


  app.use("/fournisseurs", fournisseurRoutes);
  app.use("/commandes", commandeRoutes);

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

  server.listen(3000);

  module.exports = app;

