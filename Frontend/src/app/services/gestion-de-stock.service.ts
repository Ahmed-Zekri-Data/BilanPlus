import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Produit } from '../Models/Produit';

@Injectable({
  providedIn: 'root'
})
export class StockManagementService {
  private apiUrl = 'http://localhost:3000/PRODUIT';

  constructor(private http: HttpClient) {}

  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/getall`).pipe(
      catchError(this.handleError)
    );
  }

  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/getbyid/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/addProduit`, produit).pipe(
      catchError(this.handleError)
    );
  }

  updateProduit(produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/updateproduit/${produit._id}`, produit).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteproduit/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'Erreur lors de l’appel au serveur';
    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez si le backend est en cours d’exécution.';
    } else if (error.status) {
      errorMessage = `Erreur ${error.status}: ${error.statusText || 'Erreur inconnue'}`;
      if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    } else {
      errorMessage = error.message || 'Erreur inconnue';
    }
    console.error('Erreur API complète:', error);
    return throwError(() => new Error(errorMessage));
  }
}