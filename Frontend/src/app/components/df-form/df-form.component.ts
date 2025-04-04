import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { CompteComptableService } from '../../compte-comptable.service'; // Import the service
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
    compteComptable: '' // Will hold the selected CompteComptable _id as a string
  };
  comptesComptables: CompteComptable[] = [];
  errorMessage: string | null = null;
  isEditMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private compteComptableService: CompteComptableService // Inject the service
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
        // If compteComptable is an object, extract its _id
        if (this.declaration.compteComptable && typeof this.declaration.compteComptable !== 'string') {
          this.declaration.compteComptable = this.declaration.compteComptable._id!;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load declaration details: ' + error.message;
      }
    });
  }

  loadComptesComptables(): void {
    this.compteComptableService.getComptes().subscribe({
      next: (comptes) => {
        this.comptesComptables = comptes;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load comptes comptables: ' + error.message;
      }
    });
  }

  saveDeclaration(): void {
    console.log('saveDeclaration called');
    console.log('Form data:', this.declaration);
  
    if (!this.declaration.periode || !this.declaration.montantTotal || !this.declaration.statut || !this.declaration.compteComptable) {
      this.errorMessage = 'All fields are required';
      console.log('Validation failed:', this.errorMessage);
      return;
    }
  
    if (this.isEditMode) {
      console.log('Updating declaration with ID:', this.declaration._id);
      // Update existing declaration
      this.declarationFiscaleTVAService.updateDeclaration(String(this.declaration._id), this.declaration).subscribe({
        next: (updatedDeclaration) => {
          console.log('Declaration updated successfully:', updatedDeclaration);
          this.router.navigate(['/list-declarations']);
        },
        error: (error) => {
          console.error('Update error:', error); // Use console.error for visibility
          this.errorMessage = 'Failed to update declaration: ' + error.message;
        }
      });
    } else {
      console.log('Creating new declaration');
      // Create new declaration
      this.declarationFiscaleTVAService.createDeclaration(this.declaration).subscribe({
        next: (createdDeclaration) => {
          console.log('Declaration created successfully:', createdDeclaration);
          this.router.navigate(['/list-declarations']);
        },
        error: (error) => {
          console.error('Create error:', error);
          this.errorMessage = 'Failed to create declaration: ' + error.message;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/list-declarations']);
  }
}