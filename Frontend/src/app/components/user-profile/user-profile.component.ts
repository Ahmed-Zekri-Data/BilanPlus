import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('expandPanel', [
      state('collapsed', style({ height: '0', opacity: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: '1' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class UserProfileComponent implements OnInit {
  currentUser: any = null;
  isProfileOpen = false;
  isLoading = true;
  currentLanguage = 'fr'; // Langue par défaut : français

  // Traductions
  translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      profile: 'Profil',
      welcome: 'Bienvenue',
      role: 'Rôle',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      lastLogin: 'Dernière connexion',
      accountCreated: 'Compte créé le',
      viewProfile: 'Voir le profil complet',
      logout: 'Déconnexion',
      login: 'Connexion',
      notAvailable: 'Non disponible',
      loading: 'Chargement...'
    },
    en: {
      profile: 'Profile',
      welcome: 'Welcome',
      role: 'Role',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      lastLogin: 'Last login',
      accountCreated: 'Account created on',
      viewProfile: 'View full profile',
      logout: 'Logout',
      login: 'Login',
      notAvailable: 'Not available',
      loading: 'Loading...'
    }
  };

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef,
    private router: Router
  ) { }

  // Écouteur d'événement pour fermer le panneau lorsqu'on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Ne rien faire si le panneau est déjà fermé
    if (!this.isProfileOpen) {
      return;
    }

    // Vérifier si le clic est en dehors du composant
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.closeProfilePanel();
    }
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    console.log('UserProfileComponent: Chargement des données utilisateur');
    this.isLoading = true;

    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      console.log('UserProfileComponent: Utilisateur non connecté');
      this.isLoading = false;
      this.currentUser = null;
      return;
    }

    // Récupérer les informations de l'utilisateur connecté
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('UserProfileComponent: Données utilisateur chargées', user);

        // Vérifier si les données utilisateur sont valides
        if (!user) {
          console.error('UserProfileComponent: Données utilisateur invalides');
          this.isLoading = false;
          return;
        }

        // Stocker les données utilisateur
        this.currentUser = user;
        this.isLoading = false;

        // Rafraîchir les données toutes les 5 minutes
        setTimeout(() => this.loadUserData(), 5 * 60 * 1000);
      },
      error: (err) => {
        console.error('UserProfileComponent: Erreur lors du chargement des données utilisateur', err);
        this.isLoading = false;

        // Réessayer après 30 secondes en cas d'erreur
        setTimeout(() => this.loadUserData(), 30 * 1000);
      }
    });
  }

  toggleProfilePanel(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfilePanel(): void {
    this.isProfileOpen = false;
  }

  logout(): void {
    console.log('UserProfileComponent: Déconnexion');
    this.closeProfilePanel();
    this.authService.logout();
    console.log('UserProfileComponent: Redirection vers la page de connexion');
    this.router.navigate(['/login']).then(success => {
      console.log('UserProfileComponent: Navigation vers /login:', success ? 'Success' : 'Failed');
      if (!success) {
        // Si la navigation échoue, essayer de recharger la page
        window.location.href = '/login';
      }
    });
  }

  // Méthode pour basculer la langue
  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'fr' ? 'en' : 'fr';
  }

  // Méthode pour obtenir le texte traduit
  getTranslation(key: string): string {
    return this.translations[this.currentLanguage][key];
  }

  // Méthode pour formater la date
  formatDate(date: string | Date | undefined): string {
    if (!date) return this.getTranslation('notAvailable');
    return new Date(date).toLocaleDateString(this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
