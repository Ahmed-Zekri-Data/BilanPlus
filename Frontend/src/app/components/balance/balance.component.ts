import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BalanceService } from '../../services/balance.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompteComptable } from '../../Models/CompteComptable';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  balanceData: any = { balance: [], totaux: {} };
  filtreForm: FormGroup;
  isLoading = false;

  displayedColumns: string[] = [
    'numeroCompte',
    'nom',
    'soldeInitial',
    'mouvementDebit',
    'mouvementCredit',
    'soldeDebit',
    'soldeCredit'
  ];

  constructor(
    private balanceService: BalanceService,
    private pdfExportService: PdfExportService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filtreForm = this.fb.group({
      dateDebut: [''],
      dateFin: ['']
    });
  }

  ngOnInit(): void {
    this.chargerBalance();
  }

  chargerBalance(): void {
    this.isLoading = true;
    const filters = this.filtreForm.value;

    this.balanceService.getBalance(filters.dateDebut, filters.dateFin)
      .subscribe({
        next: (data) => {
          this.balanceData = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement de la balance', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  appliquerFiltres(): void {
    this.chargerBalance();
  }

  reinitialiserFiltres(): void {
    this.filtreForm.reset();
    this.chargerBalance();
  }

  exporterPDF(): void {
    if (!this.balanceData.balance || this.balanceData.balance.length === 0) {
      this.snackBar.open('Aucune donnée à exporter', 'Fermer', {
        duration: 3000
      });
      return;
    }

    try {
      this.pdfExportService.exportBalance(this.balanceData, this.filtreForm.value);
      this.snackBar.open('Export PDF en cours...', 'Fermer', {
        duration: 2000
      });
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      this.snackBar.open('Erreur lors de l\'export PDF', 'Fermer', {
        duration: 3000
      });
    }
  }

  getCompteTypeClass(type: string): string {
    switch (type) {
      case 'actif': return 'compte-actif';
      case 'passif': return 'compte-passif';
      case 'charge': return 'compte-charge';
      case 'produit': return 'compte-produit';
      default: return '';
    }
  }
}
