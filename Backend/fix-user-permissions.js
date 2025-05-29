const mongoose = require('mongoose');
const config = require('./Config/db.json');
const Utilisateur = require('./Models/Utilisateur');
const Role = require('./Models/Role');

async function fixUserPermissions() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(config.mongoURI);
    console.log('✅ Connecté à MongoDB');

    // 1. Vérifier l'utilisateur myriammoncer42@gmail.com
    console.log('\n1. Vérification de l\'utilisateur myriammoncer42@gmail.com...');
    const user = await Utilisateur.findOne({ email: 'myriammoncer42@gmail.com' }).populate('role');
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', user.nom, user.prenom);
    console.log('Rôle actuel:', user.role ? user.role.nom : 'Aucun rôle');
    console.log('Permissions actuelles:', user.role ? user.role.permissions : 'Aucune');

    // 2. Vérifier/créer un rôle administrateur
    console.log('\n2. Vérification du rôle administrateur...');
    let adminRole = await Role.findOne({ nom: 'Administrateur Système' });
    
    if (!adminRole) {
      console.log('Création du rôle Administrateur Système...');
      adminRole = new Role({
        nom: 'Administrateur Système',
        description: 'Accès complet au système',
        permissions: {
          accesComplet: true,
          gererUtilisateursEtRoles: true,
          consulterTableauBord: true,
          gererComptes: true,
          gererBudgets: true,
          gererFactures: true,
          gererPaiements: true,
          gererRapports: true,
          gererAudit: true,
          gererParametres: true,
          exporterDonnees: true,
          importerDonnees: true,
          sauvegarderRestaurer: true
        },
        actif: true
      });
      
      await adminRole.save();
      console.log('✅ Rôle Administrateur Système créé');
    } else {
      console.log('✅ Rôle Administrateur Système existe déjà');
      
      // Mettre à jour les permissions si nécessaire
      const requiredPermissions = {
        accesComplet: true,
        gererUtilisateursEtRoles: true,
        consulterTableauBord: true,
        gererComptes: true,
        gererBudgets: true,
        gererFactures: true,
        gererPaiements: true,
        gererRapports: true,
        gererAudit: true,
        gererParametres: true,
        exporterDonnees: true,
        importerDonnees: true,
        sauvegarderRestaurer: true
      };
      
      let needsUpdate = false;
      for (const [permission, value] of Object.entries(requiredPermissions)) {
        if (!adminRole.permissions[permission]) {
          adminRole.permissions[permission] = value;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await adminRole.save();
        console.log('✅ Permissions du rôle mises à jour');
      }
    }

    // 3. Assigner le rôle administrateur à l'utilisateur
    console.log('\n3. Attribution du rôle administrateur...');
    if (!user.role || user.role._id.toString() !== adminRole._id.toString()) {
      user.role = adminRole._id;
      await user.save();
      console.log('✅ Rôle administrateur attribué à l\'utilisateur');
    } else {
      console.log('✅ L\'utilisateur a déjà le rôle administrateur');
    }

    // 4. Vérifier d'autres utilisateurs et leur attribuer des rôles appropriés
    console.log('\n4. Vérification des autres utilisateurs...');
    const allUsers = await Utilisateur.find({}).populate('role');
    
    for (const otherUser of allUsers) {
      if (otherUser.email !== 'myriammoncer42@gmail.com' && !otherUser.role) {
        console.log(`Attribution d'un rôle à ${otherUser.email}...`);
        
        // Créer ou trouver un rôle utilisateur standard
        let userRole = await Role.findOne({ nom: 'Utilisateur Standard' });
        if (!userRole) {
          userRole = new Role({
            nom: 'Utilisateur Standard',
            description: 'Utilisateur avec permissions de base',
            permissions: {
              consulterTableauBord: true,
              gererComptes: false,
              gererUtilisateursEtRoles: false
            },
            actif: true
          });
          await userRole.save();
          console.log('✅ Rôle Utilisateur Standard créé');
        }
        
        otherUser.role = userRole._id;
        await otherUser.save();
        console.log(`✅ Rôle attribué à ${otherUser.email}`);
      }
    }

    console.log('\n✅ Configuration des permissions terminée!');
    console.log('\nRésumé:');
    console.log(`- Utilisateur admin: ${user.email}`);
    console.log(`- Rôle admin: ${adminRole.nom}`);
    console.log(`- Permissions: gererUtilisateursEtRoles = ${adminRole.permissions.gererUtilisateursEtRoles}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

fixUserPermissions();
