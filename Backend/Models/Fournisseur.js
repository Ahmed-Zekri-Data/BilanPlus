// models/Fournisseur.js
const FournisseurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true },
    adresse: { type: String, required: true }
});

module.exports = mongoose.model('Fournisseur', FournisseurSchema);