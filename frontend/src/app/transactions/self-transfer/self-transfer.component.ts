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
import { Account } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { getAccountMeta } from '../../shared/utils/account-type.util';

@Component({
  selector: 'app-self-transfer',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CurrencyPipe,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDialogModule, PageHeaderComponent
  ],
  templateUrl: './self-transfer.component.html',
  styleUrl: '../transaction-form.component.scss'
})
export class SelfTransferComponent implements OnInit {
  form: FormGroup;
  accounts: Account[] = [];
  filteredReceiverAccounts: Account[] = [];
  loading = false;
  selectedSender: Account | null = null;
  selectedReceiver: Account | null = null;
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
      receiverAccountNumber: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });

    // Listen to sender changes to filter destination accounts
    this.form.get('senderAccountNumber')?.valueChanges.subscribe(num => {
      this.selectedSender = this.accounts.find(a => a.accountNumber === num) || null;
      this.updateReceiverOptions();
    });

    // Listen to receiver changes to display details
    this.form.get('receiverAccountNumber')?.valueChanges.subscribe(num => {
      this.selectedReceiver = this.accounts.find(a => a.accountNumber === num) || null;
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  get senderAvailable(): number {
    if (!this.selectedSender) return 0;
    const overdraft = this.selectedSender.accountType === 'CURRENT'
      ? Number(this.selectedSender.overdraftLimit || 0)
      : 0;
    return Number(this.selectedSender.balance) + overdraft;
  }

  isFDLocked(account: Account): boolean {
    if (account.accountType !== 'FIXED_DEPOSIT') return false;
    if (!account.maturityDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maturity = new Date(account.maturityDate);
    maturity.setHours(0, 0, 0, 0);
    return today.getTime() < maturity.getTime();
  }

  private updateReceiverOptions(): void {
    const senderNum = this.form.value.senderAccountNumber;
    this.filteredReceiverAccounts = this.accounts.filter(a => a.accountNumber !== senderNum);

    const receiverNum = this.form.value.receiverAccountNumber;
    if (receiverNum === senderNum) {
      this.form.patchValue({ receiverAccountNumber: '' });
      this.selectedReceiver = null;
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    if (!this.selectedSender || !getAccountMeta(this.selectedSender.accountType).canTransfer) {
      this.snackBar.open('Source account type does not support transfers', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }
    if (this.selectedSender.status !== 'ACTIVE') {
      this.snackBar.open('Only active accounts can send transfers', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }
    if (this.selectedReceiver && this.selectedReceiver.status !== 'ACTIVE') {
      this.snackBar.open('Receiver account must be active', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }
    if (v.senderAccountNumber === v.receiverAccountNumber) {
      this.snackBar.open('Cannot transfer to the same account', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }

    // Fixed deposit lock checks
    if (this.selectedSender && this.isFDLocked(this.selectedSender)) {
      this.snackBar.open(`Self-transfer blocked: Source account is a Fixed Deposit locked until maturity (${this.selectedSender.maturityDate})`, 'Close', { duration: 5000, panelClass: 'snack-error' });
      return;
    }
    if (this.selectedReceiver && this.isFDLocked(this.selectedReceiver)) {
      this.snackBar.open(`Self-transfer blocked: Target account is a Fixed Deposit locked until maturity (${this.selectedReceiver.maturityDate})`, 'Close', { duration: 5000, panelClass: 'snack-error' });
      return;
    }

    if (Number(v.amount) > this.senderAvailable) {
      this.snackBar.open('Transfer amount exceeds available balance', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Confirm Self-Transfer',
        message: 'Please review your self-transfer details before confirming.',
        amount: v.amount,
        currency: this.selectedSender.currency || 'USD',
        confirmText: 'Transfer Now',
        details: [
          { label: 'From Account', value: `${v.senderAccountNumber} (${getAccountMeta(this.selectedSender.accountType).label})` },
          { label: 'To Account', value: `${v.receiverAccountNumber} (${getAccountMeta(this.selectedReceiver!.accountType).label})` },
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
    this.txnService.selfTransfer(v.senderAccountNumber, v.receiverAccountNumber, v.amount, v.description).subscribe({
      next: (t) => {
        this.snackBar.open(`Self-transfer successful - Ref: ${t.referenceNumber}`, 'Close', { duration: 5000, panelClass: 'snack-success' });
        this.form.patchValue({ amount: '', description: '', receiverAccountNumber: '' });
        this.selectedReceiver = null;
        this.loadAccounts(v.senderAccountNumber);
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Self-transfer failed', 'Close', { duration: 4000, panelClass: 'snack-error' });
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
      this.updateReceiverOptions();
    });
  }
}
