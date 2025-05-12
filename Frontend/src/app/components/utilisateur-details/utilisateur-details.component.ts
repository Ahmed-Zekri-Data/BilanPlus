import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../../services/utilisateur.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-utilisateur-details',
  templateUrl: './utilisateur-details.component.html',
  styleUrls: ['./utilisateur-details.component.css']
})
export class UtilisateurDetailsComponent implements OnInit {
  utilisateur: any = null;
  loading = false;
  error = '';
  showConfirmDialog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUtilisateur(id);
    }
  }

  loadUtilisateur(id: string): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurById(id).subscribe({
      next: (response) => {
        this.utilisateur = response.utilisateur;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Erreur lors du chargement de l\'utilisateur.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/utilisateurs']);
  }

  getRoleName(): string {
    if (!this.utilisateur || !this.utilisateur.role) {
      return 'Non défini';
    }
    return typeof this.utilisateur.role === 'string' ? this.utilisateur.role : this.utilisateur.role.nom;
  }

  deleteUtilisateur(): void {
    this.showConfirmDialog = true;
  }

  cancelDelete(): void {
    this.showConfirmDialog = false;
  }

  confirmDelete(): void {
    if (this.utilisateur && this.utilisateur._id) {
      this.loading = true;
      this.utilisateurService.deleteUtilisateur(this.utilisateur._id).subscribe({
        next: () => {
          this.loading = false;
          this.showConfirmDialog = false;
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/utilisateurs']);
        },
        error: (err) => {
          this.loading = false;
          this.showConfirmDialog = false;
          this.error = err?.message || 'Erreur lors de la suppression de l\'utilisateur.';
          this.snackBar.open('Erreur lors de la suppression de l\'utilisateur', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  resetLoginAttempts(): void {
    if (this.utilisateur && this.utilisateur._id) {
      this.loading = true;
      this.utilisateurService.resetLoginAttempts(this.utilisateur._id).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Tentatives de connexion réinitialisées', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          // Recharger les informations de l'utilisateur
          this.loadUtilisateur(this.utilisateur._id);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Erreur lors de la réinitialisation des tentatives de connexion.';
          this.snackBar.open('Erreur lors de la réinitialisation des tentatives de connexion', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}