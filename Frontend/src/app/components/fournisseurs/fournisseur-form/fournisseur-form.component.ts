import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FournisseurService } from '../../../services/fournisseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-fournisseur-form',
  templateUrl: './fournisseur-form.component.html',
  styleUrls: ['./fournisseur-form.component.css']
})
export class FournisseurFormComponent implements OnInit {
  fournisseurForm: FormGroup;
  fournisseurId: string | null = null;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar
  ) {
    this.fournisseurForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      adresse: ['', Validators.required],
      categorie: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fournisseurId = this.route.snapshot.paramMap.get('id');
    if (this.fournisseurId) {
      this.isEditMode = true;
      this.loadFournisseur();
    }
  }

  loadFournisseur(): void {
    if (this.fournisseurId) {
      this.isLoading = true;
      this.fournisseurService.getFournisseurById(this.fournisseurId).subscribe({
        next: (fournisseur) => {
          this.fournisseurForm.patchValue(fournisseur);
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement du fournisseur', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
          console.error(err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.fournisseurForm.valid) {
      this.isLoading = true;
      const fournisseurData = this.fournisseurForm.value;
      if (this.isEditMode && this.fournisseurId) {
        this.fournisseurService.updateFournisseur(this.fournisseurId, fournisseurData).subscribe({
          next: () => {
            this.snackBar.open('Fournisseur mis à jour avec succès', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            this.router.navigate(['/fournisseurs']);
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de la mise à jour du fournisseur', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            console.error(err);
          }
        });
      } else {
        this.fournisseurService.createFournisseur(fournisseurData).subscribe({
          next: () => {
            this.snackBar.open('Fournisseur créé avec succès', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            this.router.navigate(['/fournisseurs']);
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de la création du fournisseur', 'Fermer', {
              duration: 3000
            });
            this.isLoading = false;
            console.error(err);
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/fournisseurs']);
  }
} 