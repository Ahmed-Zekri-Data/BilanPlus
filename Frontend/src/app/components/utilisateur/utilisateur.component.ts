import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { RoleService } from '../../services/role.service';
import { Role } from '../../Models/Role';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css'],
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
export class UtilisateurComponent implements OnInit {
  utilisateurs: any[] = [];
  errorMessage = '';
  showActivityAnalysis = false;
  buttonState = 'normal';
  roles: Role[] = [];

  constructor(
    private utilisateurService: UtilisateurService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
    this.loadRoles();
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (utilisateurs) => {
        console.log('Utilisateurs reçus:', utilisateurs); // Debugging
        this.utilisateurs = utilisateurs;
        if (!utilisateurs || utilisateurs.length === 0) {
          this.errorMessage = 'Aucun utilisateur trouvé.';
        }
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        this.errorMessage = err?.message || 'Erreur lors du chargement des utilisateurs. Vérifiez votre connexion ou l\'état du serveur.';
      }
    });
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        console.log('Rôles reçus:', roles); // Debugging
        this.roles = roles;
      },
      error: (err: any) => {
        this.errorMessage = err?.message || 'Erreur lors du chargement des rôles.';
      }
    });
  }

  goToAddUser(): void {
    this.router.navigate(['/utilisateur/add']);
  }

  viewUser(id: string): void {
    this.router.navigate([`/utilisateur/details/${id}`]);
  }

  deleteUser(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => {
          this.utilisateurs = this.utilisateurs.filter(user => user._id !== id);
        },
        error: (err: any) => {
          this.errorMessage = err?.message || 'Erreur lors de la suppression de l\'utilisateur.';
        }
      });
    }
  }

  getRoleName(user: any): string {
    if (!user || !user.role) return 'Inconnu';

    if (typeof user.role === 'string') {
      const role = this.roles.find(r => r.id === user.role || r._id === user.role);
      return role ? role.nom : 'Inconnu';
    } else if (user.role && (user.role.id || user.role._id)) {
      const role = this.roles.find(r => r.id === user.role.id || r._id === user.role._id);
      return role ? role.nom : 'Inconnu';
    }
    return 'Inconnu';
  }

  exportToCSV(): void {
    console.log('Exportation en CSV...');
    // Implémenter la logique d'exportation CSV si nécessaire
  }

  analyseUserActivity(): void {
    console.log('Analyse de l\'activité des utilisateurs...');
    this.showActivityAnalysis = !this.showActivityAnalysis;
    // Implémenter la logique d'analyse si nécessaire
  }
}