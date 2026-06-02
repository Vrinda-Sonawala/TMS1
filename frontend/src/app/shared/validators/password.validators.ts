import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  width: string;
}

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSpecial = /[@#$%^&+=!]/.test(value);
  const isLongEnough = value.length >= 8;
  const valid = hasLower && hasUpper && hasDigit && hasSpecial && isLongEnough;
  return valid ? null : { passwordStrength: true };
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: 'Enter password', color: '#8b95a5', width: '0%' };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@#$%^&+=!]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#dc3545', width: '25%' };
  if (score <= 2) return { score, label: 'Fair', color: '#e6a100', width: '50%' };
  if (score <= 4) return { score, label: 'Good', color: '#2d5a9e', width: '75%' };
  return { score, label: 'Strong', color: '#0d9f6e', width: '100%' };
}

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}
