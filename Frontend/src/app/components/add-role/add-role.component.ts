import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../../Models/Role';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css']
})
export class AddRoleComponent implements OnInit {
  roleForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  errorMessage = ''; // Ajout de la propriété manquante
  isEditMode = false;
  roleId = '';
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
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {
    this.roleForm = this.createForm();
  }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.params['id'] || '';
    this.isEditMode = !!this.roleId;

    if (this.isEditMode) {
      this.loadRoleData();
    }
  }

  createForm(): FormGroup {
    const permissionsGroup: { [key: string]: [boolean] } = {};
    this.permissionsList.forEach(perm => {
      permissionsGroup[perm] = [false];
    });

    return this.formBuilder.group({
      nom: ['', [Validators.required]],
      description: [''],
      permissions: this.formBuilder.group(permissionsGroup),
      actif: [true]
    });
  }

  loadRoleData(): void {
    this.loading = true;
    this.roleService.getRoleById(this.roleId).subscribe({
      next: (role: Role | null) => {
        if (role) {
          this.roleForm.patchValue({
            nom: role.nom,
            description: role.description || '',
            permissions: role.permissions,
            actif: role.actif
          });
        } else {
          this.error = 'Rôle non trouvé';
          this.errorMessage = 'Rôle non trouvé'; // Mise à jour de errorMessage
        }
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'Erreur lors du chargement des données du rôle';
        this.errorMessage = err.message || 'Erreur lors du chargement des données du rôle'; // Mise à jour de errorMessage
        this.loading = false;
      }
    });
  }

  // Ajout de la méthode manquante getPermissionLabel
  getPermissionLabel(permission: string): string {
    const labels: { [key: string]: string } = {
      'gestionUtilisateurs': 'Gestion des utilisateurs',
      'gestionRoles': 'Gestion des rôles',
      'gestionClients': 'Gestion des clients',
      'gestionFournisseurs': 'Gestion des fournisseurs',
      'gestionFactures': 'Gestion des factures',
      'gestionComptabilite': 'Gestion de la comptabilité',
      'gestionBilans': 'Gestion des bilans',
      'gestionDeclarations': 'Gestion des déclarations',
      'rapportsAvances': 'Rapports avancés',
      'parametresSysteme': 'Paramètres système'
    };
    return labels[permission] || permission;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.roleForm.invalid) {
      return;
    }

    this.loading = true;
    const roleData: Role = this.roleForm.value;

    if (this.isEditMode) {
      this.roleService.updateRole(this.roleId, roleData).subscribe({
        next: () => {
          this.router.navigate(['/roles']);
        },
        error: (err: Error) => {
          this.error = err.message || 'Erreur lors de la mise à jour';
          this.errorMessage = err.message || 'Erreur lors de la mise à jour'; // Mise à jour de errorMessage
          this.loading = false;
        }
      });
    } else {
      this.roleService.createRole(roleData).subscribe({
        next: () => {
          this.router.navigate(['/roles']);
        },
        error: (err: Error) => {
          this.error = err.message || 'Erreur lors de la création';
          this.errorMessage = err.message || 'Erreur lors de la création'; // Mise à jour de errorMessage
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}