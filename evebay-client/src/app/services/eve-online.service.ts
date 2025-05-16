import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contract {
  contractId: number;
  issuerId: number;
  issuerCorporationId: number;
  assigneeId: number;
  acceptorId: number;
  startStationId: number;
  endStationId: number;
  type: string;
  status: string;
  title: string;
  forCorporation: boolean;
  availability: string;
  dateIssued: string;
  dateExpired: string;
  dateAccepted: string | null;
  dateCompleted: string | null;
  numDays: number;
  price: number;
  reward: number;
  collateral: number;
  buyout: number;
  volume: number;
}

export interface ContractItem {
  record_id: number;
  type_id: number;
  quantity: number;
  raw_quantity?: number;
  is_singleton: boolean;
  is_included: boolean;
  item_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class EveOnlineService {
  constructor(private http: HttpClient) {}

  getCorporationContracts(includeFinished: boolean = false): Observable<Contract[]> {
    console.log('EveOnlineService - Getting contracts, includeFinished:', includeFinished);
    const params = new HttpParams().set('includeFinished', includeFinished.toString());
    return this.http.get<any[]>(`${environment.apiUrl}/contracts`, { params })
      .pipe(
        tap(response => console.log('EveOnlineService - Raw API response:', JSON.stringify(response, null, 2))),
        map(contracts => contracts.map(contract => {
          // Log the raw contract data
          console.log('EveOnlineService - Processing contract:', JSON.stringify(contract, null, 2));
          
          // Helper function to safely convert to number
          const toNumber = (value: any): number => {
            if (value === undefined || value === null) return 0;
            const num = Number(value);
            return isNaN(num) ? 0 : num;
          };
          
          // Map snake_case to camelCase
          const mappedContract: Contract = {
            contractId: toNumber(contract.contract_id),
            issuerId: toNumber(contract.issuer_id),
            issuerCorporationId: toNumber(contract.issuer_corporation_id),
            assigneeId: toNumber(contract.assignee_id),
            acceptorId: toNumber(contract.acceptor_id),
            startStationId: toNumber(contract.start_location_id),
            endStationId: toNumber(contract.end_location_id),
            type: contract.type,
            status: contract.status,
            title: contract.title,
            forCorporation: Boolean(contract.for_corporation),
            availability: contract.availability,
            dateIssued: contract.date_issued,
            dateExpired: contract.date_expired,
            dateAccepted: contract.date_accepted,
            dateCompleted: contract.date_completed,
            numDays: toNumber(contract.days_to_complete),
            price: toNumber(contract.price),
            reward: toNumber(contract.reward),
            collateral: toNumber(contract.collateral),
            buyout: toNumber(contract.buyout),
            volume: toNumber(contract.volume)
          };

          console.log('EveOnlineService - Mapped contract:', JSON.stringify(mappedContract, null, 2));
          return mappedContract;
        })),
        tap(response => console.log('EveOnlineService - Processed contracts:', JSON.stringify(response, null, 2))),
        catchError(error => {
          console.error('EveOnlineService - Error fetching contracts:', error);
          return of([]);
        })
      );
  }

  getContractDetails(contractId: number): Observable<Contract | null> {
    console.log('EveOnlineService - Getting contract details for ID:', contractId);
    return this.http.get<any>(`${environment.apiUrl}/contracts/${contractId}`).pipe(
      tap(response => console.log('EveOnlineService - Raw contract details:', JSON.stringify(response, null, 2))),
      map(contract => {
        // Log the raw contract data
        console.log('EveOnlineService - Processing contract details:', JSON.stringify(contract, null, 2));
        
        // Helper function to safely convert to number
        const toNumber = (value: any): number => {
          if (value === undefined || value === null) return 0;
          const num = Number(value);
          return isNaN(num) ? 0 : num;
        };
        
        // Map snake_case to camelCase
        const mappedContract: Contract = {
          contractId: toNumber(contract.contract_id),
          issuerId: toNumber(contract.issuer_id),
          issuerCorporationId: toNumber(contract.issuer_corporation_id),
          assigneeId: toNumber(contract.assignee_id),
          acceptorId: toNumber(contract.acceptor_id),
          startStationId: toNumber(contract.start_location_id),
          endStationId: toNumber(contract.end_location_id),
          type: contract.type,
          status: contract.status,
          title: contract.title,
          forCorporation: Boolean(contract.for_corporation),
          availability: contract.availability,
          dateIssued: contract.date_issued,
          dateExpired: contract.date_expired,
          dateAccepted: contract.date_accepted,
          dateCompleted: contract.date_completed,
          numDays: toNumber(contract.days_to_complete),
          price: toNumber(contract.price),
          reward: toNumber(contract.reward),
          collateral: toNumber(contract.collateral),
          buyout: toNumber(contract.buyout),
          volume: toNumber(contract.volume)
        };

        console.log('EveOnlineService - Mapped contract details:', JSON.stringify(mappedContract, null, 2));
        return mappedContract;
      }),
      tap(response => console.log('EveOnlineService - Processed contract details:', JSON.stringify(response, null, 2))),
      catchError(error => {
        console.error('EveOnlineService - Error fetching contract details:', error);
        return of(null);
      })
    );
  }

  getContractItems(contractId: number): Observable<ContractItem[]> {
    console.log('EveOnlineService - Getting items for contract:', contractId);
    const url = `${environment.apiUrl}/contracts/${contractId}/items`;
    console.log('EveOnlineService - Request URL:', url);

    return this.http.get<ContractItem[]>(url).pipe(
      tap(response => {
        console.log('EveOnlineService - Raw API response:', JSON.stringify(response, null, 2));
        console.log('EveOnlineService - Response type:', typeof response);
        console.log('EveOnlineService - Is array?', Array.isArray(response));
        if (Array.isArray(response)) {
          console.log('EveOnlineService - First item:', response[0]);
        }
      }),
      map(response => {
        if (!Array.isArray(response)) {
          console.error('EveOnlineService - Response is not an array:', response);
          return [];
        }
        return response.map(item => ({
          record_id: item.record_id,
          type_id: item.type_id,
          quantity: item.quantity,
          raw_quantity: item.raw_quantity,
          is_singleton: item.is_singleton,
          is_included: item.is_included,
          item_name: item.item_name
        }));
      }),
      tap(mappedItems => {
        console.log('EveOnlineService - Mapped items:', JSON.stringify(mappedItems, null, 2));
      }),
      catchError(error => {
        console.error('EveOnlineService - Error fetching contract items:', error);
        console.error('EveOnlineService - Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        return of([]);
      })
    );
  }
} 