const mongoose = require("mongoose");

// Sous-schéma pour chaque ligne d'une écriture
const ligneEcritureSchema = new mongoose.Schema({
  compte: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CompteComptable", 
    required: true 
  },
  montant: { type: Number, required: true },
  nature: { 
    type: String, 
    required: true, 
    enum: ["débit", "crédit"] 
  }
});


const ecritureComptableSchema = new mongoose.Schema({
  libelle: { type: String, required: true }, 
  date: { type: Date, default: Date.now },
  lignes: [ligneEcritureSchema] 
}, { timestamps: true });

module.exports = mongoose.model("EcritureComptable", ecritureComptableSchema);