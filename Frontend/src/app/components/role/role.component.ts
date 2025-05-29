import { Component, OnInit, ViewChild } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { Role } from '../../Models/Role';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

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
  dataSource: MatTableDataSource<Role>;
  displayedColumns: string[] = ['nom', 'description', 'actif', 'permissions', 'actions'];
  buttonState: string = 'normal';
  loading: boolean = false;
  statsVisible: boolean = false;
  roleStats: any[] = [];
  searchTerm: string = '';
  permissionKeys: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private roleService: RoleService, private router: Router) {
    this.dataSource = new MatTableDataSource<Role>([]);
  }

  ngOnInit(): void {
    this.loadRoles();
    this.initializePermissionKeys();
  }

  loadRoles(): void {
    this.loading = true;
    console.log('Chargement des rôles...');

    this.roleService.getRoles().subscribe({
      next: (data: Role[]) => {
        console.log('Rôles chargés avec succès:', data);

        if (Array.isArray(data)) {
          this.roles = data;
          this.filteredRoles = data;
          this.dataSource.data = this.roles;

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          } else {
            console.warn('Paginator non initialisé');
          }

          if (this.sort) {
            this.dataSource.sort = this.sort;
          } else {
            console.warn('Sort non initialisé');
          }
        } else {
          console.error('Format de réponse invalide pour les rôles:', data);
        }

        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Erreur lors du chargement des rôles:', err);

        // Afficher un message d'erreur à l'utilisateur
        let errorMessage = 'Erreur lors du chargement des rôles.';

        if (err.message) {
          errorMessage = err.message;
        }

        // Afficher un message d'erreur plus détaillé
        if (err.originalError && err.originalError.status) {
          console.error(`Statut HTTP: ${err.originalError.status}`);

          if (err.originalError.status === 403) {
            errorMessage = 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.';
          }
        }

        alert(errorMessage);
      }
    });
  }

  initializePermissionKeys(): void {
    const samplePermissions: Role['permissions'] = {
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
    this.permissionKeys = Object.keys(samplePermissions);
  }

  getPermissionsList(role: Role): string[] {
    if (!role.permissions) {
      return [];
    }
    return this.permissionKeys.filter(key => role.permissions && role.permissions[key as keyof Role['permissions']]);
  }

  toggleActif(role: Role): void {
    const updatedRole: Partial<Role> = { actif: !role.actif };
    this.roleService.updateRole(role._id || '', updatedRole).subscribe({
      next: () => { role.actif = !role.actif; },
      error: (err: any) => { console.error('Erreur:', err); }
    });
  }

  editRole(role: Role): void {
    this.router.navigate([`/roles/edit/${role._id}`]);
  }

  deleteRole(id: string): void {
    if (confirm('Êtes-vous sûr ?')) {
      this.roleService.deleteRole(id).subscribe({
        next: () => this.loadRoles(),
        error: (err: any) => console.error('Erreur:', err)
      });
    }
  }

  viewRole(id: string): void {
    this.router.navigate([`/roles/view/${id}`]);
  }

  search(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filteredRoles = this.roles.filter(role =>
      role.nom.toLowerCase().includes(this.searchTerm) ||
      role.description?.toLowerCase().includes(this.searchTerm)
    );
  }

  loadRoleStats(): void {
    this.statsVisible = true;
    this.roleStats = this.roles.map(role => ({
      nom: role.nom,
      totalUsers: Math.floor(Math.random() * 10)
    }));
  }

  hideStats(): void {
    this.statsVisible = false;
    this.roleStats = [];
  }

  exportToCSV(): void {
    const csvData = this.roles.map(role => ({
      Nom: role.nom,
      Description: role.description,
      Actif: role.actif ? 'Oui' : 'Non',
      Permissions: this.getPermissionsList(role).join(';'),
      DateCreation: role.dateCreation ? new Date(role.dateCreation).toLocaleDateString() : 'Non définie'
    }));
    const csv = [
      'Nom,Description,Actif,Permissions,DateCreation',
      ...csvData.map(row => `${row.Nom},${row.Description},${row.Actif},${row.Permissions},${row.DateCreation}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roles.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}