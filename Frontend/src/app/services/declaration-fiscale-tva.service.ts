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
  private DFApiUrl = 'http://localhost:3000/df';
  private tvaApiUrl = 'http://localhost:3000/tva';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessages: string[] = [];
    if (error.status === 400 && error.error.errors) {
      errorMessages = error.error.errors;
    } else {
      errorMessages = ['Une erreur est survenue : ' + error.message];
    }
    return throwError(() => errorMessages);
  }

  getDeclarations(): Observable<DeclarationFiscale[]> {
    return this.http.get<DeclarationFiscale[]>(`${this.DFApiUrl}/getallDF`)
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

  genererDeclarationFiscale(data: { dateDebut: string; dateFin: string; type: string; compteComptable: string }): Observable<any> {
    return this.http.post<any>(`${this.DFApiUrl}/declaration/generer`, data)
      .pipe(catchError(this.handleError));
  }

  verifierDelaisDeclaration(type: string, finPeriode: Date): Observable<any> {
    return this.http.post<any>(`${this.DFApiUrl}/declaration/verification-delais`, { type, finPeriode })
      .pipe(catchError(this.handleError));
  }

  soumettreDeclaration(declarationId: string): Observable<any> {
    return this.http.put<any>(`${this.DFApiUrl}/declaration/soumettre/${declarationId}`, {})
      .pipe(catchError(this.handleError));
  }

  genererFormulaireOfficiel(declarationId: string): Observable<any> {
    return this.http.get<any>(`${this.DFApiUrl}/declaration/formulaire/${declarationId}`)
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