import { Component, OnInit } from '@angular/core';
import { StockManagementService } from '../../services/stock-movements.service';
import { MouvementStock } from '../../Models/MouvementStock';
import { Produit } from '../../Models/Produit';

@Component({
  selector: 'app-ms',
  templateUrl: './ms.component.html',
  styleUrls: ['./ms.component.css']
})
export class MSComponent implements OnInit {
  stockMovements: MouvementStock[] = [];
  errorMessage: string | null = null;
  newMovement: Partial<MouvementStock> = {
    produit: '',
    type: '',
    quantite: 0,
    date: new Date()
  };
  editingMovement: MouvementStock | null = null;
  showForm = false;

  constructor(private stockService: StockManagementService) {}

  ngOnInit(): void {
    this.loadStockMovements();
  }

  loadStockMovements(): void {
    this.stockService.getAllStockMovements().subscribe({
      next: (data: MouvementStock[]) => {
        this.stockMovements = data || []; // Garantit un tableau vide si data est null/undefined
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des mouvements : ' + err.message;
        this.stockMovements = [];
      }
    });
  }

  getProduitNom(produit: string | Produit): string {
    if (typeof produit === 'string') {
      return 'ID: ' + produit; // Si c'est une string, affiche l'ID
    }
    return produit?.nom || 'Produit inconnu'; // Si c'est un objet, utilise nom ou un fallback
  }

  getProduitId(produit: string | Produit): string {
    if (typeof produit === 'string') {
      return produit;
    }
    return produit?._id || ''; // Retourne l'ID ou une string vide si absent
  }

  createMovement(): void {
    const mouvementToSend: MouvementStock = {
      produit: this.newMovement.produit as string, // ID du produit comme string
      type: this.newMovement.type as string,
      quantite: this.newMovement.quantite as number,
      date: new Date(this.newMovement.date as string | Date)
    };

    this.stockService.createStockMovement(mouvementToSend).subscribe({
      next: (savedMovement) => {
        this.loadStockMovements();
        this.resetForm();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la création : ' + err.message;
      }
    });
  }

  editMovement(movement: MouvementStock): void {
    this.editingMovement = { ...movement };
    this.showForm = true;
  }

  updateMovement(): void {
    if (this.editingMovement && this.editingMovement._id) {
      const mouvementToSend: MouvementStock = {
        ...this.editingMovement,
        produit: this.getProduitId(this.editingMovement.produit), // Assure que produit est une string
        date: new Date(this.editingMovement.date)
      };

      this.stockService.updateStockMovement(this.editingMovement._id, mouvementToSend).subscribe({
        next: () => {
          this.loadStockMovements();
          this.cancelEdit();
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la mise à jour : ' + err.message;
        }
      });
    }
  }

  deleteMovement(id: string): void {
    if (!id) {
      this.errorMessage = 'ID du mouvement invalide';
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce mouvement ?')) {
      this.stockService.deleteStockMovement(id).subscribe({
        next: () => {
          this.loadStockMovements();
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la suppression : ' + err.message;
        }
      });
    }
  }

  resetForm(): void {
    this.newMovement = {
      produit: '',
      type: '',
      quantite: 0,
      date: new Date()
    };
    this.showForm = false;
  }

  cancelEdit(): void {
    this.editingMovement = null;
    this.showForm = false;
  }

  onSubmit(): void {
    if (this.editingMovement) {
      this.updateMovement();
    } else {
      this.createMovement();
    }
  }
}