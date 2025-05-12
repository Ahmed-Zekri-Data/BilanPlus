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
    // Vérifier si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      console.log('Utilisateur authentifié, accès autorisé');
      return true;
    } else {
      console.warn('Utilisateur non authentifié, redirection vers la page de connexion');

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