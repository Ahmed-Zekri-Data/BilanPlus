import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { MatSnackBar } from '@angular/material/snack-bar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-df-detail',
  templateUrl: './df-detail.component.html',
  styleUrls: ['./df-detail.component.css']
})
export class DFDetailComponent implements OnInit {
  declaration: DeclarationFiscale | null = null;
  isLoading: boolean = true;
  errors: string[] = [];
  declarationId: string | null = null;

  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.declarationId = this.route.snapshot.paramMap.get('id');
    if (this.declarationId) {
      this.loadDeclaration(this.declarationId);
    } else {
      this.isLoading = false;
      this.errors = ['ID de déclaration manquant'];
      this.snackBar.open('ID de déclaration manquant', 'Fermer', { duration: 3000 });
    }
  }

  loadDeclaration(id: string): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getDeclarationById(id).subscribe({
      next: (declaration: DeclarationFiscale) => {
        console.log('Déclaration chargée avec succès:', declaration);
        this.declaration = declaration;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la déclaration:', error);
        this.errors = Array.isArray(error) ? error : [error.message || 'Erreur inconnue'];
        this.snackBar.open('Erreur lors du chargement de la déclaration', 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  generatePDF(): void {
    this.isLoading = true;
    const element = this.pdfContent.nativeElement;

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Declaration_Fiscale_${this.formatPdfDate()}.pdf`);

      this.isLoading = false;
      this.snackBar.open('PDF généré avec succès', 'Fermer', { duration: 3000 });
    }).catch(error => {
      console.error('Erreur lors de la génération du PDF:', error);
      this.snackBar.open('Erreur lors de la génération du PDF', 'Fermer', { duration: 5000 });
      this.isLoading = false;
    });
  }

  Soumettredec(): void {
    if (!this.declarationId || !this.declaration) {
      this.snackBar.open('ID ou déclaration manquant', 'Fermer', { duration: 3000 });
      console.error('Declaration ID or declaration is missing', {
        declarationId: this.declarationId,
        declaration: this.declaration
      });
      return;
    }

    this.isLoading = true;
    this.declarationFiscaleTVAService.soumettreDeclaration(this.declarationId, this.declaration)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: (result) => {
          this.isLoading = false;
          console.log('Declaration submitted successfully:', result);
          this.snackBar.open('Déclaration soumise avec succès', 'Fermer', { duration: 3000 })
          // Refresh the page after a short delay to allow the snackbar to show
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error submitting declaration:', err);
          this.snackBar.open('Erreur lors de la soumission de la déclaration', 'Fermer', { duration: 5000 });
        }
      });
      console.log('Submitting with:', { declarationId: this.declarationId, declaration: this.declaration });

  }

  // Error handling method
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Erreur lors de la soumission de la déclaration'));
  }

  formatPdfDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/list-declarations']);
  }
}