import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Role } from '../Models/Role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:3000/role';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getUsersPerRole(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  analysePermissionsUsage(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/permissions`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur côté client: ${error.error.message}`;
    } else {
      errorMessage = `Erreur côté serveur: Code ${error.status}, Message: ${error.message}`;
      console.error('Détails de l\'erreur:', error.error);
    }
    return throwError(() => new Error(errorMessage));
  }
}