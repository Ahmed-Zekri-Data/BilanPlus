import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RoleService } from '../../services/role.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    public router: Router, // Exposé au template
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.utilisateurForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telephone: [''],
      adresse: [''],
      role: ['', this.isEditMode ? [] : [Validators.required]],
      actif: [true]
    });
  }

  ngOnInit(): void {
    // Charger les rôles disponibles
    this.loadRoles();

    // Vérifier si nous sommes en mode édition
    this.userId = this.route.snapshot.paramMap.get('id');

    // Si nous sommes sur la route /utilisateur/profile, nous sommes en mode édition du profil utilisateur
    const isProfileEdit = this.router.url === '/utilisateur/profile';

    if (this.userId || isProfileEdit) {
      this.isEditMode = true;

      if (isProfileEdit) {
        // Si nous sommes en mode édition du profil, récupérer l'ID de l'utilisateur connecté
        try {
          const currentUserStr = localStorage.getItem('currentUser');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            if (currentUser && currentUser.user && currentUser.user._id) {
              this.userId = currentUser.user._id;
              console.log('AddUtilisateurComponent: Édition du profil utilisateur avec ID:', this.userId);
            }
          }
        } catch (error) {
          console.error('AddUtilisateurComponent: Erreur lors de la récupération de l\'ID utilisateur:', error);
        }
      }

      if (this.userId) {
        this.loadUtilisateur(this.userId);
      } else {
        this.error = 'Impossible de récupérer l\'ID de l\'utilisateur.';
      }
    }
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.roleService.getRoles()
      .pipe(finalize(() => this.loadingRoles = false))
      .subscribe({
        next: (roles: any) => {
          this.roles = roles.map((role: any) => ({
            _id: role._id || '',
            nom: role.nom
          }));
          console.log('Rôles chargés:', this.roles);

          // Si aucun rôle n'est disponible, afficher un message d'erreur
          if (this.roles.length === 0) {
            this.error = 'Aucun rôle disponible. Veuillez créer des rôles avant d\'ajouter des utilisateurs.';
          }
        },
        error: (err: any) => {
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
          telephone: utilisateur.telephone || '',
          adresse: utilisateur.adresse || '',
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

    // Vérifier si un rôle a été sélectionné (sauf en mode édition du profil)
    const isProfileEdit = this.router.url === '/utilisateur/profile';
    const roleId = this.utilisateurForm.get('role')?.value;

    if (!isProfileEdit && !roleId) {
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

    // Si nous sommes en mode édition du profil, conserver le rôle actuel
    if (isProfileEdit) {
      delete utilisateur.role;
      delete utilisateur.actif;

      // Récupérer le rôle actuel depuis le localStorage
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          if (currentUser && currentUser.user && currentUser.user.role) {
            utilisateur.role = currentUser.user.role;
          }
        }
      } catch (error) {
        console.error('AddUtilisateurComponent: Erreur lors de la récupération du rôle actuel:', error);
      }
    }

    console.log('Données à envoyer:', utilisateur);

    if (this.isEditMode && this.userId) {
      // Mise à jour d'un utilisateur existant
      this.utilisateurService.updateUtilisateur(this.userId, utilisateur).subscribe({
        next: (response) => {
          console.log('Réponse de mise à jour:', response);
          this.loading = false;
          this.success = 'Données personnelles mises à jour avec succès.';
          this.showSnackBar('Données personnelles mises à jour avec succès', 'success');
          // Rediriger vers la page précédente après un court délai
          setTimeout(() => window.history.back(), 1500);
        },
        error: (err) => {
          console.error('Erreur de mise à jour:', err);
          this.loading = false;
          this.error = err.message || 'Une erreur est survenue lors de la mise à jour de vos données personnelles.';
          this.showSnackBar('Erreur lors de la mise à jour de vos données personnelles', 'error');
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
          setTimeout(() => this.router.navigate(['/utilisateur']), 1500);
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
    // Utiliser l'API History pour revenir à la page précédente
    window.history.back();
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