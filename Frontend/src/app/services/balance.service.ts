import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private apiUrl = 'http://localhost:4000/balance';

  constructor(private http: HttpClient) {}

  getBalance(dateDebut?: string, dateFin?: string): Observable<any> {
    let params: any = {};
    if (dateDebut) params.dateDebut = dateDebut;
    if (dateFin) params.dateFin = dateFin;

    return this.http.get<any>(this.apiUrl, { params });
  }
}
