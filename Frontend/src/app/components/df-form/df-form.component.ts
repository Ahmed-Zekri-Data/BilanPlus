import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { CompteComptableService } from '../../compte-comptable.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { CompteComptable } from '../../Models/CompteComptable';

@Component({
  selector: 'app-declaration-fiscale-form',
  templateUrl: './df-form.component.html',
  styleUrls: ['./df-form.component.css']
})
export class DFFormComponent implements OnInit {
  declaration: DeclarationFiscale = {
    periode: '',
    montantTotal: 0,
    statut: '',
    compteComptable: ''
  };
  comptesComptables: CompteComptable[] = [];
  errors: string[] = [];
  fieldErrors: { periode: string; montantTotal: string; statut: string; compteComptable: string } = {
    periode: '',
    montantTotal: '',
    statut: '',
    compteComptable: ''
  };
  isEditMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private compteComptableService: CompteComptableService
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      console.log('Edit mode, loading declaration with ID:', id);
      this.loadDeclarationDetails(id);
    } else {
      console.log('Add mode, no ID provided');
    }
    this.loadComptesComptables();
  }

  loadDeclarationDetails(id: string): void {
    this.declarationFiscaleTVAService.getDeclarationById(id).subscribe({
      next: (declaration) => {
        this.declaration = { ...declaration };
        if (this.declaration.compteComptable && typeof this.declaration.compteComptable !== 'string') {
          this.declaration.compteComptable = this.declaration.compteComptable._id!;
        }
        this.clearErrors();
      },
      error: (errors: string[]) => {
        console.error('Error loading declaration details:', errors);
        this.errors = errors;
        this.mapFieldErrors(errors);
      }
    });
  }

  loadComptesComptables(): void {
    this.compteComptableService.getComptes().subscribe({
      next: (comptes) => {
        console.log('Comptes comptables loaded:', comptes);
        this.comptesComptables = comptes;
      },
      error: (errors: string[]) => {
        console.error('Error loading comptes comptables:', errors);
        this.errors = errors;
        this.mapFieldErrors(errors);
      }
    });
  }

  saveDeclaration(): void {
    console.log('saveDeclaration called');
    console.log('Form data:', this.declaration);
  
    this.clearErrors();

    if (!this.declaration.periode || !this.declaration.montantTotal || !this.declaration.statut || !this.declaration.compteComptable) {
      this.errors = ['Tous les champs sont requis'];
      this.mapFieldErrors(this.errors);
      console.log('Validation failed:', this.errors);
      return;
    }
  
    if (this.isEditMode) {
      console.log('Updating declaration with ID:', this.declaration._id);
      this.declarationFiscaleTVAService.updateDeclaration(String(this.declaration._id), this.declaration).subscribe({
        next: (updatedDeclaration) => {
          console.log('Declaration updated successfully:', updatedDeclaration);
          this.clearErrors();
          this.router.navigate(['/list-declarations']);
        },
        error: (errors: string[]) => {
          console.error('Update error:', errors);
          this.errors = errors;
          this.mapFieldErrors(errors);
        }
      });
    } else {
      console.log('Creating new declaration');
      this.declarationFiscaleTVAService.createDeclaration(this.declaration).subscribe({
        next: (createdDeclaration) => {
          console.log('Declaration created successfully:', createdDeclaration);
          this.clearErrors();
          this.router.navigate(['/list-declarations']);
        },
        error: (errors: string[]) => {
          console.error('Create error:', errors);
          this.errors = errors;
          this.mapFieldErrors(errors);
        }
      });
    }
  }

  goBack(): void {
    this.clearErrors();
    this.router.navigate(['/list-declarations']);
  }

  private clearErrors(): void {
    this.errors = [];
    this.fieldErrors = { periode: '', montantTotal: '', statut: '', compteComptable: '' };
  }

  private mapFieldErrors(errors: string[]): void {
    errors.forEach(error => {
      if (error.toLowerCase().includes('période') || error.toLowerCase().includes('periode')) {
        this.fieldErrors.periode = error;
      } else if (error.toLowerCase().includes('montant total') || error.toLowerCase().includes('montanttotal')) {
        this.fieldErrors.montantTotal = error;
      } else if (error.toLowerCase().includes('statut')) {
        this.fieldErrors.statut = error;
      } else if (error.toLowerCase().includes('compte comptable') || error.toLowerCase().includes('comptecomptable')) {
        this.fieldErrors.compteComptable = error;
      }
    });
  }
}