import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account, Transaction } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { getStatusClass, getTransactionIcon } from '../../shared/utils/account-type.util';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatIconModule, MatProgressSpinnerModule, MatButtonModule,
    PageHeaderComponent
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm: FormGroup;
  accounts: Account[] = [];
  dataSource = new MatTableDataSource<Transaction>([]);
  loading = false;
  columns = ['icon', 'referenceNumber', 'transactionType', 'senderAccount', 'receiverAccount', 'amount', 'transactionStatus', 'createdAt'];

  typeFilters = ['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'];
  statusFilters = ['ALL', 'SUCCESS', 'FAILED', 'PENDING', 'REVERSED'];

  getStatusClass = getStatusClass;
  getTransactionIcon = getTransactionIcon;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private accountService: AccountService,
    private txnService: TransactionService
  ) {
    this.filterForm = this.fb.group({
      accountNumber: [''],
      search: [''],
      typeFilter: ['ALL'],
      statusFilter: ['ALL']
    });
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const f = JSON.parse(filter);
      const searchMatch = !f.search ||
        data.referenceNumber.toLowerCase().includes(f.search) ||
        (data.description || '').toLowerCase().includes(f.search) ||
        (data.senderAccount || '').toLowerCase().includes(f.search) ||
        (data.receiverAccount || '').toLowerCase().includes(f.search);
      const typeMatch = f.typeFilter === 'ALL' || data.transactionType === f.typeFilter;
      const statusMatch = f.statusFilter === 'ALL' || data.transactionStatus === f.statusFilter;
      return searchMatch && typeMatch && statusMatch;
    };

    this.filterForm.valueChanges.subscribe(() => this.applyFilter());

    const user = this.auth.getCurrentUser();
    if (user) {
      this.accountService.getUserAccounts(user.id).subscribe(a => {
        this.accounts = a;
        if (a.length) {
          this.filterForm.patchValue({ accountNumber: a[0].accountNumber });
          this.loadHistory();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadHistory(): void {
    const acc = this.filterForm.value.accountNumber;
    if (!acc) return;
    this.loading = true;
    this.txnService.getHistory(acc).subscribe({
      next: (txns) => {
        this.dataSource.data = txns;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    const v = this.filterForm.value;
    this.dataSource.filter = JSON.stringify({
      search: (v.search || '').trim().toLowerCase(),
      typeFilter: v.typeFilter,
      statusFilter: v.statusFilter
    });
  }

  clearFilters(): void {
    this.filterForm.patchValue({ search: '', typeFilter: 'ALL', statusFilter: 'ALL' });
  }
}
