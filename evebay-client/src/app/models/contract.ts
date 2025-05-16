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
  date_accepted?: string;
  date_completed?: string;
  price: number;
  reward: number;
  collateral: number;
  buyout: number;
  volume: number;
  days_to_complete: number;
} 