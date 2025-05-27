const axios = require('axios');

async function testSimpleCreation() {
  try {
    console.log('🧪 Test simple de création d\'utilisateur...');
    
    // 1. Se connecter
    console.log('\n1. Connexion...');
    const loginResponse = await axios.post('http://localhost:3000/user/login', {
      email: 'myriammoncer42@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connecté, token obtenu');
    
    // 2. Récupérer les rôles disponibles
    console.log('\n2. Récupération des rôles...');
    const rolesResponse = await axios.get('http://localhost:3000/roles', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Rôles disponibles:', rolesResponse.data.length);
    if (rolesResponse.data.length > 0) {
      console.log('Premier rôle:', rolesResponse.data[0].nom, '(ID:', rolesResponse.data[0]._id + ')');
    }
    
    // 3. Créer un utilisateur simple
    console.log('\n3. Création d\'un utilisateur...');
    const userData = {
      nom: 'Test',
      prenom: 'Simple',
      email: `test.simple.${Date.now()}@example.com`,
      password: 'password123',
      role: rolesResponse.data[0]._id, // Premier rôle disponible
      telephone: '0123456789',
      adresse: '123 Rue Test',
      actif: true
    };
    
    console.log('Données utilisateur:', userData);
    
    const userResponse = await axios.post('http://localhost:3000/user/add', userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Utilisateur créé avec succès!');
    console.log('ID:', userResponse.data.utilisateur._id);
    console.log('Email:', userResponse.data.utilisateur.email);
    
    // 4. Vérifier que l'utilisateur existe en base
    console.log('\n4. Vérification en base...');
    const allUsersResponse = await axios.get('http://localhost:3000/user/getall', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const createdUser = allUsersResponse.data.utilisateurs.find(u => u.email === userData.email);
    if (createdUser) {
      console.log('✅ Utilisateur trouvé en base de données!');
      console.log('Nom complet:', createdUser.nom, createdUser.prenom);
    } else {
      console.log('❌ Utilisateur non trouvé en base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

testSimpleCreation();
