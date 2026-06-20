import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  // Optional: user info
  // user?: any;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  // Add other fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    // Load token from localStorage on initialization
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.configService.getApiUrl()}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        // Save token to localStorage
        localStorage.setItem('auth_token', response.token);
        // Update the token subject
        this.tokenSubject.next(response.token);
      })
    );
  }

  logout(): void {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    // Update the token subject
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return this.tokenSubject.value !== null;
  }

  /**
   * Get the current user's profile information
   * Assumes there's an endpoint like /auth/me or /user/profile
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.configService.getApiUrl()}/auth/me`
    );
  }

  // Optional: method to refresh token if needed
  // refreshToken(): Observable<any> { ... }
}