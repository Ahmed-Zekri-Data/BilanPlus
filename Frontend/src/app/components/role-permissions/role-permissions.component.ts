import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Role } from '../../Models/Role';

interface PermissionGroup {
  name: string;
  icon: string;
  permissions: Permission[];
}

interface Permission {
  key: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.css']
})
export class RolePermissionsComponent implements OnInit {
  @Input() role!: Role;
  @Output() permissionsChanged = new EventEmitter<any>();

  permissionGroups: PermissionGroup[] = [
    {
      name: 'Administration',
      icon: 'admin_panel_settings',
      permissions: [
        {
          key: 'gererUtilisateursEtRoles',
          label: 'Gérer les utilisateurs et rôles',
          description: 'Permet de créer, modifier et supprimer des utilisateurs et des rôles'
        },
        {
          key: 'configurerSysteme',
          label: 'Configurer le système',
          description: 'Permet de modifier les paramètres globaux du système'
        },
        {
          key: 'accesComplet',
          label: 'Accès complet',
          description: 'Donne un accès complet à toutes les fonctionnalités du système'
        }
      ]
    },
    {
      name: 'Comptabilité',
      icon: 'account_balance',
      permissions: [
        {
          key: 'validerEcritures',
          label: 'Valider les écritures',
          description: 'Permet de valider les écritures comptables'
        },
        {
          key: 'cloturerPeriodes',
          label: 'Clôturer les périodes',
          description: 'Permet de clôturer les périodes comptables'
        },
        {
          key: 'genererEtatsFinanciers',
          label: 'Générer les états financiers',
          description: 'Permet de générer les états financiers (bilan, compte de résultat, etc.)'
        },
        {
          key: 'superviserComptes',
          label: 'Superviser les comptes',
          description: 'Permet de superviser l\'ensemble des comptes comptables'
        },
        {
          key: 'saisirEcritures',
          label: 'Saisir les écritures',
          description: 'Permet de saisir des écritures comptables'
        },
        {
          key: 'gererFactures',
          label: 'Gérer les factures',
          description: 'Permet de créer et gérer les factures'
        },
        {
          key: 'suivrePaiements',
          label: 'Suivre les paiements',
          description: 'Permet de suivre et enregistrer les paiements'
        },
        {
          key: 'gererTresorerie',
          label: 'Gérer la trésorerie',
          description: 'Permet de gérer la trésorerie de l\'entreprise'
        }
      ]
    },
    {
      name: 'Contrôle de gestion',
      icon: 'insights',
      permissions: [
        {
          key: 'analyserDepensesRecettes',
          label: 'Analyser les dépenses et recettes',
          description: 'Permet d\'analyser les dépenses et recettes de l\'entreprise'
        },
        {
          key: 'genererRapportsPerformance',
          label: 'Générer des rapports de performance',
          description: 'Permet de générer des rapports de performance financière'
        },
        {
          key: 'comparerBudgetRealise',
          label: 'Comparer budget et réalisé',
          description: 'Permet de comparer le budget prévisionnel avec les réalisations'
        }
      ]
    },
    {
      name: 'Employés',
      icon: 'people',
      permissions: [
        {
          key: 'saisirNotesFrais',
          label: 'Saisir des notes de frais',
          description: 'Permet de saisir des notes de frais'
        },
        {
          key: 'consulterBulletinsPaie',
          label: 'Consulter les bulletins de paie',
          description: 'Permet de consulter les bulletins de paie'
        },
        {
          key: 'soumettreRemboursements',
          label: 'Soumettre des demandes de remboursement',
          description: 'Permet de soumettre des demandes de remboursement'
        }
      ]
    },
    {
      name: 'Clients et Fournisseurs',
      icon: 'business',
      permissions: [
        {
          key: 'accesFacturesPaiements',
          label: 'Accéder aux factures et paiements',
          description: 'Permet d\'accéder aux factures et paiements'
        },
        {
          key: 'telechargerDocuments',
          label: 'Télécharger des documents',
          description: 'Permet de télécharger des documents'
        },
        {
          key: 'communiquerComptabilite',
          label: 'Communiquer avec la comptabilité',
          description: 'Permet de communiquer avec le service comptable'
        }
      ]
    }
  ];

  ngOnInit(): void {
    // Initialisation
  }

  togglePermission(key: string): void {
    // Vérifier si les permissions existent
    if (!this.role.permissions) {
      this.role.permissions = {};
    }

    this.role.permissions[key as keyof Role['permissions']] =
      !this.role.permissions[key as keyof Role['permissions']];
    this.permissionsChanged.emit(this.role.permissions);
  }

  isPermissionEnabled(key: string): boolean {
    // Vérifier si les permissions existent
    if (!this.role.permissions) {
      return false;
    }

    return this.role.permissions[key as keyof Role['permissions']] === true;
  }

  selectAllInGroup(group: PermissionGroup): void {
    // Vérifier si les permissions existent
    if (!this.role.permissions) {
      this.role.permissions = {};
    }

    const allEnabled = group.permissions.every(p => this.isPermissionEnabled(p.key));

    group.permissions.forEach(permission => {
      this.role.permissions[permission.key as keyof Role['permissions']] = !allEnabled;
    });

    this.permissionsChanged.emit(this.role.permissions);
  }

  getGroupStatus(group: PermissionGroup): string {
    const enabledCount = group.permissions.filter(p => this.isPermissionEnabled(p.key)).length;
    const totalCount = group.permissions.length;

    if (enabledCount === 0) return 'none';
    if (enabledCount === totalCount) return 'all';
    return 'some';
  }
}
