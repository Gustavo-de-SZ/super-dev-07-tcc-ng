import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Necessario se for usar routerLink ou Router
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../core/services/theme.service';
// 1. Importamos o AuthService do nosso wrapper local
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // 2. Adicionamos o RouterModule aos imports
  imports: [CommonModule, ButtonModule, RouterModule],
  template: `
    <nav class="tcc-header">
      <div class="tcc-wrapper tcc-flex-split">

        <div style="display: flex; align-items: center; gap: 3rem;">
        
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
                @if ((profilePicture$ | async) || user.picture) {
                  <img [src]="(profilePicture$ | async) || user.picture"
                       alt="Foto de Perfil"
                       style="width: 36px; height: 36px; border-radius: 50%;">
                }

                <span style="font-size: 14px; font-weight: 500;">
                  Olá, {{ user.given_name || (user.name ? user.name.split(' ')[0] : 'Visitante') }}
                </span>
              </div>

              <p-button label="Painel" [text]="true" styleClass="tcc-btn-text" (onClick)="navigateToPanel()"></p-button>
              <p-button label="Sair" [text]="true" severity="danger" (onClick)="logout()"></p-button>
            </div>
          }

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  theme = inject(ThemeService);
  // 5. Injetamos o serviço do Auth
  auth = inject(AuthService);
  // 6. Injetamos o ProfileService para roteamento unificado
  private profileService = inject(ProfileService);
  // 7. Injetamos o Router para navegação programática
  private router = inject(Router);

  profilePicture$: Observable<string | null> = of(null);

  ngOnInit(): void {
    this.profilePicture$ = this.profileService.profilePicture$;
    
    // Log the user and roles for debugging
    this.auth.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        console.log('Navbar User:', user);
        const roles = user['https://tcc-ng.com/roles'] || [];
        console.log('Navbar Roles:', roles);
        console.log('Navbar User ID:', user.sub);
        console.log('Navbar User Email:', user.email);
      }
    });
  }

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

  /**
   * Navega para o painel apropriado baseado no tipo de usuario
   */
  navigateToPanel(): void {
    this.profileService.redirecionarParaPainelCorrespondente();
  }
}