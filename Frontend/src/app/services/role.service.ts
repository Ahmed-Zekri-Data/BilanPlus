import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Role } from '../Models/Role';

// Interface to match the backend response for create/update operations
interface RoleResponse {
  message: string;
  role: Role;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = 'http://localhost:3000/role';

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
            console.log('RoleService: Token récupéré depuis currentUser et stocké séparément');
          }
        }
      } catch (error) {
        console.error('RoleService: Erreur lors de la récupération du token depuis currentUser:', error);
      }
    }

    if (!token) {
      console.error('RoleService: Aucun token trouvé, l\'utilisateur n\'est probablement pas connecté');
    } else {
      console.log('RoleService: Token trouvé, longueur:', token.length);
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<RoleResponse>(`${this.baseUrl}`, role, { headers: this.getHeaders() }).pipe(
      map(response => response.role),
      catchError(this.handleError)
    );
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<RoleResponse>(`${this.baseUrl}/${id}`, role, { headers: this.getHeaders() }).pipe(
      map(response => response.role),
      catchError(this.handleError)
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getUsersPerRole(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stats`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  analysePermissionsUsage(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/permissions`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    console.error('Erreur HTTP détectée (RoleService):', error);

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

      console.error('Message d\'erreur final (RoleService):', errorMessage);
    }

    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}