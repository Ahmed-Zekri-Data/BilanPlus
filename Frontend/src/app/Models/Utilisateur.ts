import { Role } from './Role';

export interface Utilisateur {
  id?: string;
  _id?: string; // Ajouté pour compatibilité MongoDB
  nom: string;
  prenom?: string;
  email: string;
  password?: string;
  role: string | Role;
  telephone?: string;
  adresse?: string;
  actif?: boolean;
  dateCreation?: Date | string;
  dernierConnexion?: Date | string;
  tentativesConnexion?: number;
  photo?: string;
  preferences?: {
    theme?: string;
    langue?: string;
    notificationsEmail?: boolean;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | string;
}