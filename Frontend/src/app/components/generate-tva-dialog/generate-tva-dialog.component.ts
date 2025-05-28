import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { TVA } from '../../Models/TVA';

@Component({
  selector: 'app-generate-tva-dialog',
  templateUrl: './generate-tva-dialog.component.html',
  styleUrls: ['./generate-tva-dialog.component.css']
})
export class GenerateTvaDialogComponent implements OnInit {
  tvaForm: FormGroup;
  declarations: DeclarationFiscale[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<GenerateTvaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.tvaForm = this.fb.group({
      taux: [19, [Validators.required]],
      montant: [0, [Validators.required, Validators.min(0)]],
      declarations: [[]] // Tableau vide pour les déclarations multiples
    });

    // Ajouter un validateur personnalisé pour le taux
    this.tvaForm.get('taux')?.setValidators([
      Validators.required,
      (control) => {
        const value = control.value;
        const validTaux = [7, 13, 19];
        return validTaux.includes(value) ? null : { invalidTaux: true };
      }
    ]);

    // Écouter les changements sur le champ declarations pour calculer le montant automatiquement
    this.tvaForm.get('declarations')?.valueChanges.subscribe(selectedDeclarationIds => {
      if (selectedDeclarationIds && selectedDeclarationIds.length > 0) {
        this.calculateTotalAmount(selectedDeclarationIds);
      } else {
        // Si aucune déclaration n'est sélectionnée, réinitialiser le montant à 0
        this.tvaForm.get('montant')?.setValue(0);
      }
    });
  }

  ngOnInit(): void {
    this.loadDeclarations();
  }

  loadDeclarations(): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations) => {
        this.declarations = declarations;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des déclarations fiscales';
        this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.tvaForm.valid) {
      const formData = this.tvaForm.value;

      const payload: TVA = {
        taux: formData.taux,
        montant: formData.montant,
        declarations: formData.declarations || []
      };

      this.dialogRef.close(payload);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.tvaForm.controls).forEach(key => {
        const control = this.tvaForm.get(key);
        control?.markAsTouched();
      });

      // Construire un message d'erreur plus détaillé
      let errorMessage = 'Veuillez corriger les erreurs suivantes :';

      if (this.tvaForm.get('taux')?.invalid) {
        if (this.tvaForm.get('taux')?.hasError('required')) {
          errorMessage += '\n- Le taux de TVA est obligatoire';
        } else if (this.tvaForm.get('taux')?.hasError('invalidTaux')) {
          errorMessage += '\n- Le taux de TVA doit être 7%, 13% ou 19%';
        }
      }

      if (this.tvaForm.get('montant')?.invalid) {
        if (this.tvaForm.get('montant')?.hasError('required')) {
          errorMessage += '\n- Le montant de TVA est obligatoire';
        } else if (this.tvaForm.get('montant')?.hasError('min')) {
          errorMessage += '\n- Le montant de TVA doit être positif';
        }
      }

      this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Calcule le montant total de TVA en fonction des déclarations sélectionnées
   * @param selectedDeclarationIds IDs des déclarations sélectionnées
   */
  calculateTotalAmount(selectedDeclarationIds: string[]): void {
    if (!selectedDeclarationIds || selectedDeclarationIds.length === 0) {
      this.tvaForm.get('montant')?.setValue(0);
      return;
    }

    // Trouver les déclarations correspondantes
    const selectedDeclarations = this.declarations.filter(decl =>
      selectedDeclarationIds.includes(decl._id!)
    );

    // Calculer la somme des TVA dues
    let totalAmount = 0;
    selectedDeclarations.forEach(decl => {
      // Utiliser totalTVADue si disponible, sinon utiliser 0
      totalAmount += decl.totalTVADue || 0;
    });

    // Arrondir à 2 décimales pour éviter les problèmes de précision
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Mettre à jour le champ montant
    this.tvaForm.get('montant')?.setValue(totalAmount);
  }

  /**
   * Formate une période de déclaration (ex: "2025-05-01 - 2025-05-31") en format lisible (ex: "Mai 2025")
   * @param periode La période à formater
   * @returns La période formatée
   */
  formatPeriode(periode: string): string {
    if (!periode) return 'Période non spécifiée';

    try {
      // Extraire les dates de début et de fin
      const dates = periode.split(' - ');
      if (dates.length !== 2) return periode;

      const dateDebut = new Date(dates[0]);
      const dateFin = new Date(dates[1]);

      // Vérifier si les dates sont valides
      if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
        return periode;
      }

      // Vérifier si les dates sont dans le même mois et la même année
      if (dateDebut.getMonth() === dateFin.getMonth() && dateDebut.getFullYear() === dateFin.getFullYear()) {
        // Formater en "Mois Année"
        const mois = dateDebut.toLocaleString('fr-FR', { month: 'long' });
        const annee = dateDebut.getFullYear();
        return `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${annee}`;
      }

      // Si les dates couvrent plusieurs mois, formater en "Mois Année - Mois Année"
      const moisDebut = dateDebut.toLocaleString('fr-FR', { month: 'long' });
      const anneeDebut = dateDebut.getFullYear();
      const moisFin = dateFin.toLocaleString('fr-FR', { month: 'long' });
      const anneeFin = dateFin.getFullYear();

      return `${moisDebut.charAt(0).toUpperCase() + moisDebut.slice(1)} ${anneeDebut} - ${moisFin.charAt(0).toUpperCase() + moisFin.slice(1)} ${anneeFin}`;
    } catch (error) {
      console.error('Erreur lors du formatage de la période:', error);
      return periode;
    }
  }
}
