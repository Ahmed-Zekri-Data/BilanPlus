// models/Produit.js
const ProduitSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    categorie: { type: String, required: true },
    prix: { type: Number, required: true },
    stock: { type: Number, required: true }
});

module.exports = mongoose.model('Produit', ProduitSchema);