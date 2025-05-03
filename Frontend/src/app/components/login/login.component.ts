import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

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

  // Traductions
  translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      welcome: 'Bonjour ! Bienvenue sur BilanPlus',
      noAccount: 'Vous n\'avez pas encore de compte ?',
      signUp: 'S\'inscrire',
      signIn: 'Se connecter',
      loginLabel: 'Identifiant ou email',
      loginPlaceholder: 'Entrez votre email ou identifiant',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Doit contenir au moins 8 caractères',
      verify: 'Cliquez pour vérifier',
      forgotPassword: 'Mot de passe oublié ?',
      languageToggle: 'Passer à l\'anglais'
    },
    en: {
      welcome: 'Hello! Welcome to BilanPlus',
      noAccount: 'Don\'t have an account yet?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      loginLabel: 'Login or email',
      loginPlaceholder: 'Enter your login email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Must contain at least 8 symbols',
      verify: 'Click to verify',
      forgotPassword: 'Forgot Password?',
      languageToggle: 'Switch to French'
    }
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
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

  onInputChange(event: Event, field: 'email' | 'password'): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      if (field === 'email') {
        this.credentials.email = target.value;
      } else if (field === 'password') {
        this.credentials.password = target.value;
      }
    }
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.credentials.rememberMe = target.checked;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.credentials.email || !this.isValidEmail(this.credentials.email) || !this.credentials.password) {
      return;
    }

    this.loading = true;
    const credentials = this.credentials;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        console.error('Erreur de connexion:', err);
        if (err.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion ou l\'état du serveur.';
        } else {
          this.errorMessage = err?.message || 'Une erreur est survenue lors de la connexion.';
        }
        this.loading = false;
      }
    });
  }
}