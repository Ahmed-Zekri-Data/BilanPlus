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
    // Wait for the next tick to ensure the view is rendered
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
    // Wait for the next tick to ensure the view is rendered
    setTimeout(() => {
      if (!this.mapContainer?.nativeElement) {
        console.error('Map container not found');
        return;
      }

      try {
        // Initialize map with default center
        this.map = L.map(this.mapContainer.nativeElement).setView([0, 0], 2);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.mapInitialized = true;

        // If we already have fournisseur data, update the map
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
            // If map is not initialized yet, try to initialize it
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
      // Update map center
      this.map.setView([lat, lng], 15);

      // Remove existing marker if any
      if (this.marker) {
        this.marker.remove();
      }

      // Add new marker
      this.marker = L.marker([lat, lng]).addTo(this.map);
      
      // Add popup with fournisseur name
      if (this.fournisseur?.nom) {
        this.marker.bindPopup(this.fournisseur.nom).openPopup();
      }
    } catch (error) {
      console.error('Error updating map position:', error);
    }
  }

  editFournisseur(): void {
    if (this.fournisseur) {
      this.router.navigate(['/fournisseurs/edit', this.fournisseur.id]);
    }
  }

  deleteFournisseur(): void {
    if (this.fournisseur && confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseurService.deleteFournisseur(this.fournisseur.id).subscribe({
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