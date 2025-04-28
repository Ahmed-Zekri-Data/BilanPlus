import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FournisseurService, Fournisseur } from '../../../services/fournisseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-fournisseur-view',
  templateUrl: './fournisseur-view.component.html',
  styleUrls: ['./fournisseur-view.component.css']
})
export class FournisseurViewComponent implements OnInit {
  fournisseur: Fournisseur | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadFournisseur();
  }

  loadFournisseur(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isLoading = true;
      this.fournisseurService.getFournisseurById(+id).subscribe({
        next: (data) => {
          this.fournisseur = data;
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
  }

  editFournisseur(): void {
    if (this.fournisseur?.id) {
      this.router.navigate(['/fournisseurs/edit', this.fournisseur.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/fournisseurs']);
  }
} 