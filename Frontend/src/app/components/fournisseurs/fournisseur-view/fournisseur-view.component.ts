import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FournisseurService } from '../../../services/fournisseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-fournisseur-view',
  templateUrl: './fournisseur-view.component.html',
  styleUrls: ['./fournisseur-view.component.css']
})
export class FournisseurViewComponent implements OnInit {
  fournisseur: any;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFournisseur(id);
    }
  }

  loadFournisseur(id: string): void {
    this.isLoading = true;
    this.fournisseurService.getFournisseurById(id).subscribe({
      next: (fournisseur) => {
        this.fournisseur = fournisseur;
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