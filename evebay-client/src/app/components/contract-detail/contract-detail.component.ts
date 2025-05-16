import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { Contract } from '../../models/contract';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss']
})
export class ContractDetailComponent implements OnInit {
  contract: Contract | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService
  ) {}

  ngOnInit() {
    this.loadContract();
  }

  loadContract() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid contract ID';
      return;
    }

    this.loading = true;
    this.error = null;

    this.contractService.getContract(id).subscribe({
      next: (data) => {
        this.contract = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load contract details. Please try again.';
        this.loading = false;
        console.error('Error loading contract:', error);
      }
    });
  }
} 