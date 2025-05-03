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