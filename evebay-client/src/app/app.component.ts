import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

interface CharacterInfo {
  CharacterID: number;
  CharacterName: string;
  ExpiresOn: string;
  Scopes: string;
  TokenType: string;
  CharacterOwnerHash: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  characterInfo: CharacterInfo | null = null;
  authError: string | null = null;
  sidenavOpened = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    this.authService.isAuthenticated().subscribe({
      next: (isAuth) => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadCharacterInfo();
        } else {
          this.characterInfo = null;
        }
      },
      error: (error) => {
        this.authError = 'Failed to check authentication status';
        this.isAuthenticated = false;
        this.characterInfo = null;
      }
    });
  }

  private loadCharacterInfo() {
    this.authService.getCharacterInfo().subscribe({
      next: (info) => {
        this.characterInfo = info;
        this.authError = null;
      },
      error: (error) => {
        this.authError = 'Failed to load character information';
        this.characterInfo = null;
      }
    });
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isAuthenticated = false;
        this.characterInfo = null;
        this.authError = null;
      },
      error: (error) => {
        this.authError = 'Failed to logout';
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }
}
