import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilisateurService } from '../../services/utilisateur.service';
import { AuthService } from '../../services/auth.service';
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
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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
    this.error = null;
    console.log('UtilisateurDashboardComponent: Chargement des utilisateurs...');

    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.loading = false;
      this.error = 'Vous devez être connecté pour accéder à cette ressource.';
      console.error('UtilisateurDashboardComponent: Utilisateur non connecté');

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

      return;
    }

    this.utilisateurService.getUtilisateurs().subscribe({
      next: (response: UtilisateurResponse) => {
        console.log('UtilisateurDashboardComponent: Utilisateurs chargés avec succès:', response);

        if (response && response.utilisateurs) {
          this.utilisateurs = response.utilisateurs;
          this.filteredUtilisateurs = response.utilisateurs;
          this.dataSource = new MatTableDataSource(this.utilisateurs);

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          } else {
            console.warn('UtilisateurDashboardComponent: Paginator non initialisé');
          }

          if (this.sort) {
            this.dataSource.sort = this.sort;
          } else {
            console.warn('UtilisateurDashboardComponent: Sort non initialisé');
          }

          this.calculateStatistics();
        } else {
          this.error = 'Format de réponse invalide: utilisateurs manquants';
          console.error('UtilisateurDashboardComponent: Format de réponse invalide:', response);
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Erreur lors du chargement des utilisateurs.';
        console.error('UtilisateurDashboardComponent: Erreur lors du chargement des utilisateurs:', err);

        // Afficher un message d'erreur plus détaillé
        if (err.originalError && err.originalError.status) {
          console.error(`UtilisateurDashboardComponent: Statut HTTP: ${err.originalError.status}`);

          if (err.originalError.status === 401) {
            this.error = 'Votre session a expiré. Veuillez vous reconnecter.';

            // Déconnecter l'utilisateur et rediriger vers la page de connexion
            this.authService.logout();
          } else if (err.originalError.status === 403) {
            this.error = 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.';
          }
        }
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
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => {
          this.loadUtilisateurs();
          // Afficher un message de succès
          alert('Utilisateur supprimé avec succès');
        },
        error: (err) => {
          this.error = err?.message || 'Erreur lors de la suppression de l\'utilisateur.';
          console.error('Erreur:', err);
          // Afficher un message d'erreur
          alert('Erreur lors de la suppression de l\'utilisateur: ' + this.error);
        }
      });
    }
  }

  showDetails(user: Utilisateur): void {
    this.router.navigate([`/utilisateur/details/${user._id}`]);
  }

  toggleUserStatus(user: Utilisateur): void {
    if (!user._id) {
      console.error('UtilisateurDashboardComponent: ID utilisateur manquant');
      return;
    }

    // Désactiver le toggle pendant la requête pour éviter les clics multiples
    const toggleElement = document.querySelector(`mat-slide-toggle[data-user-id="${user._id}"]`) as any;
    if (toggleElement) {
      toggleElement.disabled = true;
    }

    console.log(`UtilisateurDashboardComponent: Changement de statut pour l'utilisateur ${user._id} de ${user.actif} à ${!user.actif}`);

    // Sauvegarder l'état actuel pour pouvoir le restaurer en cas d'erreur
    const previousState = user.actif;

    // Mettre à jour l'interface utilisateur immédiatement pour une meilleure expérience
    user.actif = !user.actif;
    this.calculateStatistics();

    // Utiliser la méthode spécifique pour changer le statut
    this.utilisateurService.toggleUserStatus(user._id, user.actif).subscribe({
      next: (response) => {
        console.log('UtilisateurDashboardComponent: Statut mis à jour avec succès', response);

        // Réactiver le toggle
        if (toggleElement) {
          toggleElement.disabled = false;
        }

        // Afficher un message de confirmation discret (sans alert)
        this.snackBar.open(
          user.actif ? 'Utilisateur activé avec succès' : 'Utilisateur désactivé avec succès',
          'Fermer',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error('UtilisateurDashboardComponent: Erreur lors de la mise à jour du statut', err);

        // Restaurer l'état précédent
        user.actif = previousState;
        this.calculateStatistics();

        // Réactiver le toggle et restaurer son état
        if (toggleElement) {
          toggleElement.disabled = false;
          toggleElement.checked = previousState;
        }

        // Afficher un message d'erreur
        this.error = err.message || 'Erreur lors de la mise à jour du statut de l\'utilisateur.';
        this.snackBar.open(
          'Erreur lors de la mise à jour du statut: ' + this.error,
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
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
    this.loading = true;
    this.utilisateurService.exportToCSV().subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        // Créer un URL pour le blob
        const url = window.URL.createObjectURL(blob);
        // Créer un élément a pour déclencher le téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = 'utilisateurs.csv';
        document.body.appendChild(a);
        a.click();
        // Nettoyer
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors de l\'exportation des utilisateurs.';
        console.error('Erreur lors de l\'exportation:', err);
        // Afficher un message d'erreur
        alert('Erreur lors de l\'exportation des utilisateurs: ' + (err.message || 'Erreur inconnue'));
      }
    });
  }

  getRoleName(user: Utilisateur): string {
    if (!user.role) {
      return 'Non défini';
    }
    return typeof user.role === 'string' ? user.role : user.role.nom;
  }
}
