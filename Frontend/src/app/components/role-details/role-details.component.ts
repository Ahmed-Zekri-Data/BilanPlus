import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../../Models/Role';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-details.component.html',
  styleUrls: ['./role-details.component.scss']
})
export class RoleDetailsComponent implements OnInit {
  role: Role | null = null;
  loading = false;
  error = '';
  roleId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) { }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.params['id'];
    this.loadRoleData();
  }

  loadRoleData(): void {
    this.loading = true;
    this.roleService.getRoleById(this.roleId).subscribe({
      next: (data: Role) => {
        this.role = data;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Erreur lors du chargement des données du rôle';
        this.loading = false;
      }
    });
  }

  editRole(): void {
    this.router.navigate(['/roles/edit', this.roleId]);
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }

  getPermissionsArray(): string[] {
    if (!this.role || !this.role.permissions) {
      return [];
    }
    return Object.keys(this.role.permissions);
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