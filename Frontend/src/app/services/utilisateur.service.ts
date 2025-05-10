import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Utilisateur, UtilisateurResponse } from '../Models/Utilisateur';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('currentUser') || '{}').token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getUtilisateurs(): Observable<UtilisateurResponse> {
    return this.http.get<UtilisateurResponse>(`${this.apiUrl}/getall`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getUtilisateurById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createUtilisateur(utilisateur: Partial<Utilisateur>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, utilisateur, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateUtilisateur(id: string, utilisateur: Partial<Utilisateur>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, utilisateur, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteUtilisateur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  resetLoginAttempts(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-attempts/${id}`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getUserStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  analyseUserActivity(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activite`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  exportToCSV(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/export-csv`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Méthodes pour la gestion de l'authentification à deux facteurs
  enableTwoFactor(id: string, method: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enable-2fa/${id}`, { method }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  disableTwoFactor(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/disable-2fa/${id}`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  verifyTwoFactor(id: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-2fa/${id}`, { code }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur côté client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Requête invalide. Veuillez vérifier les données saisies.';
          break;
        case 401:
          errorMessage = 'Vous n\'êtes pas autorisé à accéder à cette ressource. Veuillez vous reconnecter.';
          // Rediriger vers la page de connexion si le token est expiré
          if (error.error?.message === 'Token expiré') {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
          break;
        case 404:
          errorMessage = 'La ressource demandée n\'existe pas.';
          break;
        case 409:
          errorMessage = 'Un conflit est survenu. Cette ressource existe peut-être déjà.';
          break;
        case 500:
          errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur côté serveur: Code ${error.status}, Message: ${error.message}`;
      }

      // Message spécifique si disponible dans la réponse
      if (error.error?.message) {
        errorMessage = `${errorMessage} - ${error.error.message}`;
      }

      console.error('Détails de l\'erreur:', error.error);
    }

    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}