import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fournisseur } from '../Models/Fournisseur';
import { CommandeAchat } from '../Models/CommandeAchat';
import { Produit } from '../Models/Produit';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api'; // Ajustez selon votre backend

  constructor(private http: HttpClient) {}

  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/fournisseurs`);
  }

  getFournisseur(id: string): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.apiUrl}/fournisseurs/${id}`);
  }

  deleteFournisseur(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/fournisseurs/${_id}`);
  }

  getCommandes(): Observable<CommandeAchat[]> {
    return this.http.get<CommandeAchat[]>(`${this.apiUrl}/commandes`);
  }

  deleteCommande(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commandes/${_id}`);
  }

  getProduit(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${id}`);
  }
}