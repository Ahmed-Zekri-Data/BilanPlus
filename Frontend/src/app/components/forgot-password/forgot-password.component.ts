// forgot-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal => clicked', animate('200ms ease-in')),
      transition('clicked => normal', animate('200ms ease-out'))
    ])
  ]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  success = '';
  buttonState = 'normal';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.forgotPasswordForm.value.email; // Correction : on passe directement l'email

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