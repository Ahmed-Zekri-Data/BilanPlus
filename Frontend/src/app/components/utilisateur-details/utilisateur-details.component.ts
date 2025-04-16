import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utilisateur } from '../../Models/Utilisateur';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './utilisateur-details.component.html',
  styleUrls: ['./utilisateur-details.component.scss']
})
export class UtilisateurDetailsComponent implements OnInit {
  utilisateur: Utilisateur | null = null;
  loading = false;
  error = '';
  userId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.loadUserData();
  }

  loadUserData(): void {
    this.loading = true;
    this.utilisateurService.getUserById(this.userId).subscribe({
      next: (data: Utilisateur) => {
        this.utilisateur = data;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Erreur lors du chargement des données utilisateur';
        this.loading = false;
      }
    });
  }

  editUser(): void {
    this.router.navigate(['/users/edit', this.userId]);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  getPermissionsArray(): string[] {
    if (!this.utilisateur || !this.utilisateur.role || typeof this.utilisateur.role !== 'object') {
      return [];
    }
    return Object.keys(this.utilisateur.role['permissions'] || {});
  }
  
  getPermissionLabel(perm: string): string {
    const labels: { [key: string]: string } = {
      gestionUtilisateurs: 'Gestion des utilisateurs',
      gestionRoles: 'Gestion des rôles',
      gestionClients: 'Gestion des clients',
      gestionFournisseurs: 'Gestion des fournisseurs',
      gestionFactures: 'Gestion des factures',
      gestionComptabilite: 'Gestion de la comptabilité',
      gestionBilans: 'Gestion des bilans',
      gestionDeclarations: 'Gestion des déclarations',
      rapportsAvances: 'Rapports avancés',
      parametresSysteme: 'Paramètres système'
    };
    return labels[perm] || perm;
  }
}