import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, UserProfileResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<UserProfileResponse> {
    return this.http.get<ApiResponse<UserProfileResponse>>(`${environment.apiUrl}/users/profile`)
      .pipe(map(res => res.data));
  }

  updateUserProfile(payload: { fullName: string; phoneNumber: string }): Observable<UserProfileResponse> {
    return this.http.put<ApiResponse<UserProfileResponse>>(`${environment.apiUrl}/users/profile`, payload)
      .pipe(map(res => res.data));
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${environment.apiUrl}/users/change-password`, payload)
      .pipe(map(res => res.data));
  }
}
