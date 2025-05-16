import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

const routes: Routes = [
  { 
    path: 'auth/callback', 
    component: AuthCallbackComponent,
    pathMatch: 'full'
  },
  { 
    path: '', 
    redirectTo: '/', 
    pathMatch: 'full' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })], // Enable route tracing for debugging
  exports: [RouterModule]
})
export class AppRoutingModule { } 