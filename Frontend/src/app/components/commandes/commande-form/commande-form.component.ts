import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandesService } from '../../../services/commandes.service';
import { FournisseurService, Fournisseur } from '../../../services/fournisseur.service';
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
  fournisseurs: Fournisseur[] = [];
  produits: Produit[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private commandesService: CommandesService,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar,
    private stockService: StockManagementService
  ) {
    this.commandeForm = this.fb.group({
      produit: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prix: [0, [Validators.required, Validators.min(0)]],
      statut: ['En attente', Validators.required],
      fournisseurID: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.paramMap.get('id');
    if (this.commandeId) {
      this.isEditMode = true;
      this.loadCommande();
    }
    this.loadFournisseurs();
    this.loadProduits();
  }

  loadFournisseurs(): void {
    this.isLoading = true;
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (fournisseurs) => {
        this.fournisseurs = fournisseurs;
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

  loadCommande(): void {
    if (this.commandeId) {
      this.isLoading = true;
      this.commandesService.getCommandeById(this.commandeId).subscribe({
        next: (commande) => {
          this.commandeForm.patchValue(commande);
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
      const commandeData = this.commandeForm.value;
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
          next: () => {
            this.snackBar.open('Commande créée avec succès', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            this.router.navigate(['/commandes']);
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de la création de la commande', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            console.error(err);
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/commandes']);
  }
} 