import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ContractsService, Contract } from '../../services/contracts.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contract-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="contracts-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Lux Mundi Contracts</mat-card-title>
          <mat-card-subtitle *ngIf="filteredContracts.length !== contracts.length">
            Showing {{ filteredContracts.length }} of {{ contracts.length }} contracts
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <!-- Not Authenticated State -->
          <div *ngIf="!isAuthenticated" class="not-authenticated-container">
            <mat-icon color="warn">lock</mat-icon>
            <p>Please log in to view contracts</p>
            <button mat-raised-button color="primary" (click)="login()">
              Log In
            </button>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading && isAuthenticated" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading contracts...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="error && isAuthenticated" class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ error }}</p>
          </div>

          <!-- No Valid Contracts State -->
          <div *ngIf="!loading && !error && isAuthenticated && filteredContracts.length === 0" class="no-contracts-container">
            <mat-icon color="warn">info</mat-icon>
            <p>No valid contracts found</p>
          </div>

          <!-- Contracts Table -->
          <div *ngIf="!loading && !error && isAuthenticated && filteredContracts.length > 0" class="table-container">
            <table mat-table [dataSource]="filteredContracts" matSort>
              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let contract">
                  <mat-chip [color]="getContractTypeColor(contract.type)" selected>
                    {{ contract.type }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
                <td mat-cell *matCellDef="let contract">{{ contract.title || 'Untitled' }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let contract">
                  <mat-chip [color]="getStatusColor(contract.status)" selected>
                    {{ contract.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
                <td mat-cell *matCellDef="let contract">{{ contract.price | number:'1.0-0' }} ISK</td>
              </ng-container>

              <!-- Reward Column -->
              <ng-container matColumnDef="reward">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Reward</th>
                <td mat-cell *matCellDef="let contract">{{ contract.reward | number:'1.0-0' }} ISK</td>
              </ng-container>

              <!-- Date Issued Column -->
              <ng-container matColumnDef="date_issued">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date Issued</th>
                <td mat-cell *matCellDef="let contract">{{ contract.date_issued | date:'medium' }}</td>
              </ng-container>

              <!-- Date Expired Column -->
              <ng-container matColumnDef="date_expired">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Expires</th>
                <td mat-cell *matCellDef="let contract">{{ contract.date_expired | date:'medium' }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let contract">
                  <button mat-icon-button [matTooltip]="'View Details'">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .contracts-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container, .error-container, .not-authenticated-container, .no-contracts-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
      color: rgba(255, 255, 255, 0.7);
    }

    .error-container {
      color: #f44336;
    }

    .not-authenticated-container {
      color: #ffa726;
    }

    .no-contracts-container {
      color: #29b6f6;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .mat-mdc-row:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
    }

    .mat-column-type, .mat-column-status {
      width: 120px;
    }

    .mat-column-price, .mat-column-reward {
      width: 150px;
      text-align: right;
    }

    .mat-column-date_issued, .mat-column-date_expired {
      width: 180px;
    }
  `]
})
export class ContractTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Contract>;

  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  displayedColumns: string[] = [
    'type',
    'title',
    'status',
    'price',
    'reward',
    'date_issued',
    'date_expired',
    'actions'
  ];
  loading = true;
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private contractsService: ContractsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthAndLoadContracts();
  }

  private checkAuthAndLoadContracts() {
    this.authService.isAuthenticated().subscribe({
      next: (isAuth) => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadContracts();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error checking authentication:', error);
        this.isAuthenticated = false;
        this.loading = false;
      }
    });
  }

  private loadContracts() {
    this.loading = true;
    this.error = null;

    this.contractsService.getContracts().subscribe({
      next: (data: Contract[]) => {
        this.contracts = data;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = 'Failed to load contracts. Please try again later.';
        this.loading = false;
        console.error('Error loading contracts:', error);
      }
    });
  }

  login() {
    this.authService.login();
  }

  getContractTypeColor(type: string): 'primary' | 'accent' | 'warn' {
    switch (type.toLowerCase()) {
      case 'item_exchange':
        return 'primary';
      case 'auction':
        return 'accent';
      case 'courier':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status.toLowerCase()) {
      case 'outstanding':
        return 'primary';
      case 'in_progress':
        return 'accent';
      case 'finished':
        return 'warn';
      default:
        return 'primary';
    }
  }
} 