// models/DeclarationFiscale.js
var mongo = require("mongoose");
const Schema = mongo.Schema
const DeclarationFiscale =new Schema ({
    periode: { type: String, required: true },
    montantTotal: { type: Number, required: true },
    statut: { type: String, required: true },
    compteComptable: { type: mongo.Schema.Types.ObjectId, ref: 'CompteComptable' }
});

module.exports = mongo.model('DeclarationFiscale', DeclarationFiscale);


