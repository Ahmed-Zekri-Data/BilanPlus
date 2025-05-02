import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { CompteComptable } from '../../Models/CompteComptable';

@Component({
  selector: 'app-list-df',
  templateUrl: './list-df.component.html',
  styleUrls: ['./list-df.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ListDFComponent implements OnInit {
  declarations: DeclarationFiscale[] = [];
  errors: string[] = [];

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDeclarations();
  }

  loadDeclarations(): void {
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations) => {
        console.log('Déclarations récupérées :', declarations);
        this.declarations = declarations;
      },
      error: (errors: string[]) => {
        this.errors = errors;
      }
    });
  }

  openGenerateDialog(): void {
    // Rediriger vers /generer-df sans paramètres (nouvelle déclaration)
    this.router.navigate(['/generer-df']);
  }

  viewDetails(id: string): void {
    // Red相當iriger vers /generer-df avec l'ID de la déclaration
    this.router.navigate(['/generer-df'], { queryParams: { id } });
  }

  editDeclaration(id: string): void {
    this.router.navigate(['/edit-declaration', id]);
  }

  deleteDeclaration(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
      this.declarationFiscaleTVAService.deleteDeclaration(id).subscribe({
        next: () => {
          this.declarations = this.declarations.filter(d => d._id !== id);
          this.snackBar.open('Déclaration supprimée avec succès', 'Fermer', {
            duration: 5000
          });
        },
        error: (errors: string[]) => {
          this.errors = errors;
        }
      });
    }
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  getCompteComptableName(compteComptable: CompteComptable | string): string {
    if (this.isObject(compteComptable)) {
      return (compteComptable as CompteComptable).nom;
    }
    return compteComptable as string;
  }

  formatPeriode(periode: string): string {
    try {
      if (periode.includes(' - ')) {
        const [startDate, endDate] = periode.split(' - ').map(date => new Date(date));
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return periode;
        }
        const startFormatted = this.formatDate(startDate);
        const endFormatted = this.formatDate(endDate);
        return `du ${startFormatted} au ${endFormatted}`;
      }

      if (/^\d{4}-\d{2}$/.test(periode)) {
        const [year, month] = periode.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        const startFormatted = this.formatDate(startDate);
        const endFormatted = this.formatDate(endDate);
        return `du ${startFormatted} au ${endFormatted}`;
      }

      const date = new Date(periode);
      if (!isNaN(date.getTime())) {
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const startFormatted = this.formatDate(startDate);
        const endFormatted = this.formatDate(endDate);
        return `du ${startFormatted} au ${endFormatted}`;
      }

      return periode;
    } catch (error) {
      console.error('Erreur lors du formatage de la période :', periode, error);
      return periode;
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}