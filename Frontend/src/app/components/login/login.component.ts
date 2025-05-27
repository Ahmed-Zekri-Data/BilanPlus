import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
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
export class LoginComponent implements OnInit {
  credentials = { email: '', password: '', rememberMe: false };
  loading = false;
  submitted = false;
  errorMessage = '';
  buttonState = 'normal';
  currentLanguage = 'fr'; // Langue par défaut : français
  showPassword = false; // Pour afficher/masquer le mot de passe
  currentYear = new Date().getFullYear(); // Pour le copyright

  // Traductions
  translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      welcome: 'Bienvenue sur BilanPlus',
      subtitle: 'Connectez-vous pour accéder à votre compte',
      signIn: 'Se connecter',
      loginLabel: 'Identifiant ou email',
      loginPlaceholder: 'Entrez votre email ou identifiant',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      loginButton: 'Se connecter',
      loggingIn: 'Connexion en cours',
      languageToggle: 'English',
      allRightsReserved: 'Tous droits réservés'
    },
    en: {
      welcome: 'Welcome to BilanPlus',
      subtitle: 'Sign in to access your account',
      signIn: 'Sign In',
      loginLabel: 'Username or email',
      loginPlaceholder: 'Enter your email or username',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      loginButton: 'Sign In',
      loggingIn: 'Signing in',
      languageToggle: 'Français',
      allRightsReserved: 'All rights reserved'
    }
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      // Vérifier s'il y a une URL de redirection stockée
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      if (redirectUrl) {
        console.log('Redirection vers:', redirectUrl);
        sessionStorage.removeItem('redirectUrl'); // Nettoyer après utilisation
        this.router.navigateByUrl(redirectUrl).then(success => {
          console.log('Navigation vers URL stockée:', success ? 'Success' : 'Failed');
        });
      } else {
        this.router.navigate(['/home']).then(success => {
          console.log('Navigation to /home on init:', success ? 'Success' : 'Failed');
        });
      }
    }
  }

  // Méthode pour basculer la langue
  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'fr' ? 'en' : 'fr';
  }

  // Méthode pour obtenir le texte traduit
  getTranslation(key: string): string {
    return this.translations[this.currentLanguage][key];
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }



  onCheckboxChange(event: MatCheckboxChange): void {
    this.credentials.rememberMe = event.checked;
  }

  // Méthode pour afficher/masquer le mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']).then(success => {
      console.log('Navigation to /forgot-password:', success ? 'Success' : 'Failed');
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.loading = true;
    this.errorMessage = '';
    this.buttonState = 'clicked';

    // Vérifier si les champs sont remplis
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.loading = false;
      this.buttonState = 'normal';
      return;
    }

    // Tentative de connexion avec le vrai backend
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        this.buttonState = 'normal';
        console.log('Connexion réussie:', response);

        // Vérifier s'il y a une URL de redirection stockée
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
          console.log('Redirection vers:', redirectUrl);
          sessionStorage.removeItem('redirectUrl'); // Nettoyer après utilisation
          this.router.navigateByUrl(redirectUrl);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.buttonState = 'normal';
        this.errorMessage = error.message || 'Erreur de connexion. Veuillez réessayer.';
        console.error('Erreur de connexion:', error);

        // Réinitialiser le mot de passe pour la sécurité
        this.credentials.password = '';
      }
    });
  }
}