import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  message: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.message = 'Veuillez entrer un email valide';
      return;
    }

    const email = this.forgotForm.value.email || ''; // Garantit que email est une chaîne
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.message = 'Un lien de réinitialisation a été envoyé à votre email.';
      },
      error: (err) => {
        this.message = 'Erreur : ' + err.error.message;
      }
    });
  }
}