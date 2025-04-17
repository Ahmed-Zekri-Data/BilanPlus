import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { Role } from '../../Models/Role';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-role-details',
  templateUrl: './role-details.component.html',
  styleUrls: ['./role-details.component.css']
})
export class RoleDetailsComponent implements OnInit {
  role: Role | null = null;
  errorMessage: string = '';
  // Liste des clés de permissions pour itérer dans le template
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
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getRoleDetails(id);
    } else {
      this.errorMessage = 'ID de rôle non spécifié';
    }
  }

  getRoleDetails(id: string): void {
    this.roleService.getRoleById(id).subscribe({
      next: (data: Role) => {
        this.role = data;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la récupération des détails du rôle';
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }

  editRole(): void {
    if (this.role?.id) {
      this.router.navigate(['/role/edit', this.role.id]);
    }
  }
}