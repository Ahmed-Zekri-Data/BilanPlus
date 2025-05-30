// models/CommandeAchat.js
const mongoose = require('mongoose');
const Utilisateur = require('./Utilisateur');
const CommandeAchatSchema = new mongoose.Schema({
  produit: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Produit',  
      required: true 
  },
  quantite: { type: Number, required: true, min: 1 },
  date: { type: Date, default: Date.now },
  statut: { 
    type: String,
    enum: ['En attente', 'En cours', 'Livrée', 'Annulée'],
    default: 'En attente' 
  },
  type_livraison: { 
    type: String, 
    enum: ['SARL', 'EURL', 'SAS', 'SA', 'SCI', 'Auto-entrepreneur'], 
    required: true 
  }, 
  createdAt: { type: Date, default: Date.now },
  date_fin: { type: Date, required: true },
  utilisateur: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Utilisateur',  
      required: true 
  },
  fournisseurs: [{
    fournisseurID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: true
    },
    statut: {
      type: String,
      enum: ['En attente', 'Acceptée', 'Refusée'],
      default: 'En attente'
    },
    id: { type: String }
  }],
});
module.exports = mongoose.model('CommandeAchat', CommandeAchatSchema);