const mongoose = require("mongoose");

const TVASchema = new mongoose.Schema({
    taux: { type: Number, required: true },
    montant: { type: Number, required: true },
    declaration: { type: mongoose.Schema.Types.ObjectId, ref: "DeclarationFiscale", required: true },
});

module.exports = mongoose.models.TVA || mongoose.model("TVA", TVASchema);