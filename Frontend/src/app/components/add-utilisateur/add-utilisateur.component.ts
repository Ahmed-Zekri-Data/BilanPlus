import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Utilisateur } from '../../Models/Utilisateur';
import { Role } from '../../Models/Role';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RoleService } from '../../services/role.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-user-form',
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
  loading = false;
  submitted = false;
  error = '';
  isEditMode = false;
  userId = '';
  roles: Role[] = [];
  buttonState = 'normal';  // Ensure buttonState is defined

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private roleService: RoleService
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadRoles();
    
    this.userId = this.route.snapshot.params['id'] || '';
    this.isEditMode = !!this.userId;
    
    if (this.isEditMode) {
      this.loadUserData();
    }
  }
  
  createForm(): FormGroup {
    return this.formBuilder.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      role: ['', [Validators.required]],
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
  
  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data.filter(role => role.actif);
      },
      error: (err: Error) => {
        this.error = err.message || 'Erreur lors du chargement des rôles';
      }
    });
  }
  
  loadUserData(): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurById(this.userId).subscribe({
      next: (user: Utilisateur | null) => {
        if (user) {
          const userData = { ...user };
          delete userData.password;
          
          this.userForm.patchValue(userData);
          
          const roleControl = this.userForm.get('role');
          if (roleControl) {
            if (typeof user.role === 'string') {
              roleControl.setValue(user.role);
            } else if (user.role && 'id' in user.role) {
              roleControl.setValue(user.role.id);
            } else {
              this.error = 'Rôle invalide ou non défini pour cet utilisateur';
            }
          } else {
            this.error = 'Erreur lors de la récupération du contrôle de rôle';
          }
        } else {
          this.error = 'Utilisateur non trouvé';
        }
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'Erreur lors du chargement des données utilisateur';
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
    
    if (this.isEditMode && !userData.password) {
      delete userData.password;
    }
    
    if (this.isEditMode) {
      this.utilisateurService.updateUtilisateur(this.userId, userData).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err: Error) => {
          this.error = err.message || 'Erreur lors de la mise à jour';
          this.loading = false;
        }
      });
    } else {
      this.utilisateurService.createUtilisateur(userData).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err: Error) => {
          this.error = err.message || 'Erreur lors de la création';
          this.loading = false;
        }
      });
    }
  }
}