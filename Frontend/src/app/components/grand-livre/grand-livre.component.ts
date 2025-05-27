import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GrandLivreService } from '../../services/grand-livre.service';
import { AdvancedReportsService, EnhancedGrandLivreFilter } from '../../services/advanced-reports.service';
import { CompteComptableService } from '../../compte-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-grand-livre',
  templateUrl: './grand-livre.component.html',
  styleUrls: ['./grand-livre.component.css']
})
export class GrandLivreComponent implements OnInit {
  grandLivre: any[] = [];
  comptes: CompteComptable[] = [];
  filtreForm: FormGroup;
  isLoading = false;
  showAdvancedFilters = false;

  typesCompte = [
    { value: 'actif', label: 'Actif' },
    { value: 'passif', label: 'Passif' },
    { value: 'charge', label: 'Charge' },
    { value: 'produit', label: 'Produit' }
  ];

  sortOptions = [
    { value: 'numeroCompte', label: 'Numéro de compte' },
    { value: 'nom', label: 'Nom du compte' },
    { value: 'solde', label: 'Solde' },
    { value: 'mouvements', label: 'Nombre de mouvements' }
  ];

  groupOptions = [
    { value: 'none', label: 'Aucun groupement' },
    { value: 'type', label: 'Par type' },
    { value: 'category', label: 'Par catégorie' }
  ];

  constructor(
    private grandLivreService: GrandLivreService,
    private advancedReportsService: AdvancedReportsService,
    private compteService: CompteComptableService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filtreForm = this.fb.group({
      // Basic filters
      compteId: [''],
      dateDebut: [''],
      dateFin: [''],
      // Advanced filters
      compteIds: [[]],
      typeCompte: [''],
      soldeMinimum: [''],
      soldeMaximum: [''],
      includeZeroBalance: [true],
      sortBy: ['numeroCompte'],
      sortOrder: ['asc'],
      groupBy: ['none']
    });
  }

  ngOnInit(): void {
    this.chargerComptes();
    this.chargerGrandLivre();
  }

  chargerComptes(): void {
    this.compteService.getComptes().subscribe({
      next: (comptes) => {
        this.comptes = comptes;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des comptes', 'Fermer', {
          duration: 3000
        });
        console.error(err);
      }
    });
  }

  chargerGrandLivre(): void {
    this.isLoading = true;
    const formValues = this.filtreForm.value;

    if (this.showAdvancedFilters) {
      // Use advanced filtering
      const filters: EnhancedGrandLivreFilter = {
        compteIds: formValues.compteIds?.length > 0 ? formValues.compteIds :
                  (formValues.compteId ? [formValues.compteId] : undefined),
        dateDebut: formValues.dateDebut || undefined,
        dateFin: formValues.dateFin || undefined,
        typeCompte: formValues.typeCompte || undefined,
        soldeMinimum: formValues.soldeMinimum || undefined,
        soldeMaximum: formValues.soldeMaximum || undefined,
        includeZeroBalance: formValues.includeZeroBalance,
        sortBy: formValues.sortBy || 'numeroCompte',
        sortOrder: formValues.sortOrder || 'asc',
        groupBy: formValues.groupBy || 'none'
      };

      this.advancedReportsService.getEnhancedGrandLivre(filters).subscribe({
        next: (data) => {
          this.grandLivre = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement du grand livre avancé', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
          console.error(err);
        }
      });
    } else {
      // Use basic filtering
      this.grandLivreService.getGrandLivre(
        formValues.compteId,
        formValues.dateDebut,
        formValues.dateFin
      ).subscribe({
        next: (data) => {
          this.grandLivre = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement du grand livre', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
          console.error(err);
        }
      });
    }
  }

  appliquerFiltres(): void {
    this.chargerGrandLivre();
  }

  reinitialiserFiltres(): void {
    this.filtreForm.reset({
      includeZeroBalance: true,
      sortBy: 'numeroCompte',
      sortOrder: 'asc',
      groupBy: 'none'
    });
    this.chargerGrandLivre();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  exportToExcel(): void {
    if (this.grandLivre.length === 0) {
      this.snackBar.open('Aucune donnée à exporter', 'Fermer', {
        duration: 3000
      });
      return;
    }

    const formValues = this.filtreForm.value;
    const filters: EnhancedGrandLivreFilter = {
      compteIds: formValues.compteIds?.length > 0 ? formValues.compteIds :
                (formValues.compteId ? [formValues.compteId] : undefined),
      dateDebut: formValues.dateDebut || undefined,
      dateFin: formValues.dateFin || undefined,
      typeCompte: formValues.typeCompte || undefined,
      soldeMinimum: formValues.soldeMinimum || undefined,
      soldeMaximum: formValues.soldeMaximum || undefined,
      includeZeroBalance: formValues.includeZeroBalance,
      sortBy: formValues.sortBy || 'numeroCompte',
      sortOrder: formValues.sortOrder || 'asc',
      groupBy: formValues.groupBy || 'none'
    };

    this.advancedReportsService.exportGrandLivreToExcel(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grand-livre-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.snackBar.open('Export Excel réussi', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur lors de l\'export Excel:', error);
        this.snackBar.open('Erreur lors de l\'export Excel', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0,00 TND';
    }

    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'positive-balance';
    if (balance < 0) return 'negative-balance';
    return 'zero-balance';
  }
}
