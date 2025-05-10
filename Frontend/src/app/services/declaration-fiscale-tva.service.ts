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
  private dfApiUrl = 'http://localhost:3000/df'; // Base URL pour les déclarations fiscales
  private tvaApiUrl = 'http://localhost:3000/tva'; // Base URL pour les TVA

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    let errorMessage: string[] = [];
    if (error.error instanceof Array) {
      errorMessage = error.error;
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = [error.error.message];
    } else {
      errorMessage = [`Error Code: ${error.status}\nMessage: ${error.message}`];
    }
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

  // Méthodes pour les TVA
  createTVA(tva: TVA): Observable<TVA> {
    return this.http.post<TVA>(`${this.tvaApiUrl}/addTVA`, tva)
      .pipe(catchError(this.handleError));
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