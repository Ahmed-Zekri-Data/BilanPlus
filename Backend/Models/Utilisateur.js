const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UtilisateurSchema = new Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateCreation: { type: Date, default: Date.now },
  dernierConnexion: { type: Date },
  actif: { type: Boolean, default: true },
  tentativesConnexion: { type: Number, default: 0 },
  telephone: { type: String },
  adresse: { type: String },
  photo: { type: String }, // URL de l'image de profil
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  preferences: {
    theme: { type: String, default: "light" },
    langue: { type: String, default: "fr" },
    notificationsEmail: { type: Boolean, default: true }
  }
});

// Méthode pour vérifier si un utilisateur est admin
UtilisateurSchema.methods.estAdmin = function() {
  return this.role.nom === "admin";
};

// Méthode pour vérifier si le compte est verrouillé
UtilisateurSchema.methods.estVerrouille = function() {
  return this.tentativesConnexion >= 5;
};

// Méthode pour réinitialiser les tentatives de connexion
UtilisateurSchema.methods.reinitialiserTentatives = function() {
  this.tentativesConnexion = 0;
  return this.save();
};

// Méthode pour générer un token de réinitialisation de mot de passe
UtilisateurSchema.methods.genererTokenReinitialisation = function() {
  const token = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
  this.tokenReinitialisation = token;
  this.dateExpirationToken = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  return this.save().then(() => token);
};

module.exports = mongoose.model("Utilisateur", UtilisateurSchema);
