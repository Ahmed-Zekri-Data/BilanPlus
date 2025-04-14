import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Role } from '../../Models/Role';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css']
})
export class AddRoleComponent implements OnInit {
  private roleId?: string;
  public isEditMode: boolean = false;

  constructor(
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  roleForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    permissions: new FormControl('', Validators.required) // On pourrait utiliser un FormArray pour une liste
  });

  message: string = '';

  ngOnInit() {
    this.roleId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.roleId) {
      this.isEditMode = true;
      this.loadRoleData();
    }
  }

  private loadRoleData() {
    if (this.roleId) {
      this.roleService.getRoleById(this.roleId).subscribe({
        next: (role: Role) => {
          this.roleForm.patchValue({
            nom: role.nom,
            permissions: role.permissions.join(', ') // Convertit le tableau en chaîne pour l'affichage
          });
        },
        error: (err) => {
          this.message = 'Erreur lors du chargement du rôle';
          console.error(err);
        }
      });
    }
  }

  submitRole() {
    if (this.roleForm.invalid) {
      this.message = 'Veuillez remplir correctement tous les champs requis';
      return;
    }

    const roleData: any = {
      nom: this.roleForm.value.nom ?? "",
      permissions: this.roleForm.value.permissions?.split(',').map((p: string) => p.trim()) ?? [] // Convertit la chaîne en tableau
    };

    if (this.isEditMode && this.roleId) {
      this.roleService.updateRole(this.roleId, roleData).subscribe({
        next: () => {
          this.router.navigateByUrl("/roles");
        },
        error: (err) => {
          this.message = 'Erreur lors de la mise à jour';
          console.error(err);
        }
      });
    } else {
      this.roleService.createRole(roleData).subscribe({
        next: () => {
          this.router.navigateByUrl("/roles");
        },
        error: (err) => {
          this.message = 'Erreur lors de la création';
          console.error(err);
        }
      });
    }
  }
}