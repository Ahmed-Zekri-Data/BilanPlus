import { Component, OnInit, OnDestroy } from '@angular/core';
import { CompteComptableService } from '../../compte-comptable.service';
import { SearchService, SearchFilter } from '../../services/search.service';
import { CompteComptable } from '../../Models/CompteComptable';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-compte-list',
  templateUrl: './compte-list.component.html',
  styleUrls: ['./compte-list.component.css'],
})
export class CompteListComponent implements OnInit, OnDestroy {
  comptes: CompteComptable[] = [];
  filteredComptes: CompteComptable[] = [];
  showForm: boolean = false;
  selectedCompte: CompteComptable | null = null;

  // Search and Filter properties
  searchFilters: SearchFilter[] = [];
  currentSearchTerm = '';

  private destroy$ = new Subject<void>();

  constructor(
    private compteService: CompteComptableService,
    private searchService: SearchService,
    private snackBar: MatSnackBar
  ) {
    this.initializeFilters();
  }

  ngOnInit() {
    this.loadComptes();
    this.setupSearchSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilters() {
    this.searchFilters = [
      {
        id: 'type',
        name: 'Type de compte',
        type: 'select',
        value: '',
        label: 'Type de compte',
        options: [
          { value: 'actif', label: 'Actif' },
          { value: 'passif', label: 'Passif' },
          { value: 'charge', label: 'Charge' },
          { value: 'produit', label: 'Produit' }
        ]
      },
      {
        id: 'numeroCompte',
        name: 'Numéro de compte',
        type: 'text',
        value: '',
        label: 'Numéro de compte',
        placeholder: 'Ex: 101, 512...'
      },
      {
        id: 'soldeMin',
        name: 'Solde minimum',
        type: 'amount',
        value: '',
        label: 'Solde minimum',
        placeholder: '0'
      },
      {
        id: 'soldeMax',
        name: 'Solde maximum',
        type: 'amount',
        value: '',
        label: 'Solde maximum',
        placeholder: '10000'
      }
    ];
  }

  private setupSearchSubscriptions() {
    // Subscribe to search term changes
    this.searchService.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.currentSearchTerm = term;
        this.applyFilters();
      });

    // Subscribe to filter changes
    this.searchService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.searchFilters = filters;
        this.applyFilters();
      });
  }

  loadComptes() {
    this.compteService.getComptes().subscribe({
      next: (data: CompteComptable[]) => {
        console.log('Comptes récupérés:', data);
        this.comptes = data;
        this.filteredComptes = [...data];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des comptes:', err);
        this.snackBar.open('Erreur lors de la récupération des comptes.', 'Fermer', { duration: 5000 });
      },
    });
  }

  deleteCompte(id: string) {
    if (confirm('Voulez-vous vraiment supprimer ce compte ?')) {
      this.compteService.deleteCompte(id).subscribe({
        next: () => {
          this.snackBar.open('Compte supprimé avec succès !', 'Fermer', { duration: 3000 });
          this.loadComptes();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.snackBar.open('Erreur lors de la suppression du compte.', 'Fermer', { duration: 5000 });
        },
      });
    }
  }

  editCompte(compte: CompteComptable) {
    console.log('Modifier cliqué, compte:', compte);
    this.selectedCompte = { ...compte };
    this.showForm = true;
    console.log('showForm après Modifier:', this.showForm);
  }

  onCompteSaved(compte: CompteComptable) {
    console.log('Compte sauvegardé:', compte);
    this.showForm = false;
    this.selectedCompte = null;
    this.loadComptes();
  }

  // Search and Filter Methods
  applyFilters() {
    this.filteredComptes = this.searchService.searchComptes(
      this.comptes,
      this.currentSearchTerm,
      this.searchFilters
    );
  }

  onSearchChange(searchTerm: string) {
    this.currentSearchTerm = searchTerm;
    this.applyFilters();
  }

  onFiltersChange(filters: SearchFilter[]) {
    this.searchFilters = filters;
    this.applyFilters();
  }

  onFilterApplied() {
    this.applyFilters();
  }
}
