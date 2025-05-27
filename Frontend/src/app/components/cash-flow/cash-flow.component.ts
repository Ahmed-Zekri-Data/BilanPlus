import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdvancedReportsService, CashFlowData } from '../../services/advanced-reports.service';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
})
export class CashFlowComponent implements OnInit {
  cashFlowForm: FormGroup;
  cashFlowData: CashFlowData | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private advancedReportsService: AdvancedReportsService,
    private snackBar: MatSnackBar
  ) {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    this.cashFlowForm = this.fb.group({
      startDate: [startOfYear, Validators.required],
      endDate: [currentDate, Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateCashFlow();
  }

  generateCashFlow(): void {
    if (this.cashFlowForm.invalid) {
      this.snackBar.open('Veuillez sélectionner des dates valides', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const { startDate, endDate } = this.cashFlowForm.value;

    this.advancedReportsService.getCashFlowStatement(startDate, endDate)
      .subscribe({
        next: (data) => {
          this.cashFlowData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la génération du tableau de flux de trésorerie:', error);
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

    this.cashFlowForm.patchValue({
      startDate: startOfYear,
      endDate: currentDate
    });

    this.generateCashFlow();
  }

  exportToPDF(): void {
    if (!this.cashFlowData) {
      this.snackBar.open('Aucune donnée à exporter', 'Fermer', {
        duration: 3000
      });
      return;
    }

    const { startDate, endDate } = this.cashFlowForm.value;

    this.advancedReportsService.exportCashFlowToPDF(startDate, endDate)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `tableau-flux-tresorerie-${this.formatDate(startDate)}-${this.formatDate(endDate)}.pdf`;
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

  getActivityTotal(activity: 'operating' | 'investing' | 'financing'): number {
    if (!this.cashFlowData) return 0;

    switch (activity) {
      case 'operating':
        return this.cashFlowData.operatingActivities.total;
      case 'investing':
        return this.cashFlowData.investingActivities.total;
      case 'financing':
        return this.cashFlowData.financingActivities.total;
      default:
        return 0;
    }
  }

  getActivityClass(amount: number | null | undefined): string {
    if (!amount || amount === 0) return 'neutral-amount';
    if (amount > 0) return 'positive-amount';
    if (amount < 0) return 'negative-amount';
    return 'neutral-amount';
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0,00 TND';
    }

    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatPeriod(): string {
    if (!this.cashFlowData) return '';

    const start = new Date(this.cashFlowData.period.startDate);
    const end = new Date(this.cashFlowData.period.endDate);

    return `Du ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}`;
  }
}
