import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    motDePasse: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.signupForm.invalid) {
      this.message = 'Veuillez remplir correctement tous les champs';
      return;
    }

    const userData = this.signupForm.value;
    this.authService.signup(userData).subscribe({
      next: (response) => {
        this.message = 'Inscription réussie !';
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        this.message = 'Erreur lors de l\'inscription : ' + err.error.message;
      }
    });
  }
}