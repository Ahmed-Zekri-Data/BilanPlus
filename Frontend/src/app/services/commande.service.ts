import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:3000/commandes';

  constructor(private http: HttpClient) { }

  getProductCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getAllCommandes(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getCommandesWithFilters(fournisseurId: string, page: number = 0, limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/filter`, {
      params: {
        fournisseur: fournisseurId,
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }

  getCommandeById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCommande(commande: any): Observable<any> {
    return this.http.post(this.apiUrl, commande);
  }

  updateCommande(id: string, commande: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, commande);
  }

  deleteCommande(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 