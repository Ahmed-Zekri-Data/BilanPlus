import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-df-detail',
  templateUrl: './df-detail.component.html',
  styleUrls: ['./df-detail.component.css']
})
export class DFDetailComponent implements OnInit {
  declaration: DeclarationFiscale | null = null;
  isLoading: boolean = true;
  errors: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('Tentative de chargement de la déclaration avec ID:', id);
      this.loadDeclarationDetails(id);
    } else {
      this.errors = ['ID de déclaration manquant'];
      this.snackBar.open('ID de déclaration manquant', 'Fermer', { duration: 3000 });
      this.isLoading = false;
    }
  }

  loadDeclarationDetails(id: string): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getDeclarationById(id).subscribe({
      next: (declaration) => {
        console.log('Déclaration chargée avec succès:', declaration);
        this.declaration = declaration; // Pas besoin de mapping, utilisation directe des champs du backend
        this.isLoading = false;
      },
      error: (errors: string[]) => {
        console.error('Erreur lors du chargement de la déclaration:', errors);
        this.errors = errors;
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/list-declarations']);
  }
}