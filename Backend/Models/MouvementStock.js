// models/MouvementStock.js
const MouvementStockSchema = new mongoose.Schema({
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
    type: { type: String, required: true },
    quantite: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MouvementStock', MouvementStockSchema);
