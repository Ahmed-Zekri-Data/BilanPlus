const fs = require('fs');
const path = require('path');

// Fichier à corriger
const filePath = './src/app/components/role-details/role-details.component.html';

console.log('🔧 Correction des opérateurs optionnels...');

try {
  // Lire le fichier
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Compter les occurrences avant correction
  const beforeCount = (content.match(/role\.permissions\?\./g) || []).length;
  console.log(`Trouvé ${beforeCount} occurrences de "role.permissions?."`);
  
  // Remplacer tous les "role.permissions?." par "role.permissions."
  content = content.replace(/role\.permissions\?\./g, 'role.permissions.');
  
  // Compter les occurrences après correction
  const afterCount = (content.match(/role\.permissions\?\./g) || []).length;
  
  // Écrire le fichier corrigé
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`✅ Correction terminée!`);
  console.log(`   - Avant: ${beforeCount} occurrences`);
  console.log(`   - Après: ${afterCount} occurrences`);
  console.log(`   - Corrigées: ${beforeCount - afterCount} occurrences`);
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
