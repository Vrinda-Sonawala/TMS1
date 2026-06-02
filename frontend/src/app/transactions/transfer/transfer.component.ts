import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account, Beneficiary } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CurrencyPipe,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDialogModule, PageHeaderComponent
  ],
  templateUrl: './transfer.component.html',
  styleUrl: '../transaction-form.component.scss'
})
export class TransferComponent implements OnInit {
  form: FormGroup;
  accounts: Account[] = [];
  beneficiaries: Beneficiary[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private accountService: AccountService,
    private txnService: TransactionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      senderAccountNumber: ['', Validators.required],
      receiverAccountNumber: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.accountService.getUserAccounts(user.id).subscribe(a => {
        this.accounts = a;
        if (a.length) this.form.patchValue({ senderAccountNumber: a[0].accountNumber });
      });
      this.txnService.getBeneficiaries().subscribe(b => (this.beneficiaries = b));
    }
  }

  selectBeneficiary(accountNumber: string): void {
    this.form.patchValue({ receiverAccountNumber: accountNumber });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Confirm Transfer',
        message: 'Please review your transfer details before confirming.',
        amount: v.amount,
        currency: 'USD',
        confirmText: 'Transfer Now',
        details: [
          { label: 'From', value: v.senderAccountNumber },
          { label: 'To', value: v.receiverAccountNumber },
          ...(v.description ? [{ label: 'Note', value: v.description }] : [])
        ]
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.executeTransfer(v);
    });
  }

  private executeTransfer(v: { senderAccountNumber: string; receiverAccountNumber: string; amount: number; description: string }): void {
    this.loading = true;
    this.txnService.transfer(v.senderAccountNumber, v.receiverAccountNumber, v.amount, v.description).subscribe({
      next: (t) => {
        this.snackBar.open(`Transfer successful — Ref: ${t.referenceNumber}`, 'Close', { duration: 5000, panelClass: 'snack-success' });
        this.form.patchValue({ amount: '', description: '', receiverAccountNumber: '' });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Transfer failed', 'Close', { duration: 4000, panelClass: 'snack-error' });
        this.loading = false;
      }
    });
  }
}
