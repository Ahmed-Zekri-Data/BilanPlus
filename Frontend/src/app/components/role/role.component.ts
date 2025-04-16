import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../Models/Role';
import { RoleService } from '../../services/role.service';

interface RoleStats {
  roleId: string;
  roleName: string;
  nombreUtilisateurs: number;
  actifs: number;
  inactifs: number;
}

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html', // Assure-toi que ce fichier existe
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filteredRoles: Role[] = [];
  statsVisible = false;
  roleStats: RoleStats[] = [];

  constructor(
    private roleService: RoleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAllRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data;
        this.filteredRoles = [...this.roles];
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Une erreur est survenue';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRoles = [...this.roles];
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredRoles = this.roles.filter(role => 
      role.nom.toLowerCase().includes(searchTermLower) ||
      (role.description && role.description.toLowerCase().includes(searchTermLower))
    );
  }

  editRole(id: string): void {
    this.router.navigate(['/roles/edit', id]);
  }

  viewRole(id: string): void {
    this.router.navigate(['/roles/view', id]);
  }

  deleteRole(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir désactiver ce rôle ?')) {
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (error: Error) => {
          this.error = error.message || 'Une erreur est survenue lors de la désactivation';
        }
      });
    }
  }

  loadRoleStats(): void {
    this.loading = true;
    this.roleService.getUsersPerRole().subscribe({
      next: (data: { stats: RoleStats[] }) => {
        this.roleStats = data.stats;
        this.statsVisible = true;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }

  hideStats(): void {
    this.statsVisible = false;
  }
}