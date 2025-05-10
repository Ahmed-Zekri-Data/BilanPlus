import {Role} from "./Role"

export interface HistoriqueConnexion {
  date: Date | string;
  ip: string;
  navigateur: string;
  reussite: boolean;
  details?: string;
}

export interface ActionUtilisateur {
  action: string;
  date: Date | string;
  details: string;
}

export interface Utilisateur {
  id?: string;
  _id?: string;
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

  // Préférences utilisateur
  preferences?: {
    theme?: string;
    langue?: string;
    notificationsEmail?: boolean;
  };

  // Historique et audit
  historiqueConnexions?: HistoriqueConnexion[];
  dernieresActions?: ActionUtilisateur[];

  // Sécurité avancée
  authentificationDeuxFacteurs?: {
    active: boolean;
    secret?: string;
    methode?: 'app' | 'sms' | 'email';
  };

  // Gestion des mots de passe
  expirationMotDePasse?: Date | string;
  politiqueMotDePasse?: {
    longueurMinimum?: number;
    exigerMajuscule?: boolean;
    exigerChiffre?: boolean;
    exigerCaractereSpecial?: boolean;
    dureeValiditeJours?: number;
  };

  resetPasswordToken?: string;
  resetPasswordExpires?: Date | string;
}

export interface UtilisateurResponse {
  utilisateurs: Utilisateur[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface UtilisateurDetailResponse {
  utilisateur: Utilisateur;
  message?: string;
}