import { Role } from './Role';

export interface Utilisateur {
  _id: string; // Ajouté pour refléter MongoDB
  nom: string;
  prenom?: string;
  email: string;
  password?: string;
  role: string | Role;
  telephone?: string;
  adresse?: string;
  actif?: boolean;
  preferences?: {
    theme?: string;
    langue?: string;
    notificationsEmail?: boolean;
  };
}