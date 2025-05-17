// models/Fournisseur.js
const mongoose = require('mongoose');
const FournisseurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    adresse: { type: String, required: true },
    categorie: {type: String, required: true }
});

module.exports = mongoose.model('Fournisseur', FournisseurSchema);