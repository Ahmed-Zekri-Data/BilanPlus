import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandesService } from '../../../services/commandes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StockManagementService } from '../../../services/gestion-de-stock.service';
import { Produit } from '../../../Models/Produit';

@Component({
  selector: 'app-commande-form',
  templateUrl: './commande-form.component.html',
  styleUrls: ['./commande-form.component.css']
})
export class CommandeFormComponent implements OnInit {
  commandeForm: FormGroup;
  commandeId: string | null = null;
  isEditMode = false;
  isLoading = false;
  produits: Produit[] = [];
  typesLivraison = ['SARL', 'EURL', 'SAS', 'SA', 'SCI', 'Auto-entrepreneur'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private commandesService: CommandesService,
    private snackBar: MatSnackBar,
    private stockService: StockManagementService
  ) {
    this.commandeForm = this.fb.group({
      produit: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      type_livraison: ['', Validators.required],
      date_debut: [new Date(), Validators.required],
      date_fin: [null]
    }, { validators: this.dateFinAfterDateDebut });
  }

  dateFinAfterDateDebut(group: FormGroup) {
    const dateDebut = group.get('date_debut')?.value;
    const dateFin = group.get('date_fin')?.value;

    if (dateDebut && dateFin) {
      const dateDebutTime = new Date(dateDebut).getTime();
      const dateFinTime = new Date(dateFin).getTime();
      
      if (dateFinTime <= dateDebutTime) {
        return { dateFinBeforeDateDebut: true };
      }
    }
    return null;
  }

  calculateDuree(): number {
    const dateDebut = this.commandeForm.get('date_debut')?.value;
    const dateFin = this.commandeForm.get('date_fin')?.value;

    if (dateDebut && dateFin) {
      const diffTime = Math.abs(new Date(dateFin).getTime() - new Date(dateDebut).getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.paramMap.get('id');
    if (this.commandeId) {
      this.isEditMode = true;
      this.loadCommande();
    }
    this.loadProduits();
  }

  loadCommande(): void {
    if (this.commandeId) {
      this.isLoading = true;
      this.commandesService.getCommandeById(this.commandeId).subscribe({
        next: (commande) => {
          const commandeData = {
            ...commande,
            date_debut: commande.createdAt ? new Date(commande.createdAt) : new Date(),
            date_fin: commande.date_fin ? new Date(commande.date_fin) : null
          };
          this.commandeForm.patchValue(commandeData);
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement de la commande', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
          console.error(err);
        }
      });
    }
  }

  loadProduits(): void {
    this.stockService.getProduits().subscribe({
      next: (produits) => {
        this.produits = produits;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des produits', 'Fermer', {
          duration: 3000
        });
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.commandeForm.valid) {
      this.isLoading = true;
      const commandeData = {
        ...this.commandeForm.value,
        createdAt: new Date(),
        statut: 'En attente'
      };
      
      if (this.isEditMode && this.commandeId) {
        this.commandesService.updateCommande(this.commandeId, commandeData).subscribe({
          next: () => {
            this.snackBar.open('Commande mise à jour avec succès', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            this.router.navigate(['/commandes']);
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de la mise à jour de la commande', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            console.error(err);
          }
        });
      } else {
        this.commandesService.createCommande(commandeData).subscribe({
          next: (response) => {
            console.log('Commande créée:', response); // Debug log
            this.snackBar.open('Commande créée avec succès', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            this.router.navigate(['/commandes'], { 
              queryParams: { 
                refresh: true,
                timestamp: new Date().getTime() 
              }
            });
          },
          error: (err) => {
            console.error('Erreur création commande:', err); // Debug log
            this.snackBar.open('Erreur lors de la création de la commande', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/commandes']);
  }
} 