import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdvancedReportsService, FinancialRatios } from '../../services/advanced-reports.service';

@Component({
  selector: 'app-financial-ratios',
  templateUrl: './financial-ratios.component.html',
  styleUrls: ['./financial-ratios.component.css']
})
export class FinancialRatiosComponent implements OnInit {
  ratiosForm: FormGroup;
  financialRatios: FinancialRatios | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private advancedReportsService: AdvancedReportsService,
    private snackBar: MatSnackBar
  ) {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    
    this.ratiosForm = this.fb.group({
      startDate: [startOfYear, Validators.required],
      endDate: [currentDate, Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateRatios();
  }

  generateRatios(): void {
    if (this.ratiosForm.invalid) {
      this.snackBar.open('Veuillez sélectionner des dates valides', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const { startDate, endDate } = this.ratiosForm.value;

    this.advancedReportsService.getFinancialRatios(startDate, endDate)
      .subscribe({
        next: (data) => {
          this.financialRatios = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la génération des ratios financiers:', error);
          this.snackBar.open('Erreur lors de la génération des ratios', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
        }
      });
  }

  resetFilters(): void {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    
    this.ratiosForm.patchValue({
      startDate: startOfYear,
      endDate: currentDate
    });
    
    this.generateRatios();
  }

  exportToPDF(): void {
    if (!this.financialRatios) {
      this.snackBar.open('Aucune donnée à exporter', 'Fermer', {
        duration: 3000
      });
      return;
    }

    const { startDate, endDate } = this.ratiosForm.value;
    
    this.advancedReportsService.exportFinancialRatiosToPDF(startDate, endDate)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ratios-financiers-${this.formatDate(startDate)}-${this.formatDate(endDate)}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          
          this.snackBar.open('Export PDF réussi', 'Fermer', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'export PDF:', error);
          this.snackBar.open('Erreur lors de l\'export PDF', 'Fermer', {
            duration: 3000
          });
        }
      });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatRatio(value: number, type: 'ratio' | 'percentage' | 'currency' = 'ratio'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }

    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(2)}%`;
      case 'currency':
        return new Intl.NumberFormat('fr-TN', {
          style: 'currency',
          currency: 'TND',
          minimumFractionDigits: 0
        }).format(value);
      case 'ratio':
      default:
        return value.toFixed(2);
    }
  }

  getRatioClass(value: number, type: 'liquidity' | 'profitability' | 'solvency' | 'efficiency'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'neutral-ratio';
    }

    switch (type) {
      case 'liquidity':
        if (value >= 2) return 'excellent-ratio';
        if (value >= 1.5) return 'good-ratio';
        if (value >= 1) return 'acceptable-ratio';
        return 'poor-ratio';
      
      case 'profitability':
        if (value >= 0.15) return 'excellent-ratio';
        if (value >= 0.10) return 'good-ratio';
        if (value >= 0.05) return 'acceptable-ratio';
        return 'poor-ratio';
      
      case 'solvency':
        if (value <= 0.3) return 'excellent-ratio';
        if (value <= 0.5) return 'good-ratio';
        if (value <= 0.7) return 'acceptable-ratio';
        return 'poor-ratio';
      
      case 'efficiency':
        if (value >= 2) return 'excellent-ratio';
        if (value >= 1.5) return 'good-ratio';
        if (value >= 1) return 'acceptable-ratio';
        return 'poor-ratio';
      
      default:
        return 'neutral-ratio';
    }
  }

  getRatioInterpretation(value: number, ratioName: string): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'Données insuffisantes pour calculer ce ratio';
    }

    switch (ratioName) {
      case 'currentRatio':
        if (value >= 2) return 'Excellente liquidité - L\'entreprise peut facilement honorer ses dettes à court terme';
        if (value >= 1.5) return 'Bonne liquidité - Situation financière saine';
        if (value >= 1) return 'Liquidité acceptable - Surveillance recommandée';
        return 'Liquidité insuffisante - Risque de difficultés de trésorerie';
      
      case 'debtToEquity':
        if (value <= 0.3) return 'Endettement très faible - Structure financière conservatrice';
        if (value <= 0.5) return 'Endettement modéré - Bon équilibre financier';
        if (value <= 1) return 'Endettement élevé - Surveillance nécessaire';
        return 'Endettement très élevé - Risque financier important';
      
      case 'netProfitMargin':
        if (value >= 0.15) return 'Excellente rentabilité - Performance remarquable';
        if (value >= 0.10) return 'Bonne rentabilité - Entreprise performante';
        if (value >= 0.05) return 'Rentabilité acceptable - Amélioration possible';
        return 'Rentabilité faible - Optimisation nécessaire';
      
      default:
        return 'Ratio calculé avec succès';
    }
  }

  formatPeriod(): string {
    if (!this.financialRatios) return '';
    
    const start = new Date(this.financialRatios.period.startDate);
    const end = new Date(this.financialRatios.period.endDate);
    
    return `Du ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}`;
  }
}
