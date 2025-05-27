// models/Client.js
const mongoose = require('mongoose');
const ClientSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true },
    adresse: { type: String, required: true }
});

module.exports = mongoose.models.Client || mongoose.model("Client", ClientSchema);
