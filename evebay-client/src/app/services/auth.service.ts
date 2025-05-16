import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface CharacterInfo {
  CharacterID: number;
  CharacterName: string;
  ExpiresOn: string;
  Scopes: string;
  TokenType: string;
  CharacterOwnerHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5088/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Redirecting to EVE Online login');
      window.location.href = `${this.apiUrl}/login`;
    }
  }

  logout(): Observable<any> {
    console.log('Logging out');
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => console.log('Logout successful')),
        catchError(error => {
          console.error('Logout error:', error);
          return throwError(() => error);
        })
      );
  }

  isAuthenticated(): Observable<boolean> {
    console.log('Checking authentication status');
    return this.http.get<{ isValid: boolean }>(`${this.apiUrl}/session`, { withCredentials: true })
      .pipe(
        tap(response => console.log('Auth check response:', response)),
        map(response => response.isValid),
        catchError(error => {
          console.error('Auth check error:', error);
          return of(false);
        })
      );
  }

  getCharacterInfo(): Observable<CharacterInfo> {
    console.log('Getting character info');
    return this.http.get<CharacterInfo>(`${this.apiUrl}/character`, { withCredentials: true })
      .pipe(
        tap(response => console.log('Character info response:', response)),
        catchError(error => {
          console.error('Error getting character info:', error);
          return throwError(() => error);
        })
      );
  }
} 