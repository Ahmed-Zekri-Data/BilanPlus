import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  navItems = [
    { label: 'Tableau de Bord produits', route: '/dashboard' },
    { label: 'Utilisateurs', route: '/users' },
    { label: 'Facturation', route: '/facturation' },
    { label: 'Fournisseurs', route: '/fournisseurs' },
    { label: 'Commandes', route: '/commandes' },
    { label: 'Gérer produit', route: '/produits' },
    { label: 'Mouvement de Stock', route: '/mouvements' },
    { label: 'Gestion Comptable', route: '/comptabilite' },
    { label: 'Déclarations', route: '/declarations' }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
} 