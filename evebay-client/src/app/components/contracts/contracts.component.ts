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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Contract, EveOnlineService } from '../../services/eve-online.service';
import { ContractDetailsModalComponent } from './contract-details-modal/contract-details-modal.component';

@Component({
  selector: 'app-contracts',
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
    MatChipsModule,
    MatSlideToggleModule,
    FormsModule,
    MatDialogModule
  ],
  template: `
    <div class="contracts-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Lux Mundi Contracts</mat-card-title>
          <div class="spacer"></div>
          <mat-slide-toggle
            [(ngModel)]="showFinished"
            (change)="onShowFinishedChange()"
            color="primary">
            Show Finished Contracts
          </mat-slide-toggle>
        </mat-card-header>

        <mat-card-content>
          <!-- Loading State -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading contracts...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ error }}</p>
          </div>

          <!-- Contracts Table -->
          <div *ngIf="!loading && !error" class="table-container">
            <table mat-table [dataSource]="contracts" matSort>
              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let contract">
                  <mat-chip [color]="getContractTypeColor(contract.type)" selected class="contract-type-chip">
                    <mat-icon class="chip-icon">{{ getContractTypeIcon(contract.type) }}</mat-icon>
                    {{ formatContractType(contract.type) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let contract">
                  <mat-chip [color]="getStatusColor(contract.status)" selected class="status-chip">
                    <mat-icon class="chip-icon">{{ getStatusIcon(contract.status) }}</mat-icon>
                    {{ formatStatus(contract.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
                <td mat-cell *matCellDef="let contract">{{ contract.title || 'Untitled' }}</td>
              </ng-container>

              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
                <td mat-cell *matCellDef="let contract">{{ contract.price | number:'1.0-0' }} ISK</td>
              </ng-container>

              <!-- Volume Column -->
              <ng-container matColumnDef="volume">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Volume</th>
                <td mat-cell *matCellDef="let contract">{{ contract.volume | number:'1.0-2' }} m³</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let contract">
                  <button mat-icon-button [matTooltip]="'View Details'" (click)="openContractDetails(contract)">
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

    .loading-container, .error-container {
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
      width: 140px;
    }

    .mat-column-price, .mat-column-volume {
      width: 150px;
      text-align: right;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      padding: 16px;
    }

    .spacer {
      flex: 1;
    }

    .contract-type-chip, .status-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      min-width: 100px;
      justify-content: center;
    }

    .chip-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      margin-right: 4px;
    }
  `]
})
export class ContractsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Contract>;

  contracts: Contract[] = [];
  displayedColumns: string[] = ['type', 'status', 'title', 'price', 'volume', 'actions'];
  loading = true;
  error: string | null = null;
  showFinished = false;

  constructor(
    private eveOnlineService: EveOnlineService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadContracts();
  }

  private loadContracts() {
    this.loading = true;
    this.error = null;

    this.eveOnlineService.getCorporationContracts(this.showFinished).subscribe({
      next: (contracts) => {
        console.log('Received contracts:', contracts);
        this.contracts = contracts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contracts:', error);
        this.error = 'Failed to load contracts. Please try again later.';
        this.loading = false;
      }
    });
  }

  onShowFinishedChange() {
    this.loadContracts();
  }

  openContractDetails(contract: Contract) {
    console.log('Opening contract details for contract:', JSON.stringify(contract, null, 2));
    if (!contract) {
      console.error('Invalid contract data: contract is null or undefined');
      return;
    }
    
    // Ensure we have a valid contract ID
    if (typeof contract.contractId !== 'number') {
      console.error('Invalid contract ID:', contract.contractId);
      return;
    }

    // Create a new object with the contract data
    const contractData = {
      ...contract,
      contractId: Number(contract.contractId) // Ensure it's a number
    };
    
    console.log('Passing contract data to modal:', JSON.stringify(contractData, null, 2));
    
    const dialogRef = this.dialog.open(ContractDetailsModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: contractData
    });

    dialogRef.afterOpened().subscribe(() => {
      console.log('Modal opened with contract data:', JSON.stringify(contractData, null, 2));
    });
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

  getContractTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'item_exchange':
        return 'swap_horiz';
      case 'auction':
        return 'gavel';
      case 'courier':
        return 'local_shipping';
      default:
        return 'description';
    }
  }

  formatContractType(type: string): string {
    switch (type.toLowerCase()) {
      case 'item_exchange':
        return 'Item Exchange';
      case 'auction':
        return 'Auction';
      case 'courier':
        return 'Courier';
      default:
        return type.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
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
      case 'deleted':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'outstanding':
        return 'schedule';
      case 'in_progress':
        return 'pending_actions';
      case 'finished':
        return 'check_circle';
      case 'deleted':
        return 'delete';
      default:
        return 'help';
    }
  }

  formatStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'outstanding':
        return 'Outstanding';
      case 'in_progress':
        return 'In Progress';
      case 'finished':
        return 'Finished';
      case 'deleted':
        return 'Deleted';
      default:
        return status.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  }
} 