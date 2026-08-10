import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, TecnicoAdmin } from '../../../services/admin.service';
import { MessageService, MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-tecnicos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, PaginatorModule, MenuModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <div class="header-badge">
            <i class="pi pi-shield"></i>
            <span>Administração</span>
          </div>
          <h1 class="tcc-title-lg">Gestão de Técnicos</h1>
          <p class="tcc-subtitle">Controle de cadastros, aprovações e histórico de profissionais</p>
        </div>

        <div class="header-actions">
          <button class="tcc-btn-secondary" (click)="carregarTecnicos()" [disabled]="loading">
            <i class="pi" [class.pi-spin]="loading" [class.pi-spinner]="loading" [class.pi-refresh]="!loading"></i>
            <span>Atualizar</span>
          </button>
        </div>
      </header>

   
      <div class="filters-bar-card">
        <div class="filter-tabs">
          <button 
            class="tab-btn" 
            [class.active]="filtroStatus === 'todos'"
            (click)="mudarFiltro('todos')">
            <span>Todos</span>
            <span class="tab-badge">{{ countTotal }}</span>
          </button>
          <button 
            class="tab-btn" 
            [class.active]="filtroStatus === 'pendente'"
            (click)="mudarFiltro('pendente')">
            <span class="dot-indicator orange"></span>
            <span>Pendentes</span>
            <span class="tab-badge orange">{{ countPendentes }}</span>
          </button>
          <button 
            class="tab-btn" 
            [class.active]="filtroStatus === 'aprovado'"
            (click)="mudarFiltro('aprovado')">
            <span class="dot-indicator green"></span>
            <span>Aprovados</span>
            <span class="tab-badge green">{{ countAprovados }}</span>
          </button>
        </div>

        <div class="search-box">
          <i class="pi pi-search search-icon"></i>
          <input 
            type="text" 
            [(ngModel)]="termoBusca" 
            (ngModelChange)="onSearchChange()"
            placeholder="Buscar por nome, CNPJ, email ou telefone..."
            class="search-input" />
          @if (termoBusca) {
            <button class="clear-search-btn" (click)="termoBusca = ''; onSearchChange()">
              <i class="pi pi-times"></i>
            </button>
          }
        </div>
      </div>

     
      <div class="tcc-card-base table-container">
        @if (loading) {
          <div class="loading-state-box">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Carregando dados dos técnicos...</p>
          </div>
        } @else if (tecnicosFiltrados.length === 0) {
          <div class="empty-state-box">
            <div class="empty-icon-circle">
              <i class="pi pi-users"></i>
            </div>
            <h3 class="empty-title">Nenhum técnico encontrado</h3>
            <p class="empty-desc">
              @if (termoBusca) {
                Nenhum resultado corresponde à busca "{{ termoBusca }}".
              } @else if (filtroStatus === 'pendente') {
                Não há técnicos aguardando aprovação no momento.
              } @else {
                Nenhum profissional cadastrado nesta categoria.
              }
            </p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="tcc-table">
              <thead>
                <tr>
                  <th>Profissional / Empresa</th>
                  <th>CNPJ</th>
                  <th>Contato</th>
                  <th>Data de Cadastro</th>
                  <th class="text-center">Status</th>
                  <th class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (tecnico of paginatedTecnicos; track (tecnico.id || $index)) {
                  <tr class="table-row">
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
                      <span class="badge-code">{{ tecnico.cnpj || '-' }}</span>
                    </td>
                    <td>
                      <div class="contact-info">
                        <span>{{ tecnico.telefone || '-' }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="text-muted">{{ tecnico.criado_em | date:'dd/MM/yyyy' }}</span>
                    </td>
                    <td class="text-center">
                      @if (tecnico.aprovado_pelo_admin) {
                        <span class="status-badge status-approved">
                          <i class="pi pi-check-circle"></i>
                          <span>Aprovado</span>
                        </span>
                      } @else {
                        <span class="status-badge status-pending">
                          <i class="pi pi-clock"></i>
                          <span>Pendente</span>
                        </span>
                      }
                    </td>
                    <td class="text-right">
                      <div class="action-buttons-group">
                        <button 
                          class="btn-detail" 
                          (click)="abrirDetalhes(tecnico)"
                          title="Ver Detalhes do Técnico">
                          <i class="pi pi-eye"></i>
                          <span>Detalhes</span>
                        </button>

                        <button
                          type="button"
                          class="tcc-btn-outline small"
                          (click)="abrirMenu($event, menu, tecnico)"
                          title="Mais Ações"
                        >
                          Ações <i class="pi pi-chevron-down"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (tecnicosFiltrados.length > rows) {
            <div class="paginator-wrapper">
              <p-paginator
                (onPageChange)="onPageChange($event)"
                [first]="first"
                [rows]="rows"
                [totalRecords]="tecnicosFiltrados.length"
                [rowsPerPageOptions]="[10, 20, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords} técnicos"
              ></p-paginator>
            </div>
          }
        }
      </div>

      <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

      @if (tecnicoSelecionado) {
        <div class="modal-backdrop" (click)="fecharDetalhes()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-header-title">
                <div class="modal-avatar">
                  {{ tecnicoSelecionado.nome_fantasia ? tecnicoSelecionado.nome_fantasia.charAt(0).toUpperCase() : 'T' }}
                </div>
                <div>
                  <h3 class="modal-title">{{ tecnicoSelecionado.nome_fantasia }}</h3>
                  <p class="modal-subtitle">Detalhes cadastrais do profissional</p>
                </div>
              </div>
              <button class="modal-close-btn" (click)="fecharDetalhes()">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Status Cadastral</span>
                  <span class="detail-value">
                    @if (tecnicoSelecionado.aprovado_pelo_admin) {
                      <span class="status-badge status-approved">
                        <i class="pi pi-check-circle"></i> Aprovado
                      </span>
                    } @else {
                      <span class="status-badge status-pending">
                        <i class="pi pi-clock"></i> Pendente de Aprovação
                      </span>
                    }
                  </span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">CNPJ</span>
                  <span class="detail-value font-mono">{{ tecnicoSelecionado.cnpj || 'Não informado' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ tecnicoSelecionado.email || 'Não informado' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Telefone</span>
                  <span class="detail-value">{{ tecnicoSelecionado.telefone || 'Não informado' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Data de Registro</span>
                  <span class="detail-value">{{ tecnicoSelecionado.criado_em | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Chamados Vinculados</span>
                  <span class="detail-value">{{ tecnicoSelecionado.total_chamados || 0 }} atendimento(s)</span>
                </div>
              </div>

              @if (tecnicoSelecionado.descricao_servicos) {
                <div class="detail-box">
                  <span class="detail-label">Descrição dos Serviços</span>
                  <p class="detail-description">{{ tecnicoSelecionado.descricao_servicos }}</p>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" (click)="fecharDetalhes()">Fechar</button>

              @if (!tecnicoSelecionado.aprovado_pelo_admin) {
                <button 
                  class="btn-approve" 
                  (click)="aprovar(tecnicoSelecionado); fecharDetalhes()"
                  [disabled]="actionLoading[tecnicoSelecionado.id]">
                  <i class="pi pi-check"></i>
                  <span>Aprovar Cadastro</span>
                </button>
              } @else {
                <button 
                  class="btn-reject-subtle" 
                  (click)="rejeitar(tecnicoSelecionado); fecharDetalhes()"
                  [disabled]="actionLoading[tecnicoSelecionado.id]">
                  <i class="pi pi-ban"></i>
                  <span>Suspender Aprovação</span>
                </button>
              }
            </div>
          </div>
        </div>
      }
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

    /* Filters Bar */
    .filters-bar-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--tcc-text-muted, #64748b);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--tcc-bg, #f8fafc);
        color: var(--tcc-text-main, #0f172a);
      }

      &.active {
        background-color: var(--tcc-primary, #2563eb);
        color: white;

        .tab-badge {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
      }
    }

    .tab-badge {
      padding: 2px 7px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      background-color: var(--tcc-bg, #f1f5f9);
      color: var(--tcc-text-muted, #64748b);

      &.orange { background: rgba(249, 115, 22, 0.15); color: #ea580c; }
      &.green { background: rgba(16, 185, 129, 0.15); color: #059669; }
    }

    .dot-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      &.orange { background-color: #f97316; }
      &.green { background-color: #10b981; }
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 420px;
      min-width: 260px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--tcc-text-muted, #94a3b8);
      font-size: 14px;
    }

    .search-input {
      width: 100%;
      padding: 9px 36px 9px 36px;
      border-radius: 10px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      background-color: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #0f172a);
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        border-color: var(--tcc-primary, #3b82f6);
        background-color: var(--tcc-surface, #ffffff);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      }
    }

    .clear-search-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--tcc-text-muted, #94a3b8);
      cursor: pointer;
      padding: 2px;
      font-size: 12px;
      &:hover { color: var(--tcc-text-main, #0f172a); }
    }

    /* Main Table Container */
    .table-container {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .tcc-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 14px 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--tcc-text-muted, #64748b);
        border-bottom: 1px solid var(--tcc-border, #e2e8f0);
        background-color: var(--tcc-bg, #f8fafc);
      }

      td {
        padding: 16px 20px;
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
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
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

    .badge-code {
      font-family: monospace;
      font-size: 12px;
      background: var(--tcc-bg, #f1f5f9);
      padding: 4px 8px;
      border-radius: 6px;
      color: var(--tcc-text-main, #0f172a);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;

      &.status-approved {
        background-color: rgba(16, 185, 129, 0.1);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      &.status-pending {
        background-color: rgba(249, 115, 22, 0.1);
        color: #ea580c;
        border: 1px solid rgba(249, 115, 22, 0.2);
      }
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-muted { font-size: 13px; color: var(--tcc-text-muted, #64748b); }

    .action-buttons-group {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-detail {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background-color: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-main, #0f172a);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--tcc-bg, #f8fafc);
        border-color: var(--tcc-border-focus, #cbd5e1);
      }
    }

    .btn-approve {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background-color: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);

      &:hover:not(:disabled) {
        background-color: #059669;
      }
    }

    .btn-reject-subtle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background-color: #ef4444;
        color: white;
      }
    }

    .loading-state-box {
      padding: 64px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--tcc-text-muted, #64748b);

      i { font-size: 28px; color: var(--tcc-primary, #2563eb); }
    }

    .empty-state-box {
      padding: 64px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .empty-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
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

    .paginator-wrapper {
      padding: 12px 20px;
      border-top: 1px solid var(--tcc-border, #f1f5f9);
      display: flex;
      justify-content: center;
    }

    /* Modal Backdrop & Card */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      animation: fadeInModal 0.2s ease-out;
    }

    @keyframes fadeInModal {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 20px;
      width: 100%;
      max-width: 560px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popIn {
      from { transform: scale(0.95) translateY(10px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    .modal-header {
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--tcc-border, #f1f5f9);
    }

    .modal-header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
    }

    .modal-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
    }

    .modal-subtitle {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .modal-close-btn {
      background: none;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      color: var(--tcc-text-muted, #94a3b8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.15s ease;

      &:hover {
        background-color: var(--tcc-bg, #f1f5f9);
        color: var(--tcc-text-main, #0f172a);
      }
    }

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--tcc-text-muted, #64748b);
    }

    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);

      &.font-mono { font-family: monospace; }
    }

    .detail-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background-color: var(--tcc-bg, #f8fafc);
      padding: 14px;
      border-radius: 12px;
      border: 1px solid var(--tcc-border, #e2e8f0);
    }

    .detail-description {
      font-size: 13px;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
      line-height: 1.5;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--tcc-border, #f1f5f9);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background-color: var(--tcc-bg, #f8fafc);
    }

    .btn-cancel {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      cursor: pointer;

      &:hover {
        background-color: var(--tcc-surface, #ffffff);
        color: var(--tcc-text-main, #0f172a);
      }
    }

    .tcc-btn-outline.small {
      background-color: transparent;
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-main, #475569);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
      &:hover {
        background-color: var(--tcc-bg, #f8fafc);
      }
    }
  `]
})
export class TecnicosAdmin implements OnInit {
  menuItems: MenuItem[] = [];
  todosTecnicos: TecnicoAdmin[] = [];
  tecnicosFiltrados: TecnicoAdmin[] = [];
  
  filtroStatus: 'todos' | 'pendente' | 'aprovado' = 'todos';
  termoBusca = '';
  loading = true;
  actionLoading: { [key: number]: boolean } = {};

  tecnicoSelecionado: TecnicoAdmin | null = null;

  first = 0;
  rows = 10;

  get countTotal(): number {
    return this.todosTecnicos.length;
  }

  get countPendentes(): number {
    return this.todosTecnicos.filter(t => !t.aprovado_pelo_admin).length;
  }

  get countAprovados(): number {
    return this.todosTecnicos.filter(t => t.aprovado_pelo_admin).length;
  }

  get paginatedTecnicos(): TecnicoAdmin[] {
    if (!this.tecnicosFiltrados) return [];
    if (this.first >= this.tecnicosFiltrados.length && this.tecnicosFiltrados.length > 0) {
      this.first = 0;
    }
    return this.tecnicosFiltrados.slice(this.first, this.first + this.rows);
  }

  constructor(
    private adminService: AdminService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarTecnicos();
  }

  carregarTecnicos() {
    this.loading = true;
    this.adminService.getTecnicos('todos').subscribe({
      next: (tecnicos) => {
        this.todosTecnicos = tecnicos;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar técnicos:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a lista de profissionais.'
        });
      }
    });
  }

  mudarFiltro(novoFiltro: 'todos' | 'pendente' | 'aprovado') {
    this.filtroStatus = novoFiltro;
    this.first = 0;
    this.aplicarFiltros();
  }

  onSearchChange() {
    this.first = 0;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let lista = [...this.todosTecnicos];

    if (this.filtroStatus === 'pendente') {
      lista = lista.filter(t => !t.aprovado_pelo_admin);
    } else if (this.filtroStatus === 'aprovado') {
      lista = lista.filter(t => t.aprovado_pelo_admin);
    }

    if (this.termoBusca && this.termoBusca.trim()) {
      const q = this.termoBusca.toLowerCase().trim();
      lista = lista.filter(t => 
        (t.nome_fantasia && t.nome_fantasia.toLowerCase().includes(q)) ||
        (t.cnpj && t.cnpj.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.telefone && t.telefone.toLowerCase().includes(q))
      );
    }

    this.tecnicosFiltrados = lista;
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  abrirMenu(event: Event, menu: any, tecnico: TecnicoAdmin) {
    event.stopPropagation();
    const items: MenuItem[] = [
      {
        label: 'Ver Detalhes',
        icon: 'pi pi-eye',
        command: () => this.abrirDetalhes(tecnico)
      }
    ];

    if (!tecnico.aprovado_pelo_admin) {
      items.push({
        label: 'Aprovar Cadastro',
        icon: 'pi pi-check',
        command: () => this.aprovar(tecnico)
      });
    } else {
      items.push({
        label: 'Solicitar Revisão / Suspender',
        icon: 'pi pi-ban',
        styleClass: 'text-amber-500',
        command: () => this.rejeitar(tecnico)
      });
    }

    this.menuItems = items;
    menu.toggle(event);
  }

  abrirDetalhes(tecnico: TecnicoAdmin) {
    this.tecnicoSelecionado = tecnico;
  }

  fecharDetalhes() {
    this.tecnicoSelecionado = null;
  }

  aprovar(tecnico: TecnicoAdmin) {
    this.actionLoading[tecnico.id] = true;
    this.adminService.aprovarTecnico(tecnico.id).subscribe({
      next: () => {
        this.actionLoading[tecnico.id] = false;
        tecnico.aprovado_pelo_admin = true;
        this.aplicarFiltros();
        this.messageService.add({
          severity: 'success',
          summary: 'Aprovado',
          detail: `O cadastro de ${tecnico.nome_fantasia} foi aprovado!`
        });
      },
      error: (err) => {
        this.actionLoading[tecnico.id] = false;
        console.error('Erro ao aprovar:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao aprovar profissional.'
        });
      }
    });
  }

  rejeitar(tecnico: TecnicoAdmin) {
    this.actionLoading[tecnico.id] = true;
    this.adminService.rejeitarTecnico(tecnico.id).subscribe({
      next: () => {
        this.actionLoading[tecnico.id] = false;
        tecnico.aprovado_pelo_admin = false;
        this.aplicarFiltros();
        this.messageService.add({
          severity: 'info',
          summary: 'Revisão Solicitada',
          detail: `O status de ${tecnico.nome_fantasia} foi revertido para pendente.`
        });
      },
      error: (err) => {
        this.actionLoading[tecnico.id] = false;
        console.error('Erro ao desativar aprovação:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao alterar status do profissional.'
        });
      }
    });
  }
}
