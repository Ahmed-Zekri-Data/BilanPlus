import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Role } from '../../Models/Role';
import { RoleComponent } from '../role/role.component';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css'],
  animations: [
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal <=> clicked', animate('100ms ease-in-out'))
    ])
  ]
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
  buttonState: string = 'normal';

  get permissionKeys(): (keyof Role['permissions'])[] {
    return Object.keys(this.permissions) as (keyof Role['permissions'])[];
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {
    this.roleForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      actif: [true]
    });
  }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    if (this.roleId) {
      this.isEditMode = true;
      this.loadRole();
    }
  }

  loadRole(): void {
    if (this.roleId) {
      this.roleService.getRoleById(this.roleId).subscribe({
        next: (role: Role) => {
          this.roleForm.patchValue({
            nom: role.nom,
            description: role.description,
            actif: role.actif
          });
          this.permissions = { ...role.permissions };
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du rôle.';
          console.error(err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const role: Role = {
      nom: this.roleForm.value.nom,
      description: this.roleForm.value.description,
      permissions: { ...this.permissions },
      dateCreation: new Date(),
      actif: this.roleForm.value.actif
    };

    if (this.isEditMode && this.roleId) {
      role._id = this.roleId;
      this.roleService.updateRole(this.roleId, role).subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Rôle mis à jour avec succès.';
          setTimeout(() => this.router.navigate(['/roles']), 2000);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Erreur lors de la mise à jour du rôle.';
          console.error(err);
        }
      });
    } else {
      this.roleService.createRole(role).subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Rôle créé avec succès.';
          this.roleForm.reset();
          this.permissions = {
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
          setTimeout(() => this.router.navigate(['/roles']), 2000);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Erreur lors de la création du rôle.';
          console.error(err);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }

  togglePermission(key: keyof Role['permissions']): void {
    this.permissions[key] = !this.permissions[key];
  }
}