export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  minimumBalance: number;
  overdraftLimit: number;
  status: string;
  currency: string;
  userId: number;
  maturityDate?: string;
  createdAt: string;
}

export type AccountType = 'SAVINGS' | 'CURRENT' | 'BUSINESS' | 'SALARY' | 'FIXED_DEPOSIT';

export interface Transaction {
  id: number;
  referenceNumber: string;
  senderAccount?: string;
  receiverAccount?: string;
  transactionType: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  amount: number;
  transactionStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REVERSED';
  description?: string;
  createdAt: string;
}

export interface Beneficiary {
  id: number;
  nickname: string;
  beneficiaryAccountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface BalanceResponse {
  accountNumber: string;
  balance: number;
  currency: string;
  asOf: string;
}
