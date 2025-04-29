import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RoleService } from '../../services/role.service';
import { Utilisateur } from '../../Models/Utilisateur';
import { Role } from '../../Models/Role';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-add-utilisateur',
  templateUrl: './add-utilisateur.component.html',
  styleUrls: ['./add-utilisateur.component.css'],
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
export class AddUtilisateurComponent implements OnInit {
  utilisateur: Partial<Utilisateur> = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: '',
    telephone: '',
    adresse: '',
    actif: true,
    dateCreation: new Date()
  };
  userForm: FormGroup;
  roles: Role[] = [];
  error: string | null = null;
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  utilisateurId: string | null = null;
  submitted: boolean = false;
  loading: boolean = false;
  buttonState: string = 'normal';

  constructor(
    private utilisateurService: UtilisateurService,
    private roleService: RoleService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
      telephone: [''],
      adresse: [''],
      actif: [true]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    const urlSegments = this.router.url.split('/');
    if (urlSegments.includes('edit') && urlSegments.length > 3) {
      this.isEditMode = true;
      this.utilisateurId = urlSegments[urlSegments.length - 1];
      this.loadUtilisateur();
    } else if (urlSegments.includes('view') && urlSegments.length > 3) {
      this.isViewMode = true;
      this.utilisateurId = urlSegments[urlSegments.length - 1];
      this.loadUtilisateur();
    }
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.message || 'Erreur lors du chargement des rôles.';
        this.loading = false;
      }
    });
  }

  loadUtilisateur(): void {
    if (this.utilisateurId) {
      this.loading = true;
      this.utilisateurService.getUtilisateurById(this.utilisateurId).subscribe({
        next: (utilisateur: Utilisateur) => {
          this.utilisateur = { ...utilisateur };
          this.userForm.patchValue({
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
            role: typeof utilisateur.role === 'string' ? utilisateur.role : utilisateur.role?._id,
            telephone: utilisateur.telephone,
            adresse: utilisateur.adresse,
            actif: utilisateur.actif
          });
          if (this.isEditMode) {
            this.userForm.get('password')?.clearValidators();
            this.userForm.get('password')?.updateValueAndValidity();
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors du chargement de l\'utilisateur.';
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.userForm.invalid) {
      return;
    }

    const formValue = this.userForm.value;
    const utilisateurToSubmit: Partial<Utilisateur> = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role,
      telephone: formValue.telephone,
      adresse: formValue.adresse,
      actif: formValue.actif
    };

    this.loading = true;
    if (this.isEditMode && this.utilisateurId) {
      this.utilisateurService.updateUtilisateur(this.utilisateurId, utilisateurToSubmit).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/utilisateurs']);
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors de la mise à jour de l\'utilisateur.';
          this.loading = false;
        }
      });
    } else if (!this.isViewMode) {
      this.utilisateurService.createUtilisateur(utilisateurToSubmit).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/utilisateurs']);
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors de la création de l\'utilisateur.';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/utilisateurs']);
  }
}