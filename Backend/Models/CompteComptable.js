const mongoose = require("mongoose");

const compteComptableSchema = new mongoose.Schema({
  numeroCompte: { type: String, required: true, unique: true }, // Ajout du champ numeroCompte
  nom: { type: String, required: true },
  type: { type: String, required: true, enum: ["actif", "passif", "charge", "produit"] },
  solde: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }, // Optionnel : pour garder une trace de la date de création
  updatedAt: { type: Date, default: Date.now }  // Optionnel : pour garder une trace de la date de mise à jour
});

// Middleware pour mettre à jour updatedAt avant chaque sauvegarde
compteComptableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("CompteComptable", compteComptableSchema);