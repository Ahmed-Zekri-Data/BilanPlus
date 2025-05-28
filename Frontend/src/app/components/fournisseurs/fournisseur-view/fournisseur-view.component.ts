import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FournisseurService } from '../../../services/fournisseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as L from 'leaflet';

@Component({
  selector: 'app-fournisseur-view',
  templateUrl: './fournisseur-view.component.html',
  styleUrls: ['./fournisseur-view.component.css']
})
export class FournisseurViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  fournisseur: any;
  isLoading = false;
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private mapInitialized = false;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFournisseur(id);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showMap = true;
      this.cdr.detectChanges();
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    setTimeout(() => {
      if (!this.mapContainer?.nativeElement) {
        console.error('Map container not found');
        return;
      }

      try {
        this.map = L.map(this.mapContainer.nativeElement).setView([0, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.mapInitialized = true;

        if (this.fournisseur?.lat && this.fournisseur?.long) {
          this.updateMapPosition(this.fournisseur.lat, this.fournisseur.long);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 0);
  }

  loadFournisseur(id: string): void {
    this.isLoading = true;
    this.fournisseurService.getFournisseurById(id).subscribe({
      next: (fournisseur) => {
        this.fournisseur = fournisseur;
        if (fournisseur.lat && fournisseur.long) {
          if (this.mapInitialized) {
            this.updateMapPosition(fournisseur.lat, fournisseur.long);
          } else {
            this.initializeMap();
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement du fournisseur', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  private updateMapPosition(lat: number, lng: number): void {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    try {
      this.map.setView([lat, lng], 15);

      if (this.marker) {
        this.marker.remove();
      }

      // Create marker with red icon and improved visibility
      this.marker = L.marker([lat, lng], { 
        icon: this.customIcon,
        riseOnHover: true,
        zIndexOffset: 1000 // Ensure marker is always on top
      }).addTo(this.map);
      
      // Create a custom popup with improved styling
      const popupContent = `
        <div class="popup-content">
          <div class="popup-header">
            <h3>${this.fournisseur?.nom}</h3>
          </div>
          <div class="popup-body">
            <p><strong>Email:</strong> ${this.fournisseur?.email || 'Non renseigné'}</p>
            <p><strong>Contact:</strong> ${this.fournisseur?.contact || 'Non renseigné'}</p>
            <p><strong>Adresse:</strong> ${this.fournisseur?.adresse || 'Non renseigné'}</p>
          </div>
        </div>
      `;
      
      this.marker.bindPopup(popupContent, {
        maxWidth: 300,
        minWidth: 200,
        className: 'custom-popup',
        closeButton: true,
        autoClose: false,
        closeOnEscapeKey: true
      }).openPopup();
    } catch (error) {
      console.error('Error updating map position:', error);
    }
  }

  editFournisseur(): void {
    if (this.fournisseur) {
      this.router.navigate(['/fournisseurs/edit', this.fournisseur.id]);
    }
  }

  deleteFournisseur(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseurService.deleteFournisseur(id).subscribe({
        next: () => {
          this.snackBar.open('Fournisseur supprimé avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/fournisseurs']);
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
}