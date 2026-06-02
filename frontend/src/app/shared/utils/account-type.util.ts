import { AccountType } from '../../core/models';

export interface AccountTypeMeta {
  label: string;
  icon: string;
  accent: string;
  gradient: string;
  description: string;
}

export const ACCOUNT_TYPE_META: Record<AccountType, AccountTypeMeta> = {
  SAVINGS: {
    label: 'Savings',
    icon: 'savings',
    accent: '#0d9f6e',
    gradient: 'linear-gradient(135deg, #0d9f6e 0%, #0a7a55 100%)',
    description: 'Earn interest with daily withdrawal limits'
  },
  CURRENT: {
    label: 'Current',
    icon: 'account_balance',
    accent: '#2d5a9e',
    gradient: 'linear-gradient(135deg, #2d5a9e 0%, #1a3a6b 100%)',
    description: 'Business-ready with overdraft support'
  },
  BUSINESS: {
    label: 'Business',
    icon: 'business_center',
    accent: '#6b4fa0',
    gradient: 'linear-gradient(135deg, #6b4fa0 0%, #4a3470 100%)',
    description: 'High transaction limits for enterprises'
  },
  SALARY: {
    label: 'Salary',
    icon: 'payments',
    accent: '#e6a100',
    gradient: 'linear-gradient(135deg, #e6a100 0%, #c48400 100%)',
    description: 'Zero minimum balance for salary credits'
  },
  FIXED_DEPOSIT: {
    label: 'Fixed Deposit',
    icon: 'lock_clock',
    accent: '#c9a227',
    gradient: 'linear-gradient(135deg, #c9a227 0%, #9a7b1a 100%)',
    description: 'Locked period with maturity interest'
  }
};

export function getAccountMeta(type: AccountType): AccountTypeMeta {
  return ACCOUNT_TYPE_META[type] ?? ACCOUNT_TYPE_META['SAVINGS'];
}

export function getTransactionIcon(type: string): string {
  switch (type) {
    case 'DEPOSIT': return 'arrow_downward';
    case 'WITHDRAW': return 'arrow_upward';
    case 'TRANSFER': return 'swap_horiz';
    default: return 'receipt_long';
  }
}

export function getStatusClass(status: string): string {
  switch (status) {
    case 'SUCCESS': return 'badge-success';
    case 'FAILED': return 'badge-error';
    case 'PENDING': return 'badge-warning';
    case 'REVERSED': return 'badge-info';
    default: return 'badge-default';
  }
}
