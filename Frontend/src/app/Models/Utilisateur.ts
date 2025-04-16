import { Role } from './Role';

export interface Utilisateur {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  dateCreation?: Date;
  dernierConnexion?: Date;
  actif: boolean;
  tentativesConnexion?: number;
  telephone?: string;
  adresse?: string;
  photo?: string;
  role: string | Role;
  preferences?: {
    theme: string;
    langue: string;
    notificationsEmail: boolean;
  };
}
    