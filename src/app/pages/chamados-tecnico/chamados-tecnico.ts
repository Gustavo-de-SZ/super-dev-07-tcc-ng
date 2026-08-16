import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-chamados-tecnico',
  standalone: true,
  imports: [CommonModule, MenuModule, PaginatorModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="ch-page tcc-fade-in">

     
      <header class="ch-page-header">
        <div class="ch-header-title-group">
          <h1 class="ch-title">Gestão de Chamados</h1>
          <p class="ch-subtitle">Visualize seus chamados ativos, histórico e solicitações disponíveis.</p>
        </div>
        <div class="ch-header-stats">
          <div class="ch-stat-pill active">
            <i class="pi pi-bolt"></i>
            <span class="ch-stat-count">{{ chamadosAtivosCount }}</span>
            <span class="ch-stat-label">Ativos</span>
          </div>
          <div class="ch-stat-pill completed">
            <i class="pi pi-check-circle"></i>
            <span class="ch-stat-count">{{ chamadosConcluidosCount }}</span>
            <span class="ch-stat-label">Concluídos</span>
          </div>
          <div class="ch-stat-pill pending">
            <i class="pi pi-inbox"></i>
            <span class="ch-stat-count">{{ chamadosAbertos.length }}</span>
            <span class="ch-stat-label">Disponíveis</span>
          </div>
        </div>
      </header>

   
      <nav class="ch-tabs">
        <button
          class="ch-tab"
          [class.active]="activeTab === 'ativos'"
          (click)="activeTab = 'ativos'"
        >
          <i class="pi pi-bolt"></i>
          Meus chamados
         
          @if (meusChamados.length > 0) {
            <span class="ch-tab-badge">{{ meusChamados.length }}</span>
          }
        </button>
        <button
          class="ch-tab"
          [class.active]="activeTab === 'disponiveis'"
          (click)="activeTab = 'disponiveis'"
        >
          <i class="pi pi-inbox"></i>
          Disponíveis
          @if (chamadosAbertos.length > 0) {
            <span class="ch-tab-badge available">{{ chamadosAbertos.length }}</span>
          }
        </button>
      </nav>

      @if (activeTab === 'ativos') {
        <div class="ch-content">
          @if (meusChamados.length > 0) {
            <div class="ch-filter-bar">
              <div class="ch-filter-chips">
                <button
                  class="ch-filter-chip"
                  [class.active]="statusFilter === 'TODOS'"
                  (click)="setStatusFilter('TODOS')"
                >
                  Todos ({{ meusChamados.length }})
                </button>
                <button
                  class="ch-filter-chip"
                  [class.active]="statusFilter === 'EM_ANDAMENTO'"
                  (click)="setStatusFilter('EM_ANDAMENTO')"
                >
                  <i class="pi pi-bolt" style="font-size: 11px;"></i> Em Andamento ({{ chamadosAtivosCount }})
                </button>
                <button
                  class="ch-filter-chip"
                  [class.active]="statusFilter === 'CONCLUIDO'"
                  (click)="setStatusFilter('CONCLUIDO')"
                >
                  <i class="pi pi-check-circle" style="font-size: 11px;"></i> Concluídos ({{ chamadosConcluidosCount }})
                </button>
              </div>

              <button class="ch-refresh-btn" (click)="carregarMeusChamados()" [disabled]="carregando">
                <i class="pi pi-refresh" [class.pi-spin]="carregando"></i>
                Atualizar
              </button>
            </div>
          }

          @if (filteredMeusChamados.length > 0) {
            <div class="ch-list">
              @for (chamado of paginatedMeusChamados; track trackByChamado($index, chamado)) {
                <div
                  class="ch-card ch-card-interactive"
                  [class.ch-card-concluido]="chamado.status === 'CONCLUIDO'"
                  (click)="abrirDetalhes(chamado)"
                >
                  <div class="ch-card-accent" [ngClass]="getAccentClass(chamado.status)"></div>
                  <div class="ch-card-body">
                    <div class="ch-card-top">
                      <div class="ch-card-info">
                        <div class="ch-card-icon-wrap" [ngClass]="getIconBgClass(chamado.status)">
                          <i class="pi" [ngClass]="getStatusIcon(chamado.status)"></i>
                        </div>
                        <div class="ch-card-text">
                          <h3 class="ch-card-title">{{ chamado.titulo }}</h3>
                          <div class="ch-card-meta">
                            <span class="ch-meta-item">
                              <i class="pi pi-user"></i>
                              {{ chamado.cliente_nome && chamado.cliente_nome !== 'Cliente' ? chamado.cliente_nome : 'Cliente não informado' }}
                            </span>
                            <span class="ch-meta-item">
                              <i class="pi pi-calendar"></i>
                              {{ chamado.dataCriacao || formatData(chamado.data_criacao) }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="ch-card-right" (click)="$event.stopPropagation()">
                        <span class="ch-status-badge" [ngClass]="getStatusClass(chamado.status)">
                          <i class="pi" [ngClass]="getStatusIcon(chamado.status)" style="font-size: 11px;"></i>
                          {{ formatStatus(chamado.status) }}
                        </span>
                        <button
                          type="button"
                          class="ch-action-btn"
                          (click)="abrirMenuAtivo($event, menu, chamado)"
                        >
                          Ações <i class="pi pi-chevron-down"></i>
                        </button>
                      </div>
                    </div>

                    @if (chamado.descricao_problema) {
                      <p class="ch-card-desc">
                        {{ chamado.descricao_problema }}
                      </p>
                    }
                  </div>
                </div>
              }
            </div>
          }

          @if (filteredMeusChamados.length > rowsAtivos) {
            <div class="tcc-paginator-container">
              <p-paginator
                (onPageChange)="onPageChangeAtivos($event)"
                [first]="firstAtivos"
                [rows]="rowsAtivos"
                [totalRecords]="filteredMeusChamados.length"
                [rowsPerPageOptions]="[6, 12, 24, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} chamados"
              ></p-paginator>
            </div>
          }

          @if (filteredMeusChamados.length === 0) {
            <div class="ch-empty">
              <div class="ch-empty-icon">
                <i class="pi pi-inbox"></i>
              </div>
              <h3>{{ meusChamados.length === 0 ? 'Nenhum chamado atribuído' : 'Nenhum chamado com esse filtro' }}</h3>
              <p>{{ meusChamados.length === 0 ? 'Aceite um chamado disponível para começar a trabalhar.' : 'Alterne os filtros acima para visualizar seus chamados.' }}</p>
              @if (meusChamados.length === 0) {
                <button class="ch-btn-primary" (click)="activeTab = 'disponiveis'">
                  <i class="pi pi-search"></i> Ver Chamados Disponíveis
                </button>
              }
            </div>
          }
        </div>
      }

      @if (activeTab === 'disponiveis') {
        <div class="ch-content">
          <div class="ch-section-header">
            <p class="ch-section-desc">Chamados aguardando atendimento de um técnico</p>
            <button class="ch-refresh-btn" (click)="carregarChamados()" [disabled]="carregando">
              <i class="pi pi-refresh" [class.pi-spin]="carregando"></i>
              Atualizar
            </button>
          </div>

          @if (carregando) {
            <div class="ch-loading">
              <div class="ch-loading-spinner">
                <i class="pi pi-spin pi-spinner"></i>
              </div>
              <p>Carregando chamados...</p>
            </div>
          }

          @if (!carregando && chamadosAbertos.length > 0) {
            <div class="ch-list">
              @for (chamado of paginatedChamadosAbertos; track trackByChamado($index, chamado)) {
                <div class="ch-card ch-card-available ch-card-interactive" (click)="abrirDetalhes(chamado)">
                  <div class="ch-card-accent accent-pending"></div>
                  <div class="ch-card-body">
                    <div class="ch-card-top">
                      <div class="ch-card-info">
                        <div class="ch-card-icon-wrap icon-bg-pending">
                          <i class="pi pi-file-edit"></i>
                        </div>
                        <div class="ch-card-text">
                          <h3 class="ch-card-title">{{ chamado.titulo }}</h3>
                          <div class="ch-card-meta">
                            <span class="ch-meta-item">
                              <i class="pi pi-user"></i>
                              {{ chamado.cliente_nome && chamado.cliente_nome !== 'Cliente' ? chamado.cliente_nome : 'Cliente não informado' }}
                            </span>
                            <span class="ch-meta-item">
                              <i class="pi pi-calendar"></i>
                              {{ chamado.dataCriacao || formatData(chamado.data_criacao) }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span class="ch-status-badge status-pending">
                        <i class="pi pi-clock" style="font-size: 11px;"></i>
                        Pendente
                      </span>
                    </div>

                    @if (chamado.descricao_problema) {
                      <p class="ch-card-desc">
                        {{ chamado.descricao_problema }}
                      </p>
                    }

                    <div class="ch-card-footer" (click)="$event.stopPropagation()">
                      <button class="ch-btn-accept" (click)="aceitarChamado(chamado.id)">
                        <i class="pi pi-check-circle"></i> Aceitar Chamado
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          @if (!carregando && chamadosAbertos.length > rowsDisponiveis) {
            <div class="tcc-paginator-container">
              <p-paginator
                (onPageChange)="onPageChangeDisponiveis($event)"
                [first]="firstDisponiveis"
                [rows]="rowsDisponiveis"
                [totalRecords]="chamadosAbertos.length"
                [rowsPerPageOptions]="[6, 12, 24, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} chamados"
              ></p-paginator>
            </div>
          }

          @if (!carregando && chamadosAbertos.length === 0) {
            <div class="ch-empty">
              <div class="ch-empty-icon success">
                <i class="pi pi-check-circle"></i>
              </div>
              <h3>Todos os chamados atendidos!</h3>
              <p>Não há chamados pendentes no momento. Volte mais tarde.</p>
            </div>
          }
        </div>
      }

        
      <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

      @if (chamadoDetalhes) {
        <div class="tcc-modal-backdrop" (click)="fecharDetalhes()">
          <div class="tcc-modal-content tcc-fade-in" (click)="$event.stopPropagation()">
            <div class="tcc-modal-header">
              <div class="tcc-modal-title-box">
                <div class="tcc-modal-icon-box" [ngClass]="getIconBgClass(chamadoDetalhes.status)">
                  <i class="pi" [ngClass]="getStatusIcon(chamadoDetalhes.status)"></i>
                </div>
                <div>
                  <h2 class="tcc-modal-title">{{ chamadoDetalhes.titulo }}</h2>
                  <span class="tcc-modal-subtitle">Chamado #{{ chamadoDetalhes.id }}</span>
                </div>
              </div>
              <button class="tcc-modal-close" (click)="fecharDetalhes()" title="Fechar">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="tcc-modal-body">
              <div class="tcc-modal-highlight">
                <div class="highlight-item">
                  <label>Status</label>
                  <span class="ch-status-badge" [ngClass]="getStatusClass(chamadoDetalhes.status)">
                    <i class="pi" [ngClass]="getStatusIcon(chamadoDetalhes.status)" style="font-size: 11px;"></i>
                    {{ formatStatus(chamadoDetalhes.status) }}
                  </span>
                </div>
                <div class="highlight-item right">
                  <label>Data de Abertura</label>
                  <span class="highlight-type">
                    <i class="pi pi-calendar"></i>
                    {{ chamadoDetalhes.dataCriacao || formatData(chamadoDetalhes.data_criacao) }}
                  </span>
                </div>
              </div>

             
              <div class="tcc-modal-info-list">
                <div class="tcc-modal-info-item">
                  <div class="info-icon"><i class="pi pi-user"></i></div>
                  <div class="info-content">
                    <label>Cliente</label>
                    <span>{{ chamadoDetalhes.cliente_nome && chamadoDetalhes.cliente_nome !== 'Cliente' ? chamadoDetalhes.cliente_nome : 'Cliente não informado' }}</span>
                  </div>
                </div>

                @if (chamadoDetalhes.cliente_telefone) {
                  <div class="tcc-modal-info-item">
                    <div class="info-icon"><i class="pi pi-phone"></i></div>
                    <div class="info-content">
                      <label>Telefone</label>
                      <span>{{ chamadoDetalhes.cliente_telefone }}</span>
                    </div>
                  </div>
                }

                @if (chamadoDetalhes.cliente_email) {
                  <div class="tcc-modal-info-item">
                    <div class="info-icon"><i class="pi pi-envelope"></i></div>
                    <div class="info-content">
                      <label>E-mail</label>
                      <span>{{ chamadoDetalhes.cliente_email }}</span>
                    </div>
                  </div>
                }

                @if (chamadoDetalhes.cliente_endereco) {
                  <div class="tcc-modal-info-item">
                    <div class="info-icon"><i class="pi pi-map-marker"></i></div>
                    <div class="info-content">
                      <label>Local / Endereço</label>
                      <span>{{ chamadoDetalhes.cliente_endereco }}</span>
                    </div>
                  </div>
                }

                <div class="tcc-modal-info-item full-width">
                  <div class="info-icon"><i class="pi pi-align-left"></i></div>
                  <div class="info-content">
                    <label>Descrição do Problema</label>
                    <p class="modal-problem-desc">{{ chamadoDetalhes.descricao_problema || 'Nenhuma descrição detalhada informada.' }}</p>
                  </div>
                </div>

                <div class="tcc-modal-info-item full-width">
                  <div class="info-icon"><i class="pi pi-paperclip"></i></div>
                  <div class="info-content">
                    <label>Anexos</label>
                    @if (chamadoDetalhes.anexo) {
                      <div class="attachments-list">
                        @for (url of getAnexos(chamadoDetalhes.anexo); track $index) {
                          <a [href]="url" target="_blank" class="attachment-link">
                            <i class="pi pi-file"></i> Anexo {{ $index + 1 }}
                          </a>
                        }
                      </div>
                    } @else {
                      <p class="modal-problem-desc" style="color: var(--text-muted); font-style: italic;">Nenhum anexo fornecido.</p>
                    }
                  </div>
                </div>
              </div>
            </div>

            <div class="tcc-modal-footer">
              <button type="button" class="tcc-btn-outline" (click)="fecharDetalhes()">Fechar</button>

              @if (!chamadoDetalhes.profissional_id && activeTab === 'disponiveis') {
                <button type="button" class="tcc-btn-primary" (click)="aceitarChamado(chamadoDetalhes.id)">
                  <i class="pi pi-check-circle"></i> Aceitar Chamado
                </button>
              }

          
              @if (chamadoDetalhes.profissional_id || activeTab === 'ativos') {
                @if (chamadoDetalhes.status !== 'CONCLUIDO') {
                  <button type="button" class="tcc-btn-danger-outline" (click)="confirmarAbandonar(chamadoDetalhes.id)">
                    <i class="pi pi-arrow-circle-left"></i> Abandonar
                  </button>
                }

                <button type="button" class="tcc-btn-service" (click)="gerarServico(chamadoDetalhes)">
                  <i class="pi pi-file-plus"></i> Gerar O.S.
                </button>

                <button type="button" class="tcc-btn-chat" (click)="abrirChat(chamadoDetalhes.id)">
                  <i class="pi pi-comments"></i> Abrir Chat
                </button>

                @if (chamadoDetalhes.status !== 'CONCLUIDO') {
                  <button type="button" class="tcc-btn-primary" (click)="concluirChamado(chamadoDetalhes.id)">
                    <i class="pi pi-check-circle"></i> Concluir
                  </button>
                }
              }
            </div>
          </div>
        </div>
      }

    
      @if (modalAbandonarConfirmacao) {
        <div class="tcc-modal-backdrop" (click)="modalAbandonarConfirmacao = false">
          <div class="tcc-modal-content tcc-confirm-modal tcc-fade-in" (click)="$event.stopPropagation()">
            <div class="tcc-modal-header">
              <div class="tcc-modal-title-box">
                <div class="tcc-modal-icon-box danger-icon">
                  <i class="pi pi-exclamation-triangle"></i>
                </div>
                <div>
                  <h2 class="tcc-modal-title">Abandonar Chamado?</h2>
                  <span class="tcc-modal-subtitle">Confirmação de liberação</span>
                </div>
              </div>
              <button class="tcc-modal-close" (click)="modalAbandonarConfirmacao = false">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="tcc-modal-body">
              <p style="margin: 0; color: var(--tcc-text-secondary, #475569); font-size: 14px; line-height: 1.6;">
                Ao abandonar este chamado, ele será liberado imediatamente de volta para a fila aberta e outro técnico poderá assumi-lo. Deseja continuar?
              </p>
            </div>

            <div class="tcc-modal-footer">
              <button type="button" class="tcc-btn-outline" (click)="modalAbandonarConfirmacao = false">Cancelar</button>
              <button type="button" class="tcc-btn-danger" (click)="executarAbandonar()">
                <i class="pi pi-arrow-circle-left"></i> Sim, Abandonar
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    /* ===== Page Layout ===== */
    .ch-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      animation: chFadeIn 0.4s ease-out;
    }

    @keyframes chFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ===== Header ===== */
    .ch-page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .ch-header-title-group { display: flex; flex-direction: column; gap: 4px; }

    .ch-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
    }

    .ch-subtitle {
      font-size: 14px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .ch-header-stats {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .ch-stat-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 9999px;
      font-size: 13px;
      color: var(--tcc-text-secondary, #334155);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;
    }

    .ch-stat-pill i {
      color: var(--tcc-primary, #3b82f6);
      font-size: 14px;
    }

    .ch-stat-pill.active {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.3);
    }
    .ch-stat-pill.active i { color: #3b82f6; }

    .ch-stat-pill.completed {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
    }
    .ch-stat-pill.completed i { color: #10b981; }

    .ch-stat-pill.pending {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.3);
    }
    .ch-stat-pill.pending i { color: #f59e0b; }

    .ch-stat-count {
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
    }

    .ch-stat-label {
      color: var(--tcc-text-muted, #64748b);
    }

    /* ===== Filter Bar & Chips ===== */
    .ch-filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 8px;
    }

    .ch-filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ch-filter-chip {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid var(--tcc-border, #e2e8f0);
      background: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-secondary, #475569);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .ch-filter-chip:hover {
      border-color: var(--tcc-text-muted);
      background: var(--tcc-surface-hover, #f8fafc);
    }

    .ch-filter-chip.active {
      background: var(--tcc-primary, #3b82f6);
      border-color: var(--tcc-primary, #3b82f6);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
    }

    /* ===== Tabs ===== */
    .ch-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      padding-bottom: 0;
    }

    .ch-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: -1px;
    }

    .ch-tab:hover {
      color: var(--tcc-text-main, #0f172a);
    }

    .ch-tab.active {
      color: var(--tcc-primary, #3b82f6);
      border-bottom-color: var(--tcc-primary, #3b82f6);
    }

    .ch-tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      background-color: var(--tcc-primary-light, #dbeafe);
      color: var(--tcc-primary, #2563eb);
    }

    .ch-tab-badge.available {
      background-color: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    /* ===== Content ===== */
    .ch-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ch-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .ch-section-desc {
      font-size: 14px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .ch-refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      color: var(--tcc-text-muted, #64748b);
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ch-refresh-btn:hover {
      background-color: var(--tcc-surface-hover, #f8fafc);
      color: var(--tcc-text-main, #0f172a);
    }

    /* ===== Loading ===== */
    .ch-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      gap: 12px;
      color: var(--tcc-text-muted, #64748b);
      font-size: 14px;
    }

    .ch-loading-spinner i {
      font-size: 24px;
      color: var(--tcc-primary, #3b82f6);
    }

    /* ===== Chamados List ===== */
    .ch-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* ===== Card ===== */
    .ch-card {
      display: flex;
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
    }

    .ch-card-interactive {
      cursor: pointer;
    }

    .ch-card-interactive:hover {
      border-color: var(--tcc-primary, #3b82f6);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .ch-card-concluido {
      opacity: 0.85;
    }

    .ch-card-accent {
      width: 4px;
      flex-shrink: 0;
    }

    .accent-active { background-color: var(--tcc-primary, #3b82f6); }
    .accent-concluido { background-color: #10b981; }
    .accent-cancelado { background-color: #ef4444; }
    .accent-pending { background-color: #f59e0b; }

    .ch-card-body {
      flex: 1;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ch-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .ch-card-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .ch-card-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .icon-bg-active { background-color: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .icon-bg-concluido { background-color: rgba(16, 185, 129, 0.15); color: #10b981; }
    .icon-bg-cancelado { background-color: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .icon-bg-pending { background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; }

    .ch-card-text { display: flex; flex-direction: column; gap: 4px; }

    .ch-card-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
    }

    .ch-card-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .ch-meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
    }

    .ch-meta-item i {
      font-size: 12px;
    }

    .ch-card-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    /* ===== Status Badges ===== */
    .ch-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-active { background-color: rgba(59, 130, 246, 0.12); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
    .status-concluido { background-color: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-cancelado { background-color: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .status-pending { background-color: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }

    /* ===== Action Buttons ===== */
    .ch-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      color: var(--tcc-text-secondary, #475569);
      background-color: var(--tcc-surface, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ch-action-btn:hover {
      background-color: var(--tcc-surface-hover, #e2e8f0);
      color: var(--tcc-text-main, #0f172a);
    }

    .ch-card-desc {
      font-size: 13px;
      color: var(--tcc-text-secondary, #475569);
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .ch-card-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--tcc-border, #e2e8f0);
      margin-top: 4px;
    }



    .ch-btn-accept {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      background-color: var(--tcc-primary, #3b82f6);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ch-btn-accept:hover {
      background-color: var(--tcc-primary-hover, #2563eb);
      transform: translateY(-1px);
    }

    /* ===== Empty State ===== */
    .ch-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      background-color: var(--tcc-surface, #ffffff);
      border: 1px dashed var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      text-align: center;
      gap: 12px;
    }

    .ch-empty-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background-color: var(--tcc-surface-hover, #f1f5f9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: var(--tcc-text-muted, #94a3b8);
    }

    .ch-empty-icon.success {
      background-color: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .ch-empty h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
    }

    .ch-empty p {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
      max-width: 360px;
    }

    .ch-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      background-color: var(--tcc-primary, #3b82f6);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 8px;
      transition: all 0.2s;
    }

    .ch-btn-primary:hover {
      background-color: var(--tcc-primary-hover, #2563eb);
    }

    /* ===== Modals (Standard Glassmorphism / Polish) ===== */
    .tcc-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .tcc-modal-content {
      background: var(--tcc-surface, #ffffff);
      border-radius: 16px;
      width: 100%;
      max-width: 580px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow: hidden;
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-confirm-modal {
      max-width: 440px;
    }

    .tcc-modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .tcc-modal-title-box {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .tcc-modal-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .tcc-modal-icon-box.danger-icon {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .tcc-modal-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
    }

    .tcc-modal-subtitle {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-modal-close {
      background: transparent;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tcc-text-muted, #94a3b8);
      cursor: pointer;
      transition: all 0.2s;
    }

    .tcc-modal-close:hover {
      background-color: var(--tcc-surface-hover, #f1f5f9);
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .tcc-modal-highlight {
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .highlight-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .highlight-item label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--tcc-text-muted, #64748b);
      letter-spacing: 0.5px;
    }

    .highlight-type {
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tcc-modal-info-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .tcc-modal-info-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .tcc-modal-info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--tcc-bg, #f1f5f9);
      color: var(--tcc-text-secondary, #475569);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .info-content label {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      font-weight: 500;
    }

    .info-content span {
      font-size: 14px;
      color: var(--tcc-text-main, #0f172a);
      font-weight: 600;
    }

    .modal-problem-desc {
      margin: 4px 0 0 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--tcc-text-secondary, #334155);
      background: var(--tcc-bg, #f8fafc);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      white-space: pre-wrap;
    }

    .tcc-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--tcc-border, #e2e8f0);
      background: var(--tcc-surface, #fafafa);
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .attachments-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }
    .attachment-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--tcc-surface-hover, #f1f5f9);
      border: 1px solid var(--tcc-border, #cbd5e1);
      border-radius: 6px;
      color: var(--tcc-primary, #3b82f6);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .attachment-link:hover {
      background: var(--tcc-primary-light, #eff6ff);
      border-color: var(--tcc-primary, #3b82f6);
    }

    .tcc-btn-outline {
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-secondary, #475569);
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #cbd5e1);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tcc-btn-outline:hover {
      background: var(--tcc-surface-hover, #f1f5f9);
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-btn-primary {
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      background: var(--tcc-primary, #3b82f6);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tcc-btn-primary:hover {
      background: var(--tcc-primary-hover, #2563eb);
    }

    .tcc-btn-danger-outline {
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #ef4444;
      background: var(--tcc-surface, #ffffff);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tcc-btn-danger-outline:hover {
      background: rgba(239, 68, 68, 0.12);
      border-color: #ef4444;
    }

    .tcc-btn-danger {
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      background: #dc2626;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tcc-btn-danger:hover {
      background: #b91c1c;
    }

    .tcc-btn-service {
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #14b8a6;
      background: rgba(20, 184, 166, 0.15);
      border: 1px solid rgba(20, 184, 166, 0.3);
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tcc-btn-service:hover {
      background: rgba(20, 184, 166, 0.25);
    }

    .tcc-btn-chat {
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #6366f1;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tcc-btn-chat:hover {
      background: rgba(99, 102, 241, 0.25);
    }

    .tcc-paginator-container {
      margin-top: 8px;
      display: flex;
      justify-content: center;
    }

    @media (max-width: 640px) {
      .ch-page-header {
        flex-direction: column;
      }
      .ch-header-stats {
        width: 100%;
      }
      .ch-stat-pill {
        flex: 1;
        justify-content: center;
      }
      .tcc-modal-info-list {
        grid-template-columns: 1fr;
      }
      .tcc-modal-footer {
        flex-direction: column;
      }
      .tcc-modal-footer button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ChamadosTecnico {
  activeTab: 'ativos' | 'disponiveis' = 'ativos';
  statusFilter: 'TODOS' | 'EM_ANDAMENTO' | 'CONCLUIDO' = 'TODOS';
  chamadosAbertos: any[] = [];
  meusChamados: any[] = [];
  carregando: boolean = false;

  chamadoDetalhes: any = null;
  modalAbandonarConfirmacao: boolean = false;
  chamadoParaAbandonarId: string | null = null;

  firstAtivos: number = 0;
  rowsAtivos: number = 6;

  firstDisponiveis: number = 0;
  rowsDisponiveis: number = 6;

  menuItems: MenuItem[] = [];
  private chamadoAtual: any = null;

  constructor(
    private solicitacaoService: SolicitacaoService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.carregarTodos();
  }

  get chamadosAtivosCount(): number {
    if (!this.meusChamados) return 0;
    return this.meusChamados.filter(c => c.status === 'EM_ANDAMENTO' || c.status === 'ABERTO' || c.status === 'PENDENTE').length;
  }

  get chamadosConcluidosCount(): number {
    if (!this.meusChamados) return 0;
    return this.meusChamados.filter(c => c.status === 'CONCLUIDO').length;
  }

  get filteredMeusChamados(): any[] {
    if (!this.meusChamados) return [];
    if (this.statusFilter === 'TODOS') {
      return this.meusChamados;
    }
    if (this.statusFilter === 'EM_ANDAMENTO') {
      return this.meusChamados.filter(c => c.status === 'EM_ANDAMENTO' || c.status === 'ABERTO' || c.status === 'PENDENTE');
    }
    if (this.statusFilter === 'CONCLUIDO') {
      return this.meusChamados.filter(c => c.status === 'CONCLUIDO');
    }
    return this.meusChamados;
  }

  get paginatedMeusChamados(): any[] {
    const list = this.filteredMeusChamados;
    if (!list) return [];
    if (this.firstAtivos >= list.length && list.length > 0) {
      this.firstAtivos = 0;
    }
    return list.slice(this.firstAtivos, this.firstAtivos + this.rowsAtivos);
  }

  get paginatedChamadosAbertos(): any[] {
    if (!this.chamadosAbertos) return [];
    if (this.firstDisponiveis >= this.chamadosAbertos.length && this.chamadosAbertos.length > 0) {
      this.firstDisponiveis = 0;
    }
    return this.chamadosAbertos.slice(this.firstDisponiveis, this.firstDisponiveis + this.rowsDisponiveis);
  }

  setStatusFilter(filter: 'TODOS' | 'EM_ANDAMENTO' | 'CONCLUIDO') {
    this.statusFilter = filter;
    this.firstAtivos = 0;
  }

  onPageChangeAtivos(event: any): void {
    this.firstAtivos = event.first;
    this.rowsAtivos = event.rows;
  }

  onPageChangeDisponiveis(event: any): void {
    this.firstDisponiveis = event.first;
    this.rowsDisponiveis = event.rows;
  }

  carregarTodos() {
    this.carregarChamados();
    this.carregarMeusChamados();
  }

  carregarChamados() {
    this.carregando = true;
    this.solicitacaoService.getAbertas().subscribe({
      next: (chamados) => {
        this.chamadosAbertos = chamados;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  carregarMeusChamados() {
    this.solicitacaoService.getMinhas().subscribe({
      next: (chamados) => {
        this.meusChamados = chamados;
      }
    });
  }

  abrirDetalhes(chamado: any) {
    this.chamadoDetalhes = { ...chamado };
  }

  fecharDetalhes() {
    this.chamadoDetalhes = null;
  }

  getAnexos(anexoStr: any): string[] {
    if (!anexoStr) return [];
    return typeof anexoStr === 'string' ? anexoStr.split(',') : [];
  }

  abrirChat(id: string | number) {
    this.fecharDetalhes();
    this.router.navigate(['/painel/chat', id]);
  }

  gerarServico(chamado: any) {
    this.fecharDetalhes();
    this.router.navigate(['/painel/servicos/novo'], {
      queryParams: {
        cliente: chamado.cliente_nome && chamado.cliente_nome !== 'Cliente' ? chamado.cliente_nome : '',
        titulo: `Atendimento: ${chamado.titulo}`,
        fromChamado: chamado.id
      }
    });
  }

  aceitarChamado(id: string | number) {
    this.solicitacaoService.aceitar(String(id)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Chamado Aceito',
          detail: 'Chamado atribuído com sucesso!'
        });
        this.fecharDetalhes();
        this.carregarTodos();
        this.router.navigate(['/painel/chat', id]);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível aceitar o chamado.'
        });
      }
    });
  }

  concluirChamado(id: string | number) {
    this.solicitacaoService.concluir(String(id)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Concluído',
          detail: 'Chamado marcado como concluído!'
        });
        if (this.chamadoDetalhes && this.chamadoDetalhes.id === id) {
          this.chamadoDetalhes.status = 'CONCLUIDO';
        }
        this.carregarTodos();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível concluir o chamado.'
        });
      }
    });
  }

  confirmarAbandonar(id: string | number) {
    this.chamadoParaAbandonarId = String(id);
    this.modalAbandonarConfirmacao = true;
  }

  executarAbandonar() {
    if (!this.chamadoParaAbandonarId) return;
    const id = this.chamadoParaAbandonarId;

    this.solicitacaoService.abandonar(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Chamado Liberado',
          detail: 'Chamado retornado para a lista de disponíveis.'
        });
        this.modalAbandonarConfirmacao = false;
        this.chamadoParaAbandonarId = null;
        this.fecharDetalhes();
        this.carregarTodos();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível liberar o chamado.'
        });
      }
    });
  }

  abrirMenuAtivo(event: Event, menu: any, chamado: any) {
    event.stopPropagation();
    this.chamadoAtual = chamado;
    
    this.menuItems = [
      {
        label: 'Abrir Chat',
        icon: 'pi pi-comments',
        command: () => this.abrirChat(chamado.id)
      },
      {
        label: 'Gerar Ordem de Serviço',
        icon: 'pi pi-file-plus',
        command: () => this.gerarServico(chamado)
      }
    ];

    if (chamado.status !== 'CONCLUIDO') {
      this.menuItems.push(
        {
          label: 'Concluir Chamado',
          icon: 'pi pi-check-circle',
          command: () => this.concluirChamado(chamado.id)
        },
        {
          label: 'Abandonar Chamado',
          icon: 'pi pi-arrow-circle-left',
          command: () => this.confirmarAbandonar(chamado.id)
        }
      );
    }

    menu.toggle(event);
  }

  formatData(isoStr: string): string {
    if (!isoStr) return '';
    const data = new Date(isoStr);
    if (isNaN(data.getTime())) return isoStr;
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' às '
      + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    if (status === 'EM_ANDAMENTO') return 'Em Andamento';
    if (status === 'PENDENTE' || status === 'ABERTO') return 'Pendente';
    if (status === 'CONCLUIDO') return 'Concluído';
    if (status === 'CANCELADO') return 'Cancelado';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  getAccentClass(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'accent-active';
      case 'CONCLUIDO': return 'accent-concluido';
      case 'CANCELADO': return 'accent-cancelado';
      default: return 'accent-pending';
    }
  }

  getIconBgClass(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'icon-bg-active';
      case 'CONCLUIDO': return 'icon-bg-concluido';
      case 'CANCELADO': return 'icon-bg-cancelado';
      default: return 'icon-bg-pending';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'status-active';
      case 'CONCLUIDO': return 'status-concluido';
      case 'CANCELADO': return 'status-cancelado';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'pi-bolt';
      case 'CONCLUIDO': return 'pi-check-circle';
      case 'CANCELADO': return 'pi-times-circle';
      default: return 'pi-clock';
    }
  }

  trackByChamado(index: number, chamado: any): any {
    return chamado?.id && String(chamado.id).trim() !== '' ? chamado.id : index;
  }
}

export { ChamadosTecnico as ChamadosTecnicoComponent };
