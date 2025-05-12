import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    if (this.roleId) {
      this.loadRole(this.roleId);
    } else {
      this.error = 'ID du rôle non fourni.';
    }
  }

  loadRole(id: string): void {
    this.loading = true;
    this.roleService.getRoleById(id).subscribe({
      next: (role) => {
        this.role = role;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du rôle: ' + (err?.message || 'Erreur inconnue');
        this.loading = false;
        console.error('Erreur lors du chargement du rôle:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/roles']);
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