import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  signinForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    motDePasse: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.signinForm.invalid) {
      this.message = 'Veuillez remplir correctement tous les champs';
      return;
    }

    const credentials = this.signinForm.value;
    this.authService.signin(credentials).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token); // Stocke le token JWT
        this.message = 'Connexion réussie !';
        this.router.navigate(['/dashboard']); // Redirection vers une page protégée
      },
      error: (err) => {
        this.message = 'Erreur lors de la connexion : ' + err.error.message;
      }
    });
  }
}