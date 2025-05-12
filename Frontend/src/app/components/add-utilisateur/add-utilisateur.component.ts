import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RoleService } from '../../services/role.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role } from '../../Models/Role';
import { finalize } from 'rxjs/operators';

interface RoleOption {
  _id: string;
  nom: string;
}

@Component({
  selector: 'app-add-utilisateur',
  templateUrl: './add-utilisateur.component.html',
  styleUrls: ['./add-utilisateur.component.css']
})
export class AddUtilisateurComponent implements OnInit {
  utilisateurForm: FormGroup;
  loading = false;
  loadingRoles = false;
  error: string | null = null;
  success: string | null = null;
  hidePassword = true;
  isEditMode = false;
  userId: string | null = null;

  // Liste des rôles disponibles
  roles: RoleOption[] = [];

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.utilisateurForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      actif: [true]
    });
  }

  ngOnInit(): void {
    // Charger les rôles disponibles
    this.loadRoles();

    // Vérifier si nous sommes en mode édition
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.loadUtilisateur(this.userId);
    }
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.roleService.getRoles()
      .pipe(finalize(() => this.loadingRoles = false))
      .subscribe({
        next: (roles) => {
          this.roles = roles.map(role => ({
            _id: role._id || '',
            nom: role.nom
          }));
          console.log('Rôles chargés:', this.roles);

          // Si aucun rôle n'est disponible, afficher un message d'erreur
          if (this.roles.length === 0) {
            this.error = 'Aucun rôle disponible. Veuillez créer des rôles avant d\'ajouter des utilisateurs.';
          }
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des rôles: ' + (err.message || 'Erreur inconnue');
          console.error('Erreur lors du chargement des rôles:', err);
        }
      });
  }

  loadUtilisateur(id: string): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurById(id).subscribe({
      next: (response) => {
        const utilisateur = response.utilisateur;
        console.log('Utilisateur chargé:', utilisateur);

        // Extraire l'ID du rôle
        let roleId = '';
        if (utilisateur.role) {
          if (typeof utilisateur.role === 'string') {
            roleId = utilisateur.role;
          } else if (typeof utilisateur.role === 'object' && utilisateur.role._id) {
            roleId = utilisateur.role._id;
          }
        }

        // Mettre à jour le formulaire avec les données de l'utilisateur
        this.utilisateurForm.patchValue({
          nom: utilisateur.nom,
          prenom: utilisateur.prenom || '',
          email: utilisateur.email,
          role: roleId,
          actif: utilisateur.actif !== undefined ? utilisateur.actif : true
        });

        console.log('Formulaire mis à jour avec le rôle:', roleId);

        // Rendre le champ mot de passe optionnel en mode édition
        const passwordControl = this.utilisateurForm.get('password');
        if (passwordControl) {
          passwordControl.clearValidators();
          passwordControl.setValidators(Validators.minLength(6));
          passwordControl.updateValueAndValidity();
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Erreur lors du chargement des données de l\'utilisateur.';
        this.showSnackBar('Erreur lors du chargement des données de l\'utilisateur', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.utilisateurForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.utilisateurForm.controls).forEach(key => {
        const control = this.utilisateurForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Vérifier si un rôle a été sélectionné
    const roleId = this.utilisateurForm.get('role')?.value;
    if (!roleId) {
      this.error = 'Veuillez sélectionner un rôle valide.';
      this.showSnackBar('Veuillez sélectionner un rôle valide', 'error');
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // Créer une copie des valeurs du formulaire
    const utilisateur = {...this.utilisateurForm.value};

    // Si le mot de passe est vide en mode édition, le supprimer de l'objet
    if (this.isEditMode && !utilisateur.password) {
      delete utilisateur.password;
    }

    // Assurez-vous que le rôle est correctement formaté
    console.log('Envoi du rôle:', utilisateur.role);

    if (this.isEditMode && this.userId) {
      // Mise à jour d'un utilisateur existant
      this.utilisateurService.updateUtilisateur(this.userId, utilisateur).subscribe({
        next: (response) => {
          console.log('Réponse de mise à jour:', response);
          this.loading = false;
          this.success = 'Utilisateur mis à jour avec succès.';
          this.showSnackBar('Utilisateur mis à jour avec succès', 'success');
          setTimeout(() => this.router.navigate(['/utilisateurs']), 1500);
        },
        error: (err) => {
          console.error('Erreur de mise à jour:', err);
          this.loading = false;
          this.error = err.message || 'Une erreur est survenue lors de la mise à jour.';
          this.showSnackBar('Erreur lors de la mise à jour de l\'utilisateur', 'error');
        }
      });
    } else {
      // Création d'un nouvel utilisateur
      this.utilisateurService.createUtilisateur(utilisateur).subscribe({
        next: (response) => {
          console.log('Réponse de création:', response);
          this.loading = false;
          this.success = 'Utilisateur ajouté avec succès.';
          this.showSnackBar('Utilisateur ajouté avec succès', 'success');
          this.utilisateurForm.reset({
            role: '',
            actif: true
          });
          setTimeout(() => this.router.navigate(['/utilisateurs']), 1500);
        },
        error: (err) => {
          console.error('Erreur de création:', err);
          this.loading = false;
          this.error = err.message || 'Une erreur est survenue lors de la création.';
          this.showSnackBar('Erreur lors de la création de l\'utilisateur', 'error');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/utilisateurs']);
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}