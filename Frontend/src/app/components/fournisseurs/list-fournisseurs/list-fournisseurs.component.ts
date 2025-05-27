import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FournisseurService } from '../../../services/fournisseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfService } from '../../../services/pdf.service';
import * as L from 'leaflet';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-list-fournisseurs',
  templateUrl: './list-fournisseurs.component.html',
  styleUrls: ['./list-fournisseurs.component.css']
})
export class ListFournisseursComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  fournisseurs: any[] = [];
  dataSource: MatTableDataSource<any>;
  isLoading = false;
  displayedColumns: string[] = ['id', 'nom', 'email', 'contact', 'categorie', 'actions'];
  
  // Search and filter properties
  searchTerm: string = '';
  zoneGeo: string = '';
  
  // Pagination properties
  totalItems: number = 0;
  pageSize: number = 5;
  currentPage: number = 0;

  // Map properties
  private map: L.Map | undefined;
  private markers: L.Marker[] = [];
  private mapInitialized = false;
  isMapModalOpen = false;
  showMap = false;

  // Custom red marker icon
  private customIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private searchSubject = new Subject<string>();

  constructor(
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar,
    private router: Router,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = new MatTableDataSource<any>([]);
    
    // Configure custom filter predicate
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        (data.nom && data.nom.toLowerCase().includes(searchStr)) ||
        (data.email && data.email.toLowerCase().includes(searchStr)) ||
        (data.contact && data.contact.toLowerCase().includes(searchStr)) ||
        (data.categorie && data.categorie.toLowerCase().includes(searchStr))
      );
    };
    
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilter();
    });
  }

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  openMapModal(): void {
    this.isMapModalOpen = true;
    // Initialize map after modal is opened
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  closeMapModal(event: Event): void {
    event.stopPropagation();
    this.isMapModalOpen = false;
    // Clean up map when modal is closed
    if (this.map) {
      this.map.remove();
      this.map = undefined;
      this.mapInitialized = false;
    }
  }

  private initializeMap(): void {
    if (!this.mapContainer?.nativeElement || this.mapInitialized) {
      return;
    }

    try {
      // Initialize map with default center (France)
      this.map = L.map(this.mapContainer.nativeElement).setView([46.603354, 1.888334], 6);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);

      this.mapInitialized = true;

      // If we already have fournisseurs data, update the map
      if (this.fournisseurs.length > 0) {
        this.updateMapMarkers();
      }

      // Trigger a resize event to ensure the map renders correctly in the modal
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private updateMapMarkers(): void {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    try {
      // Clear existing markers
      this.markers.forEach(marker => marker.remove());
      this.markers = [];

      // Add markers for each fournisseur with coordinates
      this.fournisseurs.forEach(fournisseur => {
        if (fournisseur.lat && fournisseur.long) {
          // Create marker with red icon and improved visibility
          const marker = L.marker([fournisseur.lat, fournisseur.long], {
            icon: this.customIcon,
            riseOnHover: true,
            zIndexOffset: 1000
          });

          // Create a custom popup with improved styling
          const popupContent = `
            <div class="popup-content">
              <div class="popup-header">
                <h3>${fournisseur.nom}</h3>
              </div>
              <div class="popup-body">
                <p><strong>Email:</strong> ${fournisseur.email || 'Non renseigné'}</p>
                <p><strong>Contact:</strong> ${fournisseur.contact || 'Non renseigné'}</p>
                <p><strong>Adresse:</strong> ${fournisseur.adresse || 'Non renseigné'}</p>
                <p><strong>Catégorie:</strong> ${fournisseur.categorie || 'Non renseigné'}</p>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 300,
            minWidth: 200,
            className: 'custom-popup',
            closeButton: true,
            autoClose: false,
            closeOnEscapeKey: true
          });

          marker.addTo(this.map!);
          this.markers.push(marker);
        }
      });

      // If we have markers, fit the map to show all of them
      if (this.markers.length > 0) {
        const group = L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
      }
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }

  loadFournisseurs(): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      zoneGeo: this.zoneGeo
    };

    this.fournisseurService.getFournisseursWithFilters(params).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.fournisseurs = response;
          this.dataSource.data = this.fournisseurs;
          this.totalItems = this.fournisseurs.length;
        } else {
          this.fournisseurs = response.data;
          this.dataSource.data = this.fournisseurs;
          this.totalItems = response.total;
        }
        
        // Update map markers if map is initialized
        if (this.mapInitialized) {
          this.updateMapMarkers();
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des fournisseurs', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  applyFilter(): void {
    // Apply filter to the dataSource
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    
    // Reset pagination
    if (this.paginator) {
      this.paginator.firstPage();
    }
    
    // Update total items count
    this.totalItems = this.dataSource.filteredData.length;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFournisseurs();
  }

  exportToPDF(): void {
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Liste des Fournisseurs', style: 'header' },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              ['ID', 'Nom', 'Email', 'Contact', 'Catégorie'],
              ...this.fournisseurs.map(fournisseur => [
                fournisseur._id || '',
                fournisseur.nom || '',
                fournisseur.email || '',
                fournisseur.contact || '',
                fournisseur.categorie || ''
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number]
        }
      }
    };

    this.pdfService.generatePdf(docDefinition, 'fournisseurs.pdf');
  }

  viewFournisseur(id: string): void {
    this.router.navigate(['/fournisseurs/view', id]);
  }

  editFournisseur(id: string): void {
    this.router.navigate(['/fournisseurs/edit', id]);
  }

  deleteFournisseur(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseurService.deleteFournisseur(id).subscribe({
        next: () => {
          this.snackBar.open('Fournisseur supprimé avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadFournisseurs();
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la suppression du fournisseur', 'Fermer', {
            duration: 3000
          });
          console.error(err);
        }
      });
    }
  }

  addFournisseur(): void {
    this.router.navigate(['/fournisseurs/add']);
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }
} 