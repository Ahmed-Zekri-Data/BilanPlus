import { Component, OnInit } from '@angular/core';
import { DevisService } from '../../services/devis.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FournisseurService } from '../../services/fournisseur.service';
import { CommandeService } from '../../services/commande.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-devis',
  templateUrl: './list-devis.component.html',
  styleUrls: ['./list-devis.component.css']
})
export class ListDevisComponent implements OnInit {
  devis: any[] = [];
  filteredDevis: any[] = [];
  loading = false;
  error = '';
  displayedColumns: string[] = ['produit', 'categorie', 'fournisseur', 'prix', 'date', 'date_fin', 'statut', 'actions'];
  
  // Filter properties
  selectedCategorie: string = '';
  selectedFournisseur: string = '';
  categories: string[] = [];
  fournisseurs: any[] = [];

  constructor(
    private devisService: DevisService,
    private fournisseurService: FournisseurService,
    private commandeService: CommandeService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadDevis();
    this.loadCategories();
    this.loadFournisseurs();
    this.checkUrlParameters();
  }

  private checkUrlParameters(): void {
    this.route.queryParams.subscribe(params => {
      if (params['submitted'] === 'true') {
        this.snackBar.open('Devis déjà soumis', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadDevis(): void {
    this.loading = true;
    this.error = '';
    
    const params = {
      categorie: this.selectedCategorie,
      fournisseur: this.selectedFournisseur
    };
    
    this.devisService.getAllDevis(params).subscribe({
      next: (devis) => {
        this.devis = devis;
        this.filteredDevis = devis;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des devis';
        this.loading = false;
        this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
      }
    });
  }

  loadCategories(): void {
    this.commandeService.getProductCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadFournisseurs(): void {
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (fournisseurs) => {
        this.fournisseurs = fournisseurs;
      },
      error: (err) => {
        console.error('Error loading fournisseurs:', err);
      }
    });
  }

  applyFilter(): void {
    this.loadDevis();
  }

  acceptDevis(devisId: string): void {
    this.devisService.acceptDevis(devisId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Devis accepté avec succès', 'Fermer', { duration: 3000 });
          this.loadDevis();
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
          this.loadDevis();
        } else {
          this.snackBar.open('Erreur lors du refus du devis', 'Fermer', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du refus du devis', 'Fermer', { duration: 3000 });
      }
    });
  }

  acceptLowestPriceForCommande(commandeId: string): void {
    const commandeDevis = this.devis.filter(d => 
      d.commandeID?._id === commandeId && 
      d.statut === 'En attente' && 
      !this.isCommandeExpired(d.commandeID?.date_fin)
    );

    if (commandeDevis.length === 0) {
      this.snackBar.open('Aucun devis en attente pour cette commande', 'Fermer', { duration: 3000 });
      return;
    }

    const lowestPriceDevis = commandeDevis.reduce((lowest, current) => 
      parseFloat(current.prix) < parseFloat(lowest.prix) ? current : lowest
    );

    this.acceptDevis(lowestPriceDevis._id);
  }

  autoAcceptAllLowestPrices(): void {
    const pendingDevis = this.devis.filter(d => 
      d.statut === 'En attente' && 
      !this.isCommandeExpired(d.commandeID?.date_fin)
    );

    if (pendingDevis.length === 0) {
      this.snackBar.open('Aucun devis en attente', 'Fermer', { duration: 3000 });
      return;
    }

    // Group devis by commande
    const devisByCommande = pendingDevis.reduce((acc: { [key: string]: any[] }, devis) => {
      const commandeId = devis.commandeID?._id;
      if (!acc[commandeId]) {
        acc[commandeId] = [];
      }
      acc[commandeId].push(devis);
      return acc;
    }, {});

    // Accept lowest price for each commande
    Object.values(devisByCommande).forEach((commandeDevis: any[]) => {
      const lowestPriceDevis = commandeDevis.reduce((lowest, current) => 
        parseFloat(current.prix) < parseFloat(lowest.prix) ? current : lowest
      );
      this.acceptDevis(lowestPriceDevis._id);
    });
  }

  hasPendingDevis(): boolean {
    return this.devis.some(d => 
      d.statut === 'En attente' && 
      !this.isCommandeExpired(d.commandeID?.date_fin)
    );
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