import { Injectable, inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Injetamos o serviço oficial do Auth0
  private auth0 = inject(Auth0Service);

  // Observables para você usar direto no HTML com pipe async (ex: *ngIf="isAuthenticated$ | async")
  public user$ = this.auth0.user$;
  public isAuthenticated$ = this.auth0.isAuthenticated$;
  public isLoading$ = this.auth0.isLoading$;

  /**
   * Redireciona para a página segura de login do Auth0
   */
  login(): void {
    this.auth0.loginWithRedirect();
  }

  /**
   * Limpa a sessão no Auth0 e redireciona de volta para a raiz do seu app
   */
  logout(): void {
    this.auth0.logout({ 
      logoutParams: { returnTo: window.location.origin } 
    });
  }

  /**
   * O Auth0 já gerencia o Token. 
   * Só chame isso se precisar do token bruto por algum motivo muito específico.
   */
  getToken() {
    return this.auth0.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    });
  }
}