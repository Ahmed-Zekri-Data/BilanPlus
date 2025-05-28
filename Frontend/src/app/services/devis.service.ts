import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private apiUrl = 'http://localhost:3000/devis';

  constructor(private http: HttpClient) { }

  getCommandeDetails(commandeId: string, fournisseurId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${commandeId}/${fournisseurId}`);
  }

  createDevis(commandeId: string, fournisseurId: string, prix: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${commandeId}/${fournisseurId}`, { prix });
  }

  getAllDevis(params?: { categorie?: string; fournisseur?: string }): Observable<any> {
    let url = `${this.apiUrl}`;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.categorie) queryParams.append('categorie', params.categorie);
      if (params.fournisseur) queryParams.append('fournisseur', params.fournisseur);
      url += `?${queryParams.toString()}`;
    }
    
    return this.http.get(url).pipe(
      map((response: any) => {
        if (response.success) {
          return response.devis;
        }
        throw new Error(response.message || 'Erreur lors de la récupération des devis');
      })
    );
  }

  acceptDevis(devisId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${devisId}/accept`, {}).pipe(
      map((response: any) => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Erreur lors de l\'acceptation du devis');
      })
    );
  }

  rejectDevis(devisId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${devisId}/reject`, {}).pipe(
      map((response: any) => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Erreur lors du rejet du devis');
      })
    );
  }
} 