import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Produit } from '../../Models/Produit';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css']
})
export class ProduitsComponent implements OnInit {
  produits: Produit[] = [];
  newProduit: Produit = { nom: '', categorie: '', prix: 0, stock: 0 }; // Champs complets

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.apiService.getProduits().subscribe({
      next: (data: Produit[]) => {
        this.produits = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
      }
    });
  }

  addProduit(): void {
    if (this.newProduit.nom.trim()) {
      this.apiService.addProduit(this.newProduit).subscribe({
        next: () => {
          this.loadProduits(); // Recharger la liste après ajout
          this.newProduit = { nom: '', categorie: '', prix: 0, stock: 0 }; // Réinitialiser
        },
        error: (err) => {
          console.error('Erreur lors de l’ajout du produit:', err);
        }
      });
    }
  }

  deleteProduit(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.apiService.deleteProduit(id).subscribe({
        next: () => {
          this.produits = this.produits.filter(p => p._id !== id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }
}