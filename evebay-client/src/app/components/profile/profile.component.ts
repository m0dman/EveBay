import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

interface CharacterInfo {
  CharacterID: number;
  CharacterName: string;
  ExpiresOn: string;
  Scopes: string;
  TokenType: string;
  CharacterOwnerHash: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-content>
          <div class="profile-header">
            <img [src]="'https://images.evetech.net/characters/' + characterInfo?.CharacterID + '/portrait?size=256'" 
                 [alt]="characterInfo?.CharacterName"
                 class="profile-portrait">
            <div class="profile-info">
              <h1>{{ characterInfo?.CharacterName }}</h1>
              <p class="character-id">Character ID: {{ characterInfo?.CharacterID }}</p>
            </div>
          </div>

          <mat-divider class="my-4"></mat-divider>

          <div class="profile-details">
            <div class="detail-section">
              <h2>Token Information</h2>
              <div class="detail-grid">
                <div class="detail-item">
                  <mat-icon>vpn_key</mat-icon>
                  <div>
                    <span class="label">Token Type</span>
                    <span class="value">{{ characterInfo?.TokenType }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <span class="label">Expires On</span>
                    <span class="value">{{ characterInfo?.ExpiresOn | date:'medium' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <mat-divider class="my-4"></mat-divider>

            <div class="detail-section">
              <h2>Access Scopes</h2>
              <div class="scopes-container">
                <mat-chip *ngFor="let scope of scopes" class="scope-chip">
                  {{ scope }}
                </mat-chip>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .profile-card {
      background-color: #424242;
      color: white;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;

      .profile-portrait {
        width: 256px;
        height: 256px;
        border-radius: 8px;
        border: 4px solid #ff4081;
      }

      .profile-info {
        h1 {
          font-size: 2rem;
          margin: 0 0 8px 0;
        }

        .character-id {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      }
    }

    .profile-details {
      .detail-section {
        margin-bottom: 24px;

        h2 {
          font-size: 1.5rem;
          margin: 0 0 16px 0;
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 16px;

        mat-icon {
          color: #ff4081;
        }

        .label {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .value {
          display: block;
          font-size: 1.125rem;
        }
      }

      .scopes-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .scope-chip {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
      }
    }

    .my-4 {
      margin: 1rem 0;
    }
  `]
})
export class ProfileComponent implements OnInit {
  characterInfo: CharacterInfo | null = null;
  scopes: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadCharacterInfo();
  }

  private loadCharacterInfo() {
    this.authService.getCharacterInfo().subscribe({
      next: (info) => {
        this.characterInfo = info;
        this.scopes = info.Scopes.split(' ');
      },
      error: (error) => {
        console.error('Failed to load character information:', error);
      }
    });
  }
} 