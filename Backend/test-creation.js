const axios = require('axios');

async function testCreation() {
  try {
    console.log('Test de création d\'utilisateurs et de rôles...');
    
    // 1. D'abord se connecter pour obtenir un token
    console.log('\n1. Connexion pour obtenir un token...');
    let token = '';
    try {
      const loginResponse = await axios.post('http://localhost:3000/user/login', {
        email: 'myriammoncer42@gmail.com',
        password: 'password123' // Remplacez par le vrai mot de passe
      });
      
      token = loginResponse.data.token;
      console.log('✅ Connexion réussie, token obtenu');
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.response?.data?.message || error.message);
      return;
    }
    
    // 2. Test de création d'un rôle
    console.log('\n2. Test de création d\'un rôle...');
    try {
      const roleResponse = await axios.post('http://localhost:3000/roles', {
        nom: 'Test Role',
        description: 'Rôle de test créé via API',
        permissions: {
          gererUtilisateursEtRoles: true,
          consulterTableauBord: true,
          gererComptes: false
        },
        actif: true
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Rôle créé avec succès:', roleResponse.data.message);
      console.log('ID du rôle:', roleResponse.data.role._id);
      
      // 3. Test de création d'un utilisateur avec ce rôle
      console.log('\n3. Test de création d\'un utilisateur...');
      try {
        const userResponse = await axios.post('http://localhost:3000/user/add', {
          nom: 'Test',
          prenom: 'Utilisateur',
          email: 'test.utilisateur@example.com',
          password: 'motdepasse123',
          role: roleResponse.data.role._id,
          telephone: '0123456789',
          adresse: '123 Rue de Test',
          actif: true
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Utilisateur créé avec succès:', userResponse.data.message);
        console.log('ID de l\'utilisateur:', userResponse.data.utilisateur._id);
        
      } catch (error) {
        console.log('❌ Erreur création utilisateur:', error.response?.data?.message || error.message);
      }
      
    } catch (error) {
      console.log('❌ Erreur création rôle:', error.response?.data?.message || error.message);
    }
    
    // 4. Test avec des données invalides
    console.log('\n4. Test avec des données invalides...');
    try {
      const invalidResponse = await axios.post('http://localhost:3000/user/add', {
        nom: '', // Nom vide
        email: 'email-invalide', // Email invalide
        password: '123' // Mot de passe trop court
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('⚠️ Création réussie (ne devrait pas arriver):', invalidResponse.data);
    } catch (error) {
      console.log('✅ Création refusée (attendu):', error.response?.data?.message);
    }
    
    // 5. Test sans token
    console.log('\n5. Test sans token d\'authentification...');
    try {
      const noTokenResponse = await axios.post('http://localhost:3000/user/add', {
        nom: 'Test',
        prenom: 'Sans Token',
        email: 'sans.token@example.com',
        password: 'motdepasse123'
      });
      console.log('⚠️ Création réussie (ne devrait pas arriver):', noTokenResponse.data);
    } catch (error) {
      console.log('✅ Accès refusé (attendu):', error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

testCreation();
