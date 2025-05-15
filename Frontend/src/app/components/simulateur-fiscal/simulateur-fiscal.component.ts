import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FiscalService } from '../../services/fiscal.service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-simulateur-fiscal',
  templateUrl: './simulateur-fiscal.component.html',
  styleUrls: ['./simulateur-fiscal.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class SimulateurFiscalComponent implements OnInit {
  selectedSimulation: string = 'volume-activite';
  volumeActivityForm: FormGroup;
  regimeImpositionForm: FormGroup;
  investissementForm: FormGroup;
  isLoading: boolean = false;
  resultatSimulation: any = null;

  regimeOptions = [
    { value: 'reel', label: 'Régime Réel' },
    { value: 'forfaitaire', label: 'Régime Forfaitaire' },
    { value: 'micro', label: 'Micro-entreprise' }
  ];

  constructor(
    private fb: FormBuilder,
    private fiscalService: FiscalService,
    private snackBar: MatSnackBar
  ) {
    // Initialisation des formulaires
    this.volumeActivityForm = this.fb.group({
      chiffreAffairesActuel: [100000, [Validators.required, Validators.min(0)]],
      tauxCroissance: [10, Validators.required],
      tauxTVAMoyen: [20, Validators.required],
      tauxTVADeductibleMoyen: [20, Validators.required],
      proportionAchats: [40, Validators.required]
    });

    this.regimeImpositionForm = this.fb.group({
      regimeActuel: ['reel', Validators.required],
      chiffreAffairesAnnuel: [80000, [Validators.required, Validators.min(0)]],
      beneficeNetActuel: [25000, [Validators.required, Validators.min(0)]],
      pourcentageCharges: [60, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    this.investissementForm = this.fb.group({
      montantInvestissement: [50000, [Validators.required, Validators.min(0)]],
      typeInvestissement: ['materiel', Validators.required],
      dureeAmortissement: [5, [Validators.required, Validators.min(1)]],
      tauxImposition: [33, [Validators.required, Validators.min(0), Validators.max(100)]],
      eligibleCreditImpot: [false]
    });
  }

  ngOnInit(): void {
    // Initialisations supplémentaires si nécessaire
  }

  onTabChange(event: MatTabChangeEvent): void {
    // Réinitialiser les résultats à chaque changement d'onglet
    this.resultatSimulation = null;
    
    // Mettre à jour le type de simulation sélectionné
    switch(event.index) {
      case 0:
        this.selectedSimulation = 'volume-activite';
        break;
      case 1:
        this.selectedSimulation = 'regime-imposition';
        break;
      case 2:
        this.selectedSimulation = 'investissement';
        break;
    }
  }

  simulerVolumeActivite(): void {
    if (this.volumeActivityForm.invalid) return;
    
    this.isLoading = true;
    const parametres = this.volumeActivityForm.value;
    
    this.fiscalService.simulerChangementVolumeActivite(parametres).subscribe({
      next: (response) => {
        this.resultatSimulation = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error);
      }   
    });
  }

  simulerRegimeImposition(): void {
    if (this.regimeImpositionForm.invalid) return;
    
    this.isLoading = true;
    const parametres = this.regimeImpositionForm.value;
    
    this.fiscalService.simulerChangementRegimeImposition(parametres).subscribe({
      next: (response) => {
        this.resultatSimulation = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  simulerInvestissement(): void {
    if (this.investissementForm.invalid) return;
    
    this.isLoading = true;
    const parametres = this.investissementForm.value;
    
    this.fiscalService.simulerImpactInvestissement(parametres).subscribe({
      next: (response) => {
        this.resultatSimulation = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  handleError(error: any): void {
    this.isLoading = false;
    console.error('Erreur lors de la simulation:', error);
    
    let errorMessage = 'Une erreur est survenue lors de la simulation';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    
    this.snackBar.open(errorMessage, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  getRegimeLabel(regimeValue: string): string {
    const regime = this.regimeOptions.find(option => option.value === regimeValue);
    return regime ? regime.label : regimeValue;
  }
}