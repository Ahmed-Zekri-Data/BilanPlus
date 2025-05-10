import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur, UtilisateurResponse } from '../../Models/Utilisateur';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-utilisateur-dashboard',
  templateUrl: './utilisateur-dashboard.component.html',
  styleUrls: ['./utilisateur-dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class UtilisateurDashboardComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  dataSource: MatTableDataSource<Utilisateur>;
  displayedColumns: string[] = ['nom', 'email', 'role', 'dernierConnexion', 'actif', 'actions'];
  expandedElement: Utilisateur | null = null;

  loading = false;
  error: string | null = null;
  searchTerm: string = '';

  // Statistiques
  totalUtilisateurs = 0;
  utilisateursActifs = 0;
  utilisateursInactifs = 0;
  connexionsAujourdhui = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Utilisateur>([]);
  }

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadUtilisateurs(): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (response: UtilisateurResponse) => {
        this.utilisateurs = response.utilisateurs;
        this.filteredUtilisateurs = response.utilisateurs;
        this.dataSource = new MatTableDataSource(this.utilisateurs);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.calculateStatistics();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des utilisateurs.';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  calculateStatistics(): void {
    this.totalUtilisateurs = this.utilisateurs.length;
    this.utilisateursActifs = this.utilisateurs.filter(u => u.actif).length;
    this.utilisateursInactifs = this.totalUtilisateurs - this.utilisateursActifs;

    // Calculer les connexions d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.connexionsAujourdhui = this.utilisateurs.filter(u => {
      if (!u.dernierConnexion) return false;
      const connexionDate = new Date(u.dernierConnexion);
      return connexionDate >= today;
    }).length;
  }

  search(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filteredUtilisateurs = this.utilisateurs.filter(user => {
      const roleText = this.getRoleName(user).toLowerCase();
      return user.nom.toLowerCase().includes(this.searchTerm) ||
             user.email.toLowerCase().includes(this.searchTerm) ||
             roleText.includes(this.searchTerm);
    });
    this.dataSource.data = this.filteredUtilisateurs;
  }

  addUtilisateur(): void {
    this.router.navigate(['/utilisateur/add']);
  }

  editUtilisateur(user: Utilisateur): void {
    this.router.navigate([`/utilisateur/edit/${user._id}`]);
  }

  deleteUtilisateur(id: string | undefined): void {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => {
          this.loadUtilisateurs();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression de l\'utilisateur.';
          console.error('Erreur:', err);
        }
      });
    }
  }

  showDetails(user: Utilisateur): void {
    this.router.navigate([`/utilisateur/details/${user._id}`]);
  }

  toggleUserStatus(user: Utilisateur): void {
    if (!user._id) return;

    const updatedUser: Partial<Utilisateur> = {
      actif: !user.actif
    };

    this.utilisateurService.updateUtilisateur(user._id, updatedUser).subscribe({
      next: () => {
        user.actif = !user.actif;
        this.calculateStatistics();
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour du statut de l\'utilisateur.';
        console.error('Erreur:', err);
      }
    });
  }

  resetLoginAttempts(user: Utilisateur): void {
    if (!user._id) return;

    this.utilisateurService.resetLoginAttempts(user._id).subscribe({
      next: () => {
        user.tentativesConnexion = 0;
      },
      error: (err) => {
        this.error = 'Erreur lors de la réinitialisation des tentatives de connexion.';
        console.error('Erreur:', err);
      }
    });
  }

  exportToCSV(): void {
    const csvData = this.utilisateurs.map(user => ({
      Nom: user.nom,
      Prenom: user.prenom || '',
      Email: user.email,
      Role: typeof user.role === 'string' ? user.role : user.role.nom,
      Actif: user.actif ? 'Oui' : 'Non',
      DernierConnexion: user.dernierConnexion ? new Date(user.dernierConnexion).toLocaleString() : 'Jamais'
    }));

    const csv = [
      'Nom,Prenom,Email,Role,Actif,DernierConnexion',
      ...csvData.map(row => `${row.Nom},${row.Prenom},${row.Email},${row.Role},${row.Actif},${row.DernierConnexion}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getRoleName(user: Utilisateur): string {
    if (!user.role) {
      return 'Non défini';
    }
    return typeof user.role === 'string' ? user.role : user.role.nom;
  }
}
