import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CompteComptableService } from '../../compte-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';
import { MatSnackBar } from '@angular/material/snack-bar'; // Ajout

@Component({
  selector: 'app-compte-form',
  template: `
    <mat-card class="compte-form-card">
      <mat-card-title>{{ compte._id ? 'Modifier le compte' : 'Ajouter un compte' }}</mat-card-title>
      <mat-card-content>
        <form (ngSubmit)="onSubmit()">
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <mat-form-field appearance="fill">
            <mat-label>Numéro du compte</mat-label>
            <input matInput [(ngModel)]="compte.numeroCompte" name="numeroCompte" placeholder="Numéro" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Nom</mat-label>
            <input matInput [(ngModel)]="compte.nom" name="nom" placeholder="Nom" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="compte.type" name="type" required>
              <mat-option value="actif">Actif</mat-option>
              <mat-option value="passif">Passif</mat-option>
              <mat-option value="charge">Charge</mat-option>
              <mat-option value="produit">Produit</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Solde</mat-label>
            <input matInput [(ngModel)]="compte.solde" name="solde" type="number" placeholder="Solde" required>
          </mat-form-field>
          <mat-card-actions>
            <button mat-raised-button color="primary" type="submit">Sauvegarder</button>
            <button mat-raised-button color="warn" type="button" (click)="cancel()">Annuler</button>
          </mat-card-actions>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .compte-form-card {
      max-width: 400px;
      margin: 20px auto;
      background-color: var(--card-background, #fff);
      color: var(--text-color, #000);
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 10px;
    }

    .error-message {
      color: red;
      margin-bottom: 10px;
      text-align: center;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `]
})
export class CompteFormComponent {
  @Input() compte: CompteComptable = { numeroCompte: '', nom: '', type: 'actif', solde: 0 };
  @Output() saved = new EventEmitter<CompteComptable>();
  @Output() cancelled = new EventEmitter<void>();

  errorMessage: string = '';

  constructor(
    private compteService: CompteComptableService,
    private snackBar: MatSnackBar // Ajout
  ) {}

  onSubmit() {
    this.errorMessage = '';
    if (this.compte._id) {
      this.compteService.updateCompte(this.compte._id, this.compte).subscribe({
        next: (data) => {
          this.snackBar.open('Compte mis à jour avec succès !', 'OK', { duration: 3000 });
          this.saved.emit(data);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du compte.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000 });
        }
      });
    } else {
      this.compteService.createCompte(this.compte).subscribe({
        next: (data) => {
          this.snackBar.open('Compte créé avec succès !', 'OK', { duration: 3000 });
          this.saved.emit(data);
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la création du compte.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  cancel() {
    this.errorMessage = '';
    this.cancelled.emit();
  }
}