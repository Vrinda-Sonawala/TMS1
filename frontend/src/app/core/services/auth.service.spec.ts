import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('should store token on login', () => {
    const mockResponse = {
      success: true,
      data: {
        token: 'test-jwt-token',
        tokenType: 'Bearer',
        expiresIn: 86400000,
        user: {
          id: 1, fullName: 'Test User', email: 'test@test.com',
          role: 'CUSTOMER' as const, phoneNumber: '+1', status: 'ACTIVE', createdAt: ''
        }
      }
    };

    service.login({ email: 'test@test.com', password: 'Test@1234' }).subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/login');
    req.flush(mockResponse);
    expect(service.getToken()).toBe('test-jwt-token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should clear token on logout', () => {
    localStorage.setItem('aegis_token', 'token');
    localStorage.setItem('aegis_token_expires', String(Date.now() + 999999));
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
