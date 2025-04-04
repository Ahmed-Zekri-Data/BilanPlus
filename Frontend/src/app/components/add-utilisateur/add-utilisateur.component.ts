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
  // Ajout de l'ID pour savoir si on est en mode édition
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
    motDePasse: new FormControl('', [Validators.minLength(6)]), // Pas requis en update
    role: new FormControl('', Validators.required)
  });

  message: string = '';

  ngOnInit() {
    // Vérifier s'il y a un ID dans l'URL pour passer en mode édition
    this.userId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.userId) {
      this.isEditMode = true;
      this.loadUserData();
    }
  }

  // Charger les données de l'utilisateur existant
  private loadUserData() {
    if (this.userId) {
      this.utilisateurService.getUserById(Number(this.userId)).subscribe({
        next: (user: Utilisateur) => {
          this.utilisateurForm.patchValue({
            nom: user.nom,
            email: user.email,
            role: user.role,
            // Ne pas pré-remplir le mot de passe pour des raisons de sécurité
          });
        },
        error: (err) => {
          this.message = 'Erreur lors du chargement de l\'utilisateur';
          console.error(err);
        }
      });
    }
  }

  // Fonction submit qui gère à la fois création et mise à jour
  submitUtilisateur() {
    if (this.utilisateurForm.invalid) {
      this.message = 'Veuillez remplir correctement tous les champs requis';
      return;
    }

    const userData: any = {
      nom: this.utilisateurForm.value.nom ?? "",
      email: this.utilisateurForm.value.email ?? "",
      role: this.utilisateurForm.value.role ?? ""
    };

    // Ajouter le mot de passe uniquement s'il est rempli (pour l'update)
    if (this.utilisateurForm.value.motDePasse) {
      userData.motDePasse = this.utilisateurForm.value.motDePasse;
    }

    if (this.isEditMode && this.userId) {
      // Mode mise à jour
      this.utilisateurService.updateUser(Number(this.userId), userData).subscribe({
        next: () => {
          this.router.navigateByUrl("/utilisateurs");
        },
        error: (err) => {
          this.message = 'Erreur lors de la mise à jour';
          console.error(err);
        }
      });
    } else {
      // Mode création
      this.utilisateurService.createUser(userData).subscribe({
        next: () => {
          this.router.navigateByUrl("/utilisateurs");
        },
        error: (err) => {
          this.message = 'Erreur lors de la création';
          console.error(err);
        }
      });
    }
  }
}