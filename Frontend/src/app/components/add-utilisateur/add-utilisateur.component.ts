import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Utilisateur } from '../../Models/Utilisateur';

@Component({
  selector: 'app-add-utilisateur',
  templateUrl: './add-utilisateur.component.html',
  styleUrls: ['./add-utilisateur.component.css']
})
export class AddUtilisateurComponent implements OnInit {
  private userId?: string;
  public isEditMode: boolean = false;

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  utilisateurForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    motDePasse: new FormControl('', [Validators.required, Validators.minLength(6)]), // Obligatoire pour création
    role: new FormControl('', Validators.required)
  });

  message: string = '';

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.userId) {
      this.isEditMode = true;
      this.loadUserData();
      // Rendre motDePasse facultatif en mode édition
      this.utilisateurForm.get('motDePasse')?.clearValidators();
      this.utilisateurForm.get('motDePasse')?.setValidators(Validators.minLength(6));
      this.utilisateurForm.get('motDePasse')?.updateValueAndValidity();
    }
  }

  private loadUserData() {
    if (this.userId) {
      this.utilisateurService.getUserById(Number(this.userId)).subscribe({
        next: (user: Utilisateur) => {
          this.utilisateurForm.patchValue({
            nom: user.nom,
            email: user.email,
            role: user.role // Chaîne "admin" ou "user"
          });
        },
        error: (err) => {
          this.message = 'Erreur lors du chargement de l\'utilisateur';
          console.error('Erreur chargement:', err);
        }
      });
    }
  }

  submitUtilisateur() {
    if (this.utilisateurForm.invalid) {
      this.message = 'Veuillez remplir correctement tous les champs requis';
      console.log('Formulaire invalide:', this.utilisateurForm.value);
      return;
    }

    const userData: any = {
      nom: this.utilisateurForm.value.nom ?? "",
      email: this.utilisateurForm.value.email ?? "",
      role: this.utilisateurForm.value.role ?? "" // "admin" ou "user"
    };

    if (this.utilisateurForm.value.motDePasse) {
      userData.motDePasse = this.utilisateurForm.value.motDePasse;
    }

    if (this.isEditMode && this.userId) {
      this.utilisateurService.updateUser(Number(this.userId), userData).subscribe({
        next: () => {
          this.router.navigateByUrl("/utilisateurs");
        },
        error: (err) => {
          this.message = 'Erreur lors de la mise à jour';
          console.error( err);
        }
      });
    } else {
      this.utilisateurService.createUser(userData).subscribe({
        next: () => {
             this.router.navigateByUrl("/utilisateurs");
        },
        error: (err) => {
          this.message = 'Erreur lors de la création';
          console.error( err);
        }
      });
    }
  }
}