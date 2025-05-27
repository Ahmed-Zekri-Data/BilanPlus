import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchService, SearchFilter, SavedFilter } from '../../../services/search.service';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.css']
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {
  @Input() module: string = '';
  @Input() placeholder: string = 'Rechercher...';
  @Input() filters: SearchFilter[] = [];
  @Input() showSavedFilters: boolean = true;
  @Input() showQuickFilters: boolean = true;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filtersChange = new EventEmitter<SearchFilter[]>();
  @Output() filterApplied = new EventEmitter<void>();

  currentSearchTerm = '';
  savedFilters: SavedFilter[] = [];
  quickFilters: SearchFilter[] = [];
  showAdvancedFilters = false;
  activeFiltersCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearch(): void {
    // Initialize filters in the search service
    this.searchService.setFilters(this.filters);
  }

  // Event Handlers
  onSearchInput(event: any): void {
    this.currentSearchTerm = event.target.value;
    this.searchChange.emit(this.currentSearchTerm);
  }

  applyFilters(): void {
    this.filterApplied.emit();
  }

  clearAllFilters(): void {
    this.currentSearchTerm = '';
    this.searchService.clearFilters();
    this.searchService.setSearchTerm('');
    this.searchChange.emit('');
    this.applyFilters();
  }
}
