import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Beneficiary, Transaction } from '../models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(private http: HttpClient) {}

  deposit(accountNumber: string, amount: number, description?: string): Observable<Transaction> {
    return this.http.post<ApiResponse<Transaction>>(`${environment.apiUrl}/transactions/deposit`, {
      accountNumber, amount, description
    }).pipe(map(res => res.data));
  }

  withdraw(accountNumber: string, amount: number, description?: string): Observable<Transaction> {
    return this.http.post<ApiResponse<Transaction>>(`${environment.apiUrl}/transactions/withdraw`, {
      accountNumber, amount, description
    }).pipe(map(res => res.data));
  }

  transfer(senderAccountNumber: string, receiverAccountNumber: string, amount: number, description?: string): Observable<Transaction> {
    return this.http.post<ApiResponse<Transaction>>(`${environment.apiUrl}/transactions/transfer`, {
      senderAccountNumber, receiverAccountNumber, amount, description
    }).pipe(map(res => res.data));
  }

  getHistory(accountNumber: string): Observable<Transaction[]> {
    return this.http.get<ApiResponse<Transaction[]>>(`${environment.apiUrl}/transactions/history/${accountNumber}`)
      .pipe(map(res => res.data));
  }

  getBeneficiaries(): Observable<Beneficiary[]> {
    return this.http.get<ApiResponse<Beneficiary[]>>(`${environment.apiUrl}/beneficiaries`)
      .pipe(map(res => res.data));
  }

  addBeneficiary(payload: Omit<Beneficiary, 'id'>): Observable<Beneficiary> {
    return this.http.post<ApiResponse<Beneficiary>>(`${environment.apiUrl}/beneficiaries`, payload)
      .pipe(map(res => res.data));
  }

  deleteBeneficiary(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/beneficiaries/${id}`)
      .pipe(map(() => undefined));
  }
}
