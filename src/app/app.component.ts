import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { PrimeNG } from 'primeng/config';
import { ProfileService } from './services/profile.service';
import { AuthService } from './services/auth.service';
import { filter, switchMap, take } from 'rxjs/operators';
import { PRIME_NG_PT_BR } from './shared/i18n/primeng-pt-br';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  template: `
    <router-outlet></router-outlet>
    <p-toast></p-toast>
  `
})
export class App {
  protected readonly title = signal('tcc-ng');

  constructor(
    private profileService: ProfileService,
    private auth: AuthService,
    private router: Router,
    private primeng: PrimeNG
  ) {
    this.primeng.setTranslation(PRIME_NG_PT_BR);
    this.verificarECriarPerfilSeNecessario();
  }

  private verificarECriarPerfilSeNecessario(): void {
    // Aguarda autenticação confirmada e dados do usuário disponíveis
    this.auth.isAuthenticated$.pipe(
      filter(authenticated => authenticated),
      switchMap(() => this.auth.user$),
      filter(user => !!user), // Aguarda até ter dados reais do usuário
      take(1) // Pega a primeira emissão válida do usuário
    ).subscribe({
      next: (user) => {
        this.profileService.verificarPerfilExistente().subscribe({
          next: (response) => {
            const currentUrl = this.router.url.split('?')[0];
            if (currentUrl === '/' || currentUrl === '') {
              this.profileService.redirecionarParaPainelCorrespondente(response);
            } else if (!response.exists && !currentUrl.includes('/completar-cadastro')) {
              // Redireciona para completar o cadastro se o perfil não existe
              this.router.navigate(['/completar-cadastro']);
            }
          },
          error: (err) => console.error('Erro ao verificar perfil:', err)
        });
      },
      error: (err) => console.error('Erro ao obter dados do usuário:', err)
    });
  }
}