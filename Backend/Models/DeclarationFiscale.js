const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeclarationFiscaleSchema = new Schema({
    periode: { type: String, required: true },
    montantTotal: { type: Number, required: true },
    statut: { 
        type: String, 
        required: true, 
        enum: ["brouillon", "soumise", "validée", "payé", "rejeté"]
    },
    compteComptable: { type: mongoose.Schema.Types.ObjectId, ref: "CompteComptable", required: true },
    type: { 
        type: String, 
        required: true, 
        enum: ["mensuelle", "trimestrielle", "annuelle"] 
    },
    totalTVACollectee: { type: Number, required: true, default: 0 },
    totalTVADeductible: { type: Number, required: true, default: 0 },
    totalTVADue: { type: Number, required: true, default: 0 },
    totalTCL: { type: Number, required: true, default: 0 },
    totalDroitTimbre: { type: Number, required: true, default: 0 },
    dateCreation: { type: Date, default: Date.now },
    dateSoumission: { type: Date },
    penalites: {
        estEnRetard: { type: Boolean, default: false },
        retardJours: { type: Number, default: 0 },
        tauxPenalite: { type: Number, default: 0 },
        montantPenalite: { type: Number, default: 0 }
    }
});

module.exports = mongoose.models.DeclarationFiscale || mongoose.model("DeclarationFiscale", DeclarationFiscaleSchema);