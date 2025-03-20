import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EcritureComptable } from './Models/EcritureComptable';

@Injectable({
  providedIn: 'root'
})
export class EcritureComptableService {
  private apiUrl = 'http://localhost:3000/ecritures';

  constructor(private http: HttpClient) {}

  getEcritures(): Observable<EcritureComptable[]> {
    return this.http.get<EcritureComptable[]>(this.apiUrl);
  }

  createEcriture(ecriture: EcritureComptable): Observable<EcritureComptable> {
    return this.http.post<EcritureComptable>(this.apiUrl, ecriture);
  }

  updateEcriture(id: string, ecriture: Partial<EcritureComptable>): Observable<EcritureComptable> {
    return this.http.put<EcritureComptable>(`${this.apiUrl}/${id}`, ecriture);
  }

  deleteEcriture(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}