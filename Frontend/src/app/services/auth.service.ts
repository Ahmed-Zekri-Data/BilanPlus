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

  // Récupère l'utilisateur courant
  getCurrentUser(): Observable<any> {
    return this.currentUser;
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Récupère le token JWT depuis localStorage
  getToken(): string | null {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser?.token || null;
  }

  // Connexion
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map(response => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next(response.user);
        return response;
      })
    );
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Demande de réinitialisation de mot de passe
  requestPasswordReset(email: string): Observable<any> {
    const payload: PasswordResetRequest = { email };
    return this.http.post(`${this.apiUrl}/user/request-password-reset`, payload); // Changement de /auth à /user
  }

  // Réinitialisation du mot de passe
  resetPassword(data: PasswordReset): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/reset-password`, data); // Changement de /auth à /user
  }
}