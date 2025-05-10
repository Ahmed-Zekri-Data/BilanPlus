import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FiscalService } from '../../services/fiscal.service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-simulation-fiscale',
  templateUrl: './simulation-fiscale.component.html',
  styleUrls: ['./simulation-fiscale.component.css']
})
export class SimulationFiscaleComponent implements OnInit {
  activeTab: string = 'volume'; // 'volume', 'regime', ou 'investissement'

  // Formulaires pour les différentes simulations
  volumeForm: FormGroup;
  regimeForm: FormGroup;
  investissementForm: FormGroup;

  // États de chargement
  isLoadingVolume: boolean = false;
  isLoadingRegime: boolean = false;
  isLoadingInvestissement: boolean = false;

  // Résultats des simulations
  volumeResults: any = null;
  regimeResults: any = null;
  investissementResults: any = null;

  // Gestion des erreurs
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private fiscalService: FiscalService,
    private snackBar: MatSnackBar
  ) {
    // Initialisation des formulaires
    this.volumeForm = this.fb.group({
      chiffreAffairesActuel: [100000, [Validators.required, Validators.min(0)]],
      pourcentageVariation: [10, [Validators.required, Validators.min(-100)]],
      annee: [new Date().getFullYear(), Validators.required]
    });

    this.regimeForm = this.fb.group({
      chiffreAffairesActuel: [100000, [Validators.required, Validators.min(0)]],
      regimeActuel: ['reel', Validators.required],
      regimeCible: ['forfaitaire', Validators.required],
      annee: [new Date().getFullYear(), Validators.required]
    });

    this.investissementForm = this.fb.group({
      montantInvestissement: [50000, [Validators.required, Validators.min(0)]],
      typeInvestissement: ['materiel', Validators.required],
      dureeAmortissement: [5, [Validators.required, Validators.min(1)]],
      tauxImposition: [25, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
  }

  setActiveTab(tabIndex: number): void {
    if (tabIndex === 0) this.activeTab = 'volume';
    else if (tabIndex === 1) this.activeTab = 'regime';
    else this.activeTab = 'investissement';
  }

  // Simulation de changement de volume d'activité
  simulerChangementVolume(): void {
    if (this.volumeForm.invalid) {
      this.error = 'Veuillez remplir correctement tous les champs';
      return;
    }

    this.isLoadingVolume = true;
    this.error = null;

    const params = this.volumeForm.value;

    this.fiscalService.simulerChangementVolumeActivite(params).subscribe({
      next: (response) => {
        this.volumeResults = response.data;
        this.isLoadingVolume = false;
      },
      error: (error) => {
        console.error('Erreur lors de la simulation:', error);
        this.error = error.error?.message || 'Une erreur est survenue lors de la simulation';
        this.isLoadingVolume = false;
        this.snackBar.open(this.error || 'Erreur', 'Fermer', { duration: 5000 });
      }
    });
  }

  // Simulation de changement de régime d'imposition
  simulerChangementRegime(): void {
    if (this.regimeForm.invalid) {
      this.error = 'Veuillez remplir correctement tous les champs';
      return;
    }

    this.isLoadingRegime = true;
    this.error = null;

    const params = this.regimeForm.value;

    this.fiscalService.simulerChangementRegimeImposition(params).subscribe({
      next: (response) => {
        this.regimeResults = response.data;
        this.isLoadingRegime = false;
      },
      error: (error) => {
        console.error('Erreur lors de la simulation:', error);
        this.error = error.error?.message || 'Une erreur est survenue lors de la simulation';
        this.isLoadingRegime = false;
        this.snackBar.open(this.error || 'Erreur', 'Fermer', { duration: 5000 });
      }
    });
  }

  // Simulation d'impact d'investissement
  simulerImpactInvestissement(): void {
    if (this.investissementForm.invalid) {
      this.error = 'Veuillez remplir correctement tous les champs';
      return;
    }

    this.isLoadingInvestissement = true;
    this.error = null;

    const params = this.investissementForm.value;

    this.fiscalService.simulerImpactInvestissement(params).subscribe({
      next: (response) => {
        this.investissementResults = response.data;
        this.isLoadingInvestissement = false;
      },
      error: (error) => {
        console.error('Erreur lors de la simulation:', error);
        this.error = error.error?.message || 'Une erreur est survenue lors de la simulation';
        this.isLoadingInvestissement = false;
        this.snackBar.open(this.error || 'Erreur', 'Fermer', { duration: 5000 });
      }
    });
  }

  // Réinitialisation des formulaires
  resetVolumeForm(): void {
    this.volumeForm.reset({
      chiffreAffairesActuel: 100000,
      pourcentageVariation: 10,
      annee: new Date().getFullYear()
    });
    this.volumeResults = null;
  }

  resetRegimeForm(): void {
    this.regimeForm.reset({
      chiffreAffairesActuel: 100000,
      regimeActuel: 'reel',
      regimeCible: 'forfaitaire',
      annee: new Date().getFullYear()
    });
    this.regimeResults = null;
  }

  resetInvestissementForm(): void {
    this.investissementForm.reset({
      montantInvestissement: 50000,
      typeInvestissement: 'materiel',
      dureeAmortissement: 5,
      tauxImposition: 25
    });
    this.investissementResults = null;
  }
}
