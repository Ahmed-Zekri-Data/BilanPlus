import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CompteComptableService } from '../../compte-comptable.service';
import { EcritureComptableService } from '../../ecriture-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';
import { EcritureComptable, LigneEcriture } from '../../Models/EcritureComptable';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ecriture-form',
  templateUrl: './ecriture-form.component.html',
  styleUrls: ['./ecriture-form.component.css'],
})
export class EcritureFormComponent implements OnInit {
  @Input() ecriture: EcritureComptable | null | undefined = { libelle: '', lignes: [], date: new Date() };
  @Output() saved = new EventEmitter<EcritureComptable>();
  @Output() cancelled = new EventEmitter<void>();

  ecritureForm: FormGroup;
  comptes: CompteComptable[] = [];

  constructor(
    private fb: FormBuilder,
    private compteService: CompteComptableService,
    private ecritureService: EcritureComptableService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.ecritureForm = this.fb.group({
      libelle: ['', Validators.required],
      date: ['', Validators.required],
      lignes: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.compteService.getComptes().subscribe({
      next: (comptes) => {
        console.log('Comptes chargés pour le formulaire:', comptes);
        this.comptes = comptes;
        if (this.comptes.length === 0) {
          this.snackBar.open('Aucun compte disponible. Veuillez ajouter des comptes d’abord.', 'Fermer', {
            duration: 5000,
          });
        }
        if (this.ecriture?._id && this.ecriture.lignes.length > 0) {
          this.ecritureForm.patchValue({
            libelle: this.ecriture.libelle,
            date: this.ecriture.date?.toISOString().split('T')[0] || '',
          });
          const lignesArray = this.ecritureForm.get('lignes') as FormArray;
          this.ecriture.lignes.forEach((ligne) => {
            const natureValide = ['débit', 'crédit'].includes(ligne.nature) ? ligne.nature : 'débit';
            lignesArray.push(
              this.fb.group({
                compte: [ligne.compte, Validators.required],
                montant: [ligne.montant, [Validators.required, Validators.min(0)]],
                nature: [natureValide, Validators.required],
              })
            );
          });
        } else {
          this.addLigne('débit');
          this.addLigne('crédit');
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des comptes:', err);
        this.snackBar.open('Erreur lors de la récupération des comptes.', 'Fermer', { duration: 5000 });
      },
    });
  }

  get lignes(): FormArray {
    return this.ecritureForm.get('lignes') as FormArray;
  }

  addLigne(nature: 'débit' | 'crédit' = 'débit'): void {
    const ligne = this.fb.group({
      compte: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
      nature: [nature, Validators.required],
    });
    console.log('Nouvelle ligne ajoutée:', ligne.value, 'Désactivée ?', ligne.disabled);
    ligne.enable(); // S’assurer que le FormGroup est activé
    ligne.get('nature')?.enable(); // S’assurer que le FormControl nature est activé
    ligne.get('nature')?.valueChanges.subscribe((value) => {
      console.log('Nature changée:', value);
    });
    this.lignes.push(ligne);
  }

  removeLigne(index: number): void {
    if (this.lignes.length > 2) {
      this.lignes.removeAt(index);
    } else {
      this.snackBar.open('Une écriture doit avoir au moins une ligne de débit et une ligne de crédit.', 'Fermer', {
        duration: 3000,
      });
    }
  }

  onSubmit(): void {
    console.log('Formulaire soumis:', this.ecritureForm.value);
    console.log('Formulaire valide ?', this.ecritureForm.valid);
    if (this.ecritureForm.invalid) {
      console.log('Erreurs du formulaire:', this.ecritureForm.errors);
      this.ecritureForm.markAllAsTouched();
      this.snackBar.open('Veuillez remplir tous les champs requis.', 'Fermer', { duration: 3000 });
      return;
    }

    // Vérifier que chaque ligne a un compte sélectionné
    const lignes = this.ecritureForm.value.lignes;
    const hasInvalidLigne = lignes.some((ligne: any) => !ligne.compte);
    if (hasInvalidLigne) {
      this.snackBar.open('Veuillez sélectionner un compte pour chaque ligne.', 'Fermer', { duration: 3000 });
      return;
    }

    const ecritureData: EcritureComptable = {
      libelle: this.ecritureForm.value.libelle,
      date: new Date(this.ecritureForm.value.date),
      lignes: this.ecritureForm.value.lignes.map((ligne: any) => ({
        compte: ligne.compte._id || ligne.compte,
        montant: ligne.montant,
        nature: ligne.nature,
      })),
    };

    console.log('Données de l’écriture à envoyer:', ecritureData);

    if (this.ecriture?._id) {
      this.ecritureService.updateEcriture(this.ecriture._id, ecritureData).subscribe({
        next: (data) => {
          this.snackBar.open('Écriture mise à jour avec succès !', 'Fermer', { duration: 3000 });
          this.saved.emit(data);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.snackBar.open(error.message || 'Erreur lors de la mise à jour de l’écriture.', 'Fermer', { duration: 5000 });
        },
      });
    } else {
      this.ecritureService.createEcriture(ecritureData).subscribe({
        next: (data) => {
          this.snackBar.open('Écriture créée avec succès !', 'Fermer', { duration: 3000 });
          this.saved.emit(data);
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.snackBar.open(error.message || 'Erreur lors de la création de l’écriture.', 'Fermer', { duration: 5000 });
        },
      });
    }
  }

  cancel(): void {
    console.log('Annuler cliqué dans EcritureFormComponent');
    this.cancelled.emit();
  }
}
