import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withNoXsrfProtection, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { sslInterceptor } from './interceptors/ssl.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(),
      withNoXsrfProtection(),
      withInterceptors([sslInterceptor])
    )
  ]
};
