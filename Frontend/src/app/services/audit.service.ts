import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuditLog {
  _id?: string;
  utilisateur: string;
  action: string;
  details: string;
  date: Date;
  ip?: string;
  navigateur?: string;
}

export interface LoginHistory {
  _id?: string;
  utilisateur: string;
  date: Date;
  ip: string;
  navigateur: string;
  reussite: boolean;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('currentUser') || '{}').token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  // Récupérer les logs d'audit avec filtres optionnels
  getAuditLogs(filters?: any): Observable<AuditLog[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.utilisateur) params = params.set('utilisateur', filters.utilisateur);
      if (filters.action) params = params.set('action', filters.action);
      if (filters.dateDebut) params = params.set('dateDebut', filters.dateDebut.toISOString());
      if (filters.dateFin) params = params.set('dateFin', filters.dateFin.toISOString());
    }

    return this.http.get<AuditLog[]>(`${this.apiUrl}/logs`, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer l'historique des connexions d'un utilisateur
  getLoginHistory(userId: string): Observable<LoginHistory[]> {
    return this.http.get<LoginHistory[]>(`${this.apiUrl}/login-history/${userId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les actions d'un utilisateur
  getUserActions(userId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/user-actions/${userId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Enregistrer une action d'audit
  logAction(action: string, details: string): Observable<AuditLog> {
    return this.http.post<AuditLog>(`${this.apiUrl}/log`, { action, details }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Exporter les logs d'audit en CSV
  exportAuditLogsToCSV(filters?: any): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      if (filters.utilisateur) params = params.set('utilisateur', filters.utilisateur);
      if (filters.action) params = params.set('action', filters.action);
      if (filters.dateDebut) params = params.set('dateDebut', filters.dateDebut.toISOString());
      if (filters.dateFin) params = params.set('dateFin', filters.dateFin.toISOString());
    }

    return this.http.get(`${this.apiUrl}/export-csv`, {
      headers: this.getHeaders(),
      params: params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur dans AuditService:', error);

    // Créer un message d'erreur plus convivial
    let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.';

    if (error.status === 401) {
      errorMessage = 'Vous n\'êtes pas autorisé à accéder à cette ressource. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      errorMessage = 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.';
    } else if (error.status === 404) {
      errorMessage = 'La ressource demandée n\'existe pas.';
    } else if (error.status === 500) {
      errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
    }

    return new Observable<never>(observer => {
      observer.error({
        message: errorMessage,
        originalError: error
      });
    });
  }
}
