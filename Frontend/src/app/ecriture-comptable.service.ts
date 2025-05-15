import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EcritureComptable } from './Models/EcritureComptable';

@Injectable({
  providedIn: 'root'
})
export class EcritureComptableService {
  private apiUrl = 'http://localhost:4000/ecritures';

  constructor(private http: HttpClient) {}

  getEcritures(): Observable<EcritureComptable[]> {
    return this.http.get<EcritureComptable[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createEcriture(ecriture: EcritureComptable): Observable<EcritureComptable> {
    return this.http.post<EcritureComptable>(this.apiUrl, ecriture).pipe(
      catchError(this.handleError)
    );
  }

  updateEcriture(id: string, ecriture: Partial<EcritureComptable>): Observable<EcritureComptable> {
    return this.http.put<EcritureComptable>(`${this.apiUrl}/${id}`, ecriture).pipe(
      catchError(this.handleError)
    );
  }

  deleteEcriture(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue lors de la requête.';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error.message || `Erreur ${error.status} : Une erreur est survenue.`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
