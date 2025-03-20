// models/MouvementStock.js
var mongo = require("mongoose");
const MouvementStockSchema = new mongo.Schema({
    produit: { type: mongo.Schema.Types.ObjectId, ref: 'Produit' },
    type: { type: String, required: true },
    quantite: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongo.model('MouvementStock', MouvementStockSchema);
