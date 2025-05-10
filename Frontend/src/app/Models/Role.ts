export interface Role {
  _id?: string;
  nom: string;
  description?: string;
  permissions: {
    gererUtilisateursEtRoles?: boolean;
    configurerSysteme?: boolean;
    accesComplet?: boolean;
    validerEcritures?: boolean;
    cloturerPeriodes?: boolean;
    genererEtatsFinanciers?: boolean;
    superviserComptes?: boolean;
    saisirEcritures?: boolean;
    gererFactures?: boolean;
    suivrePaiements?: boolean;
    gererTresorerie?: boolean;
    analyserDepensesRecettes?: boolean;
    genererRapportsPerformance?: boolean;
    comparerBudgetRealise?: boolean;
    saisirNotesFrais?: boolean;
    consulterBulletinsPaie?: boolean;
    soumettreRemboursements?: boolean;
    accesFacturesPaiements?: boolean;
    telechargerDocuments?: boolean;
    communiquerComptabilite?: boolean;
    [key: string]: boolean | undefined; // Pour permettre l'accès dynamique aux propriétés
  };
  dateCreation?: Date;
  actif?: boolean;
}