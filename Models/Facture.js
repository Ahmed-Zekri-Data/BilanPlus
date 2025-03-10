// models/Facture.js
const FactureSchema = new mongoose.Schema({
    montant: { type: Number, required: true },
    statut: { type: String, required: true },
    echeance: { type: Date, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    produits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produit' }],
    tva: { type: mongoose.Schema.Types.ObjectId, ref: 'TVA' }
});

module.exports = mongoose.model('Facture', FactureSchema);