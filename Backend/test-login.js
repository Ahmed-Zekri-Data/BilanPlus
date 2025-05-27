const axios = require('axios');

async function testLogin() {
  try {
    console.log('Test de connexion avec un utilisateur réel...');
    
    // 1. Test avec un utilisateur existant
    console.log('\n1. Test avec myriammoncer42@gmail.com');
    try {
      const loginResponse = await axios.post('http://localhost:3000/user/login', {
        email: 'myriammoncer42@gmail.com',
        password: 'password123' // Remplacez par le vrai mot de passe
      });
      
      console.log('✅ Connexion réussie:', loginResponse.data.message);
      console.log('Token reçu:', loginResponse.data.token ? 'Oui' : 'Non');
      console.log('Utilisateur:', loginResponse.data.user.nom, loginResponse.data.user.prenom);
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.response?.data?.message || error.message);
    }
    
    // 2. Test avec un utilisateur inexistant
    console.log('\n2. Test avec un utilisateur inexistant');
    try {
      const invalidResponse = await axios.post('http://localhost:3000/user/login', {
        email: 'utilisateur.inexistant@example.com',
        password: 'motdepasse123'
      });
      console.log('⚠️ Connexion réussie (ne devrait pas arriver):', invalidResponse.data);
    } catch (error) {
      console.log('✅ Connexion refusée (attendu):', error.response?.data?.message);
    }
    
    // 3. Test avec un mauvais mot de passe
    console.log('\n3. Test avec un mauvais mot de passe');
    try {
      const wrongPasswordResponse = await axios.post('http://localhost:3000/user/login', {
        email: 'myriammoncer42@gmail.com',
        password: 'mauvais-mot-de-passe'
      });
      console.log('⚠️ Connexion réussie (ne devrait pas arriver):', wrongPasswordResponse.data);
    } catch (error) {
      console.log('✅ Connexion refusée (attendu):', error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

testLogin();
