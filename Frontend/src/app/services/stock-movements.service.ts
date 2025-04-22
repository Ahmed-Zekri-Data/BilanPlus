import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MouvementStock } from '../Models/MouvementStock';

@Injectable({
  providedIn: 'root'
})
export class StockManagementService {
  private apiUrl = 'http://localhost:3000/MS';

  constructor(private http: HttpClient) { }

  getAllStockMovements(): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(this.apiUrl).pipe(
      tap(data => console.log('Mouvements récupérés:', data)),
      catchError(error => {
        console.error('Erreur lors de la récupération:', error);
        return throwError(error);
      })
    );
  }

  createStockMovement(movement: MouvementStock): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(this.apiUrl, movement).pipe(
      tap(data => console.log('Mouvement créé:', data)),
      catchError(error => {
        console.error('Erreur lors de la création:', error);
        return throwError(error);
      })
    );
  }

  updateStockMovement(id: string, movement: MouvementStock): Observable<MouvementStock> {
    console.log('Service: Sending update request for ID:', id, 'with data:', movement);
    return this.http.put<MouvementStock>(`${this.apiUrl}/${id}`, movement);
  }

  deleteStockMovement(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url).pipe(
      tap(() => console.log('Mouvement supprimé:', id)),
      catchError(error => {
        console.error('Erreur lors de la suppression:', error);
        return throwError(error);
      })
    );
  }
}