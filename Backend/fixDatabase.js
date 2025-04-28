const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Utilisateur = require('./Models/Utilisateur');
const Role = require('./Models/Role');

mongoose.connect('mongodb://127.0.0.1:27017/BilanPlus')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

async function fixDatabase() {
  try {
    // Étape 1 : Créer ou récupérer des rôles
    console.log('Création ou récupération des rôles...');
    let adminRole = await Role.findOne({ nom: 'Administrateur' });
    if (!adminRole) {
      adminRole = new Role({
        nom: 'Administrateur',
        description: 'Accès complet au système',
        permissions: {
          gestionUtilisateurs: true,
          gestionRoles: true,
          gestionClients: true,
          gestionFournisseurs: true,
          gestionFactures: true,
          gestionComptabilite: true,
          gestionBilans: true,
          gestionDeclarations: true,
          rapportsAvances: true,
          parametresSysteme: true
        },
        dateCreation: new Date(),
        actif: true
      });
      await adminRole.save();
      console.log('Rôle Administrateur créé:', adminRole._id);
    }

    let gestionnaireUtilisateursRole = await Role.findOne({ nom: 'GestionnaireUtilisateurs' });
    if (!gestionnaireUtilisateursRole) {
      gestionnaireUtilisateursRole = new Role({
        nom: 'GestionnaireUtilisateurs',
        description: 'Peut gérer les utilisateurs',
        permissions: {
          gestionUtilisateurs: true,
          gestionRoles: false,
          gestionClients: false,
          gestionFournisseurs: false,
          gestionFactures: false,
          gestionComptabilite: false,
          gestionBilans: false,
          gestionDeclarations: false,
          rapportsAvances: false,
          parametresSysteme: false
        },
        dateCreation: new Date(),
        actif: true
      });
      await gestionnaireUtilisateursRole.save();
      console.log('Rôle GestionnaireUtilisateurs créé:', gestionnaireUtilisateursRole._id);
    }

    let gestionnaireRolesRole = await Role.findOne({ nom: 'GestionnaireRoles' });
    if (!gestionnaireRolesRole) {
      gestionnaireRolesRole = new Role({
        nom: 'GestionnaireRoles',
        description: 'Peut gérer les rôles',
        permissions: {
          gestionUtilisateurs: false,
          gestionRoles: true,
          gestionClients: false,
          gestionFournisseurs: false,
          gestionFactures: false,
          gestionComptabilite: false,
          gestionBilans: false,
          gestionDeclarations: false,
          rapportsAvances: false,
          parametresSysteme: false
        },
        dateCreation: new Date(),
        actif: true
      });
      await gestionnaireRolesRole.save();
      console.log('Rôle GestionnaireRoles créé:', gestionnaireRolesRole._id);
    }

    // Étape 2 : Mettre à jour les utilisateurs
    console.log('Mise à jour des utilisateurs...');
    const utilisateurs = await Utilisateur.find();

    for (let utilisateur of utilisateurs) {
      console.log(`Traitement de l'utilisateur: ${utilisateur.email}`);

      // Renommer motDePasse en password et hacher si nécessaire
      if (utilisateur.motDePasse) {
        console.log(`Utilisateur ${utilisateur.email} a motDePasse, hachage en cours...`);
        const hashedPassword = await bcrypt.hash(utilisateur.motDePasse, 10);
        utilisateur.password = hashedPassword;
        utilisateur.motDePasse = undefined;
      }

      // Ajouter les champs manquants
      if (utilisateur.actif === undefined) utilisateur.actif = true;
      if (utilisateur.tentativesConnexion === undefined) utilisateur.tentativesConnexion = 0;
      if (utilisateur.dateCreation === undefined) utilisateur.dateCreation = new Date();
      if (utilisateur.preferences === undefined) {
        utilisateur.preferences = { theme: 'light', langue: 'fr', notificationsEmail: true };
      }

      // Corriger le champ role
      if (utilisateur.email === 'test9@test.com') {
        utilisateur.role = adminRole._id;
      } else if (utilisateur.email === 'myriammoncer@gmail.com') {
        utilisateur.role = adminRole._id;
      } else if (utilisateur.email === 'test99@test.com') {
        utilisateur.role = gestionnaireUtilisateursRole._id;
      } else if (utilisateur.email === 'test@example.com') {
        utilisateur.role = gestionnaireUtilisateursRole._id;
      } else if (utilisateur.email === 'myriammoncer42@gmail.com') {
        utilisateur.role = adminRole._id;
      } else if (utilisateur.email === 'myriammoncer424@gmail.com') {
        utilisateur.role = gestionnaireRolesRole._id;
      } else if (utilisateur.email === 'myriammoncer4254@gmail.com') {
        utilisateur.role = gestionnaireRolesRole._id;
      }

      await utilisateur.save();
      console.log(`Utilisateur ${utilisateur.email} mis à jour avec succès`);
    }

    // Étape 3 : Réinitialiser les mots de passe pour qu'ils soient connus
    console.log('Réinitialisation des mots de passe...');
    const nouveauxMotsDePasse = {
      'test9@test.com': 'test9password',
      'myriammoncer@gmail.com': 'myriampassword',
      'test99@test.com': 'test99password',
      'test@example.com': 'testpassword',
      'myriammoncer42@gmail.com': 'myriam42password',
      'myriammoncer424@gmail.com': 'myriam424password',
      'myriammoncer4254@gmail.com': 'myriam4254password'
    };

    for (let email in nouveauxMotsDePasse) {
      const motDePasse = nouveauxMotsDePasse[email];
      const hashedPassword = await bcrypt.hash(motDePasse, 10);
      await Utilisateur.updateOne(
        { email },
        { $set: { password: hashedPassword, tentativesConnexion: 0 } }
      );
      console.log(`Mot de passe de ${email} réinitialisé à ${motDePasse}`);
    }

    // Étape 4 : Créer admin@bilanplus.com si nécessaire
    console.log('Création de admin@bilanplus.com...');
    const adminUser = await Utilisateur.findOne({ email: 'admin@bilanplus.com' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Utilisateur({
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@bilanplus.com',
        password: hashedPassword,
        role: adminRole._id,
        actif: true,
        tentativesConnexion: 0,
        dateCreation: new Date(),
        preferences: { theme: 'light', langue: 'fr', notificationsEmail: true }
      });
      await admin.save();
      console.log('Utilisateur admin@bilanplus.com créé avec succès');
    } else {
      console.log('Utilisateur admin@bilanplus.com existe déjà');
    }

    console.log('Base de données corrigée avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la correction de la base de données:', err);
    process.exit(1);
  }
}

fixDatabase();