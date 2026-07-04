import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth, LogLevel } from 'angular-auth-oidc-client';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { authInterceptor } from './interceptors/authInterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withXsrfConfiguration({
        cookieName: "XSRF-TOKEN",
        headerName: "X-CSRF-TOKEN"
      }),
    ),
    provideAuth({
      config: {
        authority: 'https://localhost:5443',
        redirectUrl: "https://localhost:5443",
        postLogoutRedirectUri: "https://localhost:5443",
        clientId: 'AngApp001',
        scope: 'openid profile email roles offline_access',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: LogLevel.Debug,
      },
    }),
  ]
};
