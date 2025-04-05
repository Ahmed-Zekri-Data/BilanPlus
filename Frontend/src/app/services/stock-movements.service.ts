import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MouvementStock } from '../Models/MouvementStock';

@Injectable({
  providedIn: 'root'
})
export class StockManagementService {
  private apiUrl = 'http://localhost:3000/MS';

  constructor(private http: HttpClient) { }

  getAllStockMovements(): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(this.apiUrl);
  }

  createStockMovement(movement: MouvementStock): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(this.apiUrl, movement);
  }

  updateStockMovement(id: string, movement: MouvementStock): Observable<MouvementStock> {
    return this.http.put<MouvementStock>(`${this.apiUrl}/${id}`, movement);
  }

  deleteStockMovement(id: string): Observable<string> { // Retourne string car le backend renvoie du texte
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }
}