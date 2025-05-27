const axios = require('axios');

async function testResetPassword() {
  try {
    console.log('Test de la réinitialisation de mot de passe...');
    
    // 1. Demander un reset password
    console.log('\n1. Demande de réinitialisation pour myriammoncer42@gmail.com');
    const resetResponse = await axios.post('http://localhost:3000/user/request-password-reset', {
      email: 'myriammoncer42@gmail.com'
    });
    
    console.log('Réponse:', resetResponse.data);
    
    // 2. Simuler un reset avec un token fictif (pour tester la validation)
    console.log('\n2. Test avec un token invalide');
    try {
      const invalidResetResponse = await axios.post('http://localhost:3000/user/reset-password', {
        token: 'invalid-token',
        newPassword: 'nouveaumotdepasse123'
      });
      console.log('Réponse token invalide:', invalidResetResponse.data);
    } catch (error) {
      console.log('Erreur attendue pour token invalide:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

testResetPassword();
