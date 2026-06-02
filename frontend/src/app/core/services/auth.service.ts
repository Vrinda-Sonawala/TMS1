import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'aegis_token';
  private readonly USER_KEY = 'aegis_user';
  private readonly EXPIRES_KEY = 'aegis_token_expires';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(payload: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap(res => this.handleAuth(res.data)));
  }

  login(payload: { email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap(res => this.handleAuth(res.data)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY) && !this.isTokenExpired();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuth(data: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(this.EXPIRES_KEY, String(Date.now() + data.expiresIn));
    this.currentUserSubject.next(data.user);
  }

  private isTokenExpired(): boolean {
    const expires = localStorage.getItem(this.EXPIRES_KEY);
    if (!expires) return false;
    return Date.now() > Number(expires);
  }

  private getStoredUser(): User | null {
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
