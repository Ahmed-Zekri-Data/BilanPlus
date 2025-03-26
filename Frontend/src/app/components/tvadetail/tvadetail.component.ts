import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { TVA } from '../../Models/TVA';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';


@Component({
  selector: 'app-tva-detail',
  templateUrl: './tvadetail.component.html',
  styleUrls: ['./tvadetail.component.css']
})
export class TvaDetailComponent implements OnInit {
  tva: TVA | null = null;
  declaration: DeclarationFiscale | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService
  ) {}

  ngOnInit(): void {
    const id = String(this.route.snapshot.paramMap.get('id')); // Get the TVA ID from the route
    if (id) {
      this.loadTvaDetails(id);
    } else {
      this.errorMessage = 'Invalid TVA ID';
    }
  }

 loadTvaDetails(id: string): void {
    this.declarationFiscaleTVAService.getTVAById(id).subscribe({
      next: (tva) => {
        this.tva = tva;
        // Fetch the associated DeclarationFiscale using declaration
        if (typeof tva.declaration === 'string') {
          this.loadDeclarationDetails(tva.declaration); // declaration is the _id (string)
        } else if (tva.declaration) {
          this.declaration = tva.declaration; // declaration is already a DeclarationFiscale object
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load TVA details: ' + error.message;
      }
    });
  }

  loadDeclarationDetails(declarationId: string): void {
    this.declarationFiscaleTVAService.getDeclarationById(declarationId).subscribe({
      next: (declaration) => {
        this.declaration = declaration;
      },
      error: (error) => {
        console.error('Error fetching DeclarationFiscale:', error);
        this.declaration = null; // Handle the case where the declaration isn't found
      }
    });
  }

  deleteTva(): void {
    if (this.tva && confirm('Are you sure you want to delete this TVA entry?')) {
      this.declarationFiscaleTVAService.deleteTVA(this.tva._id!).subscribe({
        next: () => {
          console.log('TVA deleted successfully');
          this.router.navigate(['/TVA']); // Navigate back to the TVA list
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete TVA: ' + error.message;
        }
      });
    }
  }

  editTva(): void {
     if (this.tva) {
      this.router.navigate(['/updatetva', this.tva._id]); // Navigate to an edit page (you'll need to create this route)
   }
  }
}