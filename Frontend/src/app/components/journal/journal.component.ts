import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { JournalService } from '../../services/journal.service';
import { EcritureComptable } from '../../Models/EcritureComptable';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css']
})
export class JournalComponent implements OnInit {
  journal: EcritureComptable[] = [];
  filtreForm: FormGroup;
  totaux = { debit: 0, credit: 0 };
  isLoading = false;

  displayedColumns: string[] = ['date', 'libelle', 'compteDebit', 'montantDebit', 'compteCredit', 'montantCredit'];

  constructor(
    private journalService: JournalService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filtreForm = this.fb.group({
      dateDebut: [''],
      dateFin: ['']
    });
  }

  ngOnInit(): void {
    this.chargerJournal();
  }

  chargerJournal(): void {
    this.isLoading = true;
    const filters = this.filtreForm.value;

    this.journalService.getJournal(filters.dateDebut, filters.dateFin)
      .subscribe({
        next: (data) => {
          this.journal = data.journal;
          this.totaux = data.totaux;
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement du journal', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  appliquerFiltres(): void {
    this.chargerJournal();
  }

  reinitialiserFiltres(): void {
    this.filtreForm.reset();
    this.chargerJournal();
  }
}
