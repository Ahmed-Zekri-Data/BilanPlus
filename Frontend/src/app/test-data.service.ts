import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestDataService {
  private baseUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  // Tester la connexion au backend
  testConnection(): Observable<any> {
    return this.http.get(`${this.baseUrl}/test`);
  }

  // Récupérer tous les comptes
  getAllComptes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/comptes`);
  }

  // Récupérer toutes les écritures
  getAllEcritures(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ecritures`);
  }

  // Créer des données de test
  createTestData(): Observable<any> {
    const comptes = [
      { numeroCompte: "101", nom: "Capital social", type: "passif", solde: 0 },
      { numeroCompte: "201", nom: "Immobilisations corporelles", type: "actif", solde: 0 },
      { numeroCompte: "301", nom: "Stocks de marchandises", type: "actif", solde: 0 },
      { numeroCompte: "411", nom: "Clients", type: "actif", solde: 0 },
      { numeroCompte: "512", nom: "Banque", type: "actif", solde: 0 },
      { numeroCompte: "401", nom: "Fournisseurs", type: "passif", solde: 0 },
      { numeroCompte: "164", nom: "Emprunts", type: "passif", solde: 0 },
      { numeroCompte: "601", nom: "Achats de marchandises", type: "charge", solde: 0 },
      { numeroCompte: "621", nom: "Personnel extérieur", type: "charge", solde: 0 },
      { numeroCompte: "701", nom: "Ventes de marchandises", type: "produit", solde: 0 },
      { numeroCompte: "706", nom: "Prestations de services", type: "produit", solde: 0 }
    ];

    return this.http.post(`${this.baseUrl}/test/create-data`, { comptes });
  }
}
