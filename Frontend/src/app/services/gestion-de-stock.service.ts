import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Produit } from '../Models/Produit';
import { MouvementStock } from '../Models/MouvementStock';

@Injectable({
  providedIn: 'root'
})
export class StockManagementService {
  private produitApiUrl = 'http://localhost:3000/PRODUIT';
  private msApiUrl = 'http://localhost:3000/MS';

  constructor(private http: HttpClient) {}

  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.produitApiUrl}/`).pipe(
      catchError(this.handleError)
    );
  }

  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.produitApiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.produitApiUrl}/`, produit).pipe(
      catchError(this.handleError)
    );
  }

  updateProduit(produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.produitApiUrl}/${produit._id}`, produit).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.produitApiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllStockMovements(): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.msApiUrl}/getallMS`).pipe(
      catchError(this.handleError)
    );
  }

  getStockMovementById(id: string): Observable<MouvementStock> {
    return this.http.get<MouvementStock>(`${this.msApiUrl}/getbyid/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createStockMovement(mouvement: MouvementStock): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(`${this.msApiUrl}/addMS`, mouvement).pipe(
      catchError(this.handleError)
    );
  }

  updateStockMovement(mouvement: MouvementStock): Observable<MouvementStock> {
    return this.http.put<MouvementStock>(`${this.msApiUrl}/updateMS/${mouvement._id}`, mouvement).pipe(
      catchError(this.handleError)
    );
  }

  deleteStockMovement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.msApiUrl}/deleteMS/${id}`).pipe(
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