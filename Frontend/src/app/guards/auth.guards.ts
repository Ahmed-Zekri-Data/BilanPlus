// auth.guards.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('AuthGuard: Vérification de l\'authentification');

    // Vérifier si l'utilisateur est connecté
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('AuthGuard: Résultat de isLoggedIn():', isLoggedIn);

    if (isLoggedIn) {
      console.log('AuthGuard: Utilisateur authentifié, accès autorisé');
      return true;
    } else {
      console.warn('AuthGuard: Utilisateur non authentifié, redirection vers la page de connexion');

      // Nettoyer les données de session si elles existent
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');

      // Stocker l'URL actuelle pour y revenir après la connexion
      const currentUrl = this.router.url;
      if (currentUrl && currentUrl !== '/login') {
        sessionStorage.setItem('redirectUrl', currentUrl);
      }

      // Rediriger vers la page de connexion
      this.router.navigate(['/login']);
      return false;
    }
  }
}