import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../core/services/auth.service';
import { AccountService } from '../core/services/account.service';
import { Account, AccountType } from '../core/models';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { AccountCardComponent } from '../shared/components/account-card/account-card.component';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { getAccountMeta } from '../shared/utils/account-type.util';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatDialogModule,
    PageHeaderComponent, AccountCardComponent
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  createForm: FormGroup;
  accountTypes: AccountType[] = ['SAVINGS', 'CURRENT', 'BUSINESS', 'SALARY', 'FIXED_DEPOSIT'];
  creating = false;
  loading = true;
  selectedTypeMeta = getAccountMeta('SAVINGS');

  getAccountMeta = getAccountMeta;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.createForm = this.fb.group({ accountType: ['SAVINGS', Validators.required] });
    this.createForm.get('accountType')?.valueChanges.subscribe((t: AccountType) => {
      this.selectedTypeMeta = getAccountMeta(t);
    });
  }

  ngOnInit(): void { this.loadAccounts(); }

  loadAccounts(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.loading = true;
    this.accountService.getUserAccounts(user.id).subscribe({
      next: (a) => { this.accounts = a; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  createAccount(): void {
    if (this.createForm.invalid) return;
    this.creating = true;
    this.accountService.createAccount(this.createForm.value.accountType).subscribe({
      next: () => {
        this.snackBar.open('Account opened successfully', 'Close', { duration: 3000, panelClass: 'snack-success' });
        this.loadAccounts();
        this.creating = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to create account', 'Close', { duration: 4000, panelClass: 'snack-error' });
        this.creating = false;
      }
    });
  }

  deleteAccount(id: number): void {
    const account = this.accounts.find(a => a.id === id);
    if (!account) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Close Account',
        message: `Are you sure you want to close account ${account.accountNumber}? This action cannot be undone.`,
        confirmText: 'Close Account',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.deleteAccount(id).subscribe({
          next: () => {
            this.snackBar.open('Account closed successfully', 'Close', { duration: 3000, panelClass: 'snack-success' });
            this.loadAccounts();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Failed to close account', 'Close', { duration: 4000, panelClass: 'snack-error' });
          }
        });
      }
    });
  }
}
