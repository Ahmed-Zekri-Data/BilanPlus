const axios = require('axios');

async function testAPICalls() {
  try {
    console.log('🧪 Test des appels API...');
    
    // 1. Se connecter
    console.log('\n1. Connexion...');
    const loginResponse = await axios.post('http://localhost:3000/user/login', {
      email: 'myriammoncer42@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connecté, token obtenu');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Tester la récupération des rôles
    console.log('\n2. Test récupération des rôles...');
    try {
      const rolesResponse = await axios.get('http://localhost:3000/roles', { headers });
      console.log(`✅ Rôles récupérés: ${rolesResponse.data.length} rôles`);
      console.log('Premier rôle:', rolesResponse.data[0]?.nom);
    } catch (error) {
      console.log('❌ Erreur récupération rôles:', error.response?.data?.message || error.message);
    }
    
    // 3. Tester la création d'un rôle
    console.log('\n3. Test création d\'un rôle...');
    const roleData = {
      nom: `Test Role ${Date.now()}`,
      description: 'Rôle de test créé par script',
      permissions: {
        gererUtilisateursEtRoles: false,
        consulterTableauBord: true,
        gererComptes: false
      },
      actif: true
    };
    
    try {
      const createRoleResponse = await axios.post('http://localhost:3000/roles', roleData, { headers });
      console.log('✅ Rôle créé avec succès');
      console.log('ID du nouveau rôle:', createRoleResponse.data.role._id);
    } catch (error) {
      console.log('❌ Erreur création rôle:', error.response?.data?.message || error.message);
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
    }
    
    // 4. Tester la création d'un utilisateur
    console.log('\n4. Test création d\'un utilisateur...');
    
    // D'abord récupérer un rôle existant
    const rolesForUser = await axios.get('http://localhost:3000/roles', { headers });
    const firstRole = rolesForUser.data[0];
    
    if (firstRole) {
      const userData = {
        nom: 'Test',
        prenom: 'Utilisateur',
        email: `test.user.${Date.now()}@example.com`,
        password: 'password123',
        role: firstRole._id,
        telephone: '0123456789',
        adresse: '123 Rue Test'
      };
      
      try {
        const createUserResponse = await axios.post('http://localhost:3000/user/add', userData, { headers });
        console.log('✅ Utilisateur créé avec succès');
        console.log('ID du nouvel utilisateur:', createUserResponse.data.utilisateur._id);
      } catch (error) {
        console.log('❌ Erreur création utilisateur:', error.response?.data?.message || error.message);
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
      }
    } else {
      console.log('❌ Aucun rôle disponible pour créer un utilisateur');
    }
    
    // 5. Tester la récupération des utilisateurs
    console.log('\n5. Test récupération des utilisateurs...');
    try {
      const usersResponse = await axios.get('http://localhost:3000/user/getall', { headers });
      console.log(`✅ Utilisateurs récupérés: ${usersResponse.data.utilisateurs.length} utilisateurs`);
    } catch (error) {
      console.log('❌ Erreur récupération utilisateurs:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data?.message || error.message);
  }
}

testAPICalls();
