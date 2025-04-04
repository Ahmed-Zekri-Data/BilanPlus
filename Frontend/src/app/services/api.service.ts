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
  private apiUrl = 'http://localhost:3000/api/produits'; // Ajusté pour /produits

  constructor(private http: HttpClient) {}

  // Fournisseurs (inchangés)
  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`http://localhost:3000/api/fournisseurs`);
  }
  getFournisseur(id: string): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`http://localhost:3000/api/fournisseurs/${id}`);
  }
  deleteFournisseur(_id: string): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/api/fournisseurs/${_id}`);
  }
  addFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(`http://localhost:3000/api/fournisseurs`, fournisseur);
  }

  // Commandes (inchangées)
  getCommandes(): Observable<CommandeAchat[]> {
    return this.http.get<CommandeAchat[]>(`http://localhost:3000/api/commandes`);
  }
  deleteCommande(_id: string): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/api/commandes/${_id}`);
  }

  // Produits (ajustés aux routes backend)
  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/getall`);
  }

  getProduit(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/getbyid/${id}`);
  }

  addProduit(produit: Produit): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addProduit`, produit);
  }

  deleteProduit(_id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteproduit/${_id}`);
  }

  updateProduit(_id: string, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/updateproduit/${_id}`, produit);
  }
}