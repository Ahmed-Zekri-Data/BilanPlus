// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fournisseur } from 'src/app/Models/Fournisseur';
import { CommandeAchat } from 'src/app/Models/CommandeAchat';
import { Produit } from 'src/app/Models/Produit';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api'; // Base URL générique pour toutes les entités

  constructor(private http: HttpClient) {}

  // Fournisseurs
  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.baseUrl}/fournisseurs`);
  }

  getFournisseur(id: string): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.baseUrl}/fournisseurs/${id}`);
  }

  addFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(`${this.baseUrl}/fournisseurs`, fournisseur);
  }

  deleteFournisseur(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fournisseurs/${_id}`);
  }

  // Commandes
  getCommandes(): Observable<CommandeAchat[]> {
    return this.http.get<CommandeAchat[]>(`${this.baseUrl}/commandes`);
  }

  createCommande(commande: CommandeAchat): Observable<CommandeAchat> {
    return this.http.post<CommandeAchat>(`${this.baseUrl}/commandes`, commande);
  }

  updateStatut(_id: string, statut: string): Observable<CommandeAchat> {
    return this.http.put<CommandeAchat>(`${this.baseUrl}/commandes/updateStatut/${_id}`, { statut });
  }

  deleteCommande(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/commandes/${_id}`);
  }

  // Produits (aligné avec la version de main)
  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/produits/getall`);
  }

  getProduit(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.baseUrl}/produits/getbyid/${id}`);
  }

  addProduit(produit: Produit): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/produits/addProduit`, produit);
  }

  deleteProduit(_id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/produits/deleteproduit/${_id}`);
  }

  updateProduit(_id: string, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.baseUrl}/produits/updateproduit/${_id}`, produit);
  }
}