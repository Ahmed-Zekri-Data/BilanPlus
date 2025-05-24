import { Component, OnInit } from '@angular/core';
import { DevisService } from '../../services/devis.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list-devis',
  templateUrl: './list-devis.component.html',
  styleUrls: ['./list-devis.component.css']
})
export class ListDevisComponent implements OnInit {
  devis: any[] = [];
  loading = false;
  error = '';
  displayedColumns: string[] = ['produit', 'fournisseur', 'prix', 'date', 'date_fin', 'statut', 'actions'];

  constructor(
    private devisService: DevisService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDevis();
  }

  loadDevis(): void {
    this.loading = true;
    this.error = '';
    
    this.devisService.getAllDevis().subscribe({
      next: (devis) => {
        this.devis = devis;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des devis';
        this.loading = false;
        this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
      }
    });
  }

  acceptDevis(devisId: string): void {
    this.devisService.acceptDevis(devisId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Devis accepté avec succès', 'Fermer', { duration: 3000 });
          this.loadDevis(); // Recharger la liste
        } else {
          this.snackBar.open('Erreur lors de l\'acceptation du devis', 'Fermer', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de l\'acceptation du devis', 'Fermer', { duration: 3000 });
      }
    });
  }

  rejectDevis(devisId: string): void {
    this.devisService.rejectDevis(devisId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Devis refusé avec succès', 'Fermer', { duration: 3000 });
          this.loadDevis(); // Recharger la liste
        } else {
          this.snackBar.open('Erreur lors du refus du devis', 'Fermer', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du refus du devis', 'Fermer', { duration: 3000 });
      }
    });
  }

  isCommandeExpired(dateFin: string): boolean {
    return new Date(dateFin) < new Date();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'En attente':
        return 'status-pending';
      case 'Accepté':
        return 'status-accepted';
      case 'Refusé':
        return 'status-rejected';
      case 'Expiré':
        return 'status-expired';
      default:
        return '';
    }
  }
} 