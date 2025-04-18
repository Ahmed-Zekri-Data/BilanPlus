
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';

@Component({
  selector: 'app-list-df',
  templateUrl: './list-df.component.html',
  styleUrls: ['./list-df.component.css']
})
export class ListDFComponent implements OnInit {
  declarations: DeclarationFiscale[] = [];
  errors: string[] = []; // Remplacement de errorMessage par une liste d'erreurs

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDeclarations();
  }

  loadDeclarations(): void {
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations) => {
        this.declarations = declarations;
      },
      error: (errors: string[]) => {
        this.errors = errors;

      }
    });
  }

  editDeclaration(id: string): void {
    this.router.navigate(['/edit-declaration', id]); // Correction de l'URL
  }

  viewDetails(id: string): void {
    this.router.navigate(['/getDF', id]); // Cette route n'est pas définie, à vérifier
  }


  deleteDeclaration(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
      this.declarationFiscaleTVAService.deleteDeclaration(id).subscribe({
        next: () => {
          this.declarations = this.declarations.filter(d => d._id !== id);
          console.log('Déclaration supprimée avec succès');
        },
        error: (errors: string[]) => {
          this.errors = errors;
        }
      });
    }
  }

  addNewDeclaration(): void {
    this.router.navigate(['/add-declaration']); // Correction de l'URL

  }
  
  viewDetails(id: string): void {
    this.router.navigate(['/getDF', id]); // Added for detail redirection
  }

}