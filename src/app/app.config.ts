import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { provideAnimations } from '@angular/platform-browser/animations';
// Configuração do PrimeNG v18
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAnimations(), // OBRIGATÓRIO para os painéis flutuantes não quebrarem
    providePrimeNG({
      theme: {
        preset: Aura, // Tema base limpo e moderno
        options: {
          darkModeSelector: '.tp-dark-theme' // Força o tema claro conforme o seu design
        }
      },
      translation: {
        dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
        monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        today: 'Hoje',
        clear: 'Limpar',
        dateFormat: 'dd/mm/yy',
        firstDayOfWeek: 0
      }
    }),
    
    
    provideAuth0({
      domain: 'dev-fzslqbhihrhb8va0.us.auth0.com',
      clientId: '0ack0PPx1NHjUHy5ym4R3rsmBjjnzBwN',
      
      // A MÁGICA ACONTECE AQUI: Salva o token fisicamente no navegador
      cacheLocation: 'localstorage', 
      
      authorizationParams: {
        redirect_uri: window.location.origin + '/painel',
        audience: 'https://api.tcc-ng.com',
      },
      httpInterceptor: {
        allowedList: [
          {
            uri: 'http://localhost:8000/*', 
            tokenOptions: {
              authorizationParams: {
                audience: 'https://api.tcc-ng.com'
              }
            }
          }
        ]
      }
    })
  ]
};