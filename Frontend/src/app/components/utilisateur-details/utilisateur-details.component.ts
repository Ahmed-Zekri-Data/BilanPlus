import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../Models/Utilisateur';
import { Role } from '../../Models/Role';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-utilisateur-details',
  templateUrl: './utilisateur-details.component.html',
  styleUrls: ['./utilisateur-details.component.css']
})
export class UtilisateurDetailsComponent implements OnInit {
  utilisateur: Utilisateur | null = null;
  errorMessage: string = '';
  permissionsList: (keyof Role['permissions'])[] = [
    'gestionUtilisateurs',
    'gestionRoles',
    'gestionClients',
    'gestionFournisseurs',
    'gestionFactures',
    'gestionComptabilite',
    'gestionBilans',
    'gestionDeclarations',
    'rapportsAvances',
    'parametresSysteme'
  ];

  constructor(
    private utilisateurService: UtilisateurService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getUtilisateurDetails(id);
    } else {
      this.errorMessage = 'ID d\'utilisateur non spécifié';
    }
  }

  getUtilisateurDetails(id: string): void {
    this.utilisateurService.getUserById(id).subscribe({
      next: (data: Utilisateur) => {
        this.utilisateur = data;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la récupération des détails de l\'utilisateur';
        console.error('Erreur détails:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/utilisateurs']);
  }

  editUser(): void {
    if (this.utilisateur?._id) {
      this.router.navigate(['/utilisateur/edit', this.utilisateur._id]);
    }
  }

  // Méthodes auxiliaires pour le template corrigées
  isRoleString(): boolean {
    if (!this.utilisateur) return false;
    if (!this.utilisateur.role) return false;
    return typeof this.utilisateur.role === 'string';
  }

  getRoleName(): string {
    if (!this.utilisateur) return 'N/A';
    if (!this.utilisateur.role) return 'N/A';
    
    return typeof this.utilisateur.role === 'string' 
      ? this.utilisateur.role 
      : (this.utilisateur.role.nom || 'N/A');
  }

  hasRolePermissions(): boolean {
    if (!this.utilisateur) return false;
    if (!this.utilisateur.role) return false;
    if (typeof this.utilisateur.role === 'string') return false;
    
    return !!this.utilisateur.role.permissions;
  }

  hasPermission(perm: keyof Role['permissions']): boolean {
    if (!this.utilisateur) return false;
    if (!this.utilisateur.role) return false;
    if (typeof this.utilisateur.role === 'string') return false;
    
    return !!this.utilisateur.role.permissions[perm];
  }
}