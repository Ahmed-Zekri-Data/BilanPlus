// models/CommandeAchat.js
const mongoose = require('mongoose');
const CommandeAchatSchema = new mongoose.Schema({
  produit: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Produit',  
      required: true 
  },
  quantite: { type: Number},
  date: { type: Date, default: Date.now },
  statut: { type: String, default: "non valide" },
  fournisseurID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: true
  }
});
module.exports = mongoose.model('CommandeAchat', CommandeAchatSchema);