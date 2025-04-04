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
  errorMessage: string | null = null;
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
        this.tva = { ...tva }; // Create a copy to avoid mutating the original
        // If declaration is a DeclarationFiscale object, extract its _id
        if (this.tva.declaration && typeof this.tva.declaration !== 'string') {
          this.tva.declaration = this.tva.declaration._id!;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load TVA details: ' + error.message;
      }
    });
  }

  loadDeclarations(): void {
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations) => {
        this.declarations = declarations;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load declarations: ' + error.message;
      }
    });
  }

  saveTva(): void {
    if (!this.tva.taux || !this.tva.montant || !this.tva.declaration) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.isEditMode) {
      // Update existing TVA
      this.declarationFiscaleTVAService.updateTVA(this.tva._id!, this.tva).subscribe({
        next: (updatedTva) => {
          console.log('TVA updated successfully:', updatedTva);
          this.router.navigate(['/list-tva']);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update TVA: ' + error.message;
        }
      });
    } else {
      // Create new TVA
      this.declarationFiscaleTVAService.createTVA(this.tva).subscribe({
        next: (createdTva) => {
          console.log('TVA created successfully:', createdTva);
          this.router.navigate(['/list-tva']);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create TVA: ' + error.message;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/list-tva']);
  }
}