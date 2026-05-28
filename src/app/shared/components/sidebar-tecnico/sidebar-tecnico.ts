import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-tecnico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="tcc-sidebar">
      <div class="tcc-sidebar-brand">
        <h2>Painel do Técnico</h2>
      </div>

      <nav class="tcc-sidebar-nav">
        <a href="#" class="tcc-nav-item active">
          <i class="pi pi-th-large"></i>
          <span>Visão Geral</span>
        </a>
        <a href="#" class="tcc-nav-item">
          <i class="pi pi-users"></i>
          <span>Clientes</span>
        </a>
        <a href="#" class="tcc-nav-item">
          <i class="pi pi-calendar"></i>
          <span>Agenda</span>
        </a>
        <a href="#" class="tcc-nav-item">
          <i class="pi pi-ticket"></i>
          <span>Chamados</span>
        </a>
        <a href="#" class="tcc-nav-item">
          <i class="pi pi-dollar"></i>
          <span>Financeiro</span>
        </a>
        <a href="#" class="tcc-nav-item">
          <i class="pi pi-chart-bar"></i>
          <span>Relatórios</span>
        </a>
        <a href="#" class="tcc-nav-item">
          <i class="pi pi-cog"></i>
          <span>Configurações</span>
        </a>
      </nav>

      <div class="tcc-sidebar-footer">
        <a href="#" class="tcc-nav-item tcc-logout">
          <i class="pi pi-sign-out"></i>
          <span>Sair</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .tcc-sidebar {
      width: 260px;
      height: 100vh;
      background-color: var(--tcc-surface);
      border-right: 1px solid var(--tcc-border);
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .tcc-sidebar-brand {
      height: 80px;
      display: flex;
      align-items: center;
      padding: 0 32px;
      
      h2 {
        font-size: 18px;
        font-weight: 700;
        color: var(--tcc-text-main);
        margin: 0;
      }
    }

    .tcc-sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      overflow-y: auto;
    }

    .tcc-nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      border-radius: 12px;
      color: var(--tcc-text-muted);
      text-decoration: none;
      font-weight: 500;
      font-size: 15px;
      transition: all 0.2s ease;

      i { font-size: 19px; }

      &:hover:not(.active) {
        background-color: var(--tcc-surface-hover);
        color: var(--tcc-text-main);
      }

      &.active {
        background-color: var(--tcc-primary);
        color: #ffffff;
        box-shadow: 0 4px 12px #3b82f64d;
      }
    }

    .tcc-sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--tcc-border);
    }

    .tcc-logout:hover {
      color: #ef4444 !important;
      background-color: #ef44441a !important;
    }
  `]
})
export class SidebarTecnico {}