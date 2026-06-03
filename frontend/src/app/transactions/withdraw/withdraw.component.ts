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
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { getAccountMeta } from '../../shared/utils/account-type.util';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CurrencyPipe,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, PageHeaderComponent
  ],
  templateUrl: './withdraw.component.html',
  styleUrl: '../transaction-form.component.scss'
})
export class WithdrawComponent implements OnInit {
  form: FormGroup;
  accounts: Account[] = [];
  loading = false;
  selectedAccount: Account | null = null;
  getAccountMeta = getAccountMeta;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private accountService: AccountService,
    private txnService: TransactionService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      accountNumber: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });
    this.form.get('accountNumber')?.valueChanges.subscribe(num => {
      this.selectedAccount = this.accounts.find(a => a.accountNumber === num) || null;
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  get selectedAvailable(): number {
    if (!this.selectedAccount) return 0;
    const overdraft = this.selectedAccount.accountType === 'CURRENT'
      ? Number(this.selectedAccount.overdraftLimit || 0)
      : 0;
    return Number(this.selectedAccount.balance) + overdraft;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedAccount || !getAccountMeta(this.selectedAccount.accountType).canWithdraw) {
      this.snackBar.open('This account type does not support withdrawals', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }
    if (this.selectedAccount.status !== 'ACTIVE') {
      this.snackBar.open('Only active accounts can withdraw funds', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }
    if (Number(this.form.value.amount) > this.selectedAvailable) {
      this.snackBar.open('Amount exceeds the available balance for this account', 'Close', { duration: 4000, panelClass: 'snack-error' });
      return;
    }

    this.loading = true;
    const { accountNumber, amount, description } = this.form.value;
    this.txnService.withdraw(accountNumber, amount, description).subscribe({
      next: (t) => {
        this.snackBar.open(`Withdrawal successful - Ref: ${t.referenceNumber}`, 'Close', { duration: 5000, panelClass: 'snack-success' });
        this.form.patchValue({ amount: '', description: '' });
        this.loadAccounts(accountNumber);
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Withdrawal failed', 'Close', { duration: 4000, panelClass: 'snack-error' });
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
        : accounts.find(a => getAccountMeta(a.accountType).canWithdraw && a.status === 'ACTIVE') || accounts[0];
      if (selected) {
        this.form.patchValue({ accountNumber: selected.accountNumber });
        this.selectedAccount = selected;
      }
    });
  }
}
