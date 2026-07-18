import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProfileService } from './services/profile.service';
import { AuthService } from './services/auth.service';
import { filter, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('tcc-ng');

  constructor(
    private profileService: ProfileService,
    private auth: AuthService,
    private router: Router
  ) {
    this.verificarECriarPerfilSeNecessario();
  }

  private verificarECriarPerfilSeNecessario(): void {
    // Aguarda autenticação confirmada
    this.auth.isAuthenticated$.pipe(
      filter(authenticated => authenticated),
      take(1),
      switchMap(() => this.auth.user$.pipe(take(1)))
    ).subscribe(user => {
      if (user) {
        this.profileService.verificarPerfilExistente().subscribe({
          next: (response) => {
            if (!response.exists) {
              // Redireciona para completar o cadastro se o perfil não existe
              this.router.navigate(['/completar-cadastro']);
            }
          },
          error: (err) => console.error('Erro ao verificar perfil:', err)
        });
      }
    });
  }
}