export interface Role {
  id?: string; // Ajout de l'ID comme propriété optionnelle
  nom: string;
  description?: string;
  permissions: {
    gestionUtilisateurs: boolean;
    gestionRoles: boolean;
    gestionClients: boolean;
    gestionFournisseurs: boolean;
    gestionFactures: boolean;
    gestionComptabilite: boolean;
    gestionBilans: boolean;
    gestionDeclarations: boolean;
    rapportsAvances: boolean;
    parametresSysteme: boolean;
  };
  dateCreation?: Date;
  actif: boolean;
}