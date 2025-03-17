const mongoose = require("mongoose");

const ecritureComptableSchema = new mongoose.Schema({
  compte: { type: mongoose.Schema.Types.ObjectId, ref: "CompteComptable", required: true },
  montant: { type: Number, required: true },
  nature: { type: String, required: true, enum: ["débit", "crédit"] },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EcritureComptable", ecritureComptableSchema);
