const mongoose = require('mongoose');
const Utilisateur = require('./Models/Utilisateur');
const Role = require('./Models/Role');

mongoose.connect('mongodb://127.0.0.1:27017/BilanPlus')
  .then(async () => {
    console.log('Connecté à MongoDB');
    const users = await Utilisateur.find().populate('role');
    console.log('Utilisateurs existants:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.nom} ${user.prenom}) - Role: ${user.role?.nom || 'Non défini'}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });
