import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Role } from '../Models/Role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:3000/roles';
  
  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    console.log('RoleService: Récupération de tous les rôles depuis le backend');

    // Obtenir le token d'authentification
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Appeler l'API backend pour récupérer les rôles
    return this.http.get<Role[]>(this.apiUrl, { headers }).pipe(
      map((roles: Role[]) => {
        console.log('RoleService: Rôles récupérés du backend:', roles);
        return roles;
      }),
      catchError((error: any) => {
        console.error('RoleService: Erreur lors de la récupération:', error);
        
        // En cas d'erreur, retourner des rôles par défaut
        console.log('RoleService: Utilisation des rôles par défaut en fallback');
        const defaultRoles: Role[] = [
          {
            _id: '1',
            nom: 'Administrateur Système',
            description: 'Accès complet à toutes les fonctionnalités du système',
            permissions: {
              gererUtilisateursEtRoles: true,
              consulterTableauBord: true,
              gererComptes: true
            },
            actif: true
          },
          {
            _id: '2',
            nom: 'Utilisateur Standard',
            description: 'Utilisateur avec permissions de base',
            permissions: {
              gererUtilisateursEtRoles: false,
              consulterTableauBord: true,
              gererComptes: false
            },
            actif: true
          }
        ];
        
        return of(defaultRoles);
      })
    );
  }

  getRoleById(id: string): Observable<Role> {
    console.log(`RoleService: Récupération du rôle avec l'ID ${id}`);

    return this.getRoles().pipe(
      map((roles: Role[]) => {
        const role = roles.find((r: Role) => r._id === id);
        
        if (role) {
          console.log(`RoleService: Rôle trouvé avec l'ID ${id}:`, role);
          return role;
        }

        // Si le rôle n'est pas trouvé, retourner un rôle par défaut
        console.log(`RoleService: Aucun rôle trouvé avec l'ID ${id}, retour du rôle par défaut`);
        const defaultRole: Role = {
          _id: '2',
          nom: 'Utilisateur Standard',
          description: 'Utilisateur avec permissions de base',
          permissions: {
            gererUtilisateursEtRoles: false,
            consulterTableauBord: true,
            gererComptes: false
          },
          actif: true
        };
        return defaultRole;
      })
    );
  }

  createRole(role: Partial<Role>): Observable<Role> {
    console.log('RoleService: Création d\'un nouveau rôle', role);

    // Préparer les données pour l'API backend
    const roleData = {
      nom: role.nom,
      description: role.description,
      permissions: role.permissions,
      actif: role.actif !== undefined ? role.actif : true
    };

    console.log('RoleService: Données envoyées au backend:', roleData);

    // Obtenir le token d'authentification
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Appeler l'API backend pour créer le rôle
    return this.http.post<any>(this.apiUrl, roleData, { headers }).pipe(
      map((response: any) => {
        console.log('RoleService: Réponse du backend:', response);
        return response.role;
      }),
      catchError((error: any) => {
        console.error('RoleService: Erreur lors de la création:', error);
        
        let errorMessage = 'Erreur lors de la création du rôle';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Données invalides ou rôle déjà existant';
        } else if (error.status === 401) {
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          errorMessage = 'Permissions insuffisantes';
        } else if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    console.log(`RoleService: Mise à jour du rôle avec l'ID ${id}`, role);

    // Obtenir le token d'authentification
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Appeler l'API backend pour mettre à jour le rôle
    return this.http.put<any>(`${this.apiUrl}/${id}`, role, { headers }).pipe(
      map((response: any) => {
        console.log('RoleService: Rôle mis à jour:', response);
        return response.role;
      }),
      catchError((error: any) => {
        console.error('RoleService: Erreur lors de la mise à jour:', error);
        return throwError(() => new Error('Erreur lors de la mise à jour du rôle'));
      })
    );
  }

  deleteRole(id: string): Observable<void> {
    console.log(`RoleService: Suppression du rôle avec l'ID ${id}`);

    // Obtenir le token d'authentification
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Appeler l'API backend pour supprimer le rôle
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((error: any) => {
        console.error('RoleService: Erreur lors de la suppression:', error);
        return throwError(() => new Error('Erreur lors de la suppression du rôle'));
      })
    );
  }

  getUsersPerRole(): Observable<any[]> {
    console.log('RoleService: Récupération des statistiques d\'utilisateurs par rôle');

    // Pour le développement, simuler une réponse réussie avec des données fictives
    const mockStats = [
      { role: 'Administrateur Système', count: 1 },
      { role: 'Utilisateur Standard', count: 5 }
    ];

    return of(mockStats);
  }

  analysePermissionsUsage(): Observable<any> {
    console.log('RoleService: Analyse de l\'utilisation des permissions');

    // Pour le développement, simuler une réponse réussie avec des données fictives
    const mockAnalysis = {
      permissionsUtilisees: [
        { permission: 'gererUtilisateursEtRoles', count: 1 },
        { permission: 'consulterTableauBord', count: 6 },
        { permission: 'gererComptes', count: 1 }
      ],
      rolesActifs: 2,
      rolesInactifs: 0
    };

    return of(mockAnalysis);
  }
}
