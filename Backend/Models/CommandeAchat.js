// models/CommandeAchat.js
const mongoose = require('mongoose');
const CommandeAchatSchema = new mongoose.Schema({
  produit: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Produit',  
      required: true 
  },
  quantite: { type: Number},
  prix: { type: Number, required: true },
  statut: { type: String, default: "En attente" },
  fournisseurID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: true
  }
});
module.exports = mongoose.model('CommandeAchat', CommandeAchatSchema);