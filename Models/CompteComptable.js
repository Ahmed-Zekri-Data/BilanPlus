const mongoose = require("mongoose");

const compteComptableSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, required: true, enum: ["actif", "passif", "charge", "produit"] },
  solde: { type: Number, default: 0 }
});

module.exports = mongoose.model("CompteComptable", compteComptableSchema);