import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Contract, ContractItem, EveOnlineService } from '../../../services/eve-online.service';

@Component({
  selector: 'app-contract-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  template: `
    <div class="contract-details-container">
      <h2 mat-dialog-title>
        Contract Details
        <button mat-icon-button class="close-button" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </h2>

      <mat-dialog-content>
        <div class="details-grid">
          <!-- Basic Information -->
          <div class="section">
            <h3>Basic Information</h3>
            <div class="detail-row">
              <span class="label">Type:</span>
              <mat-chip [color]="getContractTypeColor(data.type)" selected class="contract-type-chip">
                <mat-icon class="chip-icon">{{ getContractTypeIcon(data.type) }}</mat-icon>
                {{ formatContractType(data.type) }}
              </mat-chip>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <mat-chip [color]="getStatusColor(data.status)" selected class="status-chip">
                <mat-icon class="chip-icon">{{ getStatusIcon(data.status) }}</mat-icon>
                {{ formatStatus(data.status) }}
              </mat-chip>
            </div>
            <div class="detail-row">
              <span class="label">Title:</span>
              <span class="value">{{ data.title || 'Untitled' }}</span>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="section">
            <h3>Financial Information</h3>
            <div class="detail-row">
              <span class="label">Price:</span>
              <span class="value">{{ data.price | number:'1.0-0' }} ISK</span>
            </div>
            <div class="detail-row">
              <span class="label">Reward:</span>
              <span class="value">{{ data.reward | number:'1.0-0' }} ISK</span>
            </div>
            <div class="detail-row">
              <span class="label">Collateral:</span>
              <span class="value">{{ data.collateral | number:'1.0-0' }} ISK</span>
            </div>
            <div class="detail-row">
              <span class="label">Buyout:</span>
              <span class="value">{{ data.buyout | number:'1.0-0' }} ISK</span>
            </div>
          </div>

          <!-- Dates -->
          <div class="section">
            <h3>Dates</h3>
            <div class="detail-row">
              <span class="label">Issued:</span>
              <span class="value">{{ data.dateIssued | date:'medium' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Expires:</span>
              <span class="value">{{ data.dateExpired | date:'medium' }}</span>
            </div>
            <div class="detail-row" *ngIf="data.dateAccepted">
              <span class="label">Accepted:</span>
              <span class="value">{{ data.dateAccepted | date:'medium' }}</span>
            </div>
            <div class="detail-row" *ngIf="data.dateCompleted">
              <span class="label">Completed:</span>
              <span class="value">{{ data.dateCompleted | date:'medium' }}</span>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="section">
            <h3>Additional Information</h3>
            <div class="detail-row">
              <span class="label">For Corporation:</span>
              <span class="value">{{ data.forCorporation ? 'Yes' : 'No' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Availability:</span>
              <span class="value">{{ formatAvailability(data.availability) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Volume:</span>
              <span class="value">{{ data.volume | number:'1.0-2' }} m³</span>
            </div>
          </div>
        </div>

        <!-- Contract Items -->
        <div class="items-section">
          <h3>Contract Items</h3>
          <div *ngIf="loadingItems" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading items...</p>
          </div>
          <div *ngIf="errorItems" class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ errorItems }}</p>
          </div>
          <div *ngIf="!loadingItems && !errorItems">
            <table mat-table [dataSource]="items" class="items-table">
              <!-- Item Name Column -->
              <ng-container matColumnDef="item_name">
                <th mat-header-cell *matHeaderCellDef>Item Name</th>
                <td mat-cell *matCellDef="let item">{{ item.item_name }}</td>
              </ng-container>

              <!-- Quantity Column -->
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantity</th>
                <td mat-cell *matCellDef="let item">{{ item.quantity | number:'1.0-0' }}</td>
              </ng-container>

              <!-- Raw Quantity Column -->
              <ng-container matColumnDef="raw_quantity">
                <th mat-header-cell *matHeaderCellDef>Raw Quantity</th>
                <td mat-cell *matCellDef="let item">{{ item.raw_quantity | number:'1.0-0' }}</td>
              </ng-container>

              <!-- Singleton Column -->
              <ng-container matColumnDef="is_singleton">
                <th mat-header-cell *matHeaderCellDef>Singleton</th>
                <td mat-cell *matCellDef="let item">
                  <mat-icon [color]="item.is_singleton ? 'primary' : 'warn'">
                    {{ item.is_singleton ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                </td>
              </ng-container>

              <!-- Included Column -->
              <ng-container matColumnDef="is_included">
                <th mat-header-cell *matHeaderCellDef>Included</th>
                <td mat-cell *matCellDef="let item">
                  <mat-icon [color]="item.is_included ? 'primary' : 'warn'">
                    {{ item.is_included ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .contract-details-container {
      padding: 0;
    }

    h2[mat-dialog-title] {
      margin: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .close-button {
      margin: -8px -8px -8px 0;
    }

    mat-dialog-content {
      padding: 24px;
      max-height: 70vh;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 16px;
    }

    h3 {
      margin: 0 0 16px 0;
      font-size: 1.1em;
      color: rgba(255, 255, 255, 0.7);
    }

    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 8px;
    }

    .label {
      color: rgba(255, 255, 255, 0.7);
      min-width: 100px;
    }

    .value {
      font-weight: 500;
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

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    .items-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
    }

    .items-table {
      width: 100%;
      margin-top: 16px;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      gap: 16px;
      color: rgba(255, 255, 255, 0.7);
    }

    .error-container {
      color: #f44336;
    }

    .mat-column-item_name {
      width: 120px;
    }

    .mat-column-quantity, .mat-column-raw_quantity {
      width: 120px;
      text-align: right;
    }

    .mat-column-is_singleton, .mat-column-is_included {
      width: 100px;
      text-align: center;
    }
  `]
})
export class ContractDetailsModalComponent implements OnInit {
  items: ContractItem[] = [];
  loadingItems = true;
  errorItems: string | null = null;
  displayedColumns: string[] = ['item_name', 'quantity', 'raw_quantity', 'is_singleton', 'is_included'];

  constructor(
    public dialogRef: MatDialogRef<ContractDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Contract,
    private eveOnlineService: EveOnlineService
  ) {}

  ngOnInit() {
    console.log('Contract Details Modal - Initializing with contract:', this.data);
    if (!this.data) {
      console.error('Contract Details Modal - No contract data provided');
      this.errorItems = 'Invalid contract data';
      return;
    }
    console.log('Contract ID:', this.data.contractId);
    this.loadContractItems();
  }

  private loadContractItems() {
    if (this.data.contractId === undefined || this.data.contractId === null) {
      console.error('Contract Details Modal - Cannot load items: contractId is undefined or null');
      this.errorItems = 'Invalid contract ID';
      return;
    }

    console.log('Contract Details Modal - Starting to load items for contract:', this.data.contractId);
    this.loadingItems = true;
    this.errorItems = null;

    this.eveOnlineService.getContractItems(this.data.contractId).subscribe({
      next: (items) => {
        console.log('Contract Details Modal - Raw items received:', JSON.stringify(items, null, 2));
        console.log('Contract Details Modal - Items array length:', items.length);
        if (items.length > 0) {
          console.log('Contract Details Modal - First item:', JSON.stringify(items[0], null, 2));
        }
        this.items = items;
        this.loadingItems = false;
      },
      error: (error) => {
        console.error('Contract Details Modal - Error loading items:', error);
        this.errorItems = 'Failed to load contract items. Please try again later.';
        this.loadingItems = false;
      },
      complete: () => {
        console.log('Contract Details Modal - Items request completed');
      }
    });
  }

  close(): void {
    this.dialogRef.close();
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

  formatAvailability(availability: string): string {
    switch (availability.toLowerCase()) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      default:
        return availability.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  }
} 