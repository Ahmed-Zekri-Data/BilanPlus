export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  utilisateur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  } | null;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}