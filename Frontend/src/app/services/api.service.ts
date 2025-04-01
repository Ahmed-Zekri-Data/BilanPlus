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
<<<<<<< HEAD
  private baseUrl = 'http://localhost:3000/api'; // Base URL générique pour toutes les entités
=======
  private apiUrl = 'http://localhost:3000'; // Base URL de ton backend
>>>>>>> b6d6b22e0023e10f3122aaffd592f7f57297fe1c

  constructor(private http: HttpClient) {}

  // Fournisseurs
  getFournisseurs(): Observable<Fournisseur[]> {
<<<<<<< HEAD
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
=======
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
>>>>>>> b6d6b22e0023e10f3122aaffd592f7f57297fe1c
  }

  // Commandes
  getCommandes(): Observable<CommandeAchat[]> {
<<<<<<< HEAD
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
=======
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
>>>>>>> b6d6b22e0023e10f3122aaffd592f7f57297fe1c
  }

  // Méthodes pour produits (gardées car utilisées dans loadRelatedData, mais supposées définies ailleurs)
  getProduit(id: string): Observable<Produit> {
<<<<<<< HEAD
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
=======
    return this.http.get<Produit>(`${this.apiUrl}/PRODUIT/${id}`); // À confirmer avec le module produits
>>>>>>> b6d6b22e0023e10f3122aaffd592f7f57297fe1c
  }
}