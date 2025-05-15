import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BilanService } from '../../services/bilan.service';
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
    // À implémenter - export PDF du bilan
    this.snackBar.open('Fonctionnalité d\'export en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  getCategoriesActif(): string[] {
    return Object.keys(this.bilan.actif);
  }

  getCategoriesPassif(): string[] {
    return Object.keys(this.bilan.passif);
  }
}
