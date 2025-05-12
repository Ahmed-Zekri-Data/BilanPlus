import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, delay, retry, timeout } from 'rxjs/operators';
import { Utilisateur, UtilisateurResponse } from '../Models/Utilisateur';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let token = '';

    // Essayer d'abord de récupérer le token directement (méthode préférée)
    token = localStorage.getItem('token') || '';

    // Si aucun token n'a été trouvé, essayer de le récupérer depuis currentUser
    if (!token) {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          if (currentUser && currentUser.token) {
            token = currentUser.token;

            // Stocker le token séparément pour les prochaines requêtes
            localStorage.setItem('token', token);
            console.log('UtilisateurService: Token récupéré depuis currentUser et stocké séparément');
          }
        }
      } catch (error) {
        console.error('UtilisateurService: Erreur lors de la récupération du token depuis currentUser:', error);
      }
    }

    if (!token) {
      console.error('UtilisateurService: Aucun token trouvé, l\'utilisateur n\'est probablement pas connecté');
    } else {
      console.log('UtilisateurService: Token trouvé, longueur:', token.length);
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
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

  toggleUserStatus(id: string, actif: boolean): Observable<any> {
    console.log(`UtilisateurService: Changement de statut pour l'utilisateur ${id} à ${actif}`);

    // Utiliser une requête PATCH pour mettre à jour uniquement le statut
    return this.http.patch<any>(
      `${this.apiUrl}/toggle-status/${id}`,
      { actif },
      { headers: this.getHeaders() }
    ).pipe(
      catchError((error) => {
        console.error('UtilisateurService: Erreur lors du changement de statut:', error);
        return this.handleError(error);
      })
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

  exportToCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-csv`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
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
    console.error('Erreur HTTP détectée:', error);

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur côté client: ${error.error.message}`;
      console.error('Erreur côté client:', error.error.message);
    } else {
      // Erreur côté serveur
      console.error('Erreur côté serveur:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error
      });

      switch (error.status) {
        case 400:
          errorMessage = 'Requête invalide. Veuillez vérifier les données saisies.';
          break;
        case 401:
          errorMessage = 'Vous n\'êtes pas autorisé à accéder à cette ressource. Veuillez vous reconnecter.';

          // Vérifier si le token est expiré ou invalide
          if (error.error?.message === 'Token expiré' || error.error?.message === 'Token invalide') {
            console.warn('Token expiré ou invalide. Veuillez vous reconnecter.');

            // Afficher un message à l'utilisateur
            alert('Votre session a expiré. Veuillez vous reconnecter.');

            // Rediriger vers la page de connexion
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

      console.error('Message d\'erreur final:', errorMessage);
    }

    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}