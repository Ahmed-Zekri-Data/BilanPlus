import { Role } from './Role';

export interface Utilisateur {
  _id?: string;
  nom: string;
  email: string;
  motDePasse?: string;  // Facultatif pour éviter d'exposer le mot de passe
  role: string;  // Peut être un objet ou simplement l'ID
}
    