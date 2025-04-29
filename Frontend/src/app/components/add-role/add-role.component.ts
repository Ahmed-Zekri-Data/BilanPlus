import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { Role } from '../../Models/Role';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css'],
  animations: [
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
export class AddRoleComponent implements OnInit {
  role: Partial<Role> = {
    nom: '',
    description: '',
    actif: true,
    permissions: [],
    dateCreation: new Date()
  };
  roleForm: FormGroup;
  error: string | null = null;
  isEditMode: boolean = false;
  roleId: string | null = null;
  submitted: boolean = false;
  loading: boolean = false;
  buttonState: string = 'normal';
  availablePermissions: string[] = [
    'users:view', 'users:manage',
    'roles:view', 'roles:manage',
    'clients:view', 'clients:manage',
    'suppliers:view', 'suppliers:manage',
    'invoices:view', 'invoices:manage',
    'accounting:view', 'accounting:manage',
    'reports:view', 'reports:manage',
    'declarations:view', 'declarations:manage',
    'advancedReports:view',
    'system:manage'
  ];

  constructor(
    private roleService: RoleService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      actif: [true],
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    const urlSegments = this.router.url.split('/');
    if (urlSegments.includes('edit') && urlSegments.length > 3) {
      this.isEditMode = true;
      this.roleId = urlSegments[urlSegments.length - 1];
      this.loadRole();
    }
  }

  loadRole(): void {
    if (this.roleId) {
      this.loading = true;
      this.roleService.getRoleById(this.roleId).subscribe({
        next: (role: Role) => {
          this.role = { ...role };
          this.roleForm.patchValue({
            nom: role.nom,
            description: role.description,
            actif: role.actif,
            permissions: role.permissions || []
          });
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors du chargement du rôle.';
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.roleForm.invalid) {
      return;
    }

    const formValue = this.roleForm.value;
    const roleToSubmit: Partial<Role> = {
      nom: formValue.nom,
      description: formValue.description,
      actif: formValue.actif,
      permissions: formValue.permissions
    };

    this.loading = true;
    if (this.isEditMode && this.roleId) {
      this.roleService.updateRole(this.roleId, roleToSubmit).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/roles']);
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors de la mise à jour du rôle.';
          this.loading = false;
        }
      });
    } else {
      this.roleService.createRole(roleToSubmit).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/roles']);
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors de la création du rôle.';
          this.loading = false;
        }
      });
    }
  }

  togglePermission(permission: string): void {
    const permissions = this.roleForm.get('permissions')?.value || [];
    if (permissions.includes(permission)) {
      this.roleForm.get('permissions')?.setValue(permissions.filter((p: string) => p !== permission));
    } else {
      this.roleForm.get('permissions')?.setValue([...permissions, permission]);
    }
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }
}