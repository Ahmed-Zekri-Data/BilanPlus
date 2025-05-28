import { MatDialogConfig } from '@angular/material/dialog';

export const CENTERED_DIALOG_CONFIG: MatDialogConfig = {
  hasBackdrop: true,
  disableClose: false,
  maxWidth: '90vw',
  maxHeight: '80vh',
  panelClass: ['custom-centered-dialog'],
  autoFocus: true,
  restoreFocus: true
};

export const SMALL_CENTERED_DIALOG_CONFIG: MatDialogConfig = {
  ...CENTERED_DIALOG_CONFIG,
  width: '380px'
};

export const MEDIUM_CENTERED_DIALOG_CONFIG: MatDialogConfig = {
  ...CENTERED_DIALOG_CONFIG,
  width: '420px'
};
