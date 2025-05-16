import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'evebay_session_id';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('SessionService initialized, isBrowser:', this.isBrowser);
    
    if (this.isBrowser) {
      // Try to get session ID from URL first
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('sessionId');
      
      if (sessionId) {
        console.log('Found session ID in URL:', sessionId);
        this.setSessionId(sessionId);
        // Remove the session ID from the URL without changing the page
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }

  get sessionId(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return sessionStorage.getItem(this.SESSION_KEY);
  }

  setSessionId(id: string) {
    if (!this.isBrowser) {
      console.warn('Attempting to set session ID in non-browser environment');
      return;
    }
    console.log('Setting session ID in sessionStorage:', id);
    sessionStorage.setItem(this.SESSION_KEY, id);
  }

  clearSession() {
    if (!this.isBrowser) {
      console.warn('Attempting to clear session in non-browser environment');
      return;
    }
    console.log('Clearing session ID from sessionStorage');
    sessionStorage.removeItem(this.SESSION_KEY);
  }
} 