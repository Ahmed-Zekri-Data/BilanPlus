// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fournisseur } from 'src/app/Models/Fournisseur';
import { CommandeAchat } from 'src/app/Models/CommandeAchat';
import { Produit } from 'src/app/Models/Produit'; // Gardé pour compatibilité avec loadRelatedData

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000'; // Base URL de ton backend

  constructor(private http: HttpClient) {}

  // Fournisseurs
  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/fournisseurs`);
  }

  getFournisseur(id: string): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.apiUrl}/fournisseurs/${id}`);
  }

  addFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(`${this.apiUrl}/fournisseurs`, fournisseur);
  }

  deleteFournisseur(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/fournisseurs/${_id}`);
  }

  // Commandes
  getCommandes(): Observable<CommandeAchat[]> {
    return this.http.get<CommandeAchat[]>(`${this.apiUrl}/commandes`);
  }

  createCommande(commande: CommandeAchat): Observable<CommandeAchat> {
    return this.http.post<CommandeAchat>(`${this.apiUrl}/commandes`, commande);
  }

  updateStatut(_id: string, statut: string): Observable<CommandeAchat> {
    return this.http.put<CommandeAchat>(`${this.apiUrl}/commandes/updateStatut/${_id}`, { statut });
  }

  deleteCommande(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commandes/${_id}`);
  }

  // Méthodes pour produits (gardées car utilisées dans loadRelatedData, mais supposées définies ailleurs)
  getProduit(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/PRODUIT/${id}`); // À confirmer avec le module produits
  }
}