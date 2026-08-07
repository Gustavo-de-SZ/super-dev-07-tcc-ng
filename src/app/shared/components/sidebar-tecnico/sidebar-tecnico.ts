import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SolicitacaoService } from '../../../services/solicitacao.service';

@Component({
  selector: 'app-sidebar-tecnico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="tcc-sidebar">
      <div class="tcc-sidebar-brand">
        <div class="tcc-logo-icon">
          <i class="pi pi-desktop"></i>
        </div>
        <div class="tcc-logo-text">
          <strong>TechConnect</strong>
          <span>Painel do Técnico</span>
        </div>
      </div>

      <nav class="tcc-sidebar-nav">
        <a routerLink="/painel/dashboard" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-th-large"></i>
          <span>Visão Geral</span>
        </a>
        <a routerLink="/painel/chamados" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-list"></i>
          <span>Chamados</span>
          @if (activeChamadosCount > 0) {
            <span class="tcc-nav-badge">{{ activeChamadosCount }}</span>
          }
        </a>
        <a routerLink="/painel/clientes" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-users"></i>
          <span>Clientes</span>
        </a>
        <a routerLink="/painel/agenda" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-calendar"></i>
          <span>Agenda</span>
        </a>
        <a routerLink="/painel/servicos" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-desktop"></i>
          <span>Serviços</span>
        </a>
        <a routerLink="/painel/financeiro" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-money-bill"></i>
          <span>Financeiro</span>
        </a>
      </nav>

      <div class="tcc-sidebar-footer">
        <a routerLink="/cliente/ajuda" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-question-circle"></i>
          <span>Ajuda & Suporte</span>
        </a>
        <a routerLink="/painel/configuracoes" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-cog"></i>
          <span>Configurações</span>
        </a>
        <div class="tcc-nav-separator"></div>
        <button (click)="logout()" class="tcc-nav-item tcc-logout">
          <i class="pi pi-sign-out"></i>
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .tcc-sidebar {
      width: 260px;
      height: 100vh;
      background-color: var(--tcc-surface, #ffffff);
      border-right: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .tcc-sidebar-brand {
      height: 80px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 24px;
      border-bottom: 1px solid var(--tcc-border, #f1f5f9);
    }

    .tcc-logo-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
    }

    .tcc-logo-text {
      display: flex;
      flex-direction: column;
      strong { font-size: 16px; font-weight: 700; color: var(--tcc-text-main, #0f172a); }
      span { font-size: 11px; color: var(--tcc-text-muted, #64748b); font-weight: 500; }
    }

    .tcc-sidebar-nav, .tcc-sidebar-footer {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px;
    }

    .tcc-sidebar-nav {
      flex: 1;
      overflow-y: auto;
    }

    .tcc-sidebar-footer {
      border-top: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-nav-separator {
      height: 1px;
      background-color: var(--tcc-border, #f1f5f9);
      margin: 8px 0;
    }

    .tcc-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 16px;
      border-radius: 10px;
      color: var(--tcc-text-muted, #64748b);
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;

      i { font-size: 16px; width: 18px; text-align: center; }

      &:hover:not(.active) {
        background-color: var(--tcc-bg, #f8fafc);
        color: var(--tcc-text-main, #0f172a);
      }

      &.active {
        background-color: var(--tcc-primary, #3b82f6);
        color: #ffffff;
        font-weight: 600;
        box-shadow: 0 4px 12px #3b82f64d;
        .tcc-nav-badge {
          background: #ffffff;
          color: #2563eb;
        }
      }
    }

    .tcc-nav-badge {
      margin-left: auto;
      background: #eff6ff;
      color: #2563eb;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
    }

    .tcc-logout {
      color: #ef4444;
      &:hover {
        color: #dc2626 !important;
        background-color: #fef2f2 !important;
      }
    }
  `]
})
export class SidebarTecnico implements OnInit {
  private auth = inject(AuthService);
  private solicitacaoService = inject(SolicitacaoService);

  activeChamadosCount: number = 0;

  ngOnInit(): void {
    this.solicitacaoService.getMinhas().subscribe({
      next: (chamados) => {
        if (chamados) {
          this.activeChamadosCount = chamados.filter(c => c.status === 'EM_ANDAMENTO' || c.status === 'PENDENTE' || c.status === 'ABERTO' || c.status === 'AGUARDANDO_CLIENTE').length;
        }
      },
      error: () => {
        this.activeChamadosCount = 0;
      }
    });
  }

  logout(): void {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }
}