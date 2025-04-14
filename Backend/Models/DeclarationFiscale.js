const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeclarationFiscaleSchema = new Schema({
    periode: { type: String, required: true },
    montantTotal: { type: Number, required: true },
    statut: { type: String, required: true },
    compteComptable: { type: mongoose.Schema.Types.ObjectId, ref: "CompteComptable", required: true }
});

module.exports = mongoose.models.DeclarationFiscale || mongoose.model("DeclarationFiscale", DeclarationFiscaleSchema); 