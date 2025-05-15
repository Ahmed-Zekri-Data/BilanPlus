import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BalanceService } from '../../services/balance.service';
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
    // À implémenter - export PDF de la balance
    this.snackBar.open('Fonctionnalité d\'export en cours de développement', 'Fermer', {
      duration: 3000
    });
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
