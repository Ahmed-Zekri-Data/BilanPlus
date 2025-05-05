import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CompteComptableService } from '../../compte-comptable.service';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompteComptable } from '../../Models/CompteComptable';
import { MatDatepicker } from '@angular/material/datepicker';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-generate-declaration-dialog',
  templateUrl: './generate-declaration-dialog.component.html',
  styleUrls: ['./generate-declaration-dialog.component.css']
})
export class GenerateDeclarationDialogComponent implements OnInit {
  declarationForm: FormGroup;
  comptes: CompteComptable[] = [];
  declarationTypes = ['mensuelle', 'trimestrielle', 'annuelle'];

  @ViewChild('pickerMois') pickerMois!: MatDatepicker<Date>;
  @ViewChild('moisInput') moisInput!: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<GenerateDeclarationDialogComponent>,
    private compteService: CompteComptableService,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.declarationForm = this.fb.group({
      compteComptable: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadComptes();
    this.declarationForm.get('dateDebut')?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.normalizeDates();
      this.updateTypeAndValidateDates();
    });

    this.declarationForm.get('dateFin')?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.normalizeDates();
      this.updateTypeAndValidateDates();
    });
  }

  loadComptes(): void {
    this.compteService.getComptes().subscribe({
      next: (comptes) => (this.comptes = comptes),
      error: (err) => console.error('Erreur chargement comptes:', err)
    });
  }

  normalizeDates(): void {
    const debut: Date = this.declarationForm.get('dateDebut')?.value;
    const fin: Date = this.declarationForm.get('dateFin')?.value;

    if (debut) {
      const normalizedDebut = new Date(debut.getFullYear(), debut.getMonth(), 1);
      console.log('Avant normalisation (debut):', debut);
      console.log('Après normalisation (debut):', normalizedDebut);
      this.declarationForm.get('dateDebut')?.setValue(normalizedDebut, { emitEvent: false });
    }

    if (fin) {
      const lastDay = new Date(fin.getFullYear(), fin.getMonth() + 1, 0);
      console.log('Avant normalisation (fin):', fin);
      console.log('Après normalisation (fin):', lastDay);
      this.declarationForm.get('dateFin')?.setValue(lastDay, { emitEvent: false });
    }
  }

  updateTypeAndValidateDates(): void {
    const debut: Date = this.declarationForm.get('dateDebut')?.value;
    const fin: Date = this.declarationForm.get('dateFin')?.value;

    console.log('Date début (raw):', this.declarationForm.get('dateDebut')?.value);
    console.log('Date fin (raw):', this.declarationForm.get('dateFin')?.value);
    console.log('Date début:', debut);
    console.log('Date fin:', fin);

    if (!debut || !fin) {
      console.log('Dates non définies');
      return;
    }

    if (debut > fin) {
      this.snackBar.open("La date de début ne peut pas être après la date de fin", "Fermer", { duration: 3000 });
      this.declarationForm.get('type')?.setValue('');
      this.cdr.detectChanges();
      return;
    }

    const diffInMs = fin.getTime() - debut.getTime();
    const monthsDiff = fin.getMonth() - debut.getMonth() + (12 * (fin.getFullYear() - debut.getFullYear()));

    console.log('Différence en mois:', monthsDiff);
    console.log('Différence en millisecondes:', diffInMs);

    if (monthsDiff < 0 || monthsDiff > 11) {
      this.snackBar.open("La période doit être entre 1 mois et 1 an", "Fermer", { duration: 3000 });
      this.declarationForm.get('type')?.setValue('');
      this.cdr.detectChanges();
      return;
    }

    const isFirstDay = debut.getDate() === 1;
    const isLastDay = fin.getDate() === new Date(fin.getFullYear(), fin.getMonth() + 1, 0).getDate();

    console.log('Premier jour:', isFirstDay, 'Dernier jour:', isLastDay);

    if (!isFirstDay || !isLastDay) {
      this.snackBar.open("Les dates doivent couvrir des mois calendaires complets", "Fermer", { duration: 3000 });
      this.declarationForm.get('type')?.setValue('');
      this.cdr.detectChanges();
      return;
    }

    let typeValue = '';
    if (debut.getFullYear() === fin.getFullYear() && debut.getMonth() === fin.getMonth()) {
      typeValue = 'mensuelle';
    } else if (debut.getFullYear() === fin.getFullYear() && fin.getMonth() - debut.getMonth() === 2) {
      typeValue = 'trimestrielle';
    } else if (debut.getFullYear() === fin.getFullYear() && debut.getMonth() === 0 && fin.getMonth() === 11) {
      typeValue = 'annuelle';
    } else {
      this.snackBar.open("La période ne correspond pas à un type valide (mois, trimestre, année)", "Fermer", { duration: 3000 });
      this.declarationForm.get('type')?.setValue('');
      this.cdr.detectChanges();
      return;
    }

    console.log('Définition du type:', typeValue);
    this.declarationForm.get('type')?.setValue(typeValue);
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.declarationForm.valid) {
      const formData = this.declarationForm.value;

      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      const payload = {
        dateDebut: formatDate(new Date(formData.dateDebut)),
        dateFin: formatDate(new Date(formData.dateFin)),
        type: formData.type,
        compteComptable: formData.compteComptable
      };

      this.dialogRef.close(payload);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}