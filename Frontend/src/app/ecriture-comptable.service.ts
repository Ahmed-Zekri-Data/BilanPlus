import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EcritureComptable } from './Models/EcritureComptable';

@Injectable({
  providedIn: 'root'
})
export class EcritureComptableService {
  private apiUrl = 'http://localhost:3000/ecritures'; // URL de ton backend

  constructor(private http: HttpClient) {}

  // Récupérer toutes les écritures
  getEcritures(): Observable<EcritureComptable[]> {
    return this.http.get<EcritureComptable[]>(this.apiUrl);
  }

  // Ajouter une écriture
  createEcriture(ecriture: EcritureComptable): Observable<EcritureComptable> {
    return this.http.post<EcritureComptable>(this.apiUrl, ecriture);
  }

  // Mettre à jour une écriture
  updateEcriture(id: string, ecriture: Partial<EcritureComptable>): Observable<EcritureComptable> {
    return this.http.put<EcritureComptable>(`${this.apiUrl}/${id}`, ecriture);
  }

  // Supprimer une écriture
  deleteEcriture(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}