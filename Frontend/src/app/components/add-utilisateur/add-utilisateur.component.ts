import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-utilisateur',
  templateUrl: './add-utilisateur.component.html',
  styleUrls: ['./add-utilisateur.component.css']
})
export class AddUtilisateurComponent implements OnInit {
  utilisateurForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private router: Router
  ) {
    this.utilisateurForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      actif: [true]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.utilisateurForm.invalid) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.success = null;

    const utilisateur = this.utilisateurForm.value;
    this.utilisateurService. createUtilisateur(utilisateur).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Utilisateur ajouté avec succès.';
        this.utilisateurForm.reset();
        setTimeout(() => this.router.navigate(['/utilisateur']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Une erreur est survenue.';
      }
    });
  }
}