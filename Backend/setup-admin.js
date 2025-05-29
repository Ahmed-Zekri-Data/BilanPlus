const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('./Config/db.json');
const Utilisateur = require('./Models/Utilisateur');
const Role = require('./Models/Role');

async function setupAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(config.url);
    console.log('✅ Connecté à MongoDB');

    // 1. Créer un rôle administrateur
    console.log('\n1. Création du rôle administrateur...');

    // Supprimer l'ancien rôle s'il existe
    await Role.deleteOne({ nom: 'Administrateur Système' });

    const adminRole = new Role({
      nom: 'Administrateur Système',
      description: 'Accès complet au système',
      permissions: {
        gererUtilisateursEtRoles: true,
        consulterTableauBord: true,
        gererComptes: true,
        accesComplet: true
      },
      actif: true
    });

    await adminRole.save();
    console.log('✅ Rôle administrateur créé avec ID:', adminRole._id);

    // 2. Créer un utilisateur administrateur
    console.log('\n2. Création de l\'utilisateur administrateur...');

    // Supprimer l'ancien utilisateur s'il existe
    await Utilisateur.deleteOne({ email: 'admin@bilanplus.com' });

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = new Utilisateur({
      nom: 'Admin',
      prenom: 'Système',
      email: 'admin@bilanplus.com',
      password: hashedPassword,
      role: adminRole._id,
      telephone: '0000000000',
      adresse: 'Système',
      actif: true,
      dateCreation: new Date()
    });

    await adminUser.save();
    console.log('✅ Utilisateur administrateur créé');
    console.log('Email: admin@bilanplus.com');
    console.log('Mot de passe: admin123');

    // 3. Créer un rôle utilisateur standard
    console.log('\n3. Création du rôle utilisateur standard...');

    await Role.deleteOne({ nom: 'Utilisateur Standard' });

    const userRole = new Role({
      nom: 'Utilisateur Standard',
      description: 'Utilisateur avec permissions de base',
      permissions: {
        gererUtilisateursEtRoles: false,
        consulterTableauBord: true,
        gererComptes: false,
        accesComplet: false
      },
      actif: true
    });

    await userRole.save();
    console.log('✅ Rôle utilisateur standard créé avec ID:', userRole._id);

    // 4. Mettre à jour l'utilisateur existant myriammoncer42@gmail.com
    console.log('\n4. Mise à jour de l\'utilisateur existant...');

    const existingUser = await Utilisateur.findOne({ email: 'myriammoncer42@gmail.com' });
    if (existingUser) {
      // Mettre à jour le mot de passe et le rôle
      existingUser.password = await bcrypt.hash('password123', 10);
      existingUser.role = adminRole._id;
      existingUser.actif = true;
      await existingUser.save();
      console.log('✅ Utilisateur myriammoncer42@gmail.com mis à jour');
      console.log('Nouveau mot de passe: password123');
    } else {
      console.log('⚠️ Utilisateur myriammoncer42@gmail.com non trouvé');
    }

    // 5. Afficher un résumé
    console.log('\n📋 Résumé de la configuration:');
    console.log('');
    console.log('🔑 Comptes administrateur:');
    console.log('  - admin@bilanplus.com / admin123');
    console.log('  - myriammoncer42@gmail.com / password123');
    console.log('');
    console.log('🎭 Rôles créés:');
    console.log('  - Administrateur Système (toutes permissions)');
    console.log('  - Utilisateur Standard (permissions limitées)');
    console.log('');
    console.log('✅ Configuration terminée! Vous pouvez maintenant:');
    console.log('  1. Démarrer le backend: node app.js');
    console.log('  2. Vous connecter avec un des comptes admin');
    console.log('  3. Créer des utilisateurs et des rôles');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDéconnecté de MongoDB');
  }
}

setupAdmin();
