import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommandeAchat {
  _id?: string;
  produit: string;      // ID du produit
  quantite: number;
  prix: number;
  statut?: string;       // Optionnel
  fournisseurID: string; // ID du fournisseur
}

@Injectable({
  providedIn: 'root'
})
export class CommandesService {
  private apiUrl = `${"http://localhost:3000"}/commandes`;  // 💡 adapte ton URL ici selon ton backend

  constructor(private http: HttpClient) { }

  // 📄 Récupérer toutes les commandes
  getAllCommandes(): Observable<CommandeAchat[]> {
    return this.http.get<CommandeAchat[]>(`${this.apiUrl}`);
  }

  // 🔍 Récupérer une commande par son ID
  getCommandeById(id: string): Observable<CommandeAchat> {
    return this.http.get<CommandeAchat>(`${this.apiUrl}/${id}`);
  }

  // ➕ Créer une nouvelle commande
  createCommande(commande: CommandeAchat): Observable<CommandeAchat> {
    return this.http.post<CommandeAchat>(`${this.apiUrl}`, commande);
  }

  // ✏️ Modifier une commande existante
  updateCommande(id: string, commande: CommandeAchat): Observable<CommandeAchat> {
    return this.http.put<CommandeAchat>(`${this.apiUrl}/${id}`, commande);
  }

  // 🗑️ Supprimer une commande
  deleteCommande(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
