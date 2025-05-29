export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    _id: string;
    id?: string;
    email: string;
    nom: string;
    prenom?: string;
    role: string | {
      _id: string;
      nom: string;
      permissions: {
        [key: string]: boolean;
      };
    };
    actif?: boolean;
    dernierConnexion?: Date | string;
    tentativesConnexion?: number;
  };
  message?: string;
  expiresIn?: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface TwoFactorAuthRequest {
  userId: string;
  code: string;
}

export interface TwoFactorAuthResponse {
  success: boolean;
  message: string;
}