const mongoose = require('mongoose');
const DevisSchema = new mongoose.Schema({
    prix: { type: String, required: true },
    fournisseurID: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
    commandeID: { type: mongoose.Schema.Types.ObjectId, ref: 'CommandeAchat', required: true },
    date: { type: Date, default: Date.now },
    statut: { type: String, enum: ['En attente', 'Accepté', 'Refusé'], default: 'En attente' }
});

module.exports = mongoose.models.Devis || mongoose.model("Devis", DevisSchema);
