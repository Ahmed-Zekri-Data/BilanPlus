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
        style({ opacity: 0 }),
        animate('1000ms ease-in', style({ opacity: 1 }))
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
  placeholder = 'Entrez votre email';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

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
    const email = this.email;

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.success = 'Un lien de réinitialisation a été envoyé à votre email.';
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}