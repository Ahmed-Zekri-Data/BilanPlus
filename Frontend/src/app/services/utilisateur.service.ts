import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Utilisateur, UtilisateurResponse } from '../Models/Utilisateur';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:3000/user';

  // utilisateurs array will be populated by backend calls
  private utilisateurs: Utilisateur[] = [];

  constructor(private http: HttpClient, private roleService: RoleService) {}

  getUtilisateurs(): Observable<UtilisateurResponse> {
    console.log('UtilisateurService: Récupération de tous les utilisateurs depuis le backend');

    // Appeler l'API backend pour récupérer les utilisateurs
    // L'intercepteur se chargera d'ajouter le token
    return this.http.get<any>(`${this.apiUrl}/getall`).pipe(
      map((response: any) => {
        console.log('UtilisateurService: Utilisateurs récupérés du backend:', response);

        // Mettre à jour la liste locale avec les données du backend
        if (response.utilisateurs) {
          this.utilisateurs = response.utilisateurs;
        } else {
          // S'il n'y a pas d'utilisateurs dans la réponse, vider la liste locale
          this.utilisateurs = [];
        }

        return {
          utilisateurs: this.utilisateurs, // Toujours retourner la liste mise à jour (ou vide)
          message: response.message || 'Utilisateurs récupérés avec succès'
        };
      }),
      catchError((error: any) => {
        console.error('UtilisateurService: Erreur lors de la récupération des utilisateurs:', error);
        // Propager l'erreur pour que le composant puisse la gérer
        return throwError(() => new Error(error.error?.message || error.message || 'Erreur serveur lors de la récupération des utilisateurs'));
      })
    );
  }

  getUtilisateurById(id: string): Observable<any> {
    console.log(`UtilisateurService: Récupération de l'utilisateur avec l'ID ${id}`);

    // Récupérer l'utilisateur connecté depuis le localStorage
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser && currentUser.user) {
          console.log('UtilisateurService: Utilisateur récupéré depuis le localStorage:', currentUser.user);

          // Vérifier si l'ID correspond à l'utilisateur connecté
          if (id === currentUser.user._id || !id) {
            // Si le rôle est un ID (chaîne de caractères), récupérer l'objet Role complet
            if (currentUser.user.role && typeof currentUser.user.role === 'string') {
              return this.roleService.getRoleById(currentUser.user.role).pipe(
                switchMap(role => {
                  // Mettre à jour l'utilisateur avec l'objet Role complet
                  const utilisateurAvecRole = {
                    ...currentUser.user,
                    role: role
                  };

                  // Retourner l'utilisateur au format attendu par le composant
                  return of({
                    utilisateur: utilisateurAvecRole
                  });
                })
              );
            }

            // Si le rôle est déjà un objet Role, retourner l'utilisateur directement
            return of({
              utilisateur: currentUser.user
            });
          }
        }
      }
    } catch (error) {
      console.error('UtilisateurService: Erreur lors de la récupération des informations utilisateur:', error);
    }

    // Chercher l'utilisateur dans la liste des utilisateurs
    const utilisateur = this.utilisateurs.find(u => u._id === id);
    if (utilisateur) {
      console.log(`UtilisateurService: Utilisateur trouvé avec l'ID ${id}:`, utilisateur);

      // Si le rôle est un ID (chaîne de caractères), récupérer l'objet Role complet
      if (utilisateur.role && typeof utilisateur.role === 'string') {
        return this.roleService.getRoleById(utilisateur.role).pipe(
          switchMap(role => {
            // Mettre à jour l'utilisateur avec l'objet Role complet
            const utilisateurAvecRole = {
              ...utilisateur,
              role: role
            };

            // Retourner l'utilisateur au format attendu par le composant
            return of({
              utilisateur: utilisateurAvecRole
            });
          })
        );
      }

      // Si le rôle est déjà un objet Role, retourner l'utilisateur directement
      return of({
        utilisateur: utilisateur
      });
    }

    // Si l'utilisateur n'est pas trouvé, retourner un utilisateur par défaut
    console.log(`UtilisateurService: Aucun utilisateur trouvé avec l'ID ${id}, retour de l'utilisateur par défaut`);
    return of({
      utilisateur: this.utilisateurs[1] // Utilisateur simple par défaut
    });
  }

  createUtilisateur(utilisateur: Partial<Utilisateur>): Observable<any> {
    console.log('UtilisateurService: Création d\'un nouvel utilisateur', utilisateur);

    // Préparer les données pour l'API backend
    const userData = {
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      password: utilisateur.password,
      role: utilisateur.role,
      telephone: utilisateur.telephone || '',
      adresse: utilisateur.adresse || '',
      actif: utilisateur.actif !== undefined ? utilisateur.actif : true
    };

    console.log('UtilisateurService: Données envoyées au backend:', userData);

    // Appeler l'API backend pour créer l'utilisateur
    // L'intercepteur se chargera d'ajouter le token et Content-Type si nécessaire (HttpClient le fait souvent par défaut pour JSON)
    return this.http.post<any>(`${this.apiUrl}/add`, userData).pipe(
      map((response: any) => {
        console.log('UtilisateurService: Réponse du backend:', response);

        if (response.utilisateur) {
          // Ajouter l'utilisateur à la liste locale pour la cohérence
          this.utilisateurs.push(response.utilisateur);
          console.log('UtilisateurService: Utilisateur ajouté à la liste locale');
        }

        return {
          success: true,
          message: response.message || 'Utilisateur créé avec succès',
          utilisateur: response.utilisateur
        };
      }),
      catchError((error: any) => {
        console.error('UtilisateurService: Erreur lors de la création:', error);

        let errorMessage = 'Erreur lors de la création de l\'utilisateur';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Données invalides ou email déjà utilisé';
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

  updateUtilisateur(id: string, utilisateur: Partial<Utilisateur>): Observable<any> {
    console.log(`UtilisateurService: Mise à jour de l'utilisateur avec l'ID ${id}`, utilisateur);

    // Si le rôle est un ID (chaîne de caractères), récupérer l'objet Role complet
    if (utilisateur.role && typeof utilisateur.role === 'string') {
      return this.roleService.getRoleById(utilisateur.role).pipe(
        switchMap(role => {
          // Mettre à jour le rôle avec l'objet Role complet
          const utilisateurAvecRole = {
            ...utilisateur,
            role: role
          };

          // Continuer avec la mise à jour normale
          return this.updateUtilisateurInterne(id, utilisateurAvecRole as Partial<Utilisateur>);
        })
      );
    } else {
      // Si le rôle est déjà un objet Role ou n'est pas fourni, continuer avec la mise à jour normale
      return this.updateUtilisateurInterne(id, utilisateur);
    }
  }

  private updateUtilisateurInterne(id: string, utilisateur: Partial<Utilisateur>): Observable<any> {
    // S'assurer que les champs téléphone et adresse sont correctement définis
    const utilisateurComplet = {
      ...utilisateur,
      telephone: utilisateur.telephone || '', // Définir une chaîne vide si non défini
      adresse: utilisateur.adresse || '' // Définir une chaîne vide si non défini
    };

    console.log('UtilisateurService: Utilisateur avec champs complétés pour mise à jour:', utilisateurComplet);

    // Récupérer l'utilisateur connecté depuis le localStorage
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUserData = JSON.parse(currentUserStr);
        if (currentUserData && currentUserData.user) {
          // Vérifier si l'ID correspond à l'utilisateur connecté
          if (id === currentUserData.user._id || !id) {
            // Mettre à jour les données de l'utilisateur
            const updatedUser = {
              ...currentUserData.user,
              ...utilisateurComplet,
              _id: id || currentUserData.user._id
            };

            // Générer un nouveau token JWT avec les données mises à jour
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({
              id: updatedUser._id,
              email: updatedUser.email,
              role: typeof updatedUser.role === 'object' ? updatedUser.role._id : updatedUser.role,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Expire dans 24 heures
            }));
            const signature = btoa('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'); // Simuler une signature

            const token = `${header}.${payload}.${signature}`;
            console.log('UtilisateurService: Nouveau token JWT généré:', token);

            // Mettre à jour le localStorage
            localStorage.setItem('currentUser', JSON.stringify({
              ...currentUserData,
              user: updatedUser,
              token: token
            }));
            localStorage.setItem('token', token);

            console.log('UtilisateurService: Utilisateur mis à jour dans le localStorage:', updatedUser);

            // Pour le développement, simuler une réponse réussie
            return of({
              success: true,
              message: 'Utilisateur mis à jour avec succès',
              utilisateur: updatedUser
            });
          }
        }
      }
    } catch (error) {
      console.error('UtilisateurService: Erreur lors de la mise à jour des informations utilisateur:', error);
    }

    // Chercher l'utilisateur dans la liste des utilisateurs
    const index = this.utilisateurs.findIndex(u => u._id === id);
    if (index !== -1) {
      // Mettre à jour l'utilisateur
      const updatedUser = {
        ...this.utilisateurs[index],
        ...utilisateurComplet,
        _id: id
      };

      // Remplacer l'utilisateur dans la liste
      this.utilisateurs[index] = updatedUser as Utilisateur;

      console.log(`UtilisateurService: Utilisateur avec l'ID ${id} mis à jour:`, updatedUser);
      console.log('UtilisateurService: Liste des utilisateurs mise à jour:', this.utilisateurs);

      return of({
        success: true,
        message: 'Utilisateur mis à jour avec succès',
        utilisateur: updatedUser
      });
    }

    // Si l'utilisateur n'est pas trouvé, simuler une réponse réussie
    return of({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      utilisateur: {
        ...utilisateurComplet,
        _id: id
      }
    });
  }

  deleteUtilisateur(id: string): Observable<any> {
    console.log(`UtilisateurService: Suppression de l'utilisateur avec l'ID ${id}`);

    // Chercher l'utilisateur dans la liste des utilisateurs
    const index = this.utilisateurs.findIndex(u => u._id === id);
    if (index !== -1) {
      // Supprimer l'utilisateur de la liste
      const deletedUser = this.utilisateurs.splice(index, 1)[0];

      console.log(`UtilisateurService: Utilisateur avec l'ID ${id} supprimé:`, deletedUser);
      console.log('UtilisateurService: Liste des utilisateurs mise à jour:', this.utilisateurs);
    } else {
      console.log(`UtilisateurService: Aucun utilisateur trouvé avec l'ID ${id}`);
    }

    // Pour le développement, simuler une réponse réussie
    return of({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  }

  resetLoginAttempts(id: string): Observable<any> {
    console.log(`UtilisateurService: Réinitialisation des tentatives de connexion pour l'utilisateur avec l'ID ${id}`);

    // Pour le développement, simuler une réponse réussie
    return of({
      success: true,
      message: 'Tentatives de connexion réinitialisées avec succès'
    });
  }

  toggleUserStatus(id: string, actif: boolean): Observable<any> {
    console.log(`UtilisateurService: Changement de statut pour l'utilisateur ${id} à ${actif}`);

    // Pour le développement, simuler une réponse réussie
    return of({
      success: true,
      message: `Statut de l'utilisateur modifié avec succès`,
      utilisateur: {
        _id: id,
        actif: actif
      }
    });
  }

  getUserStatistics(): Observable<any> {
    console.log('UtilisateurService: Récupération des statistiques utilisateurs');

    // Pour le développement, simuler une réponse réussie avec des données fictives
    return of({
      totalUtilisateurs: 10,
      utilisateursActifs: 8,
      utilisateursInactifs: 2,
      nouveauxUtilisateurs: 3,
      connexionsAujourdhui: 5,
      rolesDistribution: [
        { role: 'Administrateur', count: 2 },
        { role: 'Utilisateur', count: 8 }
      ]
    });
  }

  analyseUserActivity(): Observable<any> {
    console.log('UtilisateurService: Analyse de l\'activité utilisateur');

    // Pour le développement, simuler une réponse réussie avec des données fictives
    return of({
      connexionsParJour: [
        { date: '2023-01-01', count: 5 },
        { date: '2023-01-02', count: 8 },
        { date: '2023-01-03', count: 12 }
      ],
      actionsParType: [
        { type: 'Connexion', count: 25 },
        { type: 'Création', count: 10 },
        { type: 'Modification', count: 15 },
        { type: 'Suppression', count: 5 }
      ]
    });
  }

  exportToCSV(): Observable<Blob> {
    console.log('UtilisateurService: Début de l\'exportation CSV');

    // Pour le développement, simuler une réponse réussie avec des données fictives
    const csvData = 'ID,Nom,Prénom,Email,Rôle,Actif\n' +
                   '1,Admin,Super,admin@example.com,Administrateur,Oui\n' +
                   '2,Utilisateur,Simple,user@example.com,Utilisateur,Oui\n';

    console.log('UtilisateurService: CSV généré, longueur:', csvData.length);
    return of(new Blob([csvData], { type: 'text/csv;charset=utf-8' }));
  }

  // Méthodes pour la gestion de l'authentification à deux facteurs
  enableTwoFactor(id: string, method: string): Observable<any> {
    console.log(`UtilisateurService: Activation de l'authentification à deux facteurs pour l'utilisateur avec l'ID ${id}, méthode: ${method}`);

    // Pour le développement, simuler une réponse réussie
    return of({
      success: true,
      message: 'Authentification à deux facteurs activée avec succès',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    });
  }

  disableTwoFactor(id: string): Observable<any> {
    console.log(`UtilisateurService: Désactivation de l'authentification à deux facteurs pour l'utilisateur avec l'ID ${id}`);

    // Pour le développement, simuler une réponse réussie
    return of({
      success: true,
      message: 'Authentification à deux facteurs désactivée avec succès'
    });
  }

  verifyTwoFactor(id: string, code: string): Observable<any> {
    console.log(`UtilisateurService: Vérification du code d'authentification à deux facteurs pour l'utilisateur avec l'ID ${id}, code: ${code}`);

    // Pour le développement, simuler une réponse réussie
    return of({
      success: true,
      message: 'Code d\'authentification à deux facteurs vérifié avec succès'
    });
  }


}