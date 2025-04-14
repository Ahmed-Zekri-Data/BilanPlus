import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EcritureComptable } from '../Models/EcritureComptable';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = 'http://localhost:4000/journal';

  constructor(private http: HttpClient) {}

  getJournal(dateDebut?: string, dateFin?: string): Observable<any> {
    let params: any = {};
    if (dateDebut) params.dateDebut = dateDebut;
    if (dateFin) params.dateFin = dateFin;

    return this.http.get<any>(this.apiUrl, { params });
  }
}
