import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css'],
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
export class AddRoleComponent implements OnInit {
  roleForm: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  isEditMode = false;
  roleId: string | null = null;
  buttonState = 'normal';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {
    this.roleForm = this.formBuilder.group({
      nom: ['', Validators.required],
      description: [''],
      actif: [true]
    });
  }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.roleId;

    if (this.isEditMode && this.roleId) {
      this.loadRole(this.roleId);
    }
  }

  loadRole(id: string): void {
    this.loading = true;
    this.roleService.getRoleById(id).subscribe({
      next: (role) => {
        this.roleForm.patchValue(role);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Erreur lors du chargement du rôle.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.roleForm.invalid) {
      return;
    }

    this.loading = true;
    const roleData = this.roleForm.value;

    if (this.isEditMode && this.roleId) {
      this.roleService.updateRole(this.roleId, roleData).subscribe({
        next: () => {
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          this.error = err?.message || 'Erreur lors de la mise à jour du rôle.';
          this.loading = false;
        }
      });
    } else {
      this.roleService.createRole(roleData).subscribe({
        next: () => {
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          this.error = err?.message || 'Erreur lors de la création du rôle.';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }
}