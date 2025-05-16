import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div class="p-8 bg-white rounded-lg shadow-md">
        <h1 class="mb-6 text-2xl font-bold text-center text-gray-800">Welcome to EveBay</h1>
        <button
          (click)="login()"
          class="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Login with EVE Online
        </button>
      </div>
    </div>
  `
})
export class AuthComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/contracts']);
    }
  }

  login(): void {
    this.authService.login();
  }
} 