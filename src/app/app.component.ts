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
  protected readonly title = signal('TCC');

  constructor(
    private profileService: ProfileService,
    private auth: AuthService,
    private router: Router,
    private primeng: PrimeNG
  ) {
    this.primeng.setTranslation(PRIME_NG_PT_BR);
  }
}