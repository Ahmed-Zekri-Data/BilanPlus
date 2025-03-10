// models/CompteComptable.js
const CompteComptableSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    type: { type: String, required: true },
    solde: { type: Number, required: true }
});

module.exports = mongoose.model('CompteComptable', CompteComptableSchema);
