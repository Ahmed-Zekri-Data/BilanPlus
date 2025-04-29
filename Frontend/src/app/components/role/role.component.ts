import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Role } from '../../Models/Role';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
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
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal <=> clicked', animate('100ms ease-in'))
    ])
  ]
})
export class RoleComponent implements OnInit {
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  error: string | null = null;
  buttonState: string = 'normal';
  statsVisible: boolean = false;
  roleStats: any[] = [];
  availablePermissions: string[] = [
    'users:view', 'users:manage',
    'roles:view', 'roles:manage',
    'clients:view', 'clients:manage',
    'suppliers:view', 'suppliers:manage',
    'invoices:view', 'invoices:manage',
    'accounting:view', 'accounting:manage',
    'reports:view', 'reports:manage',
    'declarations:view', 'declarations:manage',
    'advancedReports:view',
    'system:manage'
  ];

  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data;
        this.filteredRoles = [...this.roles];
        this.loading = false;
        this.error = null;
      },
      error: (err: any) => {
        this.error = err.message || 'Erreur lors du chargement des rôles.';
        this.loading = false;
        this.roles = [];
        this.filteredRoles = [];
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredRoles = [...this.roles];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRoles = this.roles.filter(role =>
        role.nom.toLowerCase().includes(term) ||
        (role.description && role.description.toLowerCase().includes(term))
      );
    }
  }

  viewRole(id: string): void {
    this.router.navigate([`/roles/view/${id}`]);
  }

  editRole(id: string): void {
    this.router.navigate([`/roles/edit/${id}`]);
  }

  deleteRole(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors de la suppression du rôle.';
        }
      });
    }
  }

  togglePermission(role: Role, permission: string): void {
    const permissions = role.permissions || [];
    const permissionExists = permissions.includes(permission);
    let updatedPermissions: string[];

    if (permissionExists) {
      updatedPermissions = permissions.filter(p => p !== permission);
    } else {
      updatedPermissions = [...permissions, permission];
    }

    this.roleService.updateRole(role._id || role.id || '', { permissions: updatedPermissions }).subscribe({
      next: () => {
        this.loadRoles();
      },
      error: (err: any) => {
        this.error = err.message || 'Erreur lors de la mise à jour des permissions.';
      }
    });
  }

  loadRoleStats(): void {
    this.roleService.getUsersPerRole().subscribe({
      next: (data: any[]) => {
        this.roleStats = data;
        this.statsVisible = true;
      },
      error: (err: any) => {
        this.error = err.message || 'Erreur lors du chargement des statistiques.';
      }
    });
  }

  hideStats(): void {
    this.statsVisible = false;
    this.roleStats = [];
  }

  analysePermissionsUsage(): void {
    this.roleService.analysePermissionsUsage().subscribe({
      next: (data: any) => {
        console.log('Analyse des permissions:', data);
      },
      error: (err: any) => {
        this.error = err.message || 'Erreur lors de l\'analyse des permissions.';
      }
    });
  }
}