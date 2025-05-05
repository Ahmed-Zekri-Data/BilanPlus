import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-df-form',
  templateUrl: './df-form.component.html',
  styleUrls: ['./df-form.component.css']
})
export class DFFormComponent implements OnInit {
  declaration: DeclarationFiscale = {
    periode: '',
    montantTotal: 0,
    totalTVACollectee: 0,
    totalTVADeductible: 0,
    totalTVADue: 0,
    statut: 'brouillon',
    compteComptable: ''
  };
  isLoading: boolean = false;
  errors: string[] = [];
  isUpdate: boolean = false;
  isEditMode: boolean = false;
  isGenerateMode: boolean = false;
  selectedMonth: Date | null = null;
  comptesComptables: any[] = []; // À remplir avec des données réelles via un service
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isGenerateMode = this.route.snapshot.queryParams['generate'] === 'true';
    if (id) {
      this.isUpdate = true;
      this.isEditMode = true;
      this.loadDeclaration(id);
    }
    // Simuler la récupération des comptes comptables (remplacer par un appel à un service si nécessaire)
    this.comptesComptables = [
      { _id: '6814f89e3de7102adae56669', nom: 'Compte 1' },
      { _id: '67e065859f73ed38336c40a6', nom: 'Compte 2' }
    ];
  }

  loadDeclaration(id: string): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getDeclarationById(id).subscribe({
      next: (declaration) => {
        this.declaration = { ...declaration };
        this.isLoading = false;
      },
      error: (errors) => {
        this.errors = errors;
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  saveDeclaration(): void {
    this.isLoading = true;
    this.fieldErrors = {};
    if (!this.isFormValid()) {
      if (!this.declaration.periode) this.fieldErrors['periode'] = 'La période est requise';
      if (this.declaration.totalTVACollectee === null || this.declaration.totalTVACollectee === undefined)
        this.fieldErrors['totalTVACollectee'] = 'La TVA collectée est requise';
      if (this.declaration.totalTVADeductible === null || this.declaration.totalTVADeductible === undefined)
        this.fieldErrors['totalTVADeductible'] = 'La TVA déductible est requise';
      if (!this.declaration.statut) this.fieldErrors['statut'] = 'Le statut est requis';
      if (!this.declaration.compteComptable) this.fieldErrors['compteComptable'] = 'Le compte comptable est requis';
      this.isLoading = false;
      return;
    }

    const declarationData = { ...this.declaration };
    if (this.isUpdate) {
      this.declarationFiscaleTVAService.updateDeclaration(this.declaration._id || '', declarationData).subscribe({
        next: () => {
          this.snackBar.open('Déclaration mise à jour avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/list-declarations']);
        },
        error: (errors) => {
          this.errors = errors;
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.declarationFiscaleTVAService.createDeclaration(declarationData).subscribe({
        next: () => {
          this.snackBar.open('Déclaration ajoutée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/list-declarations']);
        },
        error: (errors) => {
          this.errors = errors;
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  calculateTVA(): void {
    if (this.declaration.totalTVACollectee !== undefined && this.declaration.totalTVADeductible !== undefined) {
      this.declaration.totalTVADue = this.declaration.totalTVACollectee - this.declaration.totalTVADeductible;
      this.declaration.totalTVADue = this.declaration.totalTVADue >= 0 ? this.declaration.totalTVADue : 0;
      this.declaration.montantTotal = this.declaration.totalTVADue; // Mise à jour du montant total
    }
  }

  isFormValid(): boolean {
    return !(!this.declaration.periode || this.declaration.totalTVACollectee === null || this.declaration.totalTVADeductible === null);
  }

  monthPickerFilter = (d: Date | null): boolean => {
    return true; // À ajuster selon vos besoins pour filtrer les mois
  };

  updatePeriode(): void {
    if (this.selectedMonth) {
      const year = this.selectedMonth.getFullYear();
      const month = (this.selectedMonth.getMonth() + 1).toString().padStart(2, '0');
      this.declaration.periode = `${year}-${month}`;
    }
  }

  onMonthSelected(event: Date, picker: any): void {
    this.selectedMonth = event;
    this.updatePeriode();
    picker.close();
  }

  exportToPDF(): void {
    // Implémentation de l'export PDF (nécessite une bibliothèque comme jsPDF)
    this.snackBar.open('Exportation en PDF non implémentée', 'Fermer', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/list-declarations']);
  }
}