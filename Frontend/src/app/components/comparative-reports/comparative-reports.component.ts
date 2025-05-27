import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdvancedReportsService, ComparativeReport } from '../../services/advanced-reports.service';

@Component({
  selector: 'app-comparative-reports',
  templateUrl: './comparative-reports.component.html',
  styleUrls: ['./comparative-reports.component.css']
})
export class ComparativeReportsComponent implements OnInit {
  comparativeForm: FormGroup;
  comparativeData: ComparativeReport | null = null;
  isLoading = false;

  comparisonTypes = [
    { value: 'year-over-year', label: 'Année sur Année' },
    { value: 'month-over-month', label: 'Mois sur Mois' },
    { value: 'quarter-over-quarter', label: 'Trimestre sur Trimestre' }
  ];

  constructor(
    private fb: FormBuilder,
    private advancedReportsService: AdvancedReportsService,
    private snackBar: MatSnackBar
  ) {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    this.comparativeForm = this.fb.group({
      comparisonType: ['year-over-year', Validators.required],
      currentStartDate: [startOfYear, Validators.required],
      currentEndDate: [currentDate, Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateComparative();
  }

  generateComparative(): void {
    if (this.comparativeForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const { comparisonType, currentStartDate, currentEndDate } = this.comparativeForm.value;

    this.advancedReportsService.getComparativeReport(comparisonType, currentStartDate, currentEndDate)
      .subscribe({
        next: (data) => {
          this.comparativeData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la génération du rapport comparatif:', error);
          this.snackBar.open('Erreur lors de la génération du rapport', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
        }
      });
  }

  resetFilters(): void {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    this.comparativeForm.patchValue({
      comparisonType: 'year-over-year',
      currentStartDate: startOfYear,
      currentEndDate: currentDate
    });

    this.generateComparative();
  }

  exportToPDF(): void {
    if (!this.comparativeData) {
      this.snackBar.open('Aucune donnée à exporter', 'Fermer', {
        duration: 3000
      });
      return;
    }

    const { comparisonType, currentStartDate, currentEndDate } = this.comparativeForm.value;

    this.advancedReportsService.exportComparativeReportToPDF(comparisonType, currentStartDate, currentEndDate)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `rapport-comparatif-${comparisonType}-${this.formatDate(currentStartDate)}.pdf`;
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

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A';
    }

    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }

    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(2)}%`;
  }

  getTrendClass(trend: 'increasing' | 'decreasing' | 'stable'): string {
    switch (trend) {
      case 'increasing':
        return 'trend-up';
      case 'decreasing':
        return 'trend-down';
      case 'stable':
        return 'trend-stable';
      default:
        return 'trend-neutral';
    }
  }

  getTrendIcon(trend: 'increasing' | 'decreasing' | 'stable'): string {
    switch (trend) {
      case 'increasing':
        return 'trending_up';
      case 'decreasing':
        return 'trending_down';
      case 'stable':
        return 'trending_flat';
      default:
        return 'remove';
    }
  }

  getVarianceClass(variance: number): string {
    if (variance === null || variance === undefined || isNaN(variance)) {
      return 'variance-neutral';
    }

    if (variance > 0.1) return 'variance-excellent';
    if (variance > 0.05) return 'variance-good';
    if (variance > -0.05) return 'variance-stable';
    if (variance > -0.1) return 'variance-concern';
    return 'variance-poor';
  }

  getComparisonTypeLabel(): string {
    const type = this.comparativeForm.get('comparisonType')?.value;
    const typeObj = this.comparisonTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : 'Comparaison';
  }

  formatPeriodLabel(period: { startDate: Date; endDate: Date; label: string }): string {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return `${period.label} (${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')})`;
  }

  onComparisonTypeChange(): void {
    // Auto-adjust dates based on comparison type
    const type = this.comparativeForm.get('comparisonType')?.value;
    const currentDate = new Date();

    let startDate: Date;

    switch (type) {
      case 'year-over-year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        break;
      case 'month-over-month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        break;
      case 'quarter-over-quarter':
        const quarter = Math.floor(currentDate.getMonth() / 3);
        startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
        break;
      default:
        startDate = new Date(currentDate.getFullYear(), 0, 1);
    }

    this.comparativeForm.patchValue({
      currentStartDate: startDate,
      currentEndDate: currentDate
    });
  }
}
