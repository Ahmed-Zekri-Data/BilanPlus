import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Fournisseur {
  _id?: string;
  id?: string;
  nom: string;
  email: string;
  contact: string;
  statut: string;
  categorie?: string;
  long?:number;
  lat?:number;
}

export interface FournisseurFilterParams {
  page: number;
  limit: number;
  search?: string;
  categorie?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
  private apiUrl = `${"http://localhost:3000"}/fournisseurs`;

  constructor(private http: HttpClient) { }

  getAllFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/`);
  }

  getFournisseursWithFilters(params: FournisseurFilterParams & { zoneGeo?: string }): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.categorie) {
      httpParams = httpParams.set('categorie', params.categorie);
    }
    if (params.zoneGeo) {
      httpParams = httpParams.set('zoneGeo', params.zoneGeo);
    }

    return this.http.get<any>(`${this.apiUrl}`, { params: httpParams });
  }

  getFournisseurById(id: string): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.apiUrl}/${id}`);
  }

  createFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(`${this.apiUrl}`, fournisseur);
  }

  updateFournisseur(id: string, fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.put<Fournisseur>(`${this.apiUrl}/${id}`, fournisseur);
  }

  deleteFournisseur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 