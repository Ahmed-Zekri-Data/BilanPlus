// models/CommandeAchat.js
const mongoose = require('mongoose');
const CommandeAchatSchema = new mongoose.Schema({
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
    quantite: { type: Number, required: true },
    prix: { type: Number, required: true },
    statut: { type: String},
    fournisseurID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fournisseur',
        required: true
      }
});
module.exports = mongoose.model('CommandeAchat', CommandeAchatSchema);