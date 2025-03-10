// models/Paiement.js
const PaiementSchema = new mongoose.Schema({
    montant: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    facture: { type: mongoose.Schema.Types.ObjectId, ref: 'Facture' }
});

module.exports = mongoose.model('Paiement', PaiementSchema);
