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
import { getAccountMeta } from '../../shared/utils/account-type.util';

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
  selectedSender: Account | null = null;
  selectedBeneficiaryId: number | null = null;
  getAccountMeta = getAccountMeta;

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
      receiverAccountNumber: ['', [Validators.required, Validators.pattern(/^AC\d{18}$/)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });
    this.form.get('senderAccountNumber')?.valueChanges.subscribe(num => {
      this.selectedSender = this.accounts.find(a => a.accountNumber === num) || null;
    });
    this.form.get('receiverAccountNumber')?.valueChanges.subscribe(val => {
      if (val && typeof val === 'string') {
        const trimmed = val.replace(/\s+/g, '');
        if (val !== trimmed) {
          this.form.get('receiverAccountNumber')?.setValue(trimmed, { emitEvent: false });
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadBeneficiaries();
  }

  get senderAvailable(): number {
    if (!this.selectedSender) return 0;
    const overdraft = this.selectedSender.accountType === 'CURRENT'
      ? Number(this.selectedSender.overdraftLimit || 0)
      : 0;
    return Number(this.selectedSender.balance) + overdraft;
  }

  selectBeneficiary(id: number | null): void {
    this.selectedBeneficiaryId = id;
    const beneficiary = this.beneficiaries.find(b => b.id === id);
    if (beneficiary) {
      this.form.patchValue({ receiverAccountNumber: beneficiary.beneficiaryAccountNumber });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    if (!this.selectedSender || !getAccountMeta(this.selectedSender.accountType).canTransfer) {
      this.snackBar.open('This account type does not support transfers', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }
    if (this.selectedSender.status !== 'ACTIVE') {
      this.snackBar.open('Only active accounts can send transfers', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }
    if (v.senderAccountNumber === v.receiverAccountNumber) {
      this.form.get('receiverAccountNumber')?.setErrors({ sameAccount: true });
      this.snackBar.open('Cannot transfer to the same account', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }
    if (Number(v.amount) > this.senderAvailable) {
      this.snackBar.open('Transfer amount exceeds available balance', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Confirm Transfer',
        message: 'Please review your transfer details before confirming.',
        amount: v.amount,
        currency: this.selectedSender.currency || 'USD',
        confirmText: 'Transfer Now',
        details: [
          { label: 'From', value: v.senderAccountNumber },
          { label: 'To', value: v.receiverAccountNumber },
          ...(v.description ? [{ label: 'Note', value: v.description }] : [])
        ]
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) this.executeTransfer(v);
    });
  }

  private executeTransfer(v: { senderAccountNumber: string; receiverAccountNumber: string; amount: number; description: string }): void {
    this.loading = true;
    this.txnService.transfer(v.senderAccountNumber, v.receiverAccountNumber, v.amount, v.description).subscribe({
      next: (t) => {
        this.snackBar.open(`Transfer successful - Ref: ${t.referenceNumber}`, 'Close', { duration: 5000, panelClass: 'snack-success' });
        this.form.patchValue({ amount: '', description: '', receiverAccountNumber: '' });
        this.selectedBeneficiaryId = null;
        this.loadAccounts(v.senderAccountNumber);
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Transfer failed', 'Close', { duration: 4000, panelClass: 'snack-error' });
        this.loading = false;
      }
    });
  }

  private loadAccounts(preferredAccount?: string): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.accountService.getUserAccounts(user.id).subscribe(accounts => {
      this.accounts = accounts;
      const selected = preferredAccount
        ? accounts.find(a => a.accountNumber === preferredAccount)
        : accounts.find(a => getAccountMeta(a.accountType).canTransfer && a.status === 'ACTIVE') || accounts[0];
      if (selected) {
        this.form.patchValue({ senderAccountNumber: selected.accountNumber });
        this.selectedSender = selected;
      }
    });
  }

  private loadBeneficiaries(): void {
    this.txnService.getBeneficiaries().subscribe(b => (this.beneficiaries = b));
  }
}
