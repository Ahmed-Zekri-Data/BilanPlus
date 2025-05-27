import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role } from '../../Models/Role';

// Interface pour organiser les permissions par catégorie
interface PermissionCategory {
  name: string;
  icon: string;
  permissions: (keyof Role['permissions'])[];
}

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css']
})
export class AddRoleComponent implements OnInit {
  roleForm: FormGroup;
  isEditMode: boolean = false;
  roleId: string | null = null;
  permissions: Role['permissions'] = {
    gererUtilisateursEtRoles: false,
    configurerSysteme: false,
    accesComplet: false,
    validerEcritures: false,
    cloturerPeriodes: false,
    genererEtatsFinanciers: false,
    superviserComptes: false,
    saisirEcritures: false,
    gererFactures: false,
    suivrePaiements: false,
    gererTresorerie: false,
    analyserDepensesRecettes: false,
    genererRapportsPerformance: false,
    comparerBudgetRealise: false,
    saisirNotesFrais: false,
    consulterBulletinsPaie: false,
    soumettreRemboursements: false,
    accesFacturesPaiements: false,
    telechargerDocuments: false,
    communiquerComptabilite: false
  };
  loading: boolean = false;
  error: string | null = null;
  success: string | null = null;

  // Catégories de permissions pour une meilleure organisation
  permissionCategories: PermissionCategory[] = [
    {
      name: 'Gestion des utilisateurs et système',
      icon: 'admin_panel_settings',
      permissions: ['gererUtilisateursEtRoles', 'configurerSysteme', 'accesComplet']
    },
    {
      name: 'Comptabilité',
      icon: 'account_balance',
      permissions: ['validerEcritures', 'cloturerPeriodes', 'genererEtatsFinanciers', 'superviserComptes', 'saisirEcritures']
    },
    {
      name: 'Facturation et paiements',
      icon: 'receipt',
      permissions: ['gererFactures', 'suivrePaiements', 'gererTresorerie', 'accesFacturesPaiements']
    },
    {
      name: 'Rapports et analyses',
      icon: 'bar_chart',
      permissions: ['analyserDepensesRecettes', 'genererRapportsPerformance', 'comparerBudgetRealise']
    },
    {
      name: 'Autres permissions',
      icon: 'more_horiz',
      permissions: ['saisirNotesFrais', 'consulterBulletinsPaie', 'soumettreRemboursements', 'telechargerDocuments', 'communiquerComptabilite']
    }
  ];

  get permissionKeys(): (keyof Role['permissions'])[] {
    return Object.keys(this.permissions) as (keyof Role['permissions'])[];
  }

  // Dictionnaire pour afficher des noms plus conviviaux pour les permissions
  permissionLabels: { [key: string]: string } = {
    gererUtilisateursEtRoles: 'Gérer les utilisateurs et rôles',
    configurerSysteme: 'Configurer le système',
    accesComplet: 'Accès complet',
    validerEcritures: 'Valider les écritures',
    cloturerPeriodes: 'Clôturer les périodes',
    genererEtatsFinanciers: 'Générer les états financiers',
    superviserComptes: 'Superviser les comptes',
    saisirEcritures: 'Saisir les écritures',
    gererFactures: 'Gérer les factures',
    suivrePaiements: 'Suivre les paiements',
    gererTresorerie: 'Gérer la trésorerie',
    analyserDepensesRecettes: 'Analyser les dépenses et recettes',
    genererRapportsPerformance: 'Générer les rapports de performance',
    comparerBudgetRealise: 'Comparer budget et réalisé',
    saisirNotesFrais: 'Saisir les notes de frais',
    consulterBulletinsPaie: 'Consulter les bulletins de paie',
    soumettreRemboursements: 'Soumettre des remboursements',
    accesFacturesPaiements: 'Accès aux factures et paiements',
    telechargerDocuments: 'Télécharger des documents',
    communiquerComptabilite: 'Communiquer avec la comptabilité'
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      actif: [true]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.error = 'Vous devez être connecté pour accéder à cette ressource.';
      console.error('AddRoleComponent: Utilisateur non connecté');

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

      return;
    }

