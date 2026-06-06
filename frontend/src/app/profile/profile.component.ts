import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../core/services/user.service';
import { UserProfileResponse } from '../core/models';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule, PageHeaderComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profile: UserProfileResponse | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = true;
  savingProfile = false;
  savingPassword = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  loadProfile(): void {
    this.loading = true;
    this.userService.getUserProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.profileForm.patchValue({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load profile details', 'Close', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile = true;
    this.userService.updateUserProfile(this.profileForm.value).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000, panelClass: 'snack-success' });
        this.savingProfile = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to update profile', 'Close', { duration: 4000, panelClass: 'snack-error' });
        this.savingProfile = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword = true;
    this.userService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000, panelClass: 'snack-success' });
        this.passwordForm.reset();
        this.savingPassword = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to change password', 'Close', { duration: 4000, panelClass: 'snack-error' });
        this.savingPassword = false;
      }
    });
  }
}
