import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('600ms ease-in', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal => clicked', animate('200ms ease-in')),
      transition('clicked => normal', animate('200ms ease-out'))
    ])
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  sidebarOpen = false;
  buttonState = 'normal';
  currentUser: any = null; // Placeholder for user data
  userRole: string = 'Admin'; // Placeholder for user role
  currentLanguage = 'fr'; // Langue par défaut : français

  // Traductions
  translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      welcome: 'Bienvenue sur Bilan+',
      greeting: 'Bonjour',
      rolePrefix: 'Vous êtes connecté en tant que',
      slogan: 'Simple Finance, Big Success',
      description: 'Gérez votre comptabilité avec facilité et efficacité.',
      startNow: 'Commencer Maintenant',
      features: 'Nos Fonctionnalités',
      users: 'Utilisateurs',
      usersManagement: 'Gestion des Utilisateurs et Accès',
      usersManagementDesc: 'Authentification avancée (JWT, OAuth), gestion des permissions dynamiques, audit des connexions.',
      manageUsers: 'Gérer les Utilisateurs',
      roles: 'Rôles',
      rolesManagement: 'Gestion des Rôles et Permissions',
      rolesManagementDesc: 'Créez et gérez des rôles avec des permissions personnalisées pour vos utilisateurs.',
      manageRoles: 'Gérer les Rôles',
      billing: 'Facturation',
      billingManagement: 'Gestion de la Facturation et Clients',
      billingManagementDesc: 'Création de devis, conversion en factures, suivi des paiements, relances automatiques.',
      manageBilling: 'Gérer la Facturation',
      suppliers: 'Fournisseurs',
      suppliersManagement: 'Gestion des Fournisseurs et Achats',
      suppliersManagementDesc: 'Création et suivi des commandes, validation automatique selon les stocks.',
      manageSuppliers: 'Gérer les Fournisseurs',
      stocks: 'Stocks',
      stocksManagement: 'Gestion des Produits et Stocks',
      stocksManagementDesc: 'Gestion des stocks avec alertes, automatisation des réapprovisionnements.',
      manageStocks: 'Gérer les Stocks',
      accounting: 'Gestion Comptable',
      accountingManagement: 'Gestion Comptable et Transactions',
      accountingManagementDesc: 'Gestion du plan comptable tunisien, saisie automatique des écritures, calculs de bilan.',
      manageAccounting: 'Gérer la Comptabilité',
      declarations: 'Déclarations',
      declarationsManagement: 'Gestion des Déclarations et TVA',
      declarationsManagementDesc: 'Calcul automatique de la TVA, génération des déclarations, alertes pour les délais.',
      manageDeclarations: 'Gérer les Déclarations',
      logout: 'Déconnexion',
      allRightsReserved: 'Tous droits réservés',
      languageToggle: 'Passer à l\'anglais'
    },
    en: {
      welcome: 'Welcome to Bilan+',
      greeting: 'Hello',
      rolePrefix: 'You are logged in as',
      slogan: 'Simple Finance, Big Success',
      description: 'Manage your accounting with ease and efficiency.',
      startNow: 'Start Now',
      features: 'Our Features',
      users: 'Users',
      usersManagement: 'User and Access Management',
      usersManagementDesc: 'Advanced authentication (JWT, OAuth), dynamic permission management, connection audit.',
      manageUsers: 'Manage Users',
      roles: 'Roles',
      rolesManagement: 'Role and Permission Management',
      rolesManagementDesc: 'Create and manage roles with customized permissions for your users.',
      manageRoles: 'Manage Roles',
      billing: 'Billing',
      billingManagement: 'Billing and Client Management',
      billingManagementDesc: 'Create quotes, convert to invoices, track payments, automated reminders.',
      manageBilling: 'Manage Billing',
      suppliers: 'Suppliers',
      suppliersManagement: 'Supplier and Purchase Management',
      suppliersManagementDesc: 'Create and track orders, automatic validation based on stock levels.',
      manageSuppliers: 'Manage Suppliers',
      stocks: 'Stocks',
      stocksManagement: 'Product and Stock Management',
      stocksManagementDesc: 'Stock management with alerts, automated restocking.',
      manageStocks: 'Manage Stocks',
      accounting: 'Accounting Management',
      accountingManagement: 'Accounting and Transaction Management',
      accountingManagementDesc: 'Manage the Tunisian accounting plan, automatic entry recording, balance calculations.',
      manageAccounting: 'Manage Accounting',
      declarations: 'Declarations',
      declarationsManagement: 'Declaration and VAT Management',
      declarationsManagementDesc: 'Automatic VAT calculation, declaration generation, deadline alerts.',
      manageDeclarations: 'Manage Declarations',
      logout: 'Logout',
      allRightsReserved: 'All rights reserved',
      languageToggle: 'Switch to French'
    }
  };

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('HomeComponent initialized');
    // Placeholder: Fetch current user and role (e.g., from a service or local storage)
    this.currentUser = { email: 'user@example.com' }; // Replace with actual user data
    this.userRole = 'Admin'; // Replace with actual role
  }

  toggleSidebar(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
      this.sidebarOpen = !this.sidebarOpen;
      console.log('Sidebar toggled, open:', this.sidebarOpen);
    }
  }

  onButtonClick(): void {
    this.buttonState = this.buttonState === 'normal' ? 'clicked' : 'normal';
    console.log('Button clicked, state:', this.buttonState);
  }

  logout(): void {
    console.log('Logging out');
    this.router.navigate(['/login']).then(success => {
      console.log('Navigation to /login:', success ? 'Success' : 'Failed');
    });
  }

  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'fr' ? 'en' : 'fr';
    console.log('Language toggled to:', this.currentLanguage);
  }

  getTranslation(key: string): string {
    return this.translations[this.currentLanguage][key];
  }
}