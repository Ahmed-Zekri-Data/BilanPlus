import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  resetForm: FormGroup;
  submitted = false;
  loading = false;
  success = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.resetForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.requestPasswordReset({
      email: this.resetForm.controls['email'].value
    }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: error => {
        this.error = error.error.message || 'Une erreur est survenue';
        this.loading = false;
      }
    });
  }
}