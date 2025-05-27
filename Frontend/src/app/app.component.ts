import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Bilan+';
  currentRoute: string = '';

  constructor(private router: Router) {
    // Initialiser la route actuelle
    this.currentRoute = this.router.url;
    console.log('Route initiale:', this.currentRoute);
    console.log('Afficher la barre de navigation (initial):', this.shouldShowNav());

    // S'abonner aux événements de navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      console.log('Navigation vers:', this.currentRoute);
      console.log('Afficher la barre de navigation:', this.shouldShowNav());
    });
  }

  shouldShowNav(): boolean {
    // Ne pas afficher la barre de navigation sur les pages de connexion et de mot de passe oublié
    const excludedRoutes = ['/login', '/forgot-password', '/reset-password'];
    
    // Si la route actuelle est vide, considérer qu'on est sur la page d'accueil
    if (!this.currentRoute || this.currentRoute === '/' || this.currentRoute === '') {
      return true;
    }
    
    // Vérifier si la route actuelle est dans la liste des routes exclues
    const shouldHideNav = excludedRoutes.some(route => this.currentRoute.startsWith(route));
    console.log('shouldShowNav:', !shouldHideNav, 'pour la route:', this.currentRoute);
    return !shouldHideNav;
  }
}
