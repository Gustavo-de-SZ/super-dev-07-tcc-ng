import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideAuth0, authHttpInterceptorFn, AuthService as Auth0Service } from '@auth0/auth0-angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { AuthService as CustomAuthService, REAL_AUTH0_TOKEN } from './services/auth.service';
import { PRIME_NG_PT_BR } from './shared/i18n/primeng-pt-br';

const auth0Config = provideAuth0({
  domain: environment.auth0.domain,
  clientId: environment.auth0.clientId,
  
  // Salva o token fisicamente no navegador
  cacheLocation: 'localstorage', 
  
  authorizationParams: {
    redirect_uri: environment.auth0.authorizationParams.redirect_uri,
    audience: environment.auth0.authorizationParams.audience,
  },
  httpInterceptor: {
    allowedList: [
      {
        uri: `${environment.api.serverUrl}/*`, 
        tokenOptions: {
          authorizationParams: {
            audience: environment.auth0.authorizationParams.audience
          }
        }
      }
    ]
  }
});

const auth0ProvidersRaw = (auth0Config as any).ɵproviders || auth0Config;
const processedAuth0Providers = (Array.isArray(auth0ProvidersRaw) ? auth0ProvidersRaw : [auth0ProvidersRaw]).map((p: any) => {
  if (p === Auth0Service) {
    return { provide: REAL_AUTH0_TOKEN, useClass: Auth0Service };
  } else if (p && typeof p === 'object' && p.provide === Auth0Service) {
    return { ...p, provide: REAL_AUTH0_TOKEN };
  }
  return p;
});

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    provideHttpClient(withInterceptors([authHttpInterceptorFn, errorInterceptor])),
    { provide: Auth0Service, useExisting: CustomAuthService },
    provideAnimations(), // OBRIGATÓRIO para os painéis flutuantes não quebrarem
    providePrimeNG({
      theme: {
        preset: Aura, // Tema base limpo e moderno
        options: {
          darkModeSelector: '.tp-dark-theme' // Força o tema claro conforme o seu design
        }
      },
      translation: PRIME_NG_PT_BR
    }),
    
    processedAuth0Providers
  ]
};