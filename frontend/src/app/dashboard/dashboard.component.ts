import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../core/services/auth.service';
import { AccountService } from '../core/services/account.service';
import { TransactionService } from '../core/services/transaction.service';
import { Account, Transaction } from '../core/models';
import { AccountCardComponent } from '../shared/components/account-card/account-card.component';
import { getStatusClass, getTransactionIcon } from '../shared/utils/account-type.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, CurrencyPipe, DatePipe,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatTableModule, AccountCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userName = '';
  currentDate = new Date();
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  totalBalance = 0;
  loading = true;
  txnColumns = ['icon', 'referenceNumber', 'transactionType', 'amount', 'transactionStatus', 'createdAt'];

  getStatusClass = getStatusClass;
  getTransactionIcon = getTransactionIcon;

  constructor(
    private auth: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.userName = user.fullName.split(' ')[0];

    this.accountService.getUserAccounts(user.id).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
        if (accounts.length > 0) {
          this.transactionService.getHistory(accounts[0].accountNumber).subscribe({
            next: (txns) => { this.recentTransactions = txns.slice(0, 8); this.loading = false; },
            error: () => { this.loading = false; }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
}
