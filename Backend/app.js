const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const TVArouter = require("./Routes/TVAroute");
const Userrouter = require("./Routes/UtilisateurRoute");
const Rolerouter = require("./Routes/RolesRoute");
const PRODrouter = require("./Routes/Produitroute");
const MSrouter = require("./Routes/MSroute");
const DFrouter = require("./Routes/DeclarationFiscaleRoute");
const CompteRouter = require("./Routes/CompteRoute");
const EcritureRouter = require("./Routes/EcritureRoute");
const fournisseurRoutes = require("./Routes/fournisseurRoutes");
const commandeRoutes = require("./Routes/commandesRoutes");
const authRoutes = require("./Routes/Auth"); // Add auth routes
const config = require("./Config/db.json");

mongoose
  .connect(config.url)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database not connected:", err));

const app = express();

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(bodyParser.json());

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
app.use("/auth", authRoutes); // Mount auth routes

const server = http.createServer(app);

server.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});

module.exports = app;