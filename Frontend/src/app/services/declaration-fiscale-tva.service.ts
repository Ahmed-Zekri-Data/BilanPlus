import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DeclarationFiscale } from '../Models/DeclarationFiscale';
import { TVA } from '../Models/TVA';

@Injectable({
  providedIn: 'root'
})
export class DeclarationFiscaleTVAService {
  private dfApiUrl = 'http://localhost:3000/DF'; // Base URL pour les déclarations fiscales
  private tvaApiUrl = 'http://localhost:3000/TVA'; // Base URL pour les TVA

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    let errorMessage: string[] = [];

    if (error.error && Array.isArray(error.error.errors)) {
      errorMessage = error.error.errors;
    } else if (error.error && error.error.message) {
      errorMessage = [error.error.message];
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = [error.error.message];
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = [error.error];
    } else {
      errorMessage = [`Error Code: ${error.status || 'Unknown'}\nMessage: ${error.message || 'Unknown error'}`];
    }

    console.error('API Error:', error);
    return throwError(() => errorMessage);
  }

  // Méthodes pour les déclarations fiscales
  createDeclaration(declaration: DeclarationFiscale): Observable<DeclarationFiscale> {
    return this.http.post<DeclarationFiscale>(`${this.dfApiUrl}/add`, declaration)
      .pipe(catchError(this.handleError));
  }

  soumettreDeclaration(id:string,declaration:DeclarationFiscale):Observable<DeclarationFiscale>{
    return this.http.post<DeclarationFiscale>(`${this.dfApiUrl}/declaration/soumettre/${id}`, declaration)
    .pipe(catchError(this.handleError));
  }

  getDeclarations(): Observable<DeclarationFiscale[]> {
    return this.http.get<DeclarationFiscale[]>(`${this.dfApiUrl}/all`)
      .pipe(catchError(this.handleError));
  }

    getDeclarationById(id: string): Observable<DeclarationFiscale> {
      return this.http.get<DeclarationFiscale>(`${this.dfApiUrl}/${id}`)
        .pipe(catchError(this.handleError));
    }

  updateDeclaration(id: string, declaration: DeclarationFiscale): Observable<DeclarationFiscale> {
    return this.http.put<DeclarationFiscale>(`${this.dfApiUrl}/${id}`, declaration)
      .pipe(catchError(this.handleError));
  }

  deleteDeclaration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.dfApiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  generateDeclaration(data: any): Observable<DeclarationFiscale> {
    return this.http.post<DeclarationFiscale>(`${this.dfApiUrl}/declaration/generer`, data)
      .pipe(catchError(this.handleError));
  }

  // Vérifier si une déclaration existe déjà pour une période donnée
  checkDeclarationExists(dateDebut: string, dateFin: string): Observable<any> {
    return this.http.get<any>(`${this.dfApiUrl}/check-exists?dateDebut=${dateDebut}&dateFin=${dateFin}`)
      .pipe(catchError(this.handleError));
  }

  // Méthodes pour les TVA
  createTVA(tva: TVA): Observable<TVA> {
    return this.http.post<TVA>(`${this.tvaApiUrl}/addTVA`, tva)
      .pipe(catchError(this.handleError));
  }

  // Alias pour createTVA pour une meilleure cohérence avec le composant
  addTVA(tva: TVA): Observable<TVA> {
    return this.createTVA(tva);
  }

  getAllTVA(): Observable<TVA[]> {
    return this.http.get<TVA[]>(`${this.tvaApiUrl}/getallTVA`)
      .pipe(catchError(this.handleError));
  }

  getTVAById(id: string): Observable<TVA> {
    return this.http.get<TVA>(`${this.tvaApiUrl}/getTVAbyid/${id}`)
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