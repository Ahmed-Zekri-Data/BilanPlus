import { Component } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { Role } from '../../Models/Role';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent {
  Roles: Role[] = [];
  errorMessage: string = '';

  constructor(private roleService: RoleService) {}

  ngOnInit() {
    this.roleService.getAllRoles().subscribe({
      next: (data) => this.Roles = data,
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des rôles';
        console.error(err);
      }
    });
  }

  deleteRole(id: string) {
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.Roles = this.Roles.filter(role => role._id !== id);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la suppression';
        console.error(err);
      }
    });
  }
}