// models/Utilisateur.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema
const Utilisateur = new Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'user'] }
});
module.exports = mongoose.model('Utilisateur', Utilisateur);

