import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface SearchFilter {
  id: string;
  name: string;
  type: 'text' | 'date' | 'select' | 'number' | 'dateRange' | 'amount';
  value: any;
  options?: any[];
  placeholder?: string;
  label: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilter[];
  createdAt: Date;
  module: string; // 'comptes', 'ecritures', 'journal', etc.
}

export interface SearchResult {
  type: 'compte' | 'ecriture' | 'journal';
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  data: any;
  relevance: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTermSubject = new BehaviorSubject<string>('');
  private filtersSubject = new BehaviorSubject<SearchFilter[]>([]);
  private savedFiltersSubject = new BehaviorSubject<SavedFilter[]>([]);

  public searchTerm$ = this.searchTermSubject.asObservable().pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  public filters$ = this.filtersSubject.asObservable();
  public savedFilters$ = this.savedFiltersSubject.asObservable();

  constructor() {
    this.loadSavedFilters();
  }

  // Global Search Methods
  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  getSearchTerm(): string {
    return this.searchTermSubject.value;
  }

  // Filter Management
  setFilters(filters: SearchFilter[]): void {
    this.filtersSubject.next(filters);
  }

  updateFilter(filterId: string, value: any): void {
    const currentFilters = this.filtersSubject.value;
    const updatedFilters = currentFilters.map(filter => 
      filter.id === filterId ? { ...filter, value } : filter
    );
    this.filtersSubject.next(updatedFilters);
  }

  getActiveFilters(): SearchFilter[] {
    return this.filtersSubject.value.filter(filter => 
      filter.value !== null && filter.value !== undefined && filter.value !== ''
    );
  }

  clearFilters(): void {
    const clearedFilters = this.filtersSubject.value.map(filter => ({
      ...filter,
      value: filter.type === 'dateRange' ? { start: null, end: null } : null
    }));
    this.filtersSubject.next(clearedFilters);
  }

  // Saved Filters Management
  saveFilter(name: string, description: string, module: string): void {
    const activeFilters = this.getActiveFilters();
    if (activeFilters.length === 0) return;

    const savedFilter: SavedFilter = {
      id: this.generateId(),
      name,
      description,
      filters: activeFilters,
      createdAt: new Date(),
      module
    };

    const currentSaved = this.savedFiltersSubject.value;
    const updated = [...currentSaved, savedFilter];
    this.savedFiltersSubject.next(updated);
    this.persistSavedFilters(updated);
  }

  loadSavedFilter(savedFilter: SavedFilter): void {
    this.setFilters(savedFilter.filters);
  }

  deleteSavedFilter(filterId: string): void {
    const currentSaved = this.savedFiltersSubject.value;
    const updated = currentSaved.filter(filter => filter.id !== filterId);
    this.savedFiltersSubject.next(updated);
    this.persistSavedFilters(updated);
  }

  getSavedFiltersByModule(module: string): Observable<SavedFilter[]> {
    return this.savedFilters$.pipe(
      map(filters => filters.filter(filter => filter.module === module))
    );
  }

  // Search Implementation
  searchComptes(comptes: any[], searchTerm: string, filters: SearchFilter[]): any[] {
    let results = [...comptes];

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(compte => 
        compte.numeroCompte?.toLowerCase().includes(term) ||
        compte.nom?.toLowerCase().includes(term) ||
        compte.type?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    filters.forEach(filter => {
      if (!filter.value) return;

      switch (filter.id) {
        case 'type':
          results = results.filter(compte => compte.type === filter.value);
          break;
        case 'soldeMin':
          results = results.filter(compte => compte.solde >= filter.value);
          break;
        case 'soldeMax':
          results = results.filter(compte => compte.solde <= filter.value);
          break;
        case 'numeroCompte':
          results = results.filter(compte => 
            compte.numeroCompte?.includes(filter.value)
          );
          break;
      }
    });

    return results;
  }

  searchEcritures(ecritures: any[], searchTerm: string, filters: SearchFilter[]): any[] {
    let results = [...ecritures];

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(ecriture => 
        ecriture.libelle?.toLowerCase().includes(term) ||
        ecriture.lignes?.some((ligne: any) => 
          ligne.compte?.nom?.toLowerCase().includes(term) ||
          ligne.compte?.numeroCompte?.toLowerCase().includes(term)
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      if (!filter.value) return;

      switch (filter.id) {
        case 'dateRange':
          if (filter.value.start) {
            results = results.filter(ecriture => 
              new Date(ecriture.date) >= new Date(filter.value.start)
            );
          }
          if (filter.value.end) {
            results = results.filter(ecriture => 
              new Date(ecriture.date) <= new Date(filter.value.end)
            );
          }
          break;
        case 'montantMin':
          results = results.filter(ecriture => {
            const total = ecriture.lignes?.reduce((sum: number, ligne: any) => sum + ligne.montant, 0) || 0;
            return total >= filter.value;
          });
          break;
        case 'montantMax':
          results = results.filter(ecriture => {
            const total = ecriture.lignes?.reduce((sum: number, ligne: any) => sum + ligne.montant, 0) || 0;
            return total <= filter.value;
          });
          break;
        case 'compte':
          results = results.filter(ecriture => 
            ecriture.lignes?.some((ligne: any) => ligne.compte?._id === filter.value)
          );
          break;
      }
    });

    return results;
  }

  // Quick Filters
  getQuickFilters(module: string): SearchFilter[] {
    switch (module) {
      case 'comptes':
        return [
          { id: 'actif', name: 'Comptes Actif', type: 'select', value: 'actif', label: 'Type: Actif' },
          { id: 'passif', name: 'Comptes Passif', type: 'select', value: 'passif', label: 'Type: Passif' },
          { id: 'charge', name: 'Comptes Charge', type: 'select', value: 'charge', label: 'Type: Charge' },
          { id: 'produit', name: 'Comptes Produit', type: 'select', value: 'produit', label: 'Type: Produit' }
        ];
      case 'ecritures':
        return [
          { id: 'today', name: 'Aujourd\'hui', type: 'dateRange', value: this.getTodayRange(), label: 'Aujourd\'hui' },
          { id: 'thisWeek', name: 'Cette semaine', type: 'dateRange', value: this.getWeekRange(), label: 'Cette semaine' },
          { id: 'thisMonth', name: 'Ce mois', type: 'dateRange', value: this.getMonthRange(), label: 'Ce mois' },
          { id: 'lastMonth', name: 'Mois dernier', type: 'dateRange', value: this.getLastMonthRange(), label: 'Mois dernier' }
        ];
      default:
        return [];
    }
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadSavedFilters(): void {
    const saved = localStorage.getItem('bilanplus_saved_filters');
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        this.savedFiltersSubject.next(filters);
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }

  private persistSavedFilters(filters: SavedFilter[]): void {
    localStorage.setItem('bilanplus_saved_filters', JSON.stringify(filters));
  }

  private getTodayRange() {
    const today = new Date();
    return { start: today, end: today };
  }

  private getWeekRange() {
    const today = new Date();
    const start = new Date(today.setDate(today.getDate() - today.getDay()));
    const end = new Date(today.setDate(start.getDate() + 6));
    return { start, end };
  }

  private getMonthRange() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start, end };
  }

  private getLastMonthRange() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start, end };
  }
}
