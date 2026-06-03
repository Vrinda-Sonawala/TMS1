import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatIconModule,
    MatButtonModule, MatListModule, MatMenuModule, MatDividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;

  user: User | null = null;
  isMobile = false;
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  currentDate = new Date();
  private destroy$ = new Subject<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Accounts', icon: 'account_balance_wallet', route: '/accounts' },
    { label: 'Deposit', icon: 'add_circle_outline', route: '/transactions/deposit' },
    { label: 'Withdraw', icon: 'remove_circle_outline', route: '/transactions/withdraw' },
    { label: 'Transfer', icon: 'swap_horiz', route: '/transactions/transfer' },
    { label: 'Self Transfer', icon: 'sync_alt', route: '/transactions/self-transfer' },
    { label: 'Beneficiaries', icon: 'people_outline', route: '/beneficiaries' },
    { label: 'Transactions', icon: 'receipt_long', route: '/transactions/history' }
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private breakpoint: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.auth.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(u => (this.user = u));

    this.breakpoint.observe(['(max-width: 992px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        this.sidenavMode = this.isMobile ? 'over' : 'side';
        this.sidenavOpened = !this.isMobile;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeDrawerOnMobile(): void {
    if (this.isMobile && this.drawer) {
      this.drawer.close();
    }
  }

  navigate(route: string): void {
    this.router.navigateByUrl(route);
    this.closeDrawerOnMobile();
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(`${route}/`);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
