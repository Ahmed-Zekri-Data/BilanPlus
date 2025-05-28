import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../components/shared/confirm-dialog/confirm-dialog.component';
import { SuccessDialogComponent } from '../components/shared/success-dialog/success-dialog.component';
import { SMALL_CENTERED_DIALOG_CONFIG, MEDIUM_CENTERED_DIALOG_CONFIG } from '../config/dialog.config';

export interface NotificationData {
  title: string;
  message: string;
  details?: string;
  icon?: string;
  actions?: NotificationAction[];
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export interface NotificationAction {
  label: string;
  action: () => void;
  color?: 'primary' | 'accent' | 'warn';
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  // Notifications de succès améliorées - Affichage direct au centre
  showSuccess(data: NotificationData): void {
    // Afficher directement le dialog au centre de la page
    this.showSuccessDialog(data);
  }

  // Notifications d'erreur améliorées - Affichage direct au centre
  showError(data: NotificationData): void {
    // Afficher directement le dialog d'erreur au centre
    this.showErrorDialog(data);
  }

  // Notifications d'avertissement - Affichage direct au centre
  showWarning(data: NotificationData): void {
    this.dialog.open(ConfirmDialogComponent, {
      ...SMALL_CENTERED_DIALOG_CONFIG,
      data: {
        title: data.title || 'Avertissement',
        message: data.message,
        details: data.details,
        confirmText: 'OK',
        cancelText: '',
        type: 'warning',
        icon: data.icon || '⚠️'
      }
    });
  }

  // Notifications d'information - Affichage direct au centre
  showInfo(data: NotificationData): void {
    this.dialog.open(ConfirmDialogComponent, {
      ...SMALL_CENTERED_DIALOG_CONFIG,
      data: {
        title: data.title || 'Information',
        message: data.message,
        details: data.details,
        confirmText: 'OK',
        cancelText: '',
        type: 'info',
        icon: data.icon || 'ℹ️'
      }
    });
  }

  // Dialog de confirmation moderne
  showConfirmDialog(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      ...SMALL_CENTERED_DIALOG_CONFIG,
      disableClose: true,
      data: {
        title: data.title,
        message: data.message,
        details: data.details,
        confirmText: data.confirmText || 'Confirmer',
        cancelText: data.cancelText || 'Annuler',
        type: data.type || 'warning',
        icon: data.icon || this.getDefaultIcon(data.type || 'warning')
      }
    });

    return dialogRef.afterClosed();
  }

  // Dialog de succès avec actions
  showSuccessDialog(data: NotificationData): void {
    this.dialog.open(SuccessDialogComponent, {
      ...MEDIUM_CENTERED_DIALOG_CONFIG,
      data: {
        title: data.title,
        message: data.message,
        details: data.details,
        actions: data.actions,
        icon: data.icon || '🎉'
      }
    });
  }

  // Dialog d'erreur avec détails
  showErrorDialog(data: NotificationData): void {
    this.dialog.open(ConfirmDialogComponent, {
      ...MEDIUM_CENTERED_DIALOG_CONFIG,
      data: {
        title: data.title || 'Erreur',
        message: data.message,
        details: data.details,
        confirmText: 'Fermer',
        cancelText: '',
        type: 'danger',
        icon: data.icon || '❌'
      }
    });
  }

  // Méthodes spécialisées pour les actions comptables
  showCompteCreated(compte: any): void {
    this.showSuccess({
      title: 'Compte créé',
      message: `Compte ${compte.numeroCompte} créé avec succès`,
      details: `${compte.nom} (${compte.type})`,
      icon: '✅',
      actions: [
        {
          label: 'Voir le compte',
          action: () => console.log('Navigate to compte'),
          color: 'primary'
        },
        {
          label: 'Créer un autre',
          action: () => console.log('Create another'),
          color: 'accent'
        }
      ]
    });
  }

  showCompteUpdated(compte: any): void {
    this.showSuccess({
      title: 'Compte modifié',
      message: `Compte ${compte.numeroCompte} mis à jour`,
      details: `${compte.nom} (${compte.type})`,
      icon: '🔄'
    });
  }

  showCompteDeleted(compte: any): void {
    this.showInfo({
      title: 'Compte supprimé',
      message: `Compte ${compte.numeroCompte} supprimé`,
      details: `${compte.nom} a été supprimé définitivement`,
      icon: '🗑️'
    });
  }

  showEcritureCreated(ecriture: any): void {
    this.showSuccess({
      title: 'Écriture créée',
      message: 'Écriture comptable enregistrée',
      details: `${ecriture.libelle} - ${ecriture.montantTotal}€`,
      icon: '📝',
      actions: [
        {
          label: 'Voir au journal',
          action: () => console.log('Navigate to journal'),
          color: 'primary'
        },
        {
          label: 'Nouvelle écriture',
          action: () => console.log('Create another'),
          color: 'accent'
        }
      ]
    });
  }

  confirmDeleteCompte(compte: any): Observable<boolean> {
    return this.showConfirmDialog({
      title: 'Supprimer le compte',
      message: `Êtes-vous sûr de vouloir supprimer ce compte ?`,
      details: `${compte.numeroCompte} - ${compte.nom}\nCette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger',
      icon: '🗑️'
    });
  }

  confirmDeleteEcriture(ecriture: any): Observable<boolean> {
    return this.showConfirmDialog({
      title: 'Supprimer l\'écriture',
      message: `Êtes-vous sûr de vouloir supprimer cette écriture ?`,
      details: `${ecriture.libelle}\nDate: ${new Date(ecriture.date).toLocaleDateString()}\nCette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger',
      icon: '🗑️'
    });
  }

  private getDefaultIcon(type: string): string {
    switch (type) {
      case 'danger': return '⚠️';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  }
}
