import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SolicitacaoService } from '../../../services/solicitacao.service';

@Component({
  selector: 'app-recent-chamados-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tcc-card-base ch-panel-card">
      <div class="tcc-panel-header">
        <div class="ch-header-title-box">
          <div class="ch-header-icon">
            <i class="pi pi-bolt"></i>
          </div>
          <div>
            <h3>Chamados Recentes</h3>
            <span class="ch-header-sub">{{ chamados.length > 0 ? (chamados.length + ' chamado(s) na fila') : 'Nenhum chamado pendente' }}</span>
          </div>
        </div>
        <a routerLink="/painel/chamados" class="tcc-link-sm">
          Ver todos <i class="pi pi-arrow-right" style="font-size: 11px; margin-left: 2px;"></i>
        </a>
      </div>

      @if (!carregando && chamados.length > 0) {
        <div class="ch-list">
          @for (chamado of chamados.slice(0, 4); track (chamado.id || $index)) {
            <div class="ch-item" (click)="irParaChamados(chamado)">
              <div class="ch-item-left">
                <div class="ch-type-badge" [ngClass]="getBadgeClass(chamado.status)">
                  <i class="pi" [ngClass]="getIconClass(chamado.status)"></i>
                </div>
                <div class="ch-details">
                  <div class="ch-title-row">
                    <h4 class="ch-title">{{ chamado.titulo || 'Chamado #' + chamado.id }}</h4>
                  </div>
                  <div class="ch-meta">
                    <span class="ch-meta-client">
                      <i class="pi pi-user"></i>
                      {{ chamado.cliente_nome || chamado.cliente?.nome_completo || 'Cliente' }}
                    </span>
                    <span class="ch-meta-dot">•</span>
                    <span class="ch-meta-date">
                      <i class="pi pi-calendar"></i>
                      {{ formatData(chamado) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="ch-item-right">
                <span class="ch-status-pill" [ngClass]="getStatusClass(chamado.status)">
                  {{ formatStatus(chamado.status) }}
                </span>
                <i class="pi pi-chevron-right ch-chevron"></i>
              </div>
            </div>
          }
        </div>
      }

      @if (carregando) {
        <div class="ch-loading">
          @for (i of [1, 2, 3]; track i) {
            <div class="ch-skeleton-item"></div>
          }
        </div>
      }

      @if (!carregando && chamados.length === 0) {
        <div class="ch-empty">
          <div class="ch-empty-icon">
            <i class="pi pi-inbox"></i>
          </div>
          <h4>Nenhum chamado ativo</h4>
          <p>Você não possui chamados pendentes no momento. Veja solicitações abertas para atender.</p>
          <button class="tcc-btn-main small" routerLink="/painel/chamados">
            <i class="pi pi-search" style="font-size: 12px; margin-right: 6px;"></i> Explorar Chamados
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .ch-panel-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 380px;
    }

    .tcc-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .ch-header-title-box {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        font-size: 17px;
        font-weight: 600;
        color: var(--tcc-text-main, #1e293b);
        margin: 0;
      }
    }

    .ch-header-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.1);
      color: var(--tcc-primary, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .ch-header-sub {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-link-sm {
      font-size: 13px;
      color: var(--tcc-primary, #3b82f6);
      text-decoration: none;
      font-weight: 600;
      display: flex;
      align-items: center;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }
    }

    .ch-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .ch-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      background: var(--tcc-surface, #ffffff);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: var(--tcc-primary, #3b82f6);
        background: var(--tcc-surface-hover, #f8faff);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);

        .ch-chevron {
          transform: translateX(3px);
          color: var(--tcc-primary, #3b82f6);
        }
      }
    }

    .ch-item-left {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
      flex: 1;
    }

    .ch-type-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;

      &.badge-blue {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }

      &.badge-amber {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
      }

      &.badge-green {
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
      }

      &.badge-purple {
        background: rgba(139, 92, 246, 0.12);
        color: #8b5cf6;
      }
    }

    .ch-details {
      min-width: 0;
      flex: 1;
    }

    .ch-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ch-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #1e293b);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ch-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      margin-top: 3px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .ch-meta-client {
        max-width: 140px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ch-meta-dot {
        color: var(--tcc-border, #cbd5e1);
      }
    }

    .ch-item-right {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: 12px;
    }

    .ch-status-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      white-space: nowrap;
      letter-spacing: 0.2px;

      &.status-andamento {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.3);
      }

      &.status-aberto {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      &.status-concluido {
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      &.status-orcamento {
        background: rgba(139, 92, 246, 0.12);
        color: #8b5cf6;
        border: 1px solid rgba(139, 92, 246, 0.3);
      }
    }

    .ch-chevron {
      font-size: 12px;
      color: var(--tcc-text-muted, #94a3b8);
      transition: all 0.2s ease;
    }

    .ch-loading {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ch-skeleton-item {
      height: 64px;
      border-radius: 12px;
      background: linear-gradient(90deg, var(--tcc-bg, #f1f5f9) 25%, var(--tcc-border, #e2e8f0) 50%, var(--tcc-bg, #f1f5f9) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .ch-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 32px 16px;
      flex: 1;

      .ch-empty-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: var(--tcc-bg, #f1f5f9);
        color: var(--tcc-text-muted, #94a3b8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-bottom: 12px;
      }

      h4 {
        font-size: 15px;
        font-weight: 600;
        color: var(--tcc-text-main, #1e293b);
        margin: 0 0 6px 0;
      }

      p {
        font-size: 13px;
        color: var(--tcc-text-muted, #64748b);
        margin: 0 0 16px 0;
        max-width: 260px;
        line-height: 1.4;
      }
    }
  `]
})
export class RecentChamadosPanelComponent implements OnInit {
  private solicitacaoService = inject(SolicitacaoService);
  private router = inject(Router);

  chamados: any[] = [];
  carregando = true;

  ngOnInit(): void {
    this.carregarChamados();
  }

  parseDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === 'string') {
      const ddmmyyyy = val.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
      if (ddmmyyyy) {
        const day = parseInt(ddmmyyyy[1], 10);
        const month = parseInt(ddmmyyyy[2], 10) - 1;
        const year = parseInt(ddmmyyyy[3], 10);
        const hour = ddmmyyyy[4] ? parseInt(ddmmyyyy[4], 10) : 0;
        const min = ddmmyyyy[5] ? parseInt(ddmmyyyy[5], 10) : 0;
        return new Date(year, month, day, hour, min);
      }
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  carregarChamados(): void {
    this.carregando = true;
    this.solicitacaoService.getMinhas().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [];
        this.chamados = list.sort((a, b) => {
          if (a.status === 'EM_ANDAMENTO' && b.status !== 'EM_ANDAMENTO') return -1;
          if (b.status === 'EM_ANDAMENTO' && a.status !== 'EM_ANDAMENTO') return 1;
          const timeA = this.parseDate(a.dataCriacao || a.data_criacao || a.criado_em)?.getTime() || 0;
          const timeB = this.parseDate(b.dataCriacao || b.data_criacao || b.criado_em)?.getTime() || 0;
          return timeB - timeA;
        });
        this.carregando = false;
      },
      error: () => {
        this.chamados = [];
        this.carregando = false;
      }
    });
  }

  irParaChamados(chamado?: any): void {
    this.router.navigate(['/painel/chamados']);
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'ABERTO': return 'Aberto';
      case 'EM_ORCAMENTO': return 'Em Orçamento';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      default: return status || 'Pendente';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'status-andamento';
      case 'ABERTO': return 'status-aberto';
      case 'EM_ORCAMENTO': return 'status-orcamento';
      case 'CONCLUIDO': return 'status-concluido';
      default: return 'status-andamento';
    }
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'badge-blue';
      case 'ABERTO': return 'badge-amber';
      case 'EM_ORCAMENTO': return 'badge-purple';
      case 'CONCLUIDO': return 'badge-green';
      default: return 'badge-blue';
    }
  }

  getIconClass(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'pi-bolt';
      case 'ABERTO': return 'pi-clock';
      case 'EM_ORCAMENTO': return 'pi-calculator';
      case 'CONCLUIDO': return 'pi-check-circle';
      default: return 'pi-wrench';
    }
  }

  formatData(chamado: any): string {
    if (!chamado) return 'Recente';
    const raw = chamado.dataCriacao || chamado.data_criacao || chamado.criado_em;
    if (!raw) return 'Recente';

    if (typeof raw === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
      return raw;
    }

    const parsed = this.parseDate(raw);
    if (parsed) {
      return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return typeof raw === 'string' ? raw : 'Recente';
  }
}
