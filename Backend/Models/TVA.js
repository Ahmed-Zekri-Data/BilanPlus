const mongoose = require("mongoose");

const TVASchema = new mongoose.Schema({
    taux: {
        type: Number,
        required: [true, "Le taux de TVA est obligatoire"],
        enum: {
            values: [7, 13, 19],
            message: "Le taux de TVA doit être 7%, 13% ou 19%"
        }
    },
    montant: {
        type: Number,
        required: [true, "Le montant de TVA est obligatoire"],
        min: [0, "Le montant de TVA doit être positif"]
    },
    declarations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeclarationFiscale"
    }],
    dateCreation: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.TVA || mongoose.model("TVA", TVASchema);