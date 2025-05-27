const axios = require('axios');

async function testAuthentication() {
  console.log('🔐 Test d\'authentification...');
  
  try {
    // 1. Test de connexion
    console.log('\n1. Test de connexion...');
    
    const loginData = {
      email: 'myriammoncer42@gmail.com',
      password: 'password123'
    };
    
    console.log('Données de connexion:', loginData);
    
    const loginResponse = await axios.post('http://localhost:3000/user/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Connexion réussie');
    console.log('Token reçu:', loginResponse.data.token ? 'Oui' : 'Non');
    console.log('Utilisateur:', loginResponse.data.utilisateur?.email);
    
    const token = loginResponse.data.token;
    
    // 2. Test d'appel avec token
    console.log('\n2. Test d\'appel avec token...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Headers:', headers);
    
    // Test récupération des utilisateurs
    const usersResponse = await axios.get('http://localhost:3000/user/getall', { headers });
    console.log('✅ Récupération utilisateurs réussie');
    console.log('Nombre d\'utilisateurs:', usersResponse.data.utilisateurs?.length);
    
    // Test récupération des rôles
    const rolesResponse = await axios.get('http://localhost:3000/roles', { headers });
    console.log('✅ Récupération rôles réussie');
    console.log('Nombre de rôles:', rolesResponse.data?.length);
    
    // 3. Test de création d'utilisateur
    console.log('\n3. Test de création d\'utilisateur...');
    
    const userData = {
      nom: 'Test',
      prenom: 'Auth',
      email: `test.auth.${Date.now()}@example.com`,
      password: 'password123',
      role: rolesResponse.data[0]._id,
      telephone: '0123456789',
      adresse: '123 Rue Auth'
    };
    
    const createUserResponse = await axios.post('http://localhost:3000/user/add', userData, { headers });
    console.log('✅ Création utilisateur réussie');
    console.log('Nouvel utilisateur ID:', createUserResponse.data.utilisateur._id);
    
    // 4. Test de création de rôle
    console.log('\n4. Test de création de rôle...');
    
    const roleData = {
      nom: `Test Auth Role ${Date.now()}`,
      description: 'Rôle créé pour test d\'authentification',
      permissions: {
        gererUtilisateursEtRoles: false,
        consulterTableauBord: true,
        gererComptes: false
      },
      actif: true
    };
    
    const createRoleResponse = await axios.post('http://localhost:3000/roles', roleData, { headers });
    console.log('✅ Création rôle réussie');
    console.log('Nouveau rôle ID:', createRoleResponse.data.role._id);
    
    console.log('\n✅ Tous les tests d\'authentification ont réussi !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'authentification:');
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
    
    if (error.response?.data) {
      console.error('Données de réponse:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Vérifiez que le backend est démarré sur le port 3000');
      console.error('   Commande: cd Backend && node app.js');
    }
  }
}

testAuthentication();
