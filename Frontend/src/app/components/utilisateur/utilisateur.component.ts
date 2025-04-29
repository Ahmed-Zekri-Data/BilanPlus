import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RoleService } from '../../services/role.service';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Utilisateur, UtilisateurResponse } from '../../Models/Utilisateur';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css'],
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
export class UtilisateurComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  errorMessage: string | null = null;
  buttonState: string = 'normal';

  constructor(
    private utilisateurService: UtilisateurService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data: UtilisateurResponse) => {
        this.utilisateurs = data.utilisateurs;
        this.errorMessage = null;
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des utilisateurs.';
        this.utilisateurs = [];
      }
    });
  }

  getRoleName(user: Utilisateur): string {
    if (typeof user.role === 'string') {
      return user.role;
    }
    return user.role?.nom || 'N/A';
  }

  goToAddUser(): void {
    this.router.navigate(['/utilisateur/add']);
  }

  viewUser(id: string): void {
    this.router.navigate([`/utilisateur/view/${id}`]);
  }

  deleteUser(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => {
          this.loadUtilisateurs();
        },
        error: (err: any) => {
          this.errorMessage = err.message || 'Erreur lors de la suppression de l\'utilisateur.';
        }
      });
    }
  }

  analyseUserActivity(): void {
    // Implémenter la logique d'analyse si nécessaire
  }

  exportToCSV(): void {
    // Implémenter l'exportation si nécessaire
  }
}