import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { TVA } from '../../Models/TVA';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';

@Component({
  selector: 'app-tva-form',
  templateUrl: './tvaform.component.html',
  styleUrls: ['./tvaform.component.css']
})
export class TvaFormComponent implements OnInit {
  tva: TVA = {
    taux: 0,
    montant: 0,
    declaration: '' // Will hold the selected DeclarationFiscale _id
  };
  declarations: DeclarationFiscale[] = [];
  errors: string[] = [];
  // Définir fieldErrors avec un type explicite pour éviter les erreurs d'index signature
  fieldErrors: { taux: string; montant: string; declaration: string } = {
    taux: '',
    montant: '',
    declaration: ''
  };
  isEditMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadTvaDetails(id);
    }
    this.loadDeclarations();
  }

  loadTvaDetails(id: string): void {
    this.declarationFiscaleTVAService.getTVAById(id).subscribe({
      next: (tva) => {
        this.tva = { ...tva };
        if (this.tva.declaration && typeof this.tva.declaration !== 'string') {
          this.tva.declaration = this.tva.declaration._id!;
        }
        this.clearErrors();
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.mapFieldErrors(errors);
      }
    });
  }

  loadDeclarations(): void {
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations) => {
        this.declarations = declarations;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.mapFieldErrors(errors);
      }
    });
  }

  saveTva(): void {
    this.clearErrors();

    if (!this.tva.taux || !this.tva.montant || !this.tva.declaration) {
      this.errors = ['Tous les champs sont requis'];
      this.mapFieldErrors(this.errors);
      return;
    }

    if (this.isEditMode) {
      // Update existing TVA
      this.declarationFiscaleTVAService.updateTVA(this.tva._id!, this.tva).subscribe({
        next: (updatedTva) => {
          console.log('TVA updated successfully:', updatedTva);
          this.clearErrors();
          this.router.navigate(['/list-tva']);
        },
        error: (errors: string[]) => {
          this.errors = errors;
          this.mapFieldErrors(errors);
        }
      });
    } else {
      // Create new TVA
      this.declarationFiscaleTVAService.createTVA(this.tva).subscribe({
        next: (createdTva) => {
          console.log('TVA created successfully:', createdTva);
          this.clearErrors();
          this.router.navigate(['/list-tva']);
        },
        error: (errors: string[]) => {
          this.errors = errors;
          this.mapFieldErrors(errors);
        }
      });
    }
  }

  goBack(): void {
    this.clearErrors();
    this.router.navigate(['/list-tva']);
  }

  // Méthode pour réinitialiser les erreurs
  private clearErrors(): void {
    this.errors = [];
    this.fieldErrors = { taux: '', montant: '', declaration: '' };
  }

  // Méthode pour associer les erreurs aux champs
  private mapFieldErrors(errors: string[]): void {
    errors.forEach(error => {
      if (error.toLowerCase().includes('taux')) {
        this.fieldErrors['taux'] = error;
      } else if (error.toLowerCase().includes('montant')) {
        this.fieldErrors['montant'] = error;
      } else if (error.toLowerCase().includes('déclaration') || error.toLowerCase().includes('declaration')) {
        this.fieldErrors['declaration'] = error;
      }
    });
  }
}