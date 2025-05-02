import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { CompteComptableService } from '../../compte-comptable.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-generate-declaration-dialog',
  templateUrl: './generate-declaration-dialog.component.html',
  styleUrls: ['./generate-declaration-dialog.component.css']
})
export class GenerateDeclarationDialogComponent implements OnInit {
  declarationForm: FormGroup;
  comptesComptables: any[] = [];
  isSubmitting: boolean = false;
  generatedDeclaration: any = null;
  errors: string[] = [];
  isViewMode: boolean = false;
  declarationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private compteComptableService: CompteComptableService,
    private snackBar: MatSnackBar
  ) {
    this.declarationForm = this.fb.group({
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      type: ['', Validators.required],
      compteComptable: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.loadComptesComptables();
    this.checkForExistingDeclaration();
  }

  loadComptesComptables(): void {
    this.compteComptableService.getComptes().subscribe({
      next: (comptes) => {
        console.log('Comptes comptables chargés :', comptes);
        this.comptesComptables = comptes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des comptes comptables:', error);
        this.errors.push('Impossible de charger les comptes comptables');
      }
    });
  }

  checkForExistingDeclaration(): void {
    this.route.queryParams.subscribe(params => {
      this.declarationId = params['id'];
      if (this.declarationId) {
        this.isViewMode = true;
        this.loadDeclaration(this.declarationId);
      }
    });
  }

  loadDeclaration(id: string): void {
    this.declarationFiscaleTVAService.getDeclarationById(id).subscribe({
      next: (declaration: DeclarationFiscale) => {
        const [dateDebut, dateFin] = declaration.periode.split(' - ').map((date: string) => new Date(date));
        this.declarationForm.patchValue({
          dateDebut: dateDebut,
          dateFin: dateFin,
          type: '',
          compteComptable: typeof declaration.compteComptable === 'string' ? declaration.compteComptable : declaration.compteComptable._id
        });
        this.generatedDeclaration = {
          ...declaration,
          type: '',
          detailsCalcul: {
            tva: {
              totalTVACollectee: 0,
              totalTVADeductible: 0,
              soldeTVA: 0
            },
            tcl: {
              montantTCL: 0
            },
            droitTimbre: {
              totalDroitTimbre: 0
            }
          }
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la déclaration:', error);
        this.errors.push('Impossible de charger les détails de la déclaration');
      }
    });
  }

  dateRangeValidator(form: FormGroup): { [key: string]: any } | null {
    const dateDebut = form.get('dateDebut')?.value;
    const dateFin = form.get('dateFin')?.value;
    if (dateDebut && dateFin && new Date(dateDebut) >= new Date(dateFin)) {
      form.get('dateDebut')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.declarationForm.invalid) return;

    this.isSubmitting = true;
    this.errors = [];

    const formData = this.declarationForm.value;

    const declarationData = {
      dateDebut: new Date(formData.dateDebut).toISOString(),
      dateFin: new Date(formData.dateFin).toISOString(),
      type: formData.type,
      compteComptable: formData.compteComptable
    };

    console.log('Envoi des données à l\'API :', declarationData);

    this.declarationFiscaleTVAService.genererDeclarationFiscale(declarationData).subscribe({
      next: (response) => {
        console.log('Réponse de l\'API :', response);
        this.generatedDeclaration = {
          ...response.data.declaration,
          detailsCalcul: response.data.detailsCalcul
        };
        this.snackBar.open('Déclaration générée avec succès', 'Fermer', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        console.log('Tentative de redirection vers /list-df');
        this.router.navigate(['/list-df']).then(success => {
          console.log('Redirection réussie ?', success);
        });
      },
      error: (error) => {
        console.error('Erreur de l\'API :', error);
        this.isSubmitting = false;
        this.errors = Array.isArray(error) ? error : [error.message || 'Erreur lors de la génération'];
        this.snackBar.open('Erreur lors de la génération', 'Fermer', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        console.log('Redirection vers /list-df malgré l\'erreur');
        this.router.navigate(['/list-df']).then(success => {
          console.log('Redirection après erreur réussie ?', success);
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/list-df']);
  }

  getCompteComptableNom(compteId: string): string {
    const compte = this.comptesComptables.find(c => c._id === compteId);
    return compte ? `${compte.numeroCompte} - ${compte.nom}` : 'Non trouvé';
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

  exportToPDF(): void {
    if (!this.generatedDeclaration) {
      this.snackBar.open('Aucune déclaration à exporter', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    const doc = new jsPDF();
    let yPosition = 20;

    // En-tête
    doc.setFontSize(16);
    doc.text('RÉPUBLIQUE TUNISIENNE', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Ministère des Finances - Direction Générale des Impôts', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('DÉCLARATION FISCALE', 105, yPosition, { align: 'center' });
    yPosition += 20;

    // Informations Générales
    doc.setFontSize(12);
    doc.text('INFORMATIONS GÉNÉRALES', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`Période : ${this.formatPeriode(this.generatedDeclaration.periode)}`, 20, yPosition);
    yPosition += 7;
    if (this.generatedDeclaration.type) {
      doc.text(`Type : ${this.generatedDeclaration.type.charAt(0).toUpperCase() + this.generatedDeclaration.type.slice(1)}`, 20, yPosition);
      yPosition += 7;
    }
    doc.text(`Statut : ${this.generatedDeclaration.statut.charAt(0).toUpperCase() + this.generatedDeclaration.statut.slice(1)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Compte Comptable : ${this.getCompteComptableNom(this.generatedDeclaration.compteComptable)}`, 20, yPosition);
    yPosition += 15;

    // Détails des Calculs
    if (this.generatedDeclaration.detailsCalcul) {
      doc.setFontSize(12);
      doc.text('DÉTAILS DES CALCULS', 20, yPosition);
      yPosition += 10;

      // Tableau des détails
      doc.setFontSize(10);
      doc.text('Description', 20, yPosition);
      doc.text('Montant (TND)', 150, yPosition);
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition); // Ligne horizontale
      yPosition += 5;

      if (this.generatedDeclaration.detailsCalcul.tva) {
        doc.text('TVA Collectée', 20, yPosition);
        doc.text(`${this.generatedDeclaration.detailsCalcul.tva.totalTVACollectee.toFixed(2)} TND`, 150, yPosition);
        yPosition += 7;
        doc.text('TVA Déductible', 20, yPosition);
        doc.text(`${this.generatedDeclaration.detailsCalcul.tva.totalTVADeductible.toFixed(2)} TND`, 150, yPosition);
        yPosition += 7;
        doc.text('Solde TVA', 20, yPosition);
        doc.text(`${this.generatedDeclaration.detailsCalcul.tva.soldeTVA.toFixed(2)} TND`, 150, yPosition);
        yPosition += 7;
      }
      if (this.generatedDeclaration.detailsCalcul.tcl) {
        doc.text('TCL (Taxe sur le Chiffre d\'Affaires)', 20, yPosition);
        doc.text(`${this.generatedDeclaration.detailsCalcul.tcl.montantTCL.toFixed(2)} TND`, 150, yPosition);
        yPosition += 7;
      }
      if (this.generatedDeclaration.detailsCalcul.droitTimbre) {
        doc.text('Droit de Timbre', 20, yPosition);
        doc.text(`${this.generatedDeclaration.detailsCalcul.droitTimbre.totalDroitTimbre.toFixed(2)} TND`, 150, yPosition);
        yPosition += 7;
      }
      yPosition += 5;
    }

    // Montant Total
    doc.setFontSize(12);
    doc.text('MONTANT TOTAL', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`Montant Total à Payer : ${this.generatedDeclaration.montantTotal.toFixed(2)} TND`, 20, yPosition);

    // Enregistrement du PDF
    doc.save(`Declaration_Fiscale_${this.formatPeriode(this.generatedDeclaration.periode).replace(/[^\w\s]/gi, '_')}.pdf`);
  }
}