import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Account, ApiResponse, BalanceResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private http: HttpClient) {}

  createAccount(accountType: string): Observable<Account> {
    return this.http.post<ApiResponse<Account>>(`${environment.apiUrl}/accounts/create`, { accountType })
      .pipe(map(res => res.data));
  }

  getAccount(accountNumber: string): Observable<Account> {
    return this.http.get<ApiResponse<Account>>(`${environment.apiUrl}/accounts/${accountNumber}`)
      .pipe(map(res => res.data));
  }

  getBalance(accountNumber: string): Observable<BalanceResponse> {
    return this.http.get<ApiResponse<BalanceResponse>>(`${environment.apiUrl}/accounts/balance/${accountNumber}`)
      .pipe(map(res => res.data));
  }

  getUserAccounts(userId: number): Observable<Account[]> {
    return this.http.get<ApiResponse<Account[]>>(`${environment.apiUrl}/accounts/user/${userId}`)
      .pipe(map(res => res.data));
  }

  deleteAccount(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/accounts/${id}`);
  }
}
