import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../core/services/theme.service.ts';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule],
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
          
          <p-button label="Entrar" [text]="true" styleClass="tcc-btn-text px-3"></p-button>
          <p-button label="Cadastrar" styleClass="tcc-btn-main padding " [style]="{ padding: '12px 20px' }"></p-button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  theme = inject(ThemeService);
}