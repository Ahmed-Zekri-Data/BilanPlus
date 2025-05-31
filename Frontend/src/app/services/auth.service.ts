// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, PasswordReset } from '../Models/Auth';
import { EmailService } from './email.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private apiUrl = 'http://localhost:3000/user'; // URL de l'API backend

  // Utilisateur fictif pour le développement
  private mockUser = {
    _id: '1',
    email: 'user@example.com',
    nom: 'Doe',
    prenom: 'John',
    role: {
      _id: '1',
      nom: 'Administrateur Système',
      permissions: {
        accesComplet: true,
        gererUtilisateursEtRoles: true,
        configurerSysteme: true,
        validerEcritures: true,
        cloturerPeriodes: true,
        genererEtatsFinanciers: true,
        superviserComptes: true,
        saisirEcritures: true,
        gererFactures: true,
        suivrePaiements: true,
        gererTresorerie: true,
        analyserDepensesRecettes: true,
        genererRapportsPerformance: true,
        comparerBudgetRealise: true,
        saisirNotesFrais: true,
        consulterBulletinsPaie: true,
        soumettreRemboursements: true,
        accesFacturesPaiements: true,
        telechargerDocuments: true,
        communiquerComptabilite: true
      }
    },
    actif: true,
    dernierConnexion: new Date().toISOString(),
    tentativesConnexion: 0
  };

  constructor(private http: HttpClient, private emailService: EmailService) {
    console.log('AuthService: Initialisation du service');

    try {
      // Vérifier si un utilisateur existe déjà dans le localStorage
      const existingUser = localStorage.getItem('currentUser');

      // Si aucun utilisateur n'existe ou si nous voulons forcer la réinitialisation
      if (!existingUser) {
        console.log('AuthService: Aucun utilisateur trouvé dans le localStorage. Initialisation à null.');

        // Initialiser le BehaviorSubject avec null car aucun utilisateur n'est connecté
        this.currentUserSubject = new BehaviorSubject<any>(null);
        // S'assurer qu'aucun token n'est présent si aucun utilisateur n'est stocké
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser'); // Assurer la propreté
      } else {
        // Utiliser l'utilisateur existant
        console.log('AuthService: Utilisateur trouvé dans le localStorage');
        const userData = JSON.parse(existingUser);
        // S'assurer que userData et userData.user existent avant d'accéder à userData.user
        if (userData && userData.user) {
          this.currentUserSubject = new BehaviorSubject<any>(userData.user);
        } else {
          console.warn('AuthService: Données utilisateur invalides dans localStorage, initialisation à null.');
          this.currentUserSubject = new BehaviorSubject<any>(null);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        }
      }

      // Initialiser l'Observable
      this.currentUser = this.currentUserSubject.asObservable();

      console.log('AuthService: Utilisateur initialisé:', this.currentUserSubject.value);
    } catch (error) {
      console.error('AuthService: Erreur lors de l\'initialisation du service:', error);

      // En cas d'erreur, initialiser avec des valeurs par défaut
      this.currentUserSubject = new BehaviorSubject<any>(null);
      this.currentUser = this.currentUserSubject.asObservable();

      // Réinitialiser le localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }

  // Méthode pour récupérer l'utilisateur courant depuis le BehaviorSubject
  getCurrentUserFromSubject(): Observable<any> {
    return this.currentUser;
  }

  // Méthode pour récupérer les informations détaillées de l'utilisateur connecté
  getCurrentUser(): Observable<any> {
    console.log('AuthService: Récupération des informations détaillées de l\'utilisateur connecté');

    // Pour le développement, toujours retourner l'utilisateur du BehaviorSubject
    if (this.currentUserSubject.value) {
      console.log('AuthService: Utilisateur récupéré depuis le BehaviorSubject:', this.currentUserSubject.value);
      return of(this.currentUserSubject.value);
    }

    // Si aucun utilisateur n'est dans le BehaviorSubject, essayer de le récupérer depuis le localStorage
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        console.log('AuthService: Aucun objet currentUser trouvé dans le localStorage');

        // Pour le développement, utiliser l'utilisateur fictif
        console.log('AuthService: Utilisation de l\'utilisateur fictif');

        // Créer un nouvel utilisateur fictif
        const userData = {
          user: this.mockUser,
          token: 'mock-jwt-token'
        };

        // Stocker les données dans le localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('token', 'mock-jwt-token');

        // Mettre à jour le BehaviorSubject
        this.currentUserSubject.next(userData.user);

        return of(userData.user);
      }

      const currentUser = JSON.parse(currentUserStr);
      if (!currentUser || !currentUser.user) {
        console.log('AuthService: Données utilisateur invalides dans le localStorage');

        // Pour le développement, utiliser l'utilisateur fictif
        console.log('AuthService: Utilisation de l\'utilisateur fictif');

        // Créer un nouvel utilisateur fictif
        const userData = {
          user: this.mockUser,
          token: 'mock-jwt-token'
        };

        // Stocker les données dans le localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('token', 'mock-jwt-token');

        // Mettre à jour le BehaviorSubject
        this.currentUserSubject.next(userData.user);

        return of(userData.user);
      }

      // Mettre à jour le BehaviorSubject
      this.currentUserSubject.next(currentUser.user);

      console.log('AuthService: Utilisateur récupéré depuis le localStorage:', currentUser.user);
      return of(currentUser.user);
    } catch (error) {
      console.error('AuthService: Erreur lors de la récupération des informations utilisateur:', error);

      // Pour le développement, utiliser l'utilisateur fictif
      console.log('AuthService: Utilisation de l\'utilisateur fictif suite à une erreur');

      // Créer un nouvel utilisateur fictif
      const userData = {
        user: this.mockUser,
        token: 'mock-jwt-token'
      };

      // Stocker les données dans le localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('token', 'mock-jwt-token');

      // Mettre à jour le BehaviorSubject
      this.currentUserSubject.next(userData.user);

      return of(userData.user);
    }
  }

  isLoggedIn(): boolean {
    console.log('AuthService: Vérification de l\'authentification');

    // Vérifier si l'utilisateur est dans le BehaviorSubject
    if (!this.currentUserSubject.value) {
      console.log('AuthService: Aucun utilisateur dans le BehaviorSubject');
      return false;
    }

    // Vérifier si le token existe
    const token = this.getToken();
    if (!token) {
      console.log('AuthService: Aucun token trouvé');
      return false;
    }

    // Vérifier si l'utilisateur existe dans le localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      console.log('AuthService: Aucun utilisateur dans le localStorage');
      return false;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (!currentUser || !currentUser.user) {
        console.log('AuthService: Données utilisateur invalides');
        return false;
      }
    } catch (error) {
      console.error('AuthService: Erreur lors de la vérification des données utilisateur:', error);
      return false;
    }

    console.log('AuthService: Utilisateur authentifié');
    return true;
  }

  getToken(): string | null {
    // Pour le développement, retourner simplement le token du localStorage
    return localStorage.getItem('token');
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService: Tentative de connexion avec', credentials.email);

    // Appeler le vrai backend pour l'authentification
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      map((response: any) => {
        console.log('AuthService: Réponse du backend:', response);

        if (response.token && response.user) {
          // Stocker les données dans le localStorage
          const userData = {
            token: response.token,
            user: response.user
          };

          localStorage.setItem('currentUser', JSON.stringify(userData));
          localStorage.setItem('token', response.token);

          // Mettre à jour le BehaviorSubject
          this.currentUserSubject.next(response.user);

          console.log('AuthService: Connexion réussie pour', credentials.email);
          return userData as LoginResponse;
        } else {
          throw new Error('Réponse invalide du serveur');
        }
      }),
      catchError((error: any) => {
        console.error('AuthService: Erreur de connexion:', error);

        let errorMessage = 'Erreur de connexion';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 403) {
          errorMessage = 'Compte désactivé. Contactez l\'administrateur';
        } else if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    console.log('AuthService: Début de la déconnexion');

    try {
      // Supprimer les données de l'utilisateur du localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      console.log('AuthService: Données supprimées du localStorage');

      // Mettre à jour le BehaviorSubject pour notifier tous les abonnés
      this.currentUserSubject.next(null);
      console.log('AuthService: BehaviorSubject mis à jour avec null');

      // Vérifier que les données ont bien été supprimées
      const remainingUser = localStorage.getItem('currentUser');
      const remainingToken = localStorage.getItem('token');

      if (remainingUser || remainingToken) {
        console.warn('AuthService: Certaines données n\'ont pas été supprimées correctement');
        // Forcer la suppression
        localStorage.clear();
      }

      console.log('AuthService: Déconnexion terminée avec succès');

    } catch (error) {
      console.error('AuthService: Erreur lors de la déconnexion:', error);

      // En cas d'erreur, forcer la suppression de toutes les données
      try {
        localStorage.clear();
        this.currentUserSubject.next(null);
      } catch (clearError) {
        console.error('AuthService: Erreur lors du nettoyage forcé:', clearError);
      }
    }
  }

  requestPasswordReset(email: string): Observable<any> {
    console.log('AuthService: Demande de réinitialisation de mot de passe pour', email);

    // Appeler directement le backend pour envoyer un vrai email
    return this.http.post<any>(`${this.apiUrl}/request-password-reset`, { email })
      .pipe(
        map((response: any) => {
          console.log('AuthService: Réponse du backend:', response);
          return {
            success: true,
            message: response.message || `Email de réinitialisation envoyé à ${email}`
          };
        }),
        catchError((error: any) => {
          console.error('AuthService: Erreur lors de la demande de réinitialisation:', error);
          return throwError(() => ({
            success: false,
            message: error.error?.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation'
          }));
        })
      );
  }

  resetPassword(data: PasswordReset): Observable<any> {
    console.log('AuthService: Réinitialisation du mot de passe avec token');

    // Appeler directement le backend pour réinitialiser le mot de passe
    return this.http.post<any>(`${this.apiUrl}/reset-password`, {
      token: data.token,
      newPassword: data.newPassword,
      email: data.email
    }).pipe(
      map((response: any) => {
        console.log('AuthService: Mot de passe réinitialisé avec succès:', response);
        return {
          success: true,
          message: response.message || 'Mot de passe réinitialisé avec succès'
        };
      }),
      catchError((error: any) => {
        console.error('AuthService: Erreur lors de la réinitialisation:', error);
        return throwError(() => ({
          success: false,
          message: error.error?.message || 'Erreur lors de la réinitialisation du mot de passe'
        }));
      })
    );
  }

  /**
   * Vérifie si un email existe dans le système
   * En production, ceci devrait interroger la base de données
   */
  private checkIfEmailExists(email: string): boolean {
    // Pour le développement, simuler que certains emails existent
    const existingEmails = [
      'user@example.com',
      'admin@example.com',
      'test@example.com',
      this.mockUser.email
    ];

    return existingEmails.includes(email.toLowerCase());
  }
}