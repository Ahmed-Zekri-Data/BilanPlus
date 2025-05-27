import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private mockUser = {
    _id: '1',
    email: 'user@example.com',
    prenom: 'John',
    nom: 'Doe',
    telephone: '+216 12 345 678',
    adresse: '123 Rue Principale, Tunis',
    role: { nom: 'Administrateur' },
    dernierConnexion: new Date().toISOString(),
    dateCreation: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString()
  };

  constructor() {
    // Initialiser le localStorage avec un utilisateur fictif pour le développement
    if (!localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify({
        user: this.mockUser,
        token: 'mock-jwt-token'
      }));
      localStorage.setItem('token', 'mock-jwt-token');
    }
  }

  getCurrentUser(): Observable<any> {
    return of(this.mockUser);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  }
}
