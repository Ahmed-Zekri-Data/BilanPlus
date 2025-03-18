// models/Utilisateur.js
const mongoose = require('mongoose');
const UtilisateurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
});
module.exports = mongoose.model('Utilisateur', UtilisateurSchema);