import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultatService {
  private apiUrl = 'http://localhost:3000/resultat';

  constructor(private http: HttpClient) {}

  getResultat(dateDebut: string, dateFin: string): Observable<any> {
    const params = { dateDebut, dateFin };
    return this.http.get<any>(this.apiUrl, { params });
  }
}
