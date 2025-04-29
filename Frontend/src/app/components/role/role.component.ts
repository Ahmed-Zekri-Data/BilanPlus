import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../Models/Role';
import { RoleService } from '../../services/role.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface RoleStats {
  roleId: string;
  roleName: string;
  nombreUtilisateurs: number;
  actifs: number;
  inactifs: number;
}

interface PermissionsUsage {
  [key: string]: any;
}

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1000ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal => clicked', animate('200ms ease-in')),
      transition('clicked => normal', animate('200ms ease-out'))
    ])
  ]
})
export class RoleComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filteredRoles: Role[] = [];
  statsVisible = false;
  roleStats: RoleStats[] = [];
  buttonState = 'normal';
  availablePermissions = [
    'users:view', 'users:manage',
    'invoices:view', 'invoices:manage',
    'suppliers:view', 'suppliers:manage',
    'stocks:view', 'stocks:manage',
    'accounting:view', 'accounting:manage',
    'declarations:view', 'declarations:manage'
  ];

  constructor(
    private roleService: RoleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data.map(role => ({
          ...role,
          permissions: role.permissions || [] // Ensure permissions array exists
        }));
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
    if (id) {
      this.router.navigate(['/roles/edit', id]);
    }
  }

  viewRole(id: string): void {
    if (id) {
      this.router.navigate(['/roles/view', id]);
    }
  }

  deleteRole(id: string): void {
    if (!id) return;
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

  updatePermissions(role: Role): void {
    this.loading = true;
    const roleId = role.id || role._id;
    if (!roleId) {
      this.error = 'ID du rôle manquant.';
      this.loading = false;
      return;
    }
    this.roleService.updateRole(roleId, role).subscribe({
      next: () => {
        this.loading = false;
        this.loadRoles(); // Refresh the list to ensure consistency
      },
      error: (error: Error) => {
        this.error = error.message || 'Erreur lors de la mise à jour des permissions';
        this.loading = false;
      }
    });
  }

  togglePermission(role: Role, permission: string): void {
    if (!role.permissions) {
      role.permissions = [];
    }
    const index = role.permissions.indexOf(permission);
    if (index === -1) {
      role.permissions.push(permission);
    } else {
      role.permissions.splice(index, 1);
    }
    this.updatePermissions(role);
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

  analysePermissionsUsage(): void {
    this.loading = true;
    this.roleService.analysePermissionsUsage().subscribe({
      next: (data: PermissionsUsage) => {
        console.log('Analyse des permissions:', data);
        alert('Analyse des permissions terminée. Vérifiez la console pour les détails.');
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Erreur lors de l\'analyse des permissions';
        this.loading = false;
      }
    });
  }
}