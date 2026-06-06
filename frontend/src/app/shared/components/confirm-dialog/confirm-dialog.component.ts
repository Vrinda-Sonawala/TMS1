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
          <div class="amount-display">{{ data.amount | currency:'INR' }}</div>
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
      width: 56px; height: 56px; margin: 0 auto 1.25rem;
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    .dialog-icon mat-icon { color: #06b6d4; font-size: 28px; width: 28px; height: 28px; }
    h2 { font-size: 1.35rem; font-weight: 700; color: #ffffff !important; margin-bottom: 0.75rem; }
    p { color: #cbd5e1 !important; margin-bottom: 1.25rem; font-size: 0.95rem; }
    .amount-display { font-size: 2.25rem; font-weight: 700; color: #fbbf24 !important; margin: 1rem 0; }
    .details-list { text-align: left; background: rgba(10, 22, 40, 0.7) !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 1.25rem; margin-top: 1rem; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.45rem 0; font-size: 0.9rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .detail-row:last-child { border-bottom: none; }
    .detail-row span { color: #94a3b8; }
    .detail-row strong { color: #ffffff; }
    mat-dialog-actions { padding-top: 1.25rem; }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
