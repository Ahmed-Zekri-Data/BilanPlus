import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private authService: AuthService) {}

  /**
   * Vérifie si l'utilisateur connecté a une permission spécifique
   * @param permission La permission à vérifier
   * @returns Observable<boolean> True si l'utilisateur a la permission, false sinon
   */
  hasPermission(permission: string): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) {
          console.log('PermissionService: Aucun utilisateur connecté');
          return false;
        }

        if (!user.role) {
          console.log('PermissionService: L\'utilisateur n\'a pas de rôle');
          return false;
        }

        // Si le rôle est une chaîne de caractères (ID), considérer que l'utilisateur a toutes les permissions
        // pour le développement
        if (typeof user.role === 'string') {
          console.log(`PermissionService: Le rôle est un ID (${user.role}), permission ${permission} accordée pour le développement`);
          return true;
        }

        // Si l'utilisateur a un accès complet, il a toutes les permissions
        if (user.role.permissions && user.role.permissions.accesComplet) {
          console.log(`PermissionService: L'utilisateur a un accès complet, permission ${permission} accordée`);
          return true;
        }

        // Vérifier la permission spécifique
        if (user.role.permissions && user.role.permissions[permission]) {
          console.log(`PermissionService: Permission ${permission} accordée`);
          return true;
        }

        console.log(`PermissionService: Permission ${permission} refusée`);
        return false;
      })
    );
  }

  /**
   * Vérifie si l'utilisateur connecté a au moins une des permissions spécifiées
   * @param permissions Liste des permissions à vérifier
   * @returns Observable<boolean> True si l'utilisateur a au moins une des permissions, false sinon
   */
  hasAnyPermission(permissions: string[]): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) {
          console.log('PermissionService: Aucun utilisateur connecté');
          return false;
        }

        if (!user.role) {
          console.log('PermissionService: L\'utilisateur n\'a pas de rôle');
          return false;
        }

        // Si le rôle est une chaîne de caractères (ID), considérer que l'utilisateur a toutes les permissions
        // pour le développement
        if (typeof user.role === 'string') {
          console.log(`PermissionService: Le rôle est un ID (${user.role}), permissions accordées pour le développement`);
          return true;
        }

        // Si l'utilisateur a un accès complet, il a toutes les permissions
        if (user.role.permissions && user.role.permissions.accesComplet) {
          console.log(`PermissionService: L'utilisateur a un accès complet, permissions accordées`);
          return true;
        }

        // Vérifier si l'utilisateur a au moins une des permissions spécifiées
        for (const permission of permissions) {
          if (user.role.permissions && user.role.permissions[permission]) {
            console.log(`PermissionService: Permission ${permission} accordée`);
            return true;
          }
        }

        console.log(`PermissionService: Aucune des permissions requises n'est accordée`);
        return false;
      })
    );
  }

  /**
   * Vérifie si l'utilisateur connecté a toutes les permissions spécifiées
   * @param permissions Liste des permissions à vérifier
   * @returns Observable<boolean> True si l'utilisateur a toutes les permissions, false sinon
   */
  hasAllPermissions(permissions: string[]): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) {
          console.log('PermissionService: Aucun utilisateur connecté');
          return false;
        }

        if (!user.role) {
          console.log('PermissionService: L\'utilisateur n\'a pas de rôle');
          return false;
        }

        // Si le rôle est une chaîne de caractères (ID), considérer que l'utilisateur a toutes les permissions
        // pour le développement
        if (typeof user.role === 'string') {
          console.log(`PermissionService: Le rôle est un ID (${user.role}), toutes les permissions accordées pour le développement`);
          return true;
        }

        // Si l'utilisateur a un accès complet, il a toutes les permissions
        if (user.role.permissions && user.role.permissions.accesComplet) {
          console.log(`PermissionService: L'utilisateur a un accès complet, permissions accordées`);
          return true;
        }

        // Vérifier si l'utilisateur a toutes les permissions spécifiées
        for (const permission of permissions) {
          if (!user.role.permissions || !user.role.permissions[permission]) {
            console.log(`PermissionService: Permission ${permission} refusée`);
            return false;
          }
        }

        console.log(`PermissionService: Toutes les permissions requises sont accordées`);
        return true;
      })
    );
  }

  /**
   * Récupère la liste des permissions de l'utilisateur connecté
   * @returns Observable<string[]> Liste des permissions de l'utilisateur
   */
  getUserPermissions(): Observable<string[]> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user || !user.role) {
          return [];
        }

        // Si le rôle est une chaîne de caractères (ID), retourner toutes les permissions possibles
        // pour le développement
        if (typeof user.role === 'string') {
          console.log(`PermissionService: Le rôle est un ID (${user.role}), retour de toutes les permissions pour le développement`);
          return [
            'accesComplet',
            'gererUtilisateursEtRoles',
            'configurerSysteme',
            'validerEcritures',
            'cloturerPeriodes',
            'genererEtatsFinanciers',
            'superviserComptes',
            'saisirEcritures',
            'gererFactures',
            'suivrePaiements',
            'gererTresorerie',
            'analyserDepensesRecettes',
            'genererRapportsPerformance',
            'comparerBudgetRealise',
            'saisirNotesFrais',
            'consulterBulletinsPaie',
            'soumettreRemboursements',
            'accesFacturesPaiements',
            'telechargerDocuments',
            'communiquerComptabilite'
          ];
        }

        if (!user.role.permissions) {
          return [];
        }

        // Récupérer toutes les permissions actives
        return Object.keys(user.role.permissions).filter(key => user.role.permissions[key]);
      })
    );
  }
}
