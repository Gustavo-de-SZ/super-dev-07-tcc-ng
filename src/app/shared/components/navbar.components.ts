import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Necessário se for usar routerLink
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../core/services/theme.service';
// 1. Importamos o AuthService do pacote do Auth0
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // 2. Adicionamos o RouterModule aos imports
  imports: [CommonModule, ButtonModule, RouterModule],
  template: `
    <nav class="tcc-header">
      <div class="tcc-wrapper tcc-flex-split">
        
        <div style="display: flex; align-items: center; gap: 3rem;">
          <div class="tcc-menu">
            <a href="#">Serviços</a>
            <a href="#">Para Profissionais</a>
            <a href="#">Como Funciona</a>
            <a href="#">Contato</a>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <button class="tcc-toggle-mode" (click)="theme.toggle()">
            <i [class]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
          </button>
          
         @if ((auth.isAuthenticated$ | async) === false) {
            <p-button label="Entrar" [text]="true" styleClass="tcc-btn-text px-3" (onClick)="login()"></p-button>
            <p-button label="Cadastrar" styleClass="tcc-btn-main padding" [style]="{ padding: '12px 20px' }" (onClick)="cadastrar()"></p-button>
          }

          @if (auth.user$ | async; as user) {
            <div style="display: flex; align-items: center; gap: 1rem; margin-left: 0.5rem;">
              
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                @if (user.picture) {
                  <img [src]="user.picture" 
                       alt="Foto de Perfil" 
                       style="width: 36px; height: 36px; border-radius: 50%;">
                }
                
                <span style="font-size: 14px; font-weight: 500;">
                  Olá, {{ user.given_name || (user.name ? user.name.split(' ')[0] : 'Visitante') }}
                </span>
              </div>

              <p-button label="Painel" [text]="true" styleClass="tcc-btn-text" routerLink="/painel"></p-button>
              <p-button label="Sair" [text]="true" severity="danger" (onClick)="logout()"></p-button>
            </div>
          }

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  theme = inject(ThemeService);
  // 5. Injetamos o serviço do Auth0
  auth = inject(AuthService);

  login() {
    // Redireciona para a tela padrão de login
    this.auth.loginWithRedirect();
  }

  cadastrar() {
    // O 'screen_hint' diz ao Auth0 para abrir a tela já na aba de "Sign Up" (Cadastro)
    this.auth.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  }

  logout() {
    // Limpa a sessão e volta para a raiz do seu site
    this.auth.logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  }
}