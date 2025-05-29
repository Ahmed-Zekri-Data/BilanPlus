import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)'})),
      state('clicked', style({ transform: 'scale(0.95)'})),
      transition('normal => clicked', animate('200ms ease-in')),
      transition('clicked => normal', animate('200ms ease-out'))
    ])
  ]
})
export class ForgotPasswordComponent implements OnInit {
  email = '';
  submitted = false;
  loading = false;
  error = '';
  success = '';
  buttonState = 'normal';
  currentLanguage = 'fr'; // Langue par défaut : français
  currentYear = new Date().getFullYear(); // Pour le copyright

  // Traductions
  translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      title: 'Mot de passe oublié',
      subtitle: 'Entrez votre adresse email pour recevoir un lien de réinitialisation',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'Entrez votre adresse email',
      emailRequired: 'L\'adresse email est requise',
      emailInvalid: 'L\'adresse email n\'est pas valide',
      backButton: 'Retour',
      submitButton: 'Envoyer le lien',
      sending: 'Envoi en cours',
      successMessage: 'Un lien de réinitialisation a été envoyé à votre adresse email',
      languageToggle: 'English',
      allRightsReserved: 'Tous droits réservés'
    },
    en: {
      title: 'Forgot Password',
      subtitle: 'Enter your email address to receive a reset link',
      emailLabel: 'Email address',
      emailPlaceholder: 'Enter your email address',
      emailRequired: 'Email address is required',
      emailInvalid: 'Email address is not valid',
      backButton: 'Back',
      submitButton: 'Send Reset Link',
      sending: 'Sending',
      successMessage: 'A reset link has been sent to your email address',
      languageToggle: 'Français',
      allRightsReserved: 'All rights reserved'
    }
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
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

  onEmailChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.email = target.value;
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (!this.email || !this.isValidEmail(this.email)) {
      return;
    }

    this.loading = true;
    this.buttonState = 'clicked';

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response: any) => {
        console.log('ForgotPasswordComponent: Réponse du service:', response);

        if (response.success) {
          this.success = `Email envoyé avec succès !`;
        } else {
          this.error = response.message || 'Échec de l\'envoi de l\'email';
        }

        this.loading = false;
        this.buttonState = 'normal';

        // Réinitialiser le formulaire seulement en cas de succès
        if (response.success) {
          this.email = '';
          this.submitted = false;
        }
      },
      error: (err: any) => {
        console.error('ForgotPasswordComponent: Erreur lors de l\'envoi:', err);
        this.error = err?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.loading = false;
        this.buttonState = 'normal';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}