import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contract {
  contract_id: number;
  issuer_id: number;
  issuer_corporation_id: number;
  assignee_id: number;
  acceptor_id: number;
  start_location_id: number;
  end_location_id: number;
  type: string;
  status: string;
  title: string;
  for_corporation: boolean;
  availability: string;
  date_issued: string;
  date_expired: string;
  date_accepted: string;
  date_completed: string;
  price: number;
  reward: number;
  collateral: number;
  buyout: number;
  volume: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.apiUrl}/contracts`).pipe(
      catchError(error => {
        console.error('Error fetching contracts:', error);
        return of([]);
      })
    );
  }

  getContract(id: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/contracts/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching contract ${id}:`, error);
        throw error;
      })
    );
  }
} 