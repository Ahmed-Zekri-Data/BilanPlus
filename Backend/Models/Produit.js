var mongo = require("mongoose");
const ProduitSchema = new mongo.Schema({
    nom: { type: String, required: true },
    categorie: { type: String, required: true },
    prix: { type: Number, required: true },
    stock: { type: Number, required: true },
    seuilAlerte: { type: Number, default: 0 } // Ajout du seuil d'alerte avec une valeur par défaut
});

module.exports = mongo.model('Produit', ProduitSchema);