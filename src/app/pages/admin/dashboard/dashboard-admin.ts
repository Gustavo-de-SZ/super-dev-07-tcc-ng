import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminEstatisticas, TecnicoAdmin } from '../../../services/admin.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <div class="header-badge">
            <i class="pi pi-shield"></i>
            <span>Painel Administrativo</span>
          </div>
          <h1 class="tcc-title-lg">Visão Geral da Plataforma</h1>
          <p class="tcc-subtitle">Métricas operacionais e gestão de cadastros em tempo real</p>
        </div>

        <div class="header-actions">
          <button class="tcc-btn-secondary" (click)="carregarDados()" [disabled]="loading" title="Atualizar dados">
            <i class="pi" [class.pi-spin]="loading" [class.pi-spinner]="loading" [class.pi-refresh]="!loading"></i>
            <span>Atualizar</span>
          </button>
          <a routerLink="/admin/tecnicos" class="tcc-btn-main">
            <i class="pi pi-user-check"></i>
            <span>Gerenciar Técnicos</span>
          </a>
        </div>
      </header>

     
      @if (!loading && stats && stats.tecnicos_pendentes > 0) {
        <div class="admin-alert-banner">
          <div class="alert-icon-pulse">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="alert-text">
            <strong>Atenção Necessária</strong>
            <span>Você tem <strong>{{ stats.tecnicos_pendentes }}</strong> técnico{{ stats.tecnicos_pendentes > 1 ? 's' : '' }} aguardando análise e aprovação de cadastro.</span>
          </div>
          <a routerLink="/admin/tecnicos" class="alert-action-btn">
            Analisar Agora <i class="pi pi-arrow-right"></i>
          </a>
        </div>
      }

  
      <section class="kpi-grid">
   
        <div class="kpi-card" [class.highlight]="stats?.tecnicos_pendentes! > 0">
          <div class="kpi-card-top">
            <div class="kpi-icon-box orange">
              <i class="pi pi-clock"></i>
            </div>
            @if (stats?.tecnicos_pendentes! > 0) {
              <span class="pulse-tag">Pendente</span>
            }
          </div>
          <div class="kpi-card-body">
            @if (loading) {
              <div class="skeleton-num"></div>
            } @else {
              <span class="kpi-number">{{ stats?.tecnicos_pendentes || 0 }}</span>
            }
            <span class="kpi-title">Técnicos Pendentes</span>
            <span class="kpi-desc">Aguardando aprovação para atuar</span>
          </div>
        </div>

     
        <div class="kpi-card">
          <div class="kpi-card-top">
            <div class="kpi-icon-box blue">
              <i class="pi pi-users"></i>
            </div>
            <span class="badge-ratio">{{ stats?.tecnicos_aprovados || 0 }} / {{ stats?.total_tecnicos || 0 }}</span>
          </div>
          <div class="kpi-card-body">
            @if (loading) {
              <div class="skeleton-num"></div>
            } @else {
              <span class="kpi-number">{{ stats?.tecnicos_aprovados || 0 }}</span>
            }
            <span class="kpi-title">Técnicos Aprovados</span>
            <span class="kpi-desc">Profissionais cadastrados no total: {{ stats?.total_tecnicos || 0 }}</span>
          </div>
        </div>

      
        <div class="kpi-card">
          <div class="kpi-card-top">
            <div class="kpi-icon-box green">
              <i class="pi pi-building"></i>
            </div>
          </div>
          <div class="kpi-card-body">
            @if (loading) {
              <div class="skeleton-num"></div>
            } @else {
              <span class="kpi-number">{{ stats?.total_clientes || 0 }}</span>
            }
            <span class="kpi-title">Clientes Cadastrados</span>
            <span class="kpi-desc">Usuários com conta no aplicativo</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-card-top">
            <div class="kpi-icon-box purple">
              <i class="pi pi-ticket"></i>
            </div>
          </div>
          <div class="kpi-card-body">
            @if (loading) {
              <div class="skeleton-num"></div>
            } @else {
              <span class="kpi-number">{{ stats?.total_chamados || 0 }}</span>
            }
            <span class="kpi-title">Total de Chamados</span>
            <span class="kpi-desc">Atendimentos gerados na plataforma</span>
          </div>
        </div>
      </section>

   
      <div class="tcc-card-base table-card">
        <div class="table-card-header">
          <div class="header-left">
            <h2 class="section-title">Cadastros Pendentes de Aprovação</h2>
            <p class="section-subtitle">Analise os dados cadastrais antes de liberar o acesso</p>
          </div>
          <a routerLink="/admin/tecnicos" class="view-all-link">
            <span>Ver todos</span>
            <i class="pi pi-chevron-right"></i>
          </a>
        </div>

        @if (loading) {
          <div class="loading-box">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Carregando dados da administração...</span>
          </div>
        } @else if (tecnicosPendentes.length === 0) {
          <div class="empty-state-box">
            <div class="empty-icon-circle">
              <i class="pi pi-check-circle"></i>
            </div>
            <h3 class="empty-title">Nenhum técnico pendente</h3>
            <p class="empty-desc">Todos os profissionais cadastrados já foram avaliados e aprovados.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="tcc-table">
              <thead>
                <tr>
                  <th>Técnico / Empresa</th>
                  <th>CNPJ</th>
                  <th>Telefone</th>
                  <th>Data de Cadastro</th>
                  <th class="text-right">Ações Imediatas</th>
                </tr>
              </thead>
              <tbody>
                @for (tecnico of tecnicosPendentes.slice(0, 5); track tecnico.id) {
                  <tr>
                    <td>
                      <div class="tech-user-cell">
                        <div class="tech-avatar">
                          {{ tecnico.nome_fantasia ? tecnico.nome_fantasia.charAt(0).toUpperCase() : 'T' }}
                        </div>
                        <div class="tech-info">
                          <span class="tech-name">{{ tecnico.nome_fantasia }}</span>
                          <span class="tech-email">{{ tecnico.email || 'Email não disponível' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge-cnpj">{{ tecnico.cnpj }}</span>
                    </td>
                    <td>
                      <span class="text-muted">{{ tecnico.telefone }}</span>
                    </td>
                    <td>
                      <span class="text-muted">{{ tecnico.criado_em | date:'dd/MM/yyyy HH:mm' }}</span>
                    </td>
                    <td class="text-right">
                      <div class="inline-actions">
                        <button 
                          class="btn-action-approve" 
                          (click)="aprovarTecnico(tecnico)"
                          [disabled]="actionLoading[tecnico.id]"
                          title="Aprovar Cadastro">
                          <i class="pi" [class.pi-check]="!actionLoading[tecnico.id]" [class.pi-spin]="actionLoading[tecnico.id]" [class.pi-spinner]="actionLoading[tecnico.id]"></i>
                          <span>Aprovar</span>
                        </button>
                        <button 
                          class="btn-action-reject" 
                          (click)="rejeitarTecnico(tecnico)"
                          [disabled]="actionLoading[tecnico.id]"
                          title="Rejeitar">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <div class="shortcuts-section">
        <h2 class="section-title">Ações Administrativas</h2>
        <div class="shortcuts-grid">
          <a routerLink="/admin/tecnicos" class="shortcut-card">
            <div class="shortcut-icon blue">
              <i class="pi pi-users"></i>
            </div>
            <div class="shortcut-info">
              <h3>Gestão de Técnicos</h3>
              <p>Visualize todos os técnicos aprovados, pendentes, com filtros e buscas.</p>
            </div>
            <i class="pi pi-arrow-right shortcut-arrow"></i>
          </a>

          <a routerLink="/admin/configuracoes" class="shortcut-card">
            <div class="shortcut-icon purple">
              <i class="pi pi-cog"></i>
            </div>
            <div class="shortcut-info">
              <h3>Configurações Gerais</h3>
              <p>Preferências da conta, tema da interface e parâmetros administrativos.</p>
            </div>
            <i class="pi pi-arrow-right shortcut-arrow"></i>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tcc-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .tcc-page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(37, 99, 235, 0.08);
      color: var(--tcc-primary, #2563eb);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
      width: fit-content;
    }

    .tcc-title-lg {
      font-size: 26px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 4px 0;
    }

    .tcc-subtitle {
      font-size: 14px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tcc-btn-main {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background-color: var(--tcc-primary, #2563eb);
      color: #ffffff;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
      transition: all 0.2s ease;

      &:hover {
        background-color: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      }
    }

    .tcc-btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-main, #0f172a);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background-color: var(--tcc-bg, #f8fafc);
        border-color: var(--tcc-border-focus, #cbd5e1);
      }
    }

    /* Alert Banner */
    .admin-alert-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.12) 100%);
      border: 1px solid rgba(249, 115, 22, 0.3);
      border-radius: 14px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .alert-icon-pulse {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background-color: #f97316;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      box-shadow: 0 0 12px rgba(249, 115, 22, 0.4);
    }

    .alert-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 240px;

      strong {
        color: #c2410c;
        font-size: 14px;
        font-weight: 700;
      }
      span {
        color: var(--tcc-text-main, #0f172a);
        font-size: 13px;
      }
    }

    .alert-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background-color: #f97316;
      color: white;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #ea580c;
      }
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .kpi-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
      }

      &.highlight {
        border-color: rgba(249, 115, 22, 0.4);
        background: linear-gradient(180deg, var(--tcc-surface, #ffffff) 0%, rgba(249, 115, 22, 0.03) 100%);
      }
    }

    .kpi-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;

      &.orange { background: rgba(249, 115, 22, 0.12); color: #f97316; }
      &.blue { background: rgba(37, 99, 235, 0.12); color: #2563eb; }
      &.green { background: rgba(16, 185, 129, 0.12); color: #10b981; }
      &.purple { background: rgba(139, 92, 246, 0.12); color: #8b5cf6; }
    }

    .pulse-tag {
      background: rgba(249, 115, 22, 0.15);
      color: #ea580c;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-ratio {
      font-size: 12px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      background-color: var(--tcc-bg, #f8fafc);
      padding: 3px 8px;
      border-radius: 8px;
    }

    .kpi-card-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .kpi-number {
      font-size: 32px;
      font-weight: 800;
      color: var(--tcc-text-main, #0f172a);
      line-height: 1.1;
    }

    .skeleton-num {
      width: 60px;
      height: 36px;
      background: var(--tcc-border, #e2e8f0);
      border-radius: 6px;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .kpi-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      margin-top: 4px;
    }

    .kpi-desc {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
    }

    /* Table Card */
    .table-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .table-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 4px 0;
    }

    .section-subtitle {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--tcc-primary, #2563eb);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    .loading-box {
      padding: 48px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--tcc-text-muted, #64748b);
      font-size: 14px;

      i { font-size: 24px; color: var(--tcc-primary, #2563eb); }
    }

    .empty-state-box {
      padding: 48px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .empty-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 12px;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 4px 0;
    }

    .empty-desc {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .tcc-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 12px 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--tcc-text-muted, #64748b);
        border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      }

      td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--tcc-border, #f1f5f9);
        vertical-align: middle;
      }

      tbody tr:hover {
        background-color: var(--tcc-bg, #f8fafc);
      }
    }

    .tech-user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tech-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .tech-info {
      display: flex;
      flex-direction: column;
    }

    .tech-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    .tech-email {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
    }

    .badge-cnpj {
      font-family: monospace;
      font-size: 12px;
      background: var(--tcc-bg, #f1f5f9);
      padding: 3px 8px;
      border-radius: 6px;
      color: var(--tcc-text-main, #0f172a);
    }

    .text-muted {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }

    .text-right { text-align: right; }

    .inline-actions {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-action-approve {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #10b981;
        color: white;
      }
    }

    .btn-action-reject {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #ef4444;
        color: white;
      }
    }

    /* Shortcuts */
    .shortcuts-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .shortcut-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--tcc-primary, #3b82f6);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);

        .shortcut-arrow {
          transform: translateX(4px);
          color: var(--tcc-primary, #3b82f6);
        }
      }
    }

    .shortcut-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;

      &.blue { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
      &.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    }

    .shortcut-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;

      h3 {
        font-size: 15px;
        font-weight: 700;
        color: var(--tcc-text-main, #0f172a);
        margin: 0;
      }

      p {
        font-size: 12px;
        color: var(--tcc-text-muted, #64748b);
        margin: 0;
        line-height: 1.4;
      }
    }

    .shortcut-arrow {
      font-size: 14px;
      color: var(--tcc-text-muted, #94a3b8);
      transition: all 0.2s ease;
    }
  `]
})
export class DashboardAdmin implements OnInit {
  stats: AdminEstatisticas | null = null;
  tecnicosPendentes: TecnicoAdmin[] = [];
  loading = true;
  actionLoading: { [id: number]: boolean } = {};

  constructor(
    private adminService: AdminService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.loading = true;
    this.adminService.getEstatisticas().subscribe({
      next: (data) => {
        this.stats = data;
        this.carregarTecnicosPendentes();
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro de Comunicação',
          detail: 'Não foi possível carregar as métricas do painel.'
        });
      }
    });
  }

  carregarTecnicosPendentes() {
    this.adminService.getTecnicos('pendente').subscribe({
      next: (tecnicos) => {
        this.tecnicosPendentes = tecnicos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar técnicos pendentes:', err);
        this.loading = false;
      }
    });
  }

  aprovarTecnico(tecnico: TecnicoAdmin) {
    this.actionLoading[tecnico.id] = true;
    this.adminService.aprovarTecnico(tecnico.id).subscribe({
      next: () => {
        this.actionLoading[tecnico.id] = false;
        this.tecnicosPendentes = this.tecnicosPendentes.filter(t => t.id !== tecnico.id);
        if (this.stats) {
          this.stats.tecnicos_pendentes = Math.max(0, this.stats.tecnicos_pendentes - 1);
          this.stats.tecnicos_aprovados += 1;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Cadastro Aprovado',
          detail: `O técnico ${tecnico.nome_fantasia} foi aprovado com sucesso!`
        });
      },
      error: (err) => {
        this.actionLoading[tecnico.id] = false;
        console.error('Erro ao aprovar técnico:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao aprovar cadastro do profissional.'
        });
      }
    });
  }

  rejeitarTecnico(tecnico: TecnicoAdmin) {
    this.actionLoading[tecnico.id] = true;
    this.adminService.rejeitarTecnico(tecnico.id).subscribe({
      next: () => {
        this.actionLoading[tecnico.id] = false;
        this.tecnicosPendentes = this.tecnicosPendentes.filter(t => t.id !== tecnico.id);
        if (this.stats) {
          this.stats.tecnicos_pendentes = Math.max(0, this.stats.tecnicos_pendentes - 1);
        }
        this.messageService.add({
          severity: 'info',
          summary: 'Cadastro Rejeitado',
          detail: `O cadastro de ${tecnico.nome_fantasia} foi rejeitado.`
        });
      },
      error: (err) => {
        this.actionLoading[tecnico.id] = false;
        console.error('Erro ao rejeitar técnico:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao rejeitar cadastro.'
        });
      }
    });
  }
}
