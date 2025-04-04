const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TVASchema = new Schema({
    taux: { 
        type: Number, 
        required: [true, "Le taux de TVA est obligatoire"], 
        enum: [7, 13, 19], // Taux valides en Tunisie
        validate: {
            validator: function(v) {
                return v > 0; // Le taux doit être positif
            },
            message: "Le taux doit être supérieur à 0"
        }
    },
    montant: { 
        type: Number, 
        required: [true, "Le montant est obligatoire"], 
        validate: {
            validator: function(v) {
                return v >= 0; // Le montant ne peut pas être négatif
            },
            message: "Le montant ne peut pas être négatif"
        }
    },
    declaration: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "DeclarationFiscale", 
        required: [false, "La déclaration associée est obligatoire"]
    }
});

module.exports = mongoose.model("TVA", TVASchema);