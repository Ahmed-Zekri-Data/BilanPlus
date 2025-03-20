import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CompteComptableService } from '../../compte-comptable.service';
import { EcritureComptableService } from '../../ecriture-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';
import { EcritureComptable, LigneEcriture } from '../../Models/EcritureComptable';

@Component({
  selector: 'app-ecriture-form',
  template: `
    <form (ngSubmit)="onSubmit()">
      <div>
        <label>Date:</label>
        <input type="date" [(ngModel)]="ecriture.date" name="date" required>
      </div>
      <div>
        <label>Libellé:</label>
        <input [(ngModel)]="ecriture.libelle" name="libelle" placeholder="Libellé" required>
      </div>
      <div>
        <h4>Ligne de débit</h4>
        <label>Compte:</label>
        <select [(ngModel)]="debitLigne.compte" name="debitCompte" required>
          <option *ngFor="let compte of comptes" [ngValue]="compte">{{ compte.numeroCompte }} - {{ compte.nom }}</option>
        </select>
        <label>Montant:</label>
        <input type="number" [(ngModel)]="debitLigne.montant" name="debitMontant" required>
      </div>
      <div>
        <h4>Ligne de crédit</h4>
        <label>Compte:</label>
        <select [(ngModel)]="creditLigne.compte" name="creditCompte" required>
          <option *ngFor="let compte of comptes" [ngValue]="compte">{{ compte.numeroCompte }} - {{ compte.nom }}</option>
        </select>
        <label>Montant:</label>
        <input type="number" [(ngModel)]="creditLigne.montant" name="creditMontant" required>
      </div>
      <div *ngIf="errorMessage" style="color: red;">
        {{ errorMessage }}
      </div>
      <button type="submit">Sauvegarder</button>
      <button type="button" (click)="cancel()">Annuler</button>
    </form>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 500px;
      margin: 20px 0;
    }
    div {
      display: flex;
      flex-direction: column;
    }
    input, select {
      padding: 5px;
      margin-top: 5px;
    }
    button {
      padding: 5px 10px;
      margin-right: 10px;
    }
    h4 {
      margin: 10px 0 5px;
    }
  `]
})
export class EcritureFormComponent implements OnInit {
  @Input() ecriture: EcritureComptable = { libelle: '', lignes: [], date: new Date() };
  @Output() saved = new EventEmitter<EcritureComptable>();
  @Output() cancelled = new EventEmitter<void>();

  comptes: CompteComptable[] = [];
  debitLigne: LigneEcriture = { compte: null!, montant: 0, nature: 'débit' };
  creditLigne: LigneEcriture = { compte: null!, montant: 0, nature: 'crédit' };
  errorMessage: string = '';

  constructor(
    private compteService: CompteComptableService,
    private ecritureService: EcritureComptableService
  ) {}

  ngOnInit() {
    console.log('EcritureFormComponent initialisé, ecriture:', this.ecriture);
    this.compteService.getComptes().subscribe({
      next: (comptes) => {
        console.log('Comptes chargés pour le formulaire:', comptes);
        this.comptes = comptes;
        if (this.ecriture._id && this.ecriture.lignes.length >= 2) {
          this.debitLigne = { ...this.ecriture.lignes.find(l => l.nature === 'débit')! };
          this.creditLigne = { ...this.ecriture.lignes.find(l => l.nature === 'crédit')! };
        }
      },
      error: (err) => console.error('Erreur lors de la récupération des comptes:', err)
    });
  }

  onSubmit() {
    if (this.debitLigne.montant !== this.creditLigne.montant) {
      this.errorMessage = 'Les montants débit et crédit doivent être égaux.';
      return;
    }

    this.ecriture.lignes = [this.debitLigne, this.creditLigne];

    if (this.ecriture._id) {
      this.ecritureService.updateEcriture(this.ecriture._id, this.ecriture).subscribe({
        next: (data) => {
          console.log('Écriture mise à jour:', data);
          this.saved.emit(data);
        },
        error: (err) => console.error('Erreur lors de la mise à jour:', err)
      });
    } else {
      this.ecritureService.createEcriture(this.ecriture).subscribe({
        next: (data) => {
          console.log('Écriture créée:', data);
          this.saved.emit(data);
        },
        error: (err) => console.error('Erreur lors de la création:', err)
      });
    }
  }

  cancel() {
    console.log('Annuler cliqué dans EcritureFormComponent');
    this.cancelled.emit();
  }
}