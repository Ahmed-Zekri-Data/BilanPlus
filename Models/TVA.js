// models/TVA.js
var mongo = require("mongoose");
const Schema = mongo.Schema
const TVA = new Schema({
    taux: { type: Number, required: true },
    montant: { type: Number, required: true },
    declaration: { type: mongo.Schema.Types.ObjectId, ref: 'DeclarationFiscale' }
});

module.exports = mongo.model('TVA', TVA);