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
    console.log('AuthService: Vérification de l\'authentification');

    const token = this.getToken();
    if (!token) {
      console.warn('AuthService: Aucun token trouvé');
      return false;
    }

    console.log('AuthService: Token trouvé, longueur:', token.length);

    // Vérifier si l'utilisateur existe dans le localStorage
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!currentUser) {
        console.warn('AuthService: Objet currentUser non trouvé dans le localStorage');
        return false;
      }

      if (!currentUser.user) {
        console.warn('AuthService: Propriété user non trouvée dans l\'objet currentUser');
        return false;
      }

      // Vérifier si le token n'est pas expiré (si possible)
      // Pour une vérification complète, il faudrait décoder le token et vérifier la date d'expiration
      // Mais pour l'instant, on considère que le token est valide s'il existe et si l'utilisateur existe
      console.log('AuthService: Utilisateur authentifié:', currentUser.user.email);
      return true;
    } catch (error) {
      console.error('AuthService: Erreur lors de la vérification de l\'authentification:', error);
      return false;
    }
  }

  getToken(): string | null {
    // Essayer d'abord de récupérer le token directement (méthode préférée)
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }

    // Sinon, essayer de le récupérer depuis l'objet currentUser
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        console.warn('AuthService: Aucun objet currentUser trouvé dans le localStorage');
        return null;
      }

      const currentUser = JSON.parse(currentUserStr);
      if (!currentUser || !currentUser.token) {
        console.warn('AuthService: Aucun token trouvé dans l\'objet currentUser');
        return null;
      }

      // Stocker le token séparément pour les prochaines requêtes
      localStorage.setItem('token', currentUser.token);
      console.log('AuthService: Token récupéré depuis currentUser et stocké séparément');

      return currentUser.token;
    } catch (error) {
      console.error('AuthService: Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService: Tentative de connexion avec', credentials.email);
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/login`, credentials).pipe(
      map(response => {
        // Vérifier si la réponse contient un token
        if (!response.token) {
          console.error('AuthService: Réponse de connexion invalide: token manquant');
          throw new Error('Réponse de connexion invalide: token manquant');
        }

        console.log('AuthService: Connexion réussie, token reçu');

        // Stocker les informations de l'utilisateur et le token
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('token', response.token); // Stocker le token séparément pour faciliter l'accès

        // Vérifier que le token a bien été stocké
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');

        console.log('AuthService: Token stocké?', !!storedToken);
        console.log('AuthService: User stocké?', !!storedUser);

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