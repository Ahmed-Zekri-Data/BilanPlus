import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrandLivreService {
  private apiUrl = 'http://localhost:4000/grand-livre';

  constructor(private http: HttpClient) {}

  getGrandLivre(compteId?: string, dateDebut?: string, dateFin?: string): Observable<any> {
    let params: any = {};
    if (compteId) params.compteId = compteId;
    if (dateDebut) params.dateDebut = dateDebut;
    if (dateFin) params.dateFin = dateFin;

    return this.http.get<any>(this.apiUrl, { params });
  }
}
