export interface Role {
  id?: string;
  _id?: string; // Ajouté pour compatibilité MongoDB
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
  dateCreation?: Date | string;
  actif: boolean;
}