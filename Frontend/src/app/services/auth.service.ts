// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, PasswordResetRequest, PasswordReset } from '../Models/Auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL de base : http://localhost:3000
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Vérifier si le token est expiré (si possible)
    // Pour l'instant, on considère que le token est valide s'il existe
    return true;
  }

  getToken(): string | null {
    // Essayer d'abord de récupérer le token directement
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }

    // Sinon, essayer de le récupérer depuis l'objet currentUser
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      return currentUser?.token || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/login`, credentials).pipe(
      map(response => {
        // Vérifier si la réponse contient un token
        if (!response.token) {
          throw new Error('Réponse de connexion invalide: token manquant');
        }

        // Stocker les informations de l'utilisateur et le token
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('token', response.token); // Stocker le token séparément pour faciliter l'accès

        // Mettre à jour le sujet BehaviorSubject
        this.currentUserSubject.next(response.user);

        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);

    // Rediriger vers la page de connexion
    window.location.href = '/login';
  }

  requestPasswordReset(email: string): Observable<any> {
    const payload: PasswordResetRequest = { email };
    return this.http.post(`${this.apiUrl}/user/request-password-reset`, payload);
  }

  resetPassword(data: PasswordReset): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/reset-password`, data);
  }
}