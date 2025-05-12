import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../Models/Role';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-role-details',
  templateUrl: './role-details.component.html',
  styleUrls: ['./role-details.component.css']
})
export class RoleDetailsComponent implements OnInit {
  role: Role | null = null;
  loading = false;
  error = '';
  showConfirmDialog = false;
  roleId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.error = 'Vous devez être connecté pour accéder à cette ressource.';
      console.error('RoleDetailsComponent: Utilisateur non connecté');

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

      return;
    }

    this.roleId = this.route.snapshot.paramMap.get('id');
    if (this.roleId) {
      this.loadRole(this.roleId);
    } else {
      this.error = 'ID du rôle non fourni.';
    }
  }

  loadRole(id: string): void {
    this.loading = true;
    this.error = '';
    console.log('RoleDetailsComponent: Chargement du rôle avec ID:', id);

    this.roleService.getRoleById(id).subscribe({
      next: (role) => {
        console.log('RoleDetailsComponent: Rôle chargé avec succès:', role);

        // Vérifier si le rôle a des permissions
        if (!role.permissions) {
          console.warn('RoleDetailsComponent: Le rôle n\'a pas de permissions définies');
          role.permissions = {
            gererUtilisateursEtRoles: false,
            configurerSysteme: false,
            accesComplet: false,
            validerEcritures: false,
            cloturerPeriodes: false,
            genererEtatsFinanciers: false,
            superviserComptes: false,
            saisirEcritures: false,
            gererFactures: false,
            suivrePaiements: false,
            gererTresorerie: false,
            analyserDepensesRecettes: false,
            genererRapportsPerformance: false,
            comparerBudgetRealise: false,
            saisirNotesFrais: false,
            consulterBulletinsPaie: false,
            soumettreRemboursements: false,
            accesFacturesPaiements: false,
            telechargerDocuments: false,
            communiquerComptabilite: false
          };
        }

        this.role = role;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du chargement du rôle: ' + (err?.message || 'Erreur inconnue');
        console.error('RoleDetailsComponent: Erreur lors du chargement du rôle:', err);

        // Si l'erreur est due à une authentification expirée, rediriger vers la page de connexion
        if (err.originalError && err.originalError.status === 401) {
          this.error = 'Votre session a expiré. Veuillez vous reconnecter.';
          setTimeout(() => {
            this.authService.logout();
          }, 2000);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  deleteRole(): void {
    this.showConfirmDialog = true;
  }

  cancelDelete(): void {
    this.showConfirmDialog = false;
  }

  confirmDelete(): void {
    if (this.roleId) {
      this.loading = true;
      this.roleService.deleteRole(this.roleId).subscribe({
        next: () => {
          this.loading = false;
          this.showConfirmDialog = false;
          this.showSnackBar('Rôle supprimé avec succès', 'success');
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          this.loading = false;
          this.showConfirmDialog = false;
          this.error = 'Erreur lors de la suppression du rôle: ' + (err?.message || 'Erreur inconnue');
          this.showSnackBar('Erreur lors de la suppression du rôle', 'error');
          console.error('Erreur lors de la suppression du rôle:', err);
        }
      });
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}