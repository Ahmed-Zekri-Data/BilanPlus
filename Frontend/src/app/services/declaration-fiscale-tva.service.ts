import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DeclarationFiscale } from '../Models/DeclarationFiscale';
import { TVA } from '../Models/TVA';

@Injectable({
  providedIn: 'root'
})
export class DeclarationFiscaleTVAService {
  private DFApiUrl = 'http://localhost:3000/DF'; 
  private tvaApiUrl = 'http://localhost:3000/TVA'; 

  constructor(private http: HttpClient) { }

  // Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessages: string[] = [];
    if (error.status === 400 && error.error.errors) {
      // Erreurs de validation renvoyées par le backend
      errorMessages = error.error.errors;
    } else {
      // Autres erreurs (serveur, réseau, etc.)
      errorMessages = ['Une erreur est survenue : ' + error.message];
    }
    return throwError(() => errorMessages);
  }

  // --- DeclarationFiscale Methods ---

  getDeclarations(): Observable<DeclarationFiscale[]> {
    return this.http.get<DeclarationFiscale[]>(`${this.DFApiUrl}/getalldf`)
      .pipe(catchError(this.handleError));
  }

  getDeclarationById(id: string): Observable<DeclarationFiscale> {
    return this.http.get<DeclarationFiscale>(`${this.DFApiUrl}/getDFbyid/${id}`)
      .pipe(catchError(this.handleError));
  }

  createDeclaration(declaration: DeclarationFiscale): Observable<DeclarationFiscale> {
    return this.http.post<DeclarationFiscale>(`${this.DFApiUrl}/addDeclaration`, declaration)
      .pipe(catchError(this.handleError));
  }

  updateDeclaration(id: string, declaration: DeclarationFiscale): Observable<DeclarationFiscale> {
    return this.http.put<DeclarationFiscale>(`${this.DFApiUrl}/updateDF/${id}`, declaration)
      .pipe(catchError(this.handleError));
  }

  deleteDeclaration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.DFApiUrl}/deleteDF/${id}`)
      .pipe(catchError(this.handleError));
  }

  // --- TVA Methods ---

  getAllTVA(): Observable<TVA[]> {
    return this.http.get<TVA[]>(`${this.tvaApiUrl}/getallTVA`)
      .pipe(catchError(this.handleError));
  }

  getTVAById(id: string): Observable<TVA> {
    return this.http.get<TVA>(`${this.tvaApiUrl}/getTVAbyid/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTVA(tva: TVA): Observable<TVA> {
    return this.http.post<TVA>(`${this.tvaApiUrl}/addTVA`, tva)
      .pipe(catchError(this.handleError));
  }

  updateTVA(id: string, tva: TVA): Observable<TVA> {
    return this.http.put<TVA>(`${this.tvaApiUrl}/updateTVA/${id}`, tva)
      .pipe(catchError(this.handleError));
  }

  deleteTVA(id: string): Observable<void> {
    return this.http.delete<void>(`${this.tvaApiUrl}/deleteTVA/${id}`)
      .pipe(catchError(this.handleError));
  }
}