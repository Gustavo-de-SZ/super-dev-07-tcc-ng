import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-pendente-aprovacao',
  standalone: true,
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="pending-layout">
   
      <div class="floating-controls">
        <button
          (click)="theme.toggle()"
          class="btn-icon-control"
          aria-label="Alternar tema"
          title="Alternar tema"
        >
          <i [class]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <button
          (click)="logout()"
          class="btn-logout-control"
        >
          <i class="pi pi-sign-out"></i>
          <span>Sair</span>
        </button>
      </div>


      <div class="pending-card">
    
        <div class="header-icon-box">
          <i class="pi pi-clock"></i>
        </div>

     
        <h1 class="card-title">Análise Pendente</h1>
        <p class="card-subtitle">
          Seu cadastro como técnico foi recebido com sucesso e está em nossa fila de aprovação.
        </p>

     
        <div class="info-alert-box">
          <div class="info-alert-icon">
            <i class="pi pi-info-circle"></i>
          </div>
          <div class="info-alert-content">
            <p>
              Nossa equipe de moderação avaliará seu perfil em breve. Você receberá uma notificação por e-mail com o resultado da aprovação.
            </p>
          </div>
        </div>

    
        <div class="actions-wrapper">
          <button 
            class="btn-primary-check" 
            (click)="verificarStatus()" 
            [disabled]="verificando"
          >
            <i class="pi" [class.pi-spin]="verificando" [class.pi-spinner]="verificando" [class.pi-refresh]="!verificando"></i>
            <span>{{ verificando ? 'Verificando...' : 'Verificar Status' }}</span>
          </button>

          <button class="btn-secondary-logout" (click)="logout()">
            Sair por enquanto
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pending-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background-color: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #0f172a);
      position: relative;
      font-family: inherit;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* Top Floating Controls */
    .floating-controls {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 10;
    }

    .btn-icon-control {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--tcc-border, #e2e8f0);
      background-color: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;

      &:hover {
        color: var(--tcc-text-main, #0f172a);
        border-color: var(--tcc-text-muted, #94a3b8);
      }
    }

    .btn-logout-control {
      height: 38px;
      padding: 0 1rem;
      border-radius: 9999px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      background-color: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-muted, #64748b);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.3);
        background-color: rgba(239, 68, 68, 0.05);
      }
    }

    /* Card */
    .pending-card {
      width: 100%;
      max-width: 520px;
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 1rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
      padding: 2.5rem 2rem;
      text-align: center;
      box-sizing: border-box;
    }

    /* Icon Box */
    .header-icon-box {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: rgba(245, 158, 11, 0.1);
      color: #d97706;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 1.25rem;
    }

    /* Titles */
    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    .card-subtitle {
      font-size: 0.9375rem;
      color: var(--tcc-text-muted, #64748b);
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
    }

    /* Info Alert Box */
    .info-alert-box {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background-color: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 0.75rem;
      text-align: left;
      margin-bottom: 1.75rem;

      .info-alert-icon {
        color: #3b82f6;
        font-size: 1.125rem;
        margin-top: 0.125rem;
      }

      .info-alert-content p {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--tcc-text-muted, #64748b);
        line-height: 1.45;
      }
    }

    /* Action Buttons */
    .actions-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-primary-check {
      width: 100%;
      padding: 0.75rem 1.25rem;
      background-color: #2563eb;
      color: #ffffff;
      border: 1px solid transparent;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background-color 0.2s ease;

      &:hover:not(:disabled) {
        background-color: #1d4ed8;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-secondary-logout {
      width: 100%;
      padding: 0.625rem 1.25rem;
      background: transparent;
      color: var(--tcc-text-muted, #64748b);
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease, background-color 0.2s ease;

      &:hover {
        color: var(--tcc-text-main, #0f172a);
        background-color: var(--tcc-bg, #f1f5f9);
      }
    }

    @media (max-width: 640px) {
      .pending-card {
        padding: 2rem 1.25rem;
      }
    }
  `]
})
export class PendenteComponent implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  public theme = inject(ThemeService);

  verificando = false;

  ngOnInit(): void {}

  verificarStatus(): void {
    this.verificando = true;

    this.profileService.verificarPerfilExistente().subscribe({
      next: (profile) => {
        this.verificando = false;

        if (profile && profile.type === 'tecnico' && profile.aprovado === true) {
          this.messageService.add({
            severity: 'success',
            summary: 'Cadastro Aprovado!',
            detail: 'Seu perfil foi aprovado! Redirecionando para o painel...'
          });

          setTimeout(() => {
            this.profileService.redirecionarParaPainelCorrespondente(profile);
          }, 1000);
        } else if (profile && profile.type === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Análise em Andamento',
            detail: 'Seu cadastro ainda está na fila de moderação.'
          });
        }
      },
      error: () => {
        this.verificando = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Status Indisponível',
          detail: 'Não foi possível verificar agora. Tente novamente em instantes.'
        });
      }
    });
  }

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}