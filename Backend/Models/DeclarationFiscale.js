const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeclarationFiscaleSchema = new Schema({
    periode: { 
        type: String, 
        required: [true, "La période est obligatoire"], 
        match: [/^\d{4}-(0[1-9]|1[0-2])$/, "La période doit être au format YYYY-MM (ex. 2025-03)"]
    },
    montantTotal: { 
        type: Number, 
        required: [true, "Le montant total est obligatoire"], 
        validate: {
            validator: function(v) {
                return v >= 0;
            },
            message: "Le montant total ne peut pas être négatif"
        }
    },
    statut: { 
        type: String, 
        required: [true, "Le statut est obligatoire"], 
        enum: ["brouillon", "soumis", "payé", "rejeté"]
    },
    compteComptable: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "CompteComptable", 
        required: [false, "Le compte comptable est obligatoire"]
    }
});

// Vérifie si le modèle existe déjà, sinon le crée
module.exports = mongoose.models.DeclarationFiscale || mongoose.model("DeclarationFiscale", DeclarationFiscaleSchema);