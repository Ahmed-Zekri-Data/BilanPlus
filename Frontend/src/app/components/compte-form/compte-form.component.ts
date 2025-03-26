import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CompteComptableService } from '../../compte-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';

@Component({
  selector: 'app-compte-form',
  template: `
    <form (ngSubmit)="onSubmit()">
      <div>
        <label>Numéro du compte:</label>
        <input [(ngModel)]="compte.numeroCompte" name="numeroCompte" placeholder="Numéro" required>
      </div>
      <div>
        <label>Nom:</label>
        <input [(ngModel)]="compte.nom" name="nom" placeholder="Nom" required>
      </div>
      <div>
        <label>Type:</label>
        <select [(ngModel)]="compte.type" name="type" required>
          <option value="actif">Actif</option>
          <option value="passif">Passif</option>
          <option value="charge">Charge</option>
          <option value="produit">Produit</option>
        </select>
      </div>
      <div>
        <label>Solde:</label>
        <input [(ngModel)]="compte.solde" name="solde" type="number" placeholder="Solde" required>
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
      max-width: 400px;
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
  `]
})
export class CompteFormComponent {
  @Input() compte: CompteComptable = { numeroCompte: '', nom: '', type: 'actif', solde: 0 };
  @Output() saved = new EventEmitter<CompteComptable>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(private compteService: CompteComptableService) {}

  onSubmit() {
    if (this.compte._id) {
      this.compteService.updateCompte(this.compte._id, this.compte).subscribe({
        next: (data) => {
          console.log('Compte mis à jour:', data);
          this.saved.emit(data);
        },
        error: (err) => console.error('Erreur lors de la mise à jour:', err)
      });
    } else {
      this.compteService.createCompte(this.compte).subscribe({
        next: (data) => {
          console.log('Compte créé:', data);
          this.saved.emit(data);
        },
        error: (err) => console.error('Erreur lors de la création:', err)
      });
    }
  }

  cancel() {
    this.cancelled.emit();
  }
}