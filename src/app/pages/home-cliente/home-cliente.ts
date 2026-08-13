import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ProfileService } from '../../services/profile.service';
import { MeusChamadosService } from '../../services/meus-chamados.service';
import { Chamado } from '../../models/chamado';

@Component({
  selector: 'app-home-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tcc-home-minimal tcc-fade-in">
      
  
      <header class="tcc-header-simple">
        <div class="tcc-header-texts">
          <h1 class="tcc-title">
            Olá{{ userName ? ', ' + userName : '' }} <span class="tcc-wave">👋</span>
          </h1>
          <p class="tcc-subtitle">
            O que você gostaria de fazer hoje?
          </p>
        </div>
      </header>

    
      <section class="tcc-actions-grid">
        
      
        <a [routerLink]="['/cliente/solicitacao']" class="tcc-action-card card-solicitacao">
          <div class="tcc-card-icon-box icon-blue">
            <i class="pi pi-plus-circle"></i>
          </div>
          <div class="tcc-card-content">
            <h2 class="tcc-card-title">Nova Solicitação</h2>
            <p class="tcc-card-desc">Descreva um problema ou serviço para receber suporte técnico.</p>
          </div>
          <div class="tcc-card-action-link">
            <span>Abrir chamado</span>
            <i class="pi pi-arrow-right"></i>
          </div>
        </a>

     
        <a [routerLink]="['/cliente/buscar']" class="tcc-action-card card-buscar">
          <div class="tcc-card-icon-box icon-indigo">
            <i class="pi pi-search"></i>
          </div>
          <div class="tcc-card-content">
            <h2 class="tcc-card-title">Buscar Especialistas</h2>
            <p class="tcc-card-desc">Encontre profissionais qualificados por especialidade e avaliação.</p>
          </div>
          <div class="tcc-card-action-link">
            <span>Explorar técnicos</span>
            <i class="pi pi-arrow-right"></i>
          </div>
        </a>

     
        <a [routerLink]="['/cliente/meus-chamados']" class="tcc-action-card card-chamados">
          <div class="tcc-card-icon-box icon-emerald">
            <i class="pi pi-folder-open"></i>
          </div>
          <div class="tcc-card-content">
            <div class="tcc-card-title-row">
              <h2 class="tcc-card-title">Meus Chamados</h2>
              @if (chamadosAtivosCount > 0) {
                <span class="tcc-badge-count">{{ chamadosAtivosCount }} ativo(s)</span>
              }
            </div>
            <p class="tcc-card-desc">Acompanhe o andamento dos seus pedidos e converse no chat.</p>
          </div>
          <div class="tcc-card-action-link">
            <span>Ver chamados</span>
            <i class="pi pi-arrow-right"></i>
          </div>
        </a>

      </section>

   
      <section class="tcc-recent-section">
        <div class="tcc-recent-header">
          <div class="tcc-recent-title-wrap">
            <h2 class="tcc-section-heading">Chamados Recentes</h2>
            <span class="tcc-section-sub">Seus últimos atendimentos registrados</span>
          </div>
          @if (chamados.length > 0) {
            <a [routerLink]="['/cliente/meus-chamados']" class="tcc-link-all">
              Ver todos os chamados <i class="pi pi-arrow-right"></i>
            </a>
          }
        </div>

        @if (carregando) {
          <div class="tcc-loading-state">
            <i class="pi pi-spin pi-spinner tcc-spinner"></i>
            <span>Carregando seus chamados...</span>
          </div>
        } @else if (chamados.length === 0) {
          <div class="tcc-empty-box">
            <div class="tcc-empty-icon-box">
              <i class="pi pi-inbox"></i>
            </div>
            <h3>Nenhum chamado aberto</h3>
            <p>Quando você abrir uma solicitação de suporte, ela aparecerá aqui para você acompanhar.</p>
            <a [routerLink]="['/cliente/solicitacao']" class="tcc-btn-primary-sm">
              <i class="pi pi-plus"></i>
              <span>Abrir Primeira Solicitação</span>
            </a>
          </div>
        } @else {
          <div class="tcc-tickets-list">
            @for (item of chamados.slice(0, 4); track item.id) {
              <div class="tcc-ticket-item" [routerLink]="['/cliente/meus-chamados']">
                
                <div class="tcc-ticket-main">
                  <div class="tcc-ticket-meta">
                    <span class="tcc-protocol">#{{ item.id }}</span>
                    <span class="tcc-date">{{ formatarData(item.data_criacao || item.dataCriacao) }}</span>
                    @if (item.categoria_nome) {
                      <span class="tcc-cat-tag">{{ item.categoria_nome }}</span>
                    }
                  </div>
                  <h3 class="tcc-ticket-title">
                    {{ item.titulo || item.equipamento || 'Solicitação de Suporte' }}
                  </h3>
                  @if (item.profissional_nome && item.profissional_nome !== 'Técnico') {
                    <div class="tcc-ticket-tech">
                      <i class="pi pi-user"></i>
                      <span>Técnico: <strong>{{ item.profissional_nome }}</strong></span>
                    </div>
                  }
                </div>

                <div class="tcc-ticket-side">
                  <span class="tcc-status-pill" [ngClass]="getStatusClass(item.status)">
                    ● {{ getStatusLabel(item.status) }}
                  </span>

                  <div class="tcc-ticket-actions" (click)="$event.stopPropagation()">
                    @if (item.profissional_id) {
                      <a [routerLink]="['/cliente/chat', item.id]" class="tcc-btn-chat" title="Conversar no Chat">
                        <i class="pi pi-comments"></i>
                        <span>Chat</span>
                      </a>
                    }
                  </div>
                </div>

              </div>
            }
          </div>
        }
      </section>

    </div>
  `,
  styles: [`
    .tcc-home-minimal {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding: 8px 0 32px 0;
      max-width: 1140px;
      margin: 0 auto;
    }

    .tcc-fade-in {
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    
    .tcc-header-simple {
      padding-bottom: 4px;
    }

    .tcc-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--tcc-text-main, #0f172a);
      letter-spacing: -0.025em;
    }

    .tcc-wave {
      display: inline-block;
    }

    .tcc-subtitle {
      margin: 6px 0 0 0;
      font-size: 0.95rem;
      color: var(--tcc-text-muted, #64748b);
    }

    
    .tcc-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .tcc-action-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;

      &:hover {
        transform: translateY(-4px);
        border-color: #cbd5e1;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);

        .tcc-card-action-link {
          color: #2563eb;
          transform: translateX(4px);
        }
      }
    }

    .tcc-card-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin-bottom: 16px;
    }

    .icon-blue {
      background: #eff6ff;
      color: #2563eb;
    }

    .icon-indigo {
      background: #eef2ff;
      color: #4f46e5;
    }

    .icon-emerald {
      background: #ecfdf5;
      color: #059669;
    }

    .tcc-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tcc-card-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .tcc-card-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      letter-spacing: -0.01em;
    }

    .tcc-badge-count {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
      background: #d1fae5;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .tcc-card-desc {
      margin: 0;
      font-size: 0.88rem;
      color: var(--tcc-text-muted, #64748b);
      line-height: 1.45;
    }

    .tcc-card-action-link {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid var(--tcc-border, #f1f5f9);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      transition: all 0.2s;
    }

    
    .tcc-recent-section {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .tcc-recent-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--tcc-border, #f1f5f9);
    }

    .tcc-section-heading {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-section-sub {
      font-size: 0.85rem;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-link-all {
      font-size: 13px;
      font-weight: 600;
      color: #2563eb;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;

      &:hover {
        text-decoration: underline;
      }
    }

   
    .tcc-tickets-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .tcc-ticket-item {
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #f1f5f9);
      border-radius: 12px;
      padding: 16px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #ffffff;
        border-color: #cbd5e1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      }
    }

    .tcc-ticket-main {
      flex: 1;
      min-width: 250px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tcc-ticket-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tcc-protocol {
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
    }

    .tcc-date {
      font-size: 12px;
      color: #64748b;
    }

    .tcc-cat-tag {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      background: #e2e8f0;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .tcc-ticket-title {
      margin: 0;
      font-size: 14.5px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-ticket-tech {
      font-size: 12px;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;

      i { color: #16a34a; }
      strong { color: #0f172a; }
    }

    .tcc-ticket-side {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .tcc-status-pill {
      font-size: 11.5px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: capitalize;
    }

    .status-aberto {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #dbeafe;
    }

    .status-pendente {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fef3c7;
    }

    .status-andamento {
      background: #f5f3ff;
      color: #6d28d9;
      border: 1px solid #ede9fe;
    }

    .status-concluido {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #d1fae5;
    }

    .status-cancelado {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .tcc-ticket-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tcc-btn-chat {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;

      &:hover {
        background: #2563eb;
        color: #ffffff;
      }
    }

   
    .tcc-loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 36px 0;
      color: var(--tcc-text-muted, #64748b);
      font-size: 13.5px;
    }

    .tcc-spinner {
      font-size: 18px;
      color: #2563eb;
    }

    .tcc-empty-box {
      text-align: center;
      padding: 36px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--tcc-text-main, #0f172a);
      }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--tcc-text-muted, #64748b);
        max-width: 420px;
      }
    }

    .tcc-empty-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--tcc-bg, #f1f5f9);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      margin-bottom: 4px;
    }

    .tcc-btn-primary-sm {
      margin-top: 12px;
      background: #2563eb;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &:hover {
        background: #1d4ed8;
      }
    }

    @media (max-width: 640px) {
      .tcc-ticket-item {
        flex-direction: column;
        align-items: flex-start;
      }

      .tcc-ticket-side {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class ClienteInicio implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private meusChamadosService = inject(MeusChamadosService);

  userName: string = '';
  chamados: Chamado[] = [];
  chamadosAtivosCount: number = 0;
  carregando: boolean = true;

  ngOnInit(): void {
    // 1. Obter nome real do cliente
    this.profileService.obterPerfilCliente().subscribe({
      next: (perfil) => {
        if (perfil?.nome_completo) {
          this.userName = perfil.nome_completo.trim().split(' ')[0];
        }
      },
      error: () => {}
    });

    // 2. Auth0 fallback
    this.auth.user$.subscribe(user => {
      if (!this.userName && user) {
        if (user.given_name) {
          this.userName = user.given_name;
        } else if (user.name && !user.name.includes('@')) {
          this.userName = user.name.split(' ')[0];
        } else if (user.nickname && !user.nickname.includes('@')) {
          this.userName = user.nickname;
        }
      }
    });

    this.carregarChamados();
  }

  carregarChamados(): void {
    this.carregando = true;
    this.meusChamadosService.getChamados().subscribe({
      next: (chamados) => {
        this.chamados = chamados || [];
        this.chamadosAtivosCount = this.chamados.filter(c =>
          c.status === 'EM_ANDAMENTO' || c.status === 'PENDENTE' || c.status === 'ABERTO'
        ).length;
        this.carregando = false;
      },
      error: () => {
        this.chamados = [];
        this.chamadosAtivosCount = 0;
        this.carregando = false;
      }
    });
  }

  getStatusClass(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'ABERTO':
        return 'status-aberto';
      case 'PENDENTE':
        return 'status-pendente';
      case 'EM_ANDAMENTO':
        return 'status-andamento';
      case 'CONCLUIDO':
      case 'FINALIZADO':
        return 'status-concluido';
      case 'CANCELADO':
        return 'status-cancelado';
      default:
        return 'status-aberto';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'ABERTO':
        return 'Aberto';
      case 'PENDENTE':
        return 'Pendente';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'CONCLUIDO':
      case 'FINALIZADO':
        return 'Concluído';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status || 'Aberto';
    }
  }

  formatarData(data: any): string {
    if (!data) return '—';
    if (data instanceof Date) {
      if (isNaN(data.getTime())) return '—';
      const d = data.getDate().toString().padStart(2, '0');
      const m = (data.getMonth() + 1).toString().padStart(2, '0');
      const y = data.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const str = String(data);
    if (str.includes('/')) return str;
    if (str.includes('-')) {
      const partes = str.split('T')[0].split('-');
      if (partes.length === 3) {
        if (partes[0].length === 4) {
          return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return `${partes[0]}/${partes[1]}/${partes[2]}`;
      }
    }
    return str;
  }
}