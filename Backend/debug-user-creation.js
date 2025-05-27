const axios = require('axios');

async function debugUserCreation() {
  try {
    console.log('🔍 Debug de la création d\'utilisateur...');
    
    // 1. Vérifier la connexion et obtenir le token
    console.log('\n1. Test de connexion...');
    let loginData;
    try {
      const loginResponse = await axios.post('http://localhost:3000/user/login', {
        email: 'myriammoncer42@gmail.com',
        password: 'password123'
      });
      
      loginData = loginResponse.data;
      console.log('✅ Connexion réussie');
      console.log('Token reçu:', loginData.token ? 'Oui' : 'Non');
      console.log('Utilisateur:', loginData.user?.nom, loginData.user?.prenom);
      console.log('Rôle utilisateur:', loginData.user?.role);
      
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.response?.data?.message || error.message);
      return;
    }
    
    // 2. Vérifier les rôles disponibles
    console.log('\n2. Récupération des rôles disponibles...');
    try {
      const rolesResponse = await axios.get('http://localhost:3000/roles', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('✅ Rôles récupérés:', rolesResponse.data.length);
      rolesResponse.data.forEach(role => {
        console.log(`  - ${role.nom} (ID: ${role._id})`);
      });
      
      // 3. Tenter de créer un utilisateur avec le premier rôle disponible
      if (rolesResponse.data.length > 0) {
        const firstRole = rolesResponse.data[0];
        console.log(`\n3. Tentative de création d'utilisateur avec le rôle: ${firstRole.nom}`);
        
        try {
          const userResponse = await axios.post('http://localhost:3000/user/add', {
            nom: 'Test',
            prenom: 'Debug',
            email: `test.debug.${Date.now()}@example.com`, // Email unique
            password: 'motdepasse123',
            role: firstRole._id,
            telephone: '0123456789',
            adresse: '123 Rue Debug'
          }, {
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Utilisateur créé avec succès!');
          console.log('Réponse:', userResponse.data);
          
        } catch (error) {
          console.log('❌ Erreur lors de la création d\'utilisateur:');
          console.log('Status:', error.response?.status);
          console.log('Message:', error.response?.data?.message);
          console.log('Erreur complète:', error.response?.data);
        }
      }
      
    } catch (error) {
      console.log('❌ Erreur récupération rôles:', error.response?.data?.message || error.message);
    }
    
    // 4. Vérifier les permissions de l'utilisateur connecté
    console.log('\n4. Vérification des permissions...');
    try {
      const userInfoResponse = await axios.get(`http://localhost:3000/user/${loginData.user._id}`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('✅ Informations utilisateur récupérées');
      console.log('Permissions du rôle:', userInfoResponse.data.utilisateur?.role?.permissions);
      
    } catch (error) {
      console.log('❌ Erreur récupération infos utilisateur:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

debugUserCreation();
