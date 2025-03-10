// models/EcritureComptable.js
const EcritureComptableSchema = new mongoose.Schema({
    compte: { type: mongoose.Schema.Types.ObjectId, ref: 'CompteComptable' },
    montant: { type: Number, required: true },
    nature: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EcritureComptable', EcritureComptableSchema);
