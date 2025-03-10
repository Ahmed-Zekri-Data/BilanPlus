// models/CommandeAchat.js
const CommandeAchatSchema = new mongoose.Schema({
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
    quantite: { type: Number, required: true },
    prixTotal: { type: Number, required: true },
    statut: { type: String, required: true }
});
module.exports = mongoose.model('CommandeAchat', CommandeAchatSchema);