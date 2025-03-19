// models/Produit.js
var mongo = require("mongoose");
const ProduitSchema = new mongo.Schema({
    nom: { type: String, required: true },
    categorie: { type: String, required: true },
    prix: { type: Number, required: true },
    stock: { type: Number, required: true }
});

module.exports = mongo.model('Produit', ProduitSchema);