// models/Fournisseur.js
const mongoose = require('mongoose');
const FournisseurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    adresse: { type: String, required: true },
    categorie: {type: String, required: true },
    lat: {type: Number },
    long: {type: Number }
});

module.exports = mongoose.model('Fournisseur', FournisseurSchema);