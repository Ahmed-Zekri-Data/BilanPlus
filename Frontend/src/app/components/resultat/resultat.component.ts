import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResultatService } from '../../services/resultat.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-resultat',
  templateUrl: './resultat.component.html',
  styleUrls: ['./resultat.component.css']
})
export class ResultatComponent implements OnInit {
  resultat: any = {
    charges: {},
    produits: {},
    totalCharges: 0,
    totalProduits: 0,
    resultatNet: 0,
    periode: {
      debut: new Date(),
      fin: new Date()
    }
  };
  filtreForm: FormGroup;
  isLoading = false;

  constructor(
    private resultatService: ResultatService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    // Initialiser avec le mois courant
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.filtreForm = this.fb.group({
      dateDebut: [firstDay, Validators.required],
      dateFin: [lastDay, Validators.required]
    });
  }

  ngOnInit(): void {
    this.chargerResultat();
  }

  chargerResultat(): void {
    const values = this.filtreForm.value;

    if (this.filtreForm.invalid) {
      this.snackBar.open('Veuillez spécifier des dates valides', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const dateDebut = values.dateDebut.toISOString();
    const dateFin = values.dateFin.toISOString();

    this.resultatService.getResultat(dateDebut, dateFin)
      .subscribe({
        next: (data) => {
          this.resultat = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement du compte de résultat', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  appliquerFiltres(): void {
    this.chargerResultat();
  }

  exporterPDF(): void {
    // À implémenter - export PDF du compte de résultat
    this.snackBar.open('Fonctionnalité d\'export en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  getCategoriesCharges(): string[] {
    return Object.keys(this.resultat.charges);
  }

  getCategoriesProduits(): string[] {
    return Object.keys(this.resultat.produits);
  }
}
