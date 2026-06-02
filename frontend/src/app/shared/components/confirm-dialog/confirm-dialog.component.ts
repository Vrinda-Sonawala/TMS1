import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  amount?: number;
  currency?: string;
  details?: { label: string; value: string }[];
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CurrencyPipe, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon"><mat-icon>verified_user</mat-icon></div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
        @if (data.amount) {
          <div class="amount-display">{{ data.amount | currency:(data.currency || 'USD') }}</div>
        }
        @if (data.details?.length) {
          <div class="details-list">
            @for (d of data.details; track d.label) {
              <div class="detail-row">
                <span>{{ d.label }}</span>
                <strong>{{ d.value }}</strong>
              </div>
            }
          </div>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(false)">{{ data.cancelText || 'Cancel' }}</button>
        <button mat-raised-button color="primary" (click)="dialogRef.close(true)">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { padding: 0.5rem; text-align: center; min-width: 320px; }
    .dialog-icon {
      width: 56px; height: 56px; margin: 0 auto 1rem;
      background: linear-gradient(135deg, #1a3a6b, #2d5a9e);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    .dialog-icon mat-icon { color: #fff; font-size: 28px; width: 28px; height: 28px; }
    h2 { font-size: 1.25rem; font-weight: 700; color: #0a1628; margin-bottom: 0.5rem; }
    p { color: #5a6578; margin-bottom: 1rem; }
    .amount-display { font-size: 2rem; font-weight: 700; color: #0a1628; margin: 1rem 0; }
    .details-list { text-align: left; background: #f4f6f9; border-radius: 8px; padding: 1rem; margin-top: 1rem; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.35rem 0; font-size: 0.9rem; }
    .detail-row span { color: #8b95a5; }
    mat-dialog-actions { padding-top: 1rem; }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
