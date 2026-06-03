import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'accounts', loadComponent: () => import('./accounts/accounts.component').then(m => m.AccountsComponent) },
      { path: 'transactions/deposit', loadComponent: () => import('./transactions/deposit/deposit.component').then(m => m.DepositComponent) },
      { path: 'transactions/withdraw', loadComponent: () => import('./transactions/withdraw/withdraw.component').then(m => m.WithdrawComponent) },
      { path: 'transactions/transfer', loadComponent: () => import('./transactions/transfer/transfer.component').then(m => m.TransferComponent) },
      { path: 'transactions/self-transfer', loadComponent: () => import('./transactions/self-transfer/self-transfer.component').then(m => m.SelfTransferComponent) },
      { path: 'transactions/history', loadComponent: () => import('./transactions/history/history.component').then(m => m.HistoryComponent) },
      { path: 'beneficiaries', loadComponent: () => import('./beneficiaries/beneficiaries.component').then(m => m.BeneficiariesComponent) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
