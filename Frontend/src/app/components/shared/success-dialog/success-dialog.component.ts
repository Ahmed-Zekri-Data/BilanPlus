import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SuccessDialogData {
  title: string;
  message: string;
  details?: string;
  icon: string;
  actions?: SuccessAction[];
}

export interface SuccessAction {
  label: string;
  action: () => void;
  color?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.css']
})
export class SuccessDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SuccessDialogData
  ) {}

  onAction(action: SuccessAction): void {
    action.action();
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
