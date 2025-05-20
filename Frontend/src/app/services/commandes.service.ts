import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommandeAchat {
  _id?: string;
  produit?: {
    _id: string;
    nom: string;
    categorie?: string;
  };
  quantite: number;
  categorie?: string;
  statut?: string;
  type_livraison: string;
  createdAt: Date;
  date_fin: Date;
  fournisseurs: {
    fournisseurID: {
      _id: string;
      nom: string;
      email: string;
      categorie: string;
    };
    statut: string;
  }[];
}

export interface CommandeFilterParams {
  page: number;
  limit: number;
  search?: string;
  produit?: string;
  fournisseur?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandesService {
  private apiUrl = `${"http://localhost:3000"}/commandes`;  // 💡 adapte ton URL ici selon ton backend

  constructor(private http: HttpClient) { }

  // 📄 Récupérer toutes les commandes
  getAllCommandes(): Observable<CommandeAchat[]> {
    return this.http.get<CommandeAchat[]>(`${this.apiUrl}/all`);
  }

  getCommandesWithFilters(params: CommandeFilterParams): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.produit) {
      httpParams = httpParams.set('produit', params.produit);
    }
    if (params.fournisseur) {
      httpParams = httpParams.set('fournisseur', params.fournisseur);
    }

    return this.http.get<any>(`${this.apiUrl}`, { params: httpParams });
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

  updateStatut(id: string, statut: string): Observable<CommandeAchat> {
    return this.http.put<CommandeAchat>(`${this.apiUrl}/updateStatut/${id}`, { statut });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getAllProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/produits`);
  }
}
