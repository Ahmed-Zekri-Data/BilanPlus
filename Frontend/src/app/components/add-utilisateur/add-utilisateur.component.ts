import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Utilisateur } from '../../Models/Utilisateur';
import { Role } from '../../Models/Role';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './add-utilisateur.component.html',
  styleUrls: ['./add-utilisateur.component.css']
})
export class AddUtilisateurComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  isEditMode = false;
  userId = '';
  roles: Role[] = [];

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
    this.roleService.getAllRoles().subscribe({
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
    this.utilisateurService.getUserById(this.userId).subscribe({
      next: (user: Utilisateur | null) => {
        if (user) {
          // Supprimer le champ password pour l'édition
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
    
    // Si aucun mot de passe n'est fourni en mode édition, on le supprime
    if (this.isEditMode && !userData.password) {
      delete userData.password;
    }
    
    if (this.isEditMode) {
      this.utilisateurService.updateUser(this.userId, userData).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err: Error) => {
          this.error = err.message || 'Erreur lors de la mise à jour';
          this.loading = false;
        }
      });
    } else {
      this.utilisateurService.createUser(userData).subscribe({
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