import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FiscalService } from '../../services/fiscal.service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-droit-timbre-management',
  templateUrl: './droit-timbre-management.component.html',
  styleUrls: ['./droit-timbre-management.component.css']
})
export class DroitTimbreManagementComponent implements OnInit {
  droitTimbreForm: FormGroup;
  isLoading: boolean = false;
  droitTimbreResults: any = null;
  error: string | null = null;
  activeTab: string = 'calcul'; // 'calcul' ou 'rapport'
  rapportForm: FormGroup;
  rapportResults: any = null;
  isLoadingRapport: boolean = false;

  constructor(
    private fb: FormBuilder,
    private fiscalService: FiscalService,
    private snackBar: MatSnackBar
  ) {
    // Formulaire pour le calcul du droit de timbre
    this.droitTimbreForm = this.fb.group({
      dateDebut: [new Date()],
      dateFin: [new Date()],
      valeurTimbre: [0.6]
    });

    // Formulaire pour le rapport du droit de timbre
    this.rapportForm = this.fb.group({
      dateDebut: [new Date()],
      dateFin: [new Date()]
    });
  }

  ngOnInit(): void {
  }

  setActiveTab(tabIndex: number): void {
    this.activeTab = tabIndex === 0 ? 'calcul' : 'rapport';
  }

  calculateDroitTimbre(): void {
    const { dateDebut, dateFin, valeurTimbre } = this.droitTimbreForm.value;

    // Validation des dates et de la valeur du timbre
    if (!dateDebut || !dateFin) {
      this.error = 'Veuillez sélectionner des dates valides';
      return;
    }

    if (new Date(dateDebut) > new Date(dateFin)) {
      this.error = 'La date de début doit être antérieure à la date de fin';
      return;
    }

    if (valeurTimbre === null || valeurTimbre === undefined || valeurTimbre < 0) {
      this.error = 'Veuillez entrer une valeur de timbre valide';
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Appel au service pour calculer le droit de timbre
    this.fiscalService.calculerDroitTimbrePeriode(dateDebut, dateFin, valeurTimbre).subscribe({
      next: (response) => {
        this.droitTimbreResults = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du calcul du droit de timbre:', error);
        this.error = error.error?.message || 'Une erreur est survenue lors du calcul';
        this.isLoading = false;
        this.snackBar.open(this.error || 'Erreur', 'Fermer', { duration: 5000 });
      }
    });
  }

  generateRapport(): void {
    const { dateDebut, dateFin } = this.rapportForm.value;

    // Validation des dates
    if (!dateDebut || !dateFin) {
      this.error = 'Veuillez sélectionner des dates valides';
      return;
    }

    if (new Date(dateDebut) > new Date(dateFin)) {
      this.error = 'La date de début doit être antérieure à la date de fin';
      return;
    }

    this.isLoadingRapport = true;
    this.error = null;

    // Appel au service pour générer le rapport
    this.fiscalService.genererRapportDroitTimbre(dateDebut, dateFin).subscribe({
      next: (response) => {
        this.rapportResults = response.data;
        this.isLoadingRapport = false;
      },
      error: (error) => {
        console.error('Erreur lors de la génération du rapport:', error);
        this.error = error.error?.message || 'Une erreur est survenue lors de la génération du rapport';
        this.isLoadingRapport = false;
        this.snackBar.open(this.error || 'Erreur', 'Fermer', { duration: 5000 });
      }
    });
  }

  resetCalculForm(): void {
    this.droitTimbreForm.reset({
      dateDebut: new Date(),
      dateFin: new Date(),
      valeurTimbre: 0.6
    });
    this.droitTimbreResults = null;
    this.error = null;
  }

  resetRapportForm(): void {
    this.rapportForm.reset({
      dateDebut: new Date(),
      dateFin: new Date()
    });
    this.rapportResults = null;
    this.error = null;
  }
}