    this.roleId = this.route.snapshot.paramMap.get('id');
    if (this.roleId) {
      this.isEditMode = true;
      this.loadRole();
    }
  }

  loadRole(): void {
    if (this.roleId) {
      this.loading = true;
      this.roleService.getRoleById(this.roleId).subscribe({
        next: (role: Role) => {
          this.roleForm.patchValue({
            nom: role.nom,
            description: role.description,
            actif: role.actif !== undefined ? role.actif : true
          });

          // Copier les permissions du rôle
          if (role.permissions) {
            this.permissions = { ...role.permissions };
          }

          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Erreur lors du chargement du rôle: ' + (err.message || 'Erreur inconnue');
          this.showSnackBar('Erreur lors du chargement du rôle', 'error');
          console.error('Erreur lors du chargement du rôle:', err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.roleForm.controls).forEach(key => {
        const control = this.roleForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // Vérifier si au moins une permission est sélectionnée
    const hasPermissions = Object.values(this.permissions).some(value => value === true);
    if (!hasPermissions) {
      this.showSnackBar('Veuillez sélectionner au moins une permission', 'error');
      this.error = 'Veuillez sélectionner au moins une permission pour ce rôle.';
      this.loading = false;
      return;
    }

    // Envoyer l'objet permissions directement au backend

    const role: any = {
      nom: this.roleForm.value.nom,
      description: this.roleForm.value.description,
      permissions: this.permissions, // Envoyer l'objet permissions directement
      dateCreation: new Date(),
      actif: this.roleForm.value.actif
    };

    console.log('Envoi du rôle au serveur:', role);

    if (this.isEditMode && this.roleId) {
      // Mise à jour d'un rôle existant
      role._id = this.roleId;
      this.roleService.updateRole(this.roleId, role).subscribe({
        next: (updatedRole: any) => {
          this.loading = false;
          this.success = 'Rôle mis à jour avec succès.';
          this.showSnackBar('Rôle mis à jour avec succès', 'success');
          console.log('Rôle mis à jour:', updatedRole);
          setTimeout(() => this.router.navigate(['/roles']), 1500);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Erreur lors de la mise à jour du rôle: ' + (err.message || 'Erreur inconnue');
          this.showSnackBar('Erreur lors de la mise à jour du rôle', 'error');
          console.error('Erreur lors de la mise à jour du rôle:', err);
        }
      });
    } else {
      // Création d'un nouveau rôle
      this.roleService.createRole(role).subscribe({
        next: (newRole: any) => {
          this.loading = false;
          this.success = 'Rôle créé avec succès.';
          this.showSnackBar('Rôle créé avec succès', 'success');
          console.log('Nouveau rôle créé:', newRole);

          // Réinitialiser le formulaire
          this.roleForm.reset({
            nom: '',
            description: '',
            actif: true
          });

          // Réinitialiser les permissions
          this.resetPermissions();

          setTimeout(() => this.router.navigate(['/roles']), 1500);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Erreur lors de la création du rôle: ' + (err.message || 'Erreur inconnue');
          this.showSnackBar('Erreur lors de la création du rôle', 'error');
          console.error('Erreur lors de la création du rôle:', err);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }

  togglePermission(key: keyof Role['permissions']): void {
    this.permissions[key] = !this.permissions[key];

    // Si on active l'accès complet, activer toutes les autres permissions
    if (key === 'accesComplet' && this.permissions.accesComplet) {
      this.permissionKeys.forEach(permKey => {
        this.permissions[permKey] = true;
      });
    }
  }

  // Sélectionner ou désélectionner toutes les permissions d'une catégorie
  toggleCategoryPermissions(category: PermissionCategory, value: boolean): void {
    category.permissions.forEach(permKey => {
      this.permissions[permKey] = value;
    });
  }

  // Vérifier si toutes les permissions d'une catégorie sont activées
  areCategoryPermissionsAllActive(category: PermissionCategory): boolean {
    return category.permissions.every(permKey => this.permissions[permKey]);
  }

  // Vérifier si au moins une permission d'une catégorie est activée
  areCategoryPermissionsSomeActive(category: PermissionCategory): boolean {
    return category.permissions.some(permKey => this.permissions[permKey]);
  }

  // Réinitialiser toutes les permissions
  resetPermissions(): void {
    this.permissionKeys.forEach(key => {
      this.permissions[key] = false;
    });
  }

  // Afficher un message snackbar
  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}