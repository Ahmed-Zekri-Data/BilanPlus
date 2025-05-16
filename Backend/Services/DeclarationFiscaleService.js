const verifierDelaisDeclaration = (type, finPeriode) => {
  const dateActuelle = new Date();
  let dateLimite;

  // Définir les délais selon le type de déclaration
  switch (type) {
      case 'mensuelle':
          // Pour une déclaration mensuelle, la soumission est généralement due le 20 du mois suivant
          dateLimite = new Date(finPeriode);
          dateLimite.setMonth(dateLimite.getMonth() + 1);
          dateLimite.setDate(20);
          break;
      case 'trimestrielle':
          // Pour une déclaration trimestrielle, la soumission est due 30 jours après la fin du trimestre
          dateLimite = new Date(finPeriode);
          dateLimite.setDate(dateLimite.getDate() + 30);
          break;
      case 'annuelle':
          // Pour une déclaration annuelle, la soumission est due 3 mois après la fin de l'année
          dateLimite = new Date(finPeriode);
          dateLimite.setMonth(dateLimite.getMonth() + 3);
          break;
      default:
          throw new Error('Type de déclaration invalide');
  }

  // Vérifier si la soumission est en retard
  const estEnRetard = dateActuelle > dateLimite;
  let retardJours = 0;
  let tauxPenalite = 0;
  let montantPenalite = 0;

  if (estEnRetard) {
      // Calculer le nombre de jours de retard
      const diffTemps = dateActuelle - dateLimite;
      retardJours = Math.ceil(diffTemps / (1000 * 60 * 60 * 24));

      // Définir un taux de pénalité (par exemple, 0.5% par jour de retard)
      tauxPenalite = retardJours * 0.5; // 0.5% par jour
  }

  return {
      estEnRetard,
      retardJours,
      penalites: {
          totalPenalites: tauxPenalite,
          montantPenalite
      }
  };
};

module.exports = {
  verifierDelaisDeclaration
};