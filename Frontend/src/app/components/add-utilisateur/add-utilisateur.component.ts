import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RoleService } from '../../services/role.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Role } from '../../Models/Role';

@Component({
  selector: 'app-add-utilisateur',
  templateUrl: './add-utilisateur.component.html',
  styleUrls: ['./add-utilisateur.component.css'],
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
export class AddUtilisateurComponent implements OnInit {
  userForm: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  isEditMode = false;
  userId: string | null = null;
  buttonState = 'normal';
  roles: Role[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private roleService: RoleService
  ) {
    this.userForm = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
      telephone: [''],
      adresse: [''],
      actif: [true],
      preferences: this.formBuilder.group({
        theme: ['light'],
        langue: ['fr'],
        notificationsEmail: [true]
      })
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    this.loadRoles();

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        console.log('Rôles chargés pour le formulaire:', roles); // Debugging
        this.roles = roles;
        if (!roles || roles.length === 0) {
          this.error = 'Aucun rôle disponible. Veuillez d\'abord créer des rôles.';
        }
      },
      error: (err) => {
        this.error = err?.message || 'Erreur lors du chargement des rôles.';
        console.error('Erreur lors du chargement des rôles:', err);
      }
    });
  }

  loadUser(id: string): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role ? (typeof user.role === 'string' ? user.role : user.role.id || user.role._id) : '',
          telephone: user.telephone || '',
          adresse: user.adresse || '',
          actif: user.actif,
          preferences: {
            theme: user.preferences?.theme || 'light',
            langue: user.preferences?.langue || 'fr',
            notificationsEmail: user.preferences?.notificationsEmail || false
          }
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Erreur lors du chargement de l\'utilisateur.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    const userData = this.userForm.value;

    if (this.isEditMode && this.userId) {
      this.utilisateurService.updateUtilisateur(this.userId, userData).subscribe({
        next: () => {
          this.router.navigate(['/utilisateurs']);
        },
        error: (err) => {
          this.error = err?.message || 'Erreur lors de la mise à jour de l\'utilisateur.';
          this.loading = false;
        }
      });
    } else {
      this.utilisateurService.createUtilisateur(userData).subscribe({
        next: () => {
          this.router.navigate(['/utilisateurs']);
        },
        error: (err) => {
          this.error = err?.message || 'Erreur lors de la création de l\'utilisateur.';
          this.loading = false;
        }
      });
    }
  }
}