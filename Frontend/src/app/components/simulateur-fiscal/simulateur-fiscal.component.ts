// Frontend/src/app/components/simulateur-fiscal/simulateur-fiscal.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FiscalService } from '../../services/fiscal.service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-simulateur-fiscal',
  templateUrl: './simulateur-fiscal.component.html',
  styleUrls: ['./simulateur-fiscal.component.scss']
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
    { value: 'micro', label: 'Micro-Entreprise' }
  ];

  constructor(
    private fb: FormBuilder,
    private fiscalService: FiscalService,
    private snackBar: MatSnackBar
  ) {
    // Initialiser le formulaire de simulation volume d'activité
    this.volumeActivityForm = this.fb.group({
      chiffreAffairesActuel: [0, [Validators.required, Validators.min(0)]],
      tauxCroissance: [0, Validators.required],
      tauxTVAMoyen: [19, [Validators.required, Validators.min(0), Validators.max(100)]],
      tauxTVADeductibleMoyen: [19, [Validators.required, Validators.min(0), Validators.max(100)]],
      proportionAchats: [40, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    
    // Initialiser le formulaire de changement de régime
    this.regimeImpositionForm = this.fb.group({
      chiffreAffaires: [0, [Validators.required, Validators.min(0)]],
      beneficeNet: [0, [Validators.required, Validators.min(0)]],
      regimeActuel: ['reel', Validators.required],
      regimeCible: ['forfaitaire', Validators.required],
      tauxTVAMoyen: [19, [Validators.required, Validators.min(0), Validators.max(100)]],
      proportionAchats: [40, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    
    // Initialiser le formulaire d'investissement
    this.investissementForm = this.fb.group({
      montantInvestissement: [0, [Validators.required, Validators.min(0)]],
      dureeAmortissement: [5, [Validators.required, Validators.min(1)]],
      tauxInteretEmprunt: [8, [Validators.required, Validators.min(0)]],
      pourcentageEmprunt: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      augmentationCAAttendue: [0, [Validators.required, Validators.min(0)]],
      tauxIS: [25, [Validators.required, Validators.min(0), Validators.max(100)]],
      tauxTVA: [19, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {}

  changeSimulation(simulation: string): void {
    this.selectedSimulation = simulation;
    this.resultatSimulation = null;
  }

  simulerVolumeActivite(): void {
    if (this.volumeActivityForm.invalid) {
      this.snackBar.open('Veuillez remplir correctement tous les champs', 'Fermer', {
        duration: 3000
      });
      return;
    }
    
    this.isLoading = true;
    this.fiscalService.simulerChangementVolumeActivite(this.volumeActivityForm.value)
      .subscribe({
        next: (response) => {
          this.resultatSimulation = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la simulation: ' + error.message, 'Fermer', {
            duration: 5000
          });
          this.isLoading = false;
        }
      });
  }

  simulerChangementRegime(): void {
    if (this.regimeImpositionForm.invalid) {
      this.snackBar.open('Veuillez remplir correctement tous les champs', 'Fermer', {
        duration: 3000
      });
      return;
    }
    
    // Vérifier que les régimes sont différents
    if (this.regimeImpositionForm.get('regimeActuel')?.value === this.regimeImpositionForm.get('regimeCible')?.value) {
      this.snackBar.open('Le régime actuel et le régime cible doivent être différents', 'Fermer', {
        duration: 3000
      });
      return;
    }
    
    this.isLoading = true;
    this.fiscalService.simulerChangementRegimeImposition(this.regimeImpositionForm.value)
      .subscribe({
        next: (response) => {
          this.resultatSimulation = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la simulation: ' + error.message, 'Fermer', {
            duration: 5000
          });
          this.isLoading = false;
        }
      });
  }

  simulerInvestissement(): void {
    if (this.investissementForm.invalid) {
      this.snackBar.open('Veuillez remplir correctement tous les champs', 'Fermer', {
        duration: 3000
      });
      return;
    }
    
    this.isLoading = true;
    this.fiscalService.simulerImpactInvestissement(this.investissementForm.value)
      .subscribe({
        next: (response) => {
          this.resultatSimulation = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la simulation: ' + error.message, 'Fermer', {
            duration: 5000
          });
          this.isLoading = false;
        }
      });
  }

  getRecommandationClass(importance: string): string {
    switch (importance) {
      case 'haute': return 'haute-importance';
      case 'moyenne': return 'moyenne-importance';
      case 'basse': return 'basse-importance';
      default: return '';
    }
  }

  resetSimulation(): void {
    this.resultatSimulation = null;
  }
}
