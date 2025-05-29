// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
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
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  email: string = '';
  submitted = false;
  loading = false;
  success = false;
  error = '';
  showPassword = false;
  buttonState = 'normal';
  currentLanguage = 'fr'; // Langue par défaut : français
  currentYear = new Date().getFullYear(); // Pour le copyright

  // Traductions
  translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      title: 'Réinitialisation du mot de passe',
      subtitle: 'Créez un nouveau mot de passe sécurisé pour votre compte',
      tokenValid: 'Token de réinitialisation valide',
      tokenMissing: 'Token de réinitialisation manquant ou invalide',
      newPasswordLabel: 'Nouveau mot de passe',
      newPasswordPlaceholder: 'Entrez votre nouveau mot de passe',
      confirmPasswordLabel: 'Confirmer le mot de passe',
      confirmPasswordPlaceholder: 'Confirmez votre nouveau mot de passe',
      passwordRequired: 'Le mot de passe est requis',
      passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
      confirmPasswordRequired: 'La confirmation du mot de passe est requise',
      passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
      backButton: 'Retour',
      resetButton: 'Réinitialiser le mot de passe',
      resetting: 'Réinitialisation en cours...',
      successTitle: 'Mot de passe réinitialisé !',
      successMessage: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
      redirecting: 'Redirection vers la page de connexion...',
      languageToggle: 'English',
      allRightsReserved: 'Tous droits réservés'
    },
    en: {
      title: 'Password Reset',
      subtitle: 'Create a new secure password for your account',
      tokenValid: 'Valid reset token',
      tokenMissing: 'Missing or invalid reset token',
      newPasswordLabel: 'New Password',
      newPasswordPlaceholder: 'Enter your new password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your new password',
      passwordRequired: 'Password is required',
      passwordTooShort: 'Password must be at least 8 characters long',
      confirmPasswordRequired: 'Password confirmation is required',
      passwordsDoNotMatch: 'Passwords do not match',
      backButton: 'Back',
      resetButton: 'Reset Password',
      resetting: 'Resetting...',
      successTitle: 'Password Reset!',
      successMessage: 'Your password has been successfully reset. You can now log in with your new password.',
      redirecting: 'Redirecting to login page...',
      languageToggle: 'Français',
      allRightsReserved: 'All rights reserved'
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    console.log('ResetPasswordComponent: Initialisation');

    // Récupérer le token depuis l'URL
    this.token = this.route.snapshot.queryParams['token'] || '';
    this.email = this.route.snapshot.queryParams['email'] || '';

    console.log('ResetPasswordComponent: Token récupéré:', this.token ? 'Présent (longueur: ' + this.token.length + ')' : 'Absent');
    console.log('ResetPasswordComponent: Email récupéré:', this.email);

    // Si aucun token n'est présent, afficher un message d'erreur
    if (!this.token) {
      this.error = this.getTranslation('tokenMissing');
      console.log('ResetPasswordComponent: Token manquant dans l\'URL');
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

  // Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Méthode pour vérifier si un champ est invalide
  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return this.submitted && field !== null && field.invalid;
  }

  // Méthode pour vérifier que les mots de passe correspondent
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: AbstractControl) => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      // Vérifier si les valeurs correspondent
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }

      return null;
    };
  }

  // Méthode pour retourner à la page de connexion
  goBack(): void {
    this.router.navigate(['/login']);
  }

  onSubmit(): void {
    console.log('ResetPasswordComponent: Soumission du formulaire');
    this.submitted = true;
    this.error = '';
    this.buttonState = 'clicked';

    // Vérifier si le formulaire est valide
    if (this.resetForm.invalid) {
      console.log('ResetPasswordComponent: Formulaire invalide');
      this.buttonState = 'normal';
      return;
    }

    // Vérifier si le token est présent
    if (!this.token) {
      console.log('ResetPasswordComponent: Token manquant');
      this.error = this.getTranslation('tokenMissing');
      this.buttonState = 'normal';
      return;
    }

    this.loading = true;
    console.log('ResetPasswordComponent: Envoi de la demande de réinitialisation');

    this.authService.resetPassword({
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.get('password')?.value
    }).subscribe({
      next: (response) => {
        console.log('ResetPasswordComponent: Réinitialisation réussie', response);
        this.success = true;
        this.loading = false;
        this.buttonState = 'normal';

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('ResetPasswordComponent: Erreur lors de la réinitialisation', err);
        this.error = err?.error?.message || err?.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe';
        this.loading = false;
        this.buttonState = 'normal';
      }
    });
  }
}