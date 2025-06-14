import { Component, OnInit } from '@angular/core';
import { DevisService } from '../../services/devis.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.css']
})
export class DevisComponent implements OnInit {
  devis: any[] = [];
  loading = false;
  error: string | null = null;
  displayedColumns: string[] = ['produit', 'fournisseur', 'prix', 'date', 'date_fin', 'statut', 'actions'];
  devisForm: FormGroup;
  commandeId: string = '';
  fournisseurId: string = '';
  existingDevis: any = null;
  commandeDetails: any = null;
  fournisseurDetails: any = null;

  constructor(
    private devisService: DevisService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.devisForm = this.fb.group({
      prix: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.commandeId = params['commandeId'];
      this.fournisseurId = params['fournisseurId'];
      this.loadCommandeDetails();
    });
    this.loadDevis();
  }

  loadDevis(): void {
    this.loading = true;
    this.error = null;
    this.devisService.getAllDevis().subscribe({
      next: (data) => {
        this.devis = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des devis';
        this.loading = false;
        this.showSnackBar('Erreur lors du chargement des devis', 'error');
      }
    });
  }

  loadCommandeDetails(): void {
    this.loading = true;
    this.error = null;
    this.devisService.getCommandeDetails(this.commandeId, this.fournisseurId).subscribe({
      next: (response) => {
        if (response.success) {
          this.commandeDetails = response.data.commande;
          this.fournisseurDetails = response.data.fournisseur;
          this.existingDevis = response.data.devisExistant;
          if (this.existingDevis) {
            this.showSnackBar('Vous avez déjà soumis un prix pour cette commande', 'info');
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des détails';
        this.loading = false;
        this.showSnackBar('Erreur lors du chargement des détails', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.devisForm.valid) {
      this.loading = true;
      const prix = this.devisForm.get('prix')?.value;

      this.devisService.createDevis(this.commandeId, this.fournisseurId, prix).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar('Prix soumis avec succès', 'success');
            this.existingDevis = response.devis;
            this.devisForm.reset();
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors de la soumission du prix';
          this.loading = false;
          this.showSnackBar('Erreur lors de la soumission du prix', 'error');
        }
      });
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'Accepté':
        return 'status-accepted';
      case 'Refusé':
        return 'status-rejected';
      case 'En attente':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  }

  isCommandeExpired(dateFin: string): boolean {
    if (!dateFin) return false;
    return new Date(dateFin) < new Date();
  }

  acceptDevis(devisId: string): void {
    this.loading = true;
    this.devisService.acceptDevis(devisId).subscribe({
      next: () => {
        this.loadDevis();
        this.showSnackBar('Devis accepté avec succès', 'success');
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'acceptation du devis';
        this.loading = false;
        this.showSnackBar('Erreur lors de l\'acceptation du devis', 'error');
      }
    });
  }

  rejectDevis(devisId: string): void {
    this.loading = true;
    this.devisService.rejectDevis(devisId).subscribe({
      next: () => {
        this.loadDevis();
        this.showSnackBar('Devis refusé avec succès', 'success');
      },
      error: (err) => {
        this.error = 'Erreur lors du rejet du devis';
        this.loading = false;
        this.showSnackBar('Erreur lors du rejet du devis', 'error');
      }
    });
  }

  autoAcceptLowestPrice(): void {
    this.loading = true;
    
    // Group devis by commandeID
    const devisByCommande: { [key: string]: any[] } = this.devis.reduce((acc, devis) => {
      if (!acc[devis.commandeID._id]) {
        acc[devis.commandeID._id] = [];
      }
      acc[devis.commandeID._id].push(devis);
      return acc;
    }, {} as { [key: string]: any[] });

    // For each commande, find and accept the lowest price devis
    const promises = Object.entries(devisByCommande).map(([commandeId, devisList]) => {
      const pendingDevis = devisList.filter(d => d.statut === 'En attente' && !this.isCommandeExpired(d.commandeID?.date_fin));
      
      if (pendingDevis.length > 0) {
        const lowestPriceDevis = pendingDevis.reduce((min, current) => 
          parseFloat(current.prix) < parseFloat(min.prix) ? current : min
        );
        
        return this.devisService.acceptDevis(lowestPriceDevis._id).toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(promises)
      .then(() => {
        this.loadDevis();
        this.showSnackBar('Meilleurs prix acceptés avec succès', 'success');
      })
      .catch((err) => {
        this.error = 'Erreur lors de l\'auto-acceptation des devis';
        this.loading = false;
        this.showSnackBar('Erreur lors de l\'auto-acceptation des devis', 'error');
      });
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : 
                 type === 'error' ? ['error-snackbar'] : 
                 ['info-snackbar']
    });
  }
} 