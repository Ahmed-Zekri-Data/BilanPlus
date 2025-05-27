import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BilanService } from '../../services/bilan.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bilan',
  templateUrl: './bilan.component.html',
  styleUrls: ['./bilan.component.css']
})
export class BilanComponent implements OnInit {
  bilan: any = {
    actif: {},
    passif: {},
    totalActif: 0,
    totalPassif: 0,
    date: new Date()
  };
  filtreForm: FormGroup;
  isLoading = false;

  constructor(
    private bilanService: BilanService,
    private pdfExportService: PdfExportService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filtreForm = this.fb.group({
      date: [new Date()]
    });
  }

  ngOnInit(): void {
    this.chargerBilan();
  }

  chargerBilan(): void {
    this.isLoading = true;
    const date = this.filtreForm.value.date;

    this.bilanService.getBilan(date)
      .subscribe({
        next: (data) => {
          this.bilan = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement du bilan', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  appliquerFiltres(): void {
    this.chargerBilan();
  }

  exporterPDF(): void {
    if (!this.bilan || (!this.bilan.actif && !this.bilan.passif)) {
      this.snackBar.open('Aucune donnée à exporter', 'Fermer', {
        duration: 3000
      });
      return;
    }

    try {
      this.pdfExportService.exportBilan(this.bilan);
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

  getCategoriesActif(): string[] {
    return Object.keys(this.bilan.actif);
  }

  getCategoriesPassif(): string[] {
    return Object.keys(this.bilan.passif);
  }
}
