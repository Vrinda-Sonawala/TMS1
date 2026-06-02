import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransactionService } from '../core/services/transaction.service';
import { Beneficiary } from '../core/models';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatTableModule, MatSnackBarModule,
    MatDialogModule, MatTooltipModule, PageHeaderComponent
  ],
  templateUrl: './beneficiaries.component.html',
  styleUrl: './beneficiaries.component.scss'
})
export class BeneficiariesComponent implements OnInit {
  form: FormGroup;
  beneficiaries: Beneficiary[] = [];
  columns = ['nickname', 'beneficiaryAccountNumber', 'bankName', 'ifscCode', 'actions'];
  showForm = false;

  constructor(
    private fb: FormBuilder,
    private txnService: TransactionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      nickname: ['', [Validators.required, Validators.maxLength(100)]],
      beneficiaryAccountNumber: ['', [Validators.required, Validators.maxLength(20)]],
      bankName: ['', [Validators.required, Validators.maxLength(150)]],
      ifscCode: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.txnService.getBeneficiaries().subscribe(b => (this.beneficiaries = b));
  }

  add(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.txnService.addBeneficiary(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Beneficiary added successfully', 'Close', { duration: 3000, panelClass: 'snack-success' });
        this.form.reset();
        this.showForm = false;
        this.load();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed to add beneficiary', 'Close', { duration: 4000 })
    });
  }

  remove(id: number, nickname: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Remove Beneficiary',
        message: `Are you sure you want to remove "${nickname}" from your beneficiaries?`,
        confirmText: 'Remove',
        cancelText: 'Keep'
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.txnService.deleteBeneficiary(id).subscribe({
        next: () => {
          this.snackBar.open('Beneficiary removed', 'Close', { duration: 3000 });
          this.load();
        }
      });
    });
  }
}
