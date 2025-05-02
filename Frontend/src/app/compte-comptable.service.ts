import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompteComptable } from './Models/CompteComptable';

@Injectable({
  providedIn: 'root'
})
export class CompteComptableService {
  private apiUrl = 'http://localhost:3000/comptes'; // Changé de 4000 à 3000

  constructor(private http: HttpClient) {}

  getComptes(): Observable<CompteComptable[]> {
    return this.http.get<CompteComptable[]>(this.apiUrl);
  }

  createCompte(compte: CompteComptable): Observable<CompteComptable> {
    return this.http.post<CompteComptable>(this.apiUrl, compte);
  }

  updateCompte(id: string, compte: Partial<CompteComptable>): Observable<CompteComptable> {
    return this.http.put<CompteComptable>(`${this.apiUrl}/${id}`, compte);
  }

  deleteCompte(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}