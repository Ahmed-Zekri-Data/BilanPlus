import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RoleService } from '../../services/role.service'; // Added RoleService
import { AuthService } from '../../services/auth.service';
import { Utilisateur, UtilisateurResponse } from '../../Models/Utilisateur';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';

// Define interfaces for RoleOption and RoleStatistic
interface RoleOption {
  _id: string;
  nom: string;
}

interface RoleStatistic {
  nom: string;
  count: number;
}

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
  roleStatistics: RoleStatistic[] = [];
  allRoles: RoleOption[] = [];
  loadingRoles = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private utilisateurService: UtilisateurService,
    private roleService: RoleService, // Injected RoleService
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Utilisateur>([]);
  }

  ngOnInit(): void {
    this.loadUtilisateurs();
    this.loadAllRoles(); // Load all roles
  }

  loadAllRoles(): void {
    this.loadingRoles = true;
    this.roleService.getRoles().subscribe({
      next: (roles: any[]) => { // Assuming getRoles returns RoleOption compatible array
        this.allRoles = roles.map(role => ({
          _id: role._id,
          nom: role.nom
        }));
        this.calculateStatistics(); // Recalculate stats now that roles are available
        this.loadingRoles = false;
      },
      error: (err) => {
        console.error('UtilisateurDashboardComponent: Error loading roles:', err);
        this.snackBar.open('Erreur lors du chargement des rôles pour les statistiques.', 'Fermer', { duration: 3000, panelClass: ['error-snackbar'] });
        this.loadingRoles = false;
      }
    });
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
    // Calculate general stats
    this.totalUtilisateurs = this.utilisateurs ? this.utilisateurs.length : 0;
    this.utilisateursActifs = this.utilisateurs ? this.utilisateurs.filter(u => u.actif).length : 0;
    this.utilisateursInactifs = this.totalUtilisateurs - this.utilisateursActifs;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.connexionsAujourdhui = this.utilisateurs ? this.utilisateurs.filter(u => {
      if (!u.dernierConnexion) return false;
      const connexionDate = new Date(u.dernierConnexion);
      return connexionDate >= today;
    }).length : 0;

    // Calculate role statistics if both users and allRoles are loaded
    if (this.utilisateurs && this.allRoles && this.allRoles.length > 0) {
      this.roleStatistics = this.allRoles.map(role => {
        const count = this.utilisateurs.filter(user => {
          const userRoleName = this.getRoleName(user);
          return userRoleName === role.nom;
        }).length;
        return { nom: role.nom, count: count };
      });
    } else if (this.allRoles && this.allRoles.length > 0) {
      // If users aren't loaded yet, but roles are, show roles with 0 count
      this.roleStatistics = this.allRoles.map(role => ({ nom: role.nom, count: 0 }));
    } else {
      this.roleStatistics = [];
    }
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
    console.log('UtilisateurDashboardComponent: Début de l\'exportation CSV');

    try {
      // Afficher un indicateur de chargement
      this.loading = true;
      this.error = null;

      // Afficher un message de chargement
      const loadingSnackBarRef = this.snackBar.open(
        'Exportation des utilisateurs en cours...',
        'Patienter',
        { duration: 0 }
      );

      // Vérifier si l'utilisateur est connecté
      if (!this.authService.isLoggedIn()) {
        loadingSnackBarRef.dismiss();
        this.loading = false;
        this.error = 'Vous devez être connecté pour exporter les utilisateurs.';

        this.snackBar.open(
          'Vous devez être connecté pour exporter les utilisateurs.',
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );

        return;
      }

      // Générer le CSV côté client si l'exportation côté serveur échoue
      const generateClientSideCSV = () => {
        try {
          console.log('UtilisateurDashboardComponent: Génération du CSV côté client');

          // Définir le type pour les données CSV
          interface CsvDataRow {
            Nom: string;
            Prenom: string;
            Email: string;
            Role: string;
            Actif: string;
            DateCreation: string;
            DernierConnexion: string;
            [key: string]: string; // Index signature pour permettre l'accès dynamique
          }

          // Créer les données CSV
          const csvData: CsvDataRow[] = this.utilisateurs.map(user => ({
            Nom: user.nom || '',
            Prenom: user.prenom || '',
            Email: user.email || '',
            Role: typeof user.role === 'string' ? user.role : (user.role ? user.role.nom : 'Non défini'),
            Actif: user.actif ? 'Oui' : 'Non',
            DateCreation: user.dateCreation ? new Date(user.dateCreation).toLocaleString() : 'N/A',
            DernierConnexion: user.dernierConnexion ? new Date(user.dernierConnexion).toLocaleString() : 'Jamais'
          }));

          // Créer l'en-tête CSV
          const headers = Object.keys(csvData[0]);

          // Créer les lignes CSV
          const csvRows = [
            headers.join(','),
            ...csvData.map(row => headers.map(header =>
              // Échapper les virgules et les guillemets
              JSON.stringify(row[header] || '')
            ).join(','))
          ];

          // Joindre les lignes avec des sauts de ligne
          const csvString = csvRows.join('\n');

          // Créer un blob avec le contenu CSV
          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

          // Créer un URL pour le blob
          const url = window.URL.createObjectURL(blob);

          // Créer un élément a pour déclencher le téléchargement
          const a = document.createElement('a');
          a.href = url;
          a.download = 'utilisateurs.csv';
          document.body.appendChild(a);

          // Déclencher le téléchargement
          a.click();

          // Nettoyer
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          return true;
        } catch (error) {
          console.error('UtilisateurDashboardComponent: Erreur lors de la génération du CSV côté client', error);
          return false;
        }
      };

      // Essayer d'exporter depuis le serveur
      this.utilisateurService.exportToCSV().subscribe({
        next: (blob: Blob) => {
          console.log('UtilisateurDashboardComponent: Blob reçu', {
            type: blob.type,
            size: blob.size
          });

          // Vérifier si le blob est valide
          if (!blob || blob.size === 0) {
            console.warn('UtilisateurDashboardComponent: Blob vide reçu, génération côté client');

            // Essayer de générer le CSV côté client
            const success = generateClientSideCSV();

            // Masquer l'indicateur de chargement
            this.loading = false;
            loadingSnackBarRef.dismiss();

            if (success) {
              // Afficher un message de succès
              this.snackBar.open(
                'Exportation réussie (générée côté client)',
                'Fermer',
                { duration: 3000 }
              );
            } else {
              // Afficher un message d'erreur
              this.error = 'Erreur lors de l\'exportation des utilisateurs.';
              this.snackBar.open(
                'Erreur lors de l\'exportation des utilisateurs.',
                'Fermer',
                { duration: 5000, panelClass: ['error-snackbar'] }
              );
            }

            return;
          }

          // Créer un URL pour le blob
          const url = window.URL.createObjectURL(blob);

          // Créer un élément a pour déclencher le téléchargement
          const a = document.createElement('a');
          a.href = url;
          a.download = 'utilisateurs.csv';
          document.body.appendChild(a);

          // Déclencher le téléchargement
          a.click();

          // Nettoyer
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // Masquer l'indicateur de chargement
          this.loading = false;
          loadingSnackBarRef.dismiss();

          // Afficher un message de succès
          this.snackBar.open(
            'Exportation réussie',
            'Fermer',
            { duration: 3000 }
          );

          console.log('UtilisateurDashboardComponent: Exportation CSV terminée avec succès');
        },
        error: (err) => {
          console.error('UtilisateurDashboardComponent: Erreur lors de l\'exportation CSV', err);

          // Essayer de générer le CSV côté client
          console.log('UtilisateurDashboardComponent: Tentative de génération côté client');
          const success = generateClientSideCSV();

          // Masquer l'indicateur de chargement
          this.loading = false;
          loadingSnackBarRef.dismiss();

          if (success) {
            // Afficher un message de succès
            this.snackBar.open(
              'Exportation réussie (générée côté client)',
              'Fermer',
              { duration: 3000 }
            );
          } else {
            // Afficher un message d'erreur
            this.error = err.message || 'Erreur lors de l\'exportation des utilisateurs.';

            this.snackBar.open(
              'Erreur lors de l\'exportation: ' + this.error,
              'Fermer',
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
          }
        }
      });
    } catch (error) {
      console.error('UtilisateurDashboardComponent: Erreur non gérée lors de l\'exportation', error);
      this.loading = false;
      this.error = 'Erreur inattendue lors de l\'exportation.';

      this.snackBar.open(
        'Erreur inattendue lors de l\'exportation.',
        'Fermer',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    }
  }

  getRoleName(user: Utilisateur): string {
    if (!user.role) {
      return 'Non défini';
    }
    return typeof user.role === 'string' ? user.role : user.role.nom;
  }
}
