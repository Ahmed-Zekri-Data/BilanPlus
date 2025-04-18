const axios = require('axios');

const API_URL = 'http://localhost:3000'; // Remove /api
let token = '';

async function testLogin() {
  try {
    console.log('Test de connexion...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@bilanplus.com',
      password: 'admin123'
    });
    token = response.data.token;
    console.log('Connexion réussie!');
    console.log('Token:', token);
    return token;
  } catch (error) {
    console.error('Erreur de connexion:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function testGetAllUsers() {
  try {
    console.log('\nTest de récupération des utilisateurs...');
    const response = await axios.get(`${API_URL}/user/getall`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Récupération des utilisateurs réussie!');
    console.log('Nombre d\'utilisateurs:', response.data.length);
    console.log('Premier utilisateur:', response.data[0]);
    return response.data;
  } catch (error) {
    console.error('Erreur de récupération des utilisateurs:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function testGetAllRoles() {
  try {
    console.log('\nTest de récupération des rôles...');
    const response = await axios.get(`${API_URL}/role`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Récupération des rôles réussie!');
    console.log('Nombre de rôles:', response.data.length);
    console.log('Premier rôle:', response.data[0]);
    return response.data;
  } catch (error) {
    console.error('Erreur de récupération des rôles:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function testCreateUser(roleId) {
  try {
    console.log('\nTest de création d\'un utilisateur...');
    const response = await axios.post(`${API_URL}/user/add`, {
      nom: 'Test',
      prenom: 'Utilisateur',
      email: 'test@example.com',
      password: 'password123',
      role: roleId,
      telephone: '12345678'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Création d\'utilisateur réussie!');
    console.log('Nouvel utilisateur:', response.data.user);
    return response.data.user;
  } catch (error) {
    console.error('Erreur de création d\'utilisateur:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function runTests() {
  try {
    await testLogin();
    const users = await testGetAllUsers();
    const roles = await testGetAllRoles();
    if (roles && roles.length > 0) {
      const adminRole = roles.find(role => role.nom === 'Administrateur');
      if (adminRole) {
        await testCreateUser(adminRole._id);
      }
    }
    console.log('\nTous les tests ont réussi!');
  } catch (error) {
    console.error('\nLes tests ont échoué:', error.message);
  }
}

runTests();