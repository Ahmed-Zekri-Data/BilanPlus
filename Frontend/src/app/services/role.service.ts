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
    // Align with UtilisateurService token retrieval
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const token = currentUser.token || localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/getall`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<RoleResponse>(`${this.baseUrl}/add`, role, { headers: this.getHeaders() }).pipe(
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
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur côté client: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Erreur côté serveur: Code ${error.status}, Message: ${error.message}`;
      // Include backend error details if available
      if (error.error && error.error.message) {
        errorMessage += `, Détails: ${error.error.message}`;
      }
      console.error('Détails de l\'erreur:', error.error);
    }
    return throwError(() => new Error(errorMessage));
  }
}