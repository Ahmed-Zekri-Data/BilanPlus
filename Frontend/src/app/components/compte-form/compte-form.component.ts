import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CompteComptableService } from '../../compte-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';
import { NotificationService } from '../../services/notification.service';

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
      max-width: 500px;
      margin: 20px auto;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: visible;
      position: relative;
      z-index: 1;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 15px;
      position: relative;
      overflow: visible;
    }

    mat-form-field .mat-mdc-select {
      overflow: visible;
    }

    .error-message {
      color: #d32f2f;
      margin-bottom: 15px;
      text-align: center;
      padding: 10px;
      background-color: #ffebee;
      border-radius: 4px;
      border-left: 4px solid #d32f2f;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px;
      background-color: #fafafa;
      margin: 0 -24px -24px -24px;
      border-radius: 0 0 12px 12px;
    }

    mat-card-content {
      padding: 24px;
      overflow: visible;
    }

    mat-card-title {
      color: #1E3A8A;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 20px;
      padding: 20px 24px 0 24px;
    }

    form {
      overflow: visible;
      position: relative;
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
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    this.errorMessage = '';
    if (this.compte._id) {
      this.compteService.updateCompte(this.compte._id, this.compte).subscribe({
        next: (data) => {
          this.notificationService.showCompteUpdated(data);
          this.saved.emit(data);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du compte.';
          this.notificationService.showError({
            title: 'Erreur de mise à jour',
            message: 'Impossible de mettre à jour le compte',
            details: this.errorMessage,
            icon: '❌'
          });
        }
      });
    } else {
      this.compteService.createCompte(this.compte).subscribe({
        next: (data) => {
          this.notificationService.showCompteCreated(data);
          this.saved.emit(data);
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la création du compte.';
          this.notificationService.showError({
            title: 'Erreur de création',
            message: 'Impossible de créer le compte',
            details: this.errorMessage,
            icon: '❌'
          });
        }
      });
    }
  }

  cancel() {
    this.errorMessage = '';
    this.cancelled.emit();
  }
}
