import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { TVA } from '../../Models/TVA';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tva-form',
  templateUrl: './tvaform.component.html',
  styleUrls: ['./tvaform.component.css']
})
export class TvaFormComponent implements OnInit {
  tva: TVA = {
    taux: 0,
    montant: 0,
    declaration: ''
  };
  declarations: DeclarationFiscale[] = [];
  isEditMode: boolean = false;
  errors: string[] = [];
  fieldErrors: { taux: string; montant: string; declaration: string } = {
    taux: '',
    montant: '',
    declaration: ''
  };
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadTVADetails(id);
    }
    this.loadDeclarations();
  }

  loadTVADetails(id: string): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getTVAById(id).subscribe({
      next: (tva) => {
        this.tva = { ...tva };
        if (this.tva.declaration && typeof this.tva.declaration !== 'string') {
          this.tva.declaration = this.tva.declaration._id!;
        }
        this.isLoading = false;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.mapFieldErrors(errors);
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadDeclarations(): void {
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations: DeclarationFiscale[]) => {
        this.declarations = declarations;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.mapFieldErrors(errors);
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
      }
    });
  }

  saveTVA(): void {
    this.clearErrors();

    if (
      !this.tva.taux ||
      this.tva.taux <= 0 ||
      !this.tva.montant ||
      this.tva.montant <= 0
    ) {
      this.errors = ['Tous les champs sont requis et doivent être positifs'];
      this.mapFieldErrors(this.errors);
      this.snackBar.open('Tous les champs sont requis et doivent être positifs', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.isEditMode) {
      this.declarationFiscaleTVAService.updateTVA(String(this.tva._id), this.tva).subscribe({
        next: () => {
          this.snackBar.open('TVA mise à jour avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/list-tva']);
        },
        error: (errors: string[]) => {
          this.errors = errors;
          this.mapFieldErrors(errors);
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.declarationFiscaleTVAService.createTVA(this.tva).subscribe({
        next: () => {
          this.snackBar.open('TVA créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/list-tva']);
        },
        error: (errors: string[]) => {
          this.errors = errors;
          this.mapFieldErrors(errors);
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.clearErrors();
    this.router.navigate(['/list-tva']);
  }

  private clearErrors(): void {
    this.errors = [];
    this.fieldErrors = { taux: '', montant: '', declaration: '' };
  }

  private mapFieldErrors(errors: string[]): void {
    errors.forEach(error => {
      if (error.toLowerCase().includes('taux')) {
        this.fieldErrors.taux = error;
      } else if (error.toLowerCase().includes('montant')) {
        this.fieldErrors.montant = error;
      } else if (error.toLowerCase().includes('declaration')) {
        this.fieldErrors.declaration = error;
      }
    });
  }
}