// models/TVA.js
const TVASchema = new mongoose.Schema({
    taux: { type: Number, required: true },
    montant: { type: Number, required: true },
    declaration: { type: mongoose.Schema.Types.ObjectId, ref: 'DeclarationFiscale' }
});

module.exports = mongoose.model('TVA', TVASchema);