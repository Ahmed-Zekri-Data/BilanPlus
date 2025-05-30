import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  navItems = [
   
    { label: 'Fournisseurs', route: '/fournisseurs' },
    { label: 'Commandes', route: '/commandes' },
    { label: 'Devis', route: '/devis' }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
} 