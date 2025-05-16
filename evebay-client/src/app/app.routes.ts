import { Routes } from '@angular/router';
import { ContractTableComponent } from './components/contract-table/contract-table.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ContractsComponent } from './components/contracts/contracts.component';

export const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'contracts', component: ContractsComponent },
  { path: '', redirectTo: '/profile', pathMatch: 'full' },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: '**', redirectTo: '' }
];
