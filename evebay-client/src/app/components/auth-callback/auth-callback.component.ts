import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-callback">
      <p *ngIf="loading">Processing authentication...</p>
      <p *ngIf="error" class="error">{{ error }}</p>
      <div *ngIf="debugInfo" class="debug-info">
        <h3>Debug Information:</h3>
        <pre>{{ debugInfo | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .auth-callback {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      padding: 20px;
    }
    .error {
      color: red;
      margin: 10px 0;
    }
    .debug-info {
      margin-top: 20px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #f5f5f5;
      max-width: 600px;
      overflow: auto;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error: string | null = null;
  debugInfo: any = null;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sessionService: SessionService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('[AuthCallback] Component constructed');
    
    if (this.isBrowser) {
      this.debugInfo = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      };
    } else {
      this.debugInfo = {
        timestamp: new Date().toISOString(),
        environment: 'server'
      };
    }
  }

  ngOnInit() {
    console.log('[AuthCallback] Component initialized');
    
    if (this.isBrowser) {
      console.log('[AuthCallback] Current URL:', window.location.href);
      
      // First try to get session ID directly from URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('sessionId');
      const error = urlParams.get('error');

      console.log('[AuthCallback] Direct URL params:', { sessionId, error });

      if (sessionId || error) {
        this.handleAuthResponse(sessionId, error);
      } else {
        // If not in URL, try route params
        this.route.queryParams.subscribe({
          next: (params) => {
            console.log('[AuthCallback] Route params received:', params);
            this.handleAuthResponse(params['sessionId'], params['error']);
          },
          error: (err) => {
            console.error('[AuthCallback] Error processing route params:', err);
            this.handleError('Error processing authentication');
          }
        });
      }
    } else {
      // On server side, just use route params
      this.route.queryParams.subscribe({
        next: (params) => {
          console.log('[AuthCallback] Route params received:', params);
          this.handleAuthResponse(params['sessionId'], params['error']);
        },
        error: (err) => {
          console.error('[AuthCallback] Error processing route params:', err);
          this.handleError('Error processing authentication');
        }
      });
    }
  }

  private handleAuthResponse(sessionId: string | null, error: string | null) {
    this.debugInfo = {
      ...this.debugInfo,
      params: { sessionId, error },
      timestamp: new Date().toISOString()
    };

    if (error) {
      console.error('[AuthCallback] Authentication error:', error);
      this.handleError('Authentication failed');
      return;
    }

    if (sessionId) {
      console.log('[AuthCallback] Storing session ID:', sessionId);
      this.sessionService.setSessionId(sessionId);
      
      // Verify the session ID was stored
      const storedSessionId = this.sessionService.sessionId;
      console.log('[AuthCallback] Verified stored session ID:', storedSessionId);
      
      this.debugInfo = {
        ...this.debugInfo,
        storedSessionId,
        timestamp: new Date().toISOString()
      };

      // Add a small delay before navigation to ensure session is stored
      setTimeout(() => {
        console.log('[AuthCallback] Navigating to home page');
        this.router.navigate(['/']);
      }, 100);
    } else {
      console.error('[AuthCallback] No session ID received');
      this.handleError('No session ID found');
    }
  }

  private handleError(message: string) {
    this.error = message;
    this.loading = false;
    this.debugInfo = {
      ...this.debugInfo,
      error: message,
      timestamp: new Date().toISOString()
    };
    this.router.navigate(['/login']);
  }
} 