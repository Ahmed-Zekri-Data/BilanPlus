// models/DeclarationFiscale.js
const DeclarationFiscaleSchema = new mongoose.Schema({
    periode: { type: String, required: true },
    montantTotal: { type: Number, required: true },
    statut: { type: String, required: true },
    compteComptable: { type: mongoose.Schema.Types.ObjectId, ref: 'CompteComptable' }
});

module.exports = mongoose.model('DeclarationFiscale', DeclarationFiscaleSchema);
