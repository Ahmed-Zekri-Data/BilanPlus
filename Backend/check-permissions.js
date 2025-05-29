const mongoose = require('mongoose');
const config = require('./Config/db.json');
const Utilisateur = require('./Models/Utilisateur');
const Role = require('./Models/Role');

async function checkPermissions() {
  try {
    await mongoose.connect(config.url);
    console.log('🔍 Vérification des permissions utilisateur...');
    
    // Vérifier l'utilisateur principal
    const user = await Utilisateur.findOne({ email: 'myriammoncer42@gmail.com' }).populate('role');
    if (user) {
      console.log('\n👤 Utilisateur:', user.email);
      console.log('🎭 Rôle:', user.role?.nom || 'Aucun rôle');
      console.log('🔐 Permissions:');
      if (user.role?.permissions) {
        Object.entries(user.role.permissions).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      } else {
        console.log('   Aucune permission définie');
      }
      
      const canManageUsers = user.role?.permissions?.gererUtilisateursEtRoles;
      console.log(`\n✅ Peut gérer utilisateurs/rôles: ${canManageUsers ? 'OUI' : 'NON'}`);
      
      if (!canManageUsers) {
        console.log('\n⚠️  PROBLÈME: L\'utilisateur n\'a pas la permission gererUtilisateursEtRoles');
        console.log('   Cette permission est requise pour:');
        console.log('   - Ajouter des utilisateurs');
        console.log('   - Modifier des rôles');
        console.log('   - Voir la liste des utilisateurs');
      }
    } else {
      console.log('❌ Utilisateur myriammoncer42@gmail.com non trouvé');
    }
    
    // Vérifier l'utilisateur admin
    const admin = await Utilisateur.findOne({ email: 'admin@bilanplus.com' }).populate('role');
    if (admin) {
      console.log('\n👤 Admin:', admin.email);
      console.log('🎭 Rôle:', admin.role?.nom || 'Aucun rôle');
      const canManageUsers = admin.role?.permissions?.gererUtilisateursEtRoles;
      console.log(`✅ Peut gérer utilisateurs/rôles: ${canManageUsers ? 'OUI' : 'NON'}`);
    }
    
    // Vérifier tous les rôles
    const roles = await Role.find({});
    console.log('\n📋 Rôles disponibles:');
    roles.forEach(role => {
      const canManage = role.permissions?.gererUtilisateursEtRoles || false;
      console.log(`  - ${role.nom}: gererUtilisateursEtRoles = ${canManage ? 'OUI' : 'NON'}`);
    });
    
    console.log('\n🔧 Solution recommandée:');
    console.log('1. Se connecter avec admin@bilanplus.com / admin123');
    console.log('2. Ou corriger les permissions de l\'utilisateur actuel');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkPermissions();
