import { Component, OnInit } from '@angular/core';
import { StockManagementService } from '../services/gestion-de-stock.service';
import { Produit } from '../Models/Produit';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = []; // Array for filtered products
  selectedProduit: Produit | null = null;
  newProduit: Produit = { nom: '', categorie: '', prix: 0, stock: 0 };
  editMode: boolean = false;
  errorMessage: string | null = null;
  searchTerm: string = ''; // Property for search term

  constructor(private stockService: StockManagementService) {}

  ngOnInit(): void {
    this.getAllProduits();
  }

  getAllProduits(): void {
    this.stockService.getProduits().subscribe({
      next: (produits) => {
        this.produits = produits;
        this.filteredProduits = produits; // Initialize filteredProduits with all products
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des produits: ' + err.message;
        console.error('Erreur lors du chargement des produits:', err);
      }
    });
  }

  getProduitById(id: string): void {
    this.stockService.getProduitById(id).subscribe({
      next: (produit) => {
        this.selectedProduit = produit;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement du produit: ' + err.message;
        console.error('Erreur lors du chargement du produit:', err);
      }
    });
  }

  addProduit(): void {
    this.stockService.createProduit(this.newProduit).subscribe({
      next: (produit) => {
        this.produits.push(produit);
        this.filteredProduits = this.produits; // Reset filtered list to show all products
        this.searchTerm = ''; // Clear search term after adding
        this.newProduit = { nom: '', categorie: '', prix: 0, stock: 0 };
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'ajout du produit: ' + err.message;
        console.error('Erreur lors de l\'ajout du produit:', err);
      }
    });
  }

  editProduit(produit: Produit): void {
    this.selectedProduit = { ...produit };
    this.newProduit = { ...produit };
    this.editMode = true;
  }

  updateProduit(): void {
    if (!this.selectedProduit || !this.selectedProduit._id) return;
    this.stockService.updateProduit(this.newProduit).subscribe({
      next: (produit) => {
        this.produits = this.produits.map(p => p._id === produit._id ? produit : p);
        this.filteredProduits = this.produits; // Reset filtered list to show all products
        this.searchTerm = ''; // Clear search term after updating
        this.selectedProduit = null;
        this.newProduit = { nom: '', categorie: '', prix: 0, stock: 0 };
        this.editMode = false;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour du produit: ' + err.message;
        console.error('Erreur lors de la mise à jour du produit:', err);
      }
    });
  }

  deleteProduit(id: string): void {
    this.stockService.deleteProduit(id).subscribe({
      next: () => {
        console.log('Produit supprimé avec succès');
        this.produits = this.produits.filter(p => p._id !== id);
        this.filteredProduits = this.produits; // Reset filtered list to show all products
        this.searchTerm = ''; // Clear search term after deleting
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la suppression du produit: ' + err.message;
        console.error('Erreur lors de la suppression du produit:', err);
      }
    });
  }

  cancelEdit(): void {
    this.selectedProduit = null;
    this.newProduit = { nom: '', categorie: '', prix: 0, stock: 0 };
    this.editMode = false;
  }

  filterProduits(): void {
    if (!this.searchTerm) {
      this.filteredProduits = this.produits; // Show all products if search term is empty
      return;
    }

    // const term = this.searchTerm.toLowerCase();
    // this.filteredProduits = this.produits.filter(produit =>
    //   produit.nom.toLowerCase().includes(term) ||
    //   produit.categorie.toLowerCase().includes(term)
    // );
  }
}