import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { MessageService, MenuItem } from 'primeng/api';
import { Chamado } from '../../models/chamado';
import { MeusChamadosService } from '../../services/meus-chamados.service';

@Component({
  selector: 'app-meus-chamados',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginatorModule, ToastModule, MenuModule],
  providers: [MessageService],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <p-toast></p-toast>

  
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <h1 class="tcc-title-lg">Meus Chamados</h1>
          <p class="tcc-subtitle">Acompanhe em tempo real o status e o histórico dos seus atendimentos</p>
        </div>
        <button class="tcc-btn-main" [routerLink]="['/cliente/solicitacao']">
          <i class="pi pi-plus"></i>
          <span>Novo Chamado</span>
        </button>
      </header>

  
      <div class="tcc-metrics-grid">
        <div class="tcc-metric-card metric-active" (click)="setStatusFilter('EM_ANDAMENTO')" [class.selected]="statusFilter === 'EM_ANDAMENTO'">
          <div class="tcc-metric-icon">
            <i class="pi pi-bolt"></i>
          </div>
          <div class="tcc-metric-info">
            <span class="tcc-metric-label">Em Andamento</span>
            <strong class="tcc-metric-value">{{ countEmAndamento }}</strong>
          </div>
        </div>

        <div class="tcc-metric-card metric-pending" (click)="setStatusFilter('PENDENTE')" [class.selected]="statusFilter === 'PENDENTE'">
          <div class="tcc-metric-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="tcc-metric-info">
            <span class="tcc-metric-label">Aguardando Técnico</span>
            <strong class="tcc-metric-value">{{ countAguardando }}</strong>
          </div>
        </div>

        <div class="tcc-metric-card metric-completed" (click)="setStatusFilter('CONCLUIDO')" [class.selected]="statusFilter === 'CONCLUIDO'">
          <div class="tcc-metric-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="tcc-metric-info">
            <span class="tcc-metric-label">Concluídos</span>
            <strong class="tcc-metric-value">{{ countConcluidos }}</strong>
          </div>
        </div>

        <div class="tcc-metric-card metric-total" (click)="setStatusFilter('TODOS')" [class.selected]="statusFilter === 'TODOS'">
          <div class="tcc-metric-icon">
            <i class="pi pi-list"></i>
          </div>
          <div class="tcc-metric-info">
            <span class="tcc-metric-label">Total de Chamados</span>
            <strong class="tcc-metric-value">{{ chamados.length }}</strong>
          </div>
        </div>
      </div>

  
   
      <div class="tcc-filter-card">
        <div class="tcc-search-box">
          <i class="pi pi-search"></i>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="aplicarFiltros()"
            placeholder="Buscar por título, descrição, número ou técnico..."
            class="tcc-search-input"
          />
          @if (searchTerm) {
            <button class="tcc-clear-btn" (click)="searchTerm = ''; aplicarFiltros()">
              <i class="pi pi-times"></i>
            </button>
          }
        </div>
      </div>

  
      @if (carregando) {
        <div class="tcc-center-content">
          <i class="pi pi-spinner pi-spin tcc-spinner"></i>
          <p>Carregando seus chamados...</p>
        </div>
      } @else if (filteredChamados.length === 0) {
        <div class="tcc-empty-state">
          <div class="tcc-empty-icon">
            <i class="pi pi-inbox"></i>
          </div>
          <h3>Nenhum chamado encontrado</h3>
          <p>
            @if (searchTerm || statusFilter !== 'TODOS') {
              Nenhum chamado corresponde aos filtros aplicados.
            } @else {
              Você ainda não abriu nenhum chamado de suporte.
            }
          </p>
          @if (searchTerm || statusFilter !== 'TODOS') {
            <button class="tcc-btn-outline mt-3" (click)="resetFiltros()">
              Limpar Filtros
            </button>
          } @else {
            <button class="tcc-btn-main mt-3" [routerLink]="['/cliente/solicitacao']">
              <i class="pi pi-plus"></i> Abrir Primeiro Chamado
            </button>
          }
        </div>
      } @else {
        <div class="tcc-chamados-grid">
          @for (chamado of paginatedChamados; track (chamado?.id || $index)) {
            <div class="tcc-chamado-card" [class.border-active]="chamado.status === 'EM_ANDAMENTO'" (click)="abrirDetalhes(chamado)">
              
      
              <div class="tcc-card-top">
                <div class="tcc-id-tag">
                  <span class="tcc-tag-hash">#{{ chamado.id }}</span>
                  <span class="tcc-tag-date">
                    <i class="pi pi-calendar"></i> {{ chamado.dataCriacao || chamado.data_criacao }}
                  </span>
                </div>

                <div class="tcc-status-pill" [ngClass]="getStatusBadgeClass(chamado.status)">
                  <i class="pi" [ngClass]="getStatusIcon(chamado.status)"></i>
                  <span>{{ formatStatus(chamado.status) }}</span>
                </div>
              </div>

         
              <div class="tcc-card-body">
                <h3 class="tcc-chamado-title">
                  {{ chamado.titulo || chamado.equipamento || 'Sem título' }}
                </h3>
                
                <p class="tcc-chamado-desc">
                  {{ chamado.descricao_problema || 'Nenhuma descrição adicional informada.' }}
                </p>

           
                <div class="tcc-tech-info">
                  @if (chamado.profissional_nome && chamado.profissional_nome !== 'Técnico' && chamado.profissional_id) {
                    <div class="tcc-tech-assigned">
                      <div class="tcc-tech-avatar">
                        <i class="pi pi-user"></i>
                      </div>
                      <div class="tcc-tech-text">
                        <span class="label">Técnico Responsável</span>
                        <strong class="name">{{ chamado.profissional_nome }}</strong>
                      </div>
                    </div>
                  } @else {
                    <div class="tcc-tech-unassigned">
                      <i class="pi pi-clock"></i>
                      <span>Aguardando atendimento por um profissional</span>
                    </div>
                  }
                </div>
              </div>

           
              <div class="tcc-card-footer" (click)="$event.stopPropagation()">
                <div class="tcc-footer-right" style="margin-left: auto;">
                  @if (chamado.status === 'CONCLUIDO' && chamado.avaliacao_nota) {
                    <button
                      class="tcc-rating-badge"
                      (click)="abrirModalAvaliacao(chamado)"
                      title="Ver ou editar avaliação"
                    >
                      <i class="pi pi-star-fill"></i>
                      <span>{{ chamado.avaliacao_nota }}.0</span>
                    </button>
                  }

                  <button
                    type="button"
                    class="tcc-btn-outline small"
                    (click)="abrirMenu($event, menu, chamado)"
                  >
                    Ações <i class="pi pi-chevron-down"></i>
                  </button>
                </div>
              </div>

            </div>
          }
        </div>

        @if (filteredChamados.length > rows) {
          <div class="tcc-paginator-container">
            <p-paginator
              (onPageChange)="onPageChange($event)"
              [first]="first"
              [rows]="rows"
              [totalRecords]="filteredChamados.length"
              [rowsPerPageOptions]="[6, 12, 24, 48]"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} chamados"
            ></p-paginator>
          </div>
        }
      }

      <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

      @if (chamadoDetalhes) {
        <div class="tcc-modal-backdrop" (click)="fecharDetalhes()">
          <div class="tcc-modal-content" (click)="$event.stopPropagation()">
            
            <div class="tcc-modal-header">
              <div class="tcc-modal-title-group">
                <span class="tcc-modal-badge">Chamado #{{ chamadoDetalhes.id }}</span>
                <h2>{{ chamadoDetalhes.titulo || chamadoDetalhes.equipamento }}</h2>
              </div>
              <button class="tcc-modal-close" (click)="fecharDetalhes()">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="tcc-modal-body">
              <div class="tcc-modal-section">
                <div class="tcc-modal-grid-2">
                  <div class="tcc-info-box">
                    <span class="info-label">Status Atual</span>
                    <div class="tcc-status-pill inline-pill" [ngClass]="getStatusBadgeClass(chamadoDetalhes.status)">
                      <i class="pi" [ngClass]="getStatusIcon(chamadoDetalhes.status)"></i>
                      <span>{{ formatStatus(chamadoDetalhes.status) }}</span>
                    </div>
                  </div>

                  <div class="tcc-info-box">
                    <span class="info-label">Data de Abertura</span>
                    <strong class="info-val">{{ chamadoDetalhes.dataCriacao || chamadoDetalhes.data_criacao }}</strong>
                  </div>
                </div>
              </div>

              <div class="tcc-modal-section">
                <span class="info-label">Descrição do Problema</span>
                <div class="tcc-desc-box">
                  {{ chamadoDetalhes.descricao_problema || 'Nenhum detalhe adicional fornecido.' }}
                </div>
              </div>

              <div class="tcc-modal-section">
                <span class="info-label">Anexos</span>
                @if (chamadoDetalhes.anexo) {
                  <div class="attachments-list">
                    @for (url of getAnexos(chamadoDetalhes.anexo); track $index) {
                      <a [href]="url" target="_blank" class="attachment-link">
                        <i class="pi pi-file"></i> Anexo {{ $index + 1 }}
                      </a>
                    }
                  </div>
                } @else {
                  <div class="tcc-desc-box" style="font-style: italic; color: var(--text-muted);">
                    Nenhum anexo fornecido.
                  </div>
                }
              </div>

              <div class="tcc-modal-section">
                <span class="info-label">Profissional Atribuído</span>
                @if (chamadoDetalhes.profissional_nome && chamadoDetalhes.profissional_id) {
                  <div class="tcc-tech-card-modal">
                    <div class="tcc-tech-avatar-lg">
                      <i class="pi pi-desktop"></i>
                    </div>
                    <div class="tcc-tech-info-modal">
                      <h4>{{ chamadoDetalhes.profissional_nome }}</h4>
                      <p>Técnico de TI responsável por este atendimento</p>
                    </div>
                    <a [routerLink]="['/cliente/chat', chamadoDetalhes.id]" (click)="fecharDetalhes()" class="tcc-btn-main tcc-btn-sm">
                      <i class="pi pi-comments"></i> Conversar
                    </a>
                  </div>
                } @else {
                  <div class="tcc-unassigned-banner">
                    <i class="pi pi-info-circle"></i>
                    <div>
                      <strong>Aguardando Atribuição</strong>
                      <p>Sua solicitação está aberta na rede de técnicos. Assim que um especialista aceitar, você poderá interagir pelo chat.</p>
                    </div>
                  </div>
                }
              </div>

              @if (chamadoDetalhes.status === 'CONCLUIDO' && chamadoDetalhes.profissional_id) {
                <div class="tcc-modal-section">
                  <span class="info-label">Avaliação do Atendimento</span>
                  @if (chamadoDetalhes.avaliacao_nota) {
                    <div class="tcc-rated-card">
                      <div class="tcc-rated-top">
                        <div class="tcc-stars-display">
                          @for (star of [1, 2, 3, 4, 5]; track star) {
                            <i class="pi" [ngClass]="star <= (chamadoDetalhes.avaliacao_nota || 0) ? 'pi-star-fill active' : 'pi-star'"></i>
                          }
                          <strong class="tcc-rating-num">{{ chamadoDetalhes.avaliacao_nota }}.0 / 5.0</strong>
                        </div>
                        <button class="tcc-btn-rate-edit" (click)="abrirModalAvaliacao(chamadoDetalhes)" title="Alterar avaliação">
                          <i class="pi pi-pencil"></i> Editar
                        </button>
                      </div>
                      @if (chamadoDetalhes.avaliacao_comentario) {
                        <p class="tcc-rated-comment">
                          "{{ chamadoDetalhes.avaliacao_comentario }}"
                        </p>
                      }
                    </div>
                  } @else {
                    <div class="tcc-rate-invite-card">
                      <div class="tcc-invite-content">
                        <div class="tcc-invite-icon-wrapper">
                          <i class="pi pi-star-fill tcc-invite-icon"></i>
                        </div>
                        <div>
                          <strong class="tcc-invite-title">Como foi seu atendimento com {{ chamadoDetalhes.profissional_nome }}?</strong>
                          <p class="tcc-invite-desc">Sua avaliação reconhece o trabalho do técnico e melhora a qualidade da nossa rede.</p>
                        </div>
                      </div>
                      <button class="tcc-btn-rate-action" (click)="abrirModalAvaliacao(chamadoDetalhes)">
                        <i class="pi pi-star"></i> Avaliar Técnico
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="tcc-modal-footer">
              @if (chamadoDetalhes.status === 'ABERTO' || chamadoDetalhes.status === 'PENDENTE') {
                <button class="tcc-btn-danger-outline" (click)="confirmarCancelarChamado(chamadoDetalhes)">
                  <i class="pi pi-trash"></i> Cancelar Chamado
                </button>
              }
              <button class="tcc-btn-outline ml-auto" (click)="fecharDetalhes()">
                Fechar
              </button>
            </div>

          </div>
        </div>
      }

  
      @if (modalCancelarConfirmacao) {
        <div class="tcc-modal-backdrop" (click)="modalCancelarConfirmacao = false">
          <div class="tcc-modal-content tcc-modal-sm" (click)="$event.stopPropagation()">
            <div class="tcc-modal-header">
              <h3 style="margin: 0; color: #dc2626; display: flex; align-items: center; gap: 8px;">
                <i class="pi pi-exclamation-triangle"></i> Cancelar Chamado
              </h3>
              <button class="tcc-modal-close" (click)="modalCancelarConfirmacao = false">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="tcc-modal-body">
              <p>Tem certeza de que deseja cancelar o chamado <strong>#{{ chamadoParaCancelarId }}</strong>?</p>
              <p style="font-size: 13px; color: var(--tcc-text-muted);">Esta ação cancelará a solicitação e os técnicos não poderão mais aceitá-la.</p>
            </div>
            <div class="tcc-modal-footer">
              <button class="tcc-btn-outline" (click)="modalCancelarConfirmacao = false">Voltar</button>
              <button class="tcc-btn-danger" (click)="executarCancelamento()">
                <i class="pi pi-check"></i> Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      }


      @if (modalAvaliacao && chamadoParaAvaliar) {
        <div class="tcc-modal-backdrop" (click)="fecharModalAvaliacao()">
          <div class="tcc-modal-content tcc-modal-rate" (click)="$event.stopPropagation()">
            <div class="tcc-modal-header">
              <div class="tcc-modal-title-group">
                <span class="tcc-modal-badge badge-rate">Avaliação de Atendimento</span>
                <h2>Avaliar Atendimento</h2>
                <p class="tcc-modal-sub">Chamado #{{ chamadoParaAvaliar.id }} &bull; {{ chamadoParaAvaliar.titulo || chamadoParaAvaliar.equipamento || 'Atendimento de TI' }}</p>
              </div>
              <button class="tcc-modal-close" (click)="fecharModalAvaliacao()">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="tcc-modal-body">
            
              <div class="tcc-rate-tech-preview">
                <div class="tcc-tech-avatar-rate">
                  <i class="pi pi-user"></i>
                </div>
                <div class="tcc-rate-tech-info">
                  <strong>{{ chamadoParaAvaliar.profissional_nome || 'Técnico Especialista' }}</strong>
                  <span>Profissional responsável pelo atendimento</span>
                </div>
              </div>

           
              <div class="tcc-rate-selector-box">
                <span class="tcc-rate-selector-title">Que nota você dá para o atendimento?</span>
                <div class="tcc-stars-interactive">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <button
                      type="button"
                      class="tcc-star-btn"
                      [class.hovered]="hoverRating >= star"
                      [class.selected]="notaSelecionada >= star"
                      (mouseenter)="hoverRating = star"
                      (mouseleave)="hoverRating = 0"
                      (click)="selecionarNota(star)"
                      [title]="star + ' estrelas'"
                    >
                      <i class="pi" [ngClass]="(hoverRating >= star || (!hoverRating && notaSelecionada >= star)) ? 'pi-star-fill' : 'pi-star'"></i>
                    </button>
                  }
                </div>
                <span class="tcc-rating-label-text">
                  {{ getRatingLabel(hoverRating || notaSelecionada) }}
                </span>
              </div>

          
              <div class="tcc-rate-field">
                <label for="comentarioAvaliacao" class="tcc-rate-label">Comentário ou feedback (opcional)</label>
                <textarea
                  id="comentarioAvaliacao"
                  class="tcc-rate-textarea"
                  rows="3"
                  placeholder="Conte como foi o atendimento, pontualidade e resolução do problema..."
                  [(ngModel)]="comentarioAvaliacao"
                  maxlength="500"
                ></textarea>
                <div class="tcc-char-count">{{ comentarioAvaliacao.length }}/500</div>
              </div>
            </div>

            <div class="tcc-modal-footer">
              <button class="tcc-btn-outline" (click)="fecharModalAvaliacao()" [disabled]="enviandoAvaliacao">
                Cancelar
              </button>
              <button
                class="tcc-btn-main ml-auto"
                (click)="enviarAvaliacao()"
                [disabled]="notaSelecionada === 0 || enviandoAvaliacao"
              >
                @if (enviandoAvaliacao) {
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>Salvando...</span>
                } @else {
                  <i class="pi pi-check"></i>
                  <span>Enviar Avaliação</span>
                }
              </button>
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
      padding: 0;
    }
    .tcc-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Page Header */
    .tcc-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .tcc-title-lg {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      letter-spacing: -0.02em;
    }
    .tcc-subtitle {
      margin: 6px 0 0 0;
      color: var(--tcc-text-muted, #64748b);
      font-size: 0.95rem;
    }

    /* Metrics Grid */
    .tcc-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .tcc-metric-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.05);
      }
      &.selected {
        border-color: var(--tcc-primary, #3b82f6);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }
    .tcc-metric-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .metric-active .tcc-metric-icon { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .metric-pending .tcc-metric-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .metric-completed .tcc-metric-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .metric-total .tcc-metric-icon { background: var(--tcc-bg, #f8fafc); color: var(--tcc-text-muted, #64748b); }

    .tcc-metric-info {
      display: flex;
      flex-direction: column;
    }
    .tcc-metric-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--tcc-text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .tcc-metric-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      line-height: 1.2;
    }

    /* Search Filter Card */
    .tcc-filter-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 14px;
      padding: 12px 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .tcc-search-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;

      i.pi-search {
        position: absolute;
        left: 14px;
        color: #94a3b8;
        font-size: 15px;
      }
      .tcc-clear-btn {
        position: absolute;
        right: 12px;
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        &:hover { color: #475569; }
      }
    }
    .tcc-search-input {
      width: 100%;
      padding: 12px 38px 12px 40px;
      border: 1px solid var(--tcc-border, #cbd5e1);
      border-radius: 10px;
      font-size: 14px;
      background: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #0f172a);
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: var(--tcc-primary, #3b82f6);
        background: var(--tcc-surface, #ffffff);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      }
    }

    /* Chamados Grid */
    .tcc-chamados-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }
    .tcc-chamado-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);

      &:hover {
        border-color: var(--tcc-primary, #3b82f6);
        box-shadow: 0 10px 20px -5px rgba(0,0,0,0.06);
        transform: translateY(-2px);
      }
      &.border-active {
        border-left: 4px solid var(--tcc-primary, #3b82f6);
      }
    }
    .tcc-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .tcc-id-tag {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tcc-tag-hash {
      font-weight: 700;
      font-size: 14px;
      color: var(--tcc-text-main, #0f172a);
      background: var(--tcc-bg, #f1f5f9);
      padding: 3px 8px;
      border-radius: 6px;
    }
    .tcc-tag-date {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tcc-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .status-andamento { background: rgba(59, 130, 246, 0.12); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
    .status-pendente { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .status-concluido { background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-cancelado { background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

    .tcc-card-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .tcc-chamado-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      cursor: pointer;
      line-height: 1.3;
      &:hover { color: var(--tcc-primary, #3b82f6); }
    }
    .tcc-chamado-desc {
      margin: 0;
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tcc-tech-info {
      margin-top: 4px;
      padding-top: 10px;
      border-top: 1px dashed var(--tcc-border, #f1f5f9);
    }
    .tcc-tech-assigned {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tcc-tech-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .tcc-tech-text {
      display: flex;
      flex-direction: column;
      .label { font-size: 11px; color: var(--tcc-text-muted, #64748b); }
      .name { font-size: 13px; color: var(--tcc-text-main, #0f172a); }
    }
    .tcc-tech-unassigned {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
      padding: 6px 10px;
      border-radius: 8px;
    }

    .tcc-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid var(--tcc-border, #f1f5f9);
    }
    .tcc-btn-details {
      background: transparent;
      border: none;
      color: var(--tcc-primary, #3b82f6);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 0;
      &:hover { text-decoration: underline; }
    }
    .tcc-footer-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tcc-btn-rate {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      &:hover {
        background: rgba(245, 158, 11, 0.22);
        color: #d97706;
        transform: translateY(-1px);
      }
    }
    .tcc-rating-badge {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;
      i { color: #f59e0b; font-size: 13px; }
      &:hover {
        background: rgba(245, 158, 11, 0.22);
        border-color: #f59e0b;
      }
    }
    .tcc-btn-chat {
      background: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      &:hover {
        background: var(--tcc-primary, #3b82f6);
        color: #ffffff;
      }
    }

    /* Buttons */
    .tcc-btn-main {
      background: var(--tcc-primary, #3b82f6);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
      transition: all 0.2s;
      text-decoration: none;
      &:hover { background: var(--tcc-primary-hover, #2563eb); }
    }
    .tcc-btn-outline {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #cbd5e1);
      color: var(--tcc-text-secondary, #334155);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      &:hover { background: var(--tcc-surface-hover, #f8fafc); color: var(--tcc-text-main); }
    }
    .tcc-btn-danger {
      background: #dc2626;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      &:hover { background: #b91c1c; }
    }
    .tcc-btn-danger-outline {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      &:hover { background: rgba(239, 68, 68, 0.12); }
    }
    .tcc-btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* Paginator */
    .tcc-paginator-container {
      display: flex;
      justify-content: center;
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 6px 12px;
    }

    /* Empty State & Loader */
    .tcc-center-content {
      text-align: center;
      padding: 48px 0;
      color: var(--tcc-text-muted);
    }
    .tcc-spinner {
      font-size: 32px;
      color: var(--tcc-primary, #3b82f6);
      margin-bottom: 12px;
    }
    .tcc-empty-state {
      background: var(--tcc-surface, #ffffff);
      border: 1px dashed var(--tcc-border, #cbd5e1);
      border-radius: 16px;
      padding: 48px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .tcc-empty-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--tcc-bg, #f1f5f9);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 8px;
    }

    /* Modals */
    .tcc-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .tcc-modal-content {
      background: var(--tcc-surface, #ffffff);
      border-radius: 18px;
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-main, #0f172a);
      animation: modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tcc-modal-sm {
      max-width: 440px;
    }
    @keyframes modalScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .tcc-modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .tcc-modal-title-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      h2 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--tcc-text-main, #0f172a);
      }
    }
    .tcc-modal-badge {
      font-size: 11px;
      font-weight: 700;
      color: var(--tcc-primary, #3b82f6);
      background: rgba(59, 130, 246, 0.15);
      padding: 2px 8px;
      border-radius: 6px;
      width: fit-content;
    }
    .tcc-modal-close {
      background: transparent;
      border: none;
      font-size: 16px;
      color: var(--tcc-text-muted, #94a3b8);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      &:hover { background: var(--tcc-surface-hover, #f1f5f9); color: var(--tcc-text-main, #334155); }
    }
    .tcc-modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .tcc-modal-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .tcc-modal-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .tcc-info-box {
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .info-val {
      font-size: 14px;
      color: var(--tcc-text-main, #0f172a);
    }
    .inline-pill {
      width: fit-content;
    }
    .tcc-desc-box {
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 14px;
      line-height: 1.6;
      color: var(--tcc-text-secondary, #334155);
      white-space: pre-wrap;
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

    .tcc-tech-card-modal {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .tcc-tech-avatar-lg {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.18);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .tcc-tech-info-modal {
      flex: 1;
      h4 { margin: 0; font-size: 15px; color: var(--tcc-text-main, #14532d); }
      p { margin: 2px 0 0 0; font-size: 12px; color: var(--tcc-text-muted, #166534); }
    }
    .tcc-unassigned-banner {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      i { font-size: 18px; color: #f59e0b; margin-top: 2px; }
      strong { display: block; font-size: 14px; color: var(--tcc-text-main, #92400e); }
      p { margin: 2px 0 0 0; font-size: 12px; color: var(--tcc-text-muted, #b45309); line-height: 1.4; }
    }
    /* Rated Card in Details */
    .tcc-rated-card {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tcc-rated-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tcc-stars-display {
      display: flex;
      align-items: center;
      gap: 4px;
      i {
        font-size: 16px;
        color: var(--tcc-border, #cbd5e1);
        &.active, &.pi-star-fill {
          color: #f59e0b;
        }
      }
    }
    .tcc-rating-num {
      margin-left: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #f59e0b;
    }
    .tcc-btn-rate-edit {
      background: transparent;
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      &:hover {
        background: rgba(245, 158, 11, 0.18);
      }
    }
    .tcc-rated-comment {
      margin: 0;
      font-size: 13px;
      font-style: italic;
      color: var(--tcc-text-secondary, #78350f);
      line-height: 1.4;
    }

    /* Invite Card in Details */
    .tcc-rate-invite-card {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .tcc-invite-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 240px;
    }
    .tcc-invite-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(245, 158, 11, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tcc-invite-icon {
      font-size: 20px;
      color: #f59e0b;
    }
    .tcc-invite-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #92400e);
      display: block;
      margin-bottom: 2px;
    }
    .tcc-invite-desc {
      font-size: 12px;
      color: var(--tcc-text-muted, #b45309);
      margin: 0;
    }
    .tcc-btn-rate-action {
      background: #d97706;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3);
      transition: all 0.2s;
      white-space: nowrap;
      &:hover {
        background: #b45309;
        transform: translateY(-1px);
      }
    }

    /* Modal Rate Specific */
    .tcc-modal-rate {
      max-width: 500px;
    }
    .badge-rate {
      color: #f59e0b !important;
      background: rgba(245, 158, 11, 0.15) !important;
    }
    .tcc-modal-sub {
      margin: 0;
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }
    .tcc-rate-tech-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 12px 16px;
    }
    .tcc-tech-avatar-rate {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .tcc-rate-tech-info {
      display: flex;
      flex-direction: column;
      strong { font-size: 14px; color: var(--tcc-text-main, #0f172a); }
      span { font-size: 12px; color: var(--tcc-text-muted, #64748b); }
    }
    .tcc-rate-selector-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: var(--tcc-bg, #fafaf9);
      border: 1px solid var(--tcc-border, #e7e5e4);
      border-radius: 14px;
      gap: 12px;
    }
    .tcc-rate-selector-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #1c1917);
    }
    .tcc-stars-interactive {
      display: flex;
      gap: 8px;
    }
    .tcc-star-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--tcc-text-muted, #d6d3d1);
      transition: transform 0.15s ease, color 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover, &.hovered, &.selected {
        color: #f59e0b;
        transform: scale(1.18);
      }
      i {
        font-size: 32px;
      }
    }
    .tcc-rating-label-text {
      font-size: 13px;
      font-weight: 600;
      color: #f59e0b;
      min-height: 20px;
    }
    .tcc-rate-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tcc-rate-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-main, #334155);
    }
    .tcc-rate-textarea {
      width: 100%;
      border: 1px solid var(--tcc-border, #cbd5e1);
      border-radius: 10px;
      padding: 12px;
      font-family: inherit;
      font-size: 13px;
      color: var(--tcc-text-main, #0f172a);
      resize: vertical;
      background: var(--tcc-surface, #ffffff);
      &:focus {
        outline: none;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
      }
    }
    .tcc-char-count {
      align-self: flex-end;
      font-size: 11px;
      color: var(--tcc-text-muted, #94a3b8);
    }

    .tcc-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--tcc-surface, #f8fafc);
    }
    .ml-auto { margin-left: auto; }
  `]
})
export class MeusChamados implements OnInit {
  private meusChamadosService = inject(MeusChamadosService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  menuItems: MenuItem[] = [];
  chamados: Chamado[] = [];
  filteredChamados: Chamado[] = [];
  carregando: boolean = true;

  searchTerm: string = '';
  statusFilter: 'TODOS' | 'EM_ANDAMENTO' | 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO' = 'TODOS';

  chamadoDetalhes: Chamado | null = null;
  modalCancelarConfirmacao: boolean = false;
  chamadoParaCancelarId: number | string | null = null;

  modalAvaliacao: boolean = false;
  chamadoParaAvaliar: Chamado | null = null;
  notaSelecionada: number = 0;
  hoverRating: number = 0;
  comentarioAvaliacao: string = '';
  enviandoAvaliacao: boolean = false;

  first: number = 0;
  rows: number = 6;

  get countEmAndamento(): number {
    return this.chamados.filter(c => c.status === 'EM_ANDAMENTO').length;
  }

  get countAguardando(): number {
    return this.chamados.filter(c => c.status === 'PENDENTE' || c.status === 'ABERTO' || (!c.profissional_id && c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO')).length;
  }

  get countConcluidos(): number {
    return this.chamados.filter(c => c.status === 'CONCLUIDO').length;
  }

  get countCancelados(): number {
    return this.chamados.filter(c => c.status === 'CANCELADO').length;
  }

  trackByChamadoId(index: number, chamado: any): number {
    return chamado.id;
  }

  getAnexos(anexoStr: any): string[] {
    if (!anexoStr) return [];
    return typeof anexoStr === 'string' ? anexoStr.split(',') : [];
  }

  get paginatedChamados(): Chamado[] {
    if (!this.filteredChamados) return [];
    if (this.first >= this.filteredChamados.length && this.filteredChamados.length > 0) {
      this.first = 0;
    }
    return this.filteredChamados.slice(this.first, this.first + this.rows);
  }

  ngOnInit(): void {
    this.carregarChamados();
  }

  carregarChamados(): void {
    this.carregando = true;
    this.meusChamadosService.getChamados().subscribe({
      next: (data) => {
        this.chamados = data || [];
        this.aplicarFiltros();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar chamados', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar seus chamados.'
        });
        this.chamados = [];
        this.filteredChamados = [];
        this.carregando = false;
      }
    });
  }

  setStatusFilter(filter: 'TODOS' | 'EM_ANDAMENTO' | 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO'): void {
    this.statusFilter = filter;
    this.first = 0;
    this.aplicarFiltros();
  }

  resetFiltros(): void {
    this.searchTerm = '';
    this.statusFilter = 'TODOS';
    this.first = 0;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let result = [...this.chamados];

    // Status filter
    if (this.statusFilter === 'EM_ANDAMENTO') {
      result = result.filter(c => c.status === 'EM_ANDAMENTO');
    } else if (this.statusFilter === 'PENDENTE') {
      result = result.filter(c => c.status === 'PENDENTE' || c.status === 'ABERTO' || (!c.profissional_id && c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO'));
    } else if (this.statusFilter === 'CONCLUIDO') {
      result = result.filter(c => c.status === 'CONCLUIDO');
    } else if (this.statusFilter === 'CANCELADO') {
      result = result.filter(c => c.status === 'CANCELADO');
    }

    // Text search
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(c =>
        (c.titulo && c.titulo.toLowerCase().includes(term)) ||
        (c.equipamento && c.equipamento.toLowerCase().includes(term)) ||
        (c.descricao_problema && c.descricao_problema.toLowerCase().includes(term)) ||
        (c.profissional_nome && c.profissional_nome.toLowerCase().includes(term)) ||
        String(c.id).includes(term)
      );
    }

    this.filteredChamados = result;
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  abrirMenu(event: Event, menu: any, chamado: Chamado): void {
    event.stopPropagation();
    const items: MenuItem[] = [];

    if (chamado.profissional_id) {
      items.push({
        label: 'Abrir Chat',
        icon: 'pi pi-comments',
        command: () => this.router.navigate(['/cliente/chat', chamado.id])
      });
    }

    if (chamado.status === 'CONCLUIDO' && chamado.profissional_id) {
      items.push({
        label: chamado.avaliacao_nota ? `Avaliação (${chamado.avaliacao_nota}.0 ★)` : 'Avaliar Atendimento',
        icon: 'pi pi-star',
        command: () => this.abrirModalAvaliacao(chamado)
      });
    }

    if (chamado.status === 'ABERTO' || chamado.status === 'PENDENTE') {
      items.push({ separator: true });
      items.push({
        label: 'Cancelar Chamado',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.confirmarCancelarChamado(chamado)
      });
    }

    if (items.length === 0) {
      items.push({
        label: 'Nenhuma ação extra',
        disabled: true
      });
    }

    this.menuItems = items;
    menu.toggle(event);
  }

  abrirDetalhes(chamado: Chamado): void {
    this.chamadoDetalhes = chamado;
  }

  fecharDetalhes(): void {
    this.chamadoDetalhes = null;
  }

  confirmarCancelarChamado(chamado: Chamado): void {
    this.chamadoParaCancelarId = chamado.id;
    this.modalCancelarConfirmacao = true;
  }

  executarCancelamento(): void {
    if (!this.chamadoParaCancelarId) return;

    this.meusChamadosService.cancelarChamado(this.chamadoParaCancelarId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cancelado',
          detail: `Chamado #${this.chamadoParaCancelarId} cancelado com sucesso.`
        });
        this.modalCancelarConfirmacao = false;
        this.fecharDetalhes();
        this.carregarChamados();
      },
      error: (err) => {
        console.error('Erro ao cancelar chamado', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível cancelar o chamado.'
        });
      }
    });
  }

  formatStatus(status: string): string {
    if (!status) return 'Aberto';
    if (status === 'EM_ANDAMENTO') return 'Em Andamento';
    if (status === 'PENDENTE' || status === 'ABERTO') return 'Aguardando';
    if (status === 'CONCLUIDO') return 'Concluído';
    if (status === 'CANCELADO') return 'Cancelado';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'status-andamento';
      case 'CONCLUIDO': return 'status-concluido';
      case 'CANCELADO': return 'status-cancelado';
      default: return 'status-pendente';
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

  abrirModalAvaliacao(chamado: Chamado): void {
    this.chamadoParaAvaliar = chamado;
    this.notaSelecionada = chamado.avaliacao_nota || 5;
    this.hoverRating = 0;
    this.comentarioAvaliacao = chamado.avaliacao_comentario || '';
    this.modalAvaliacao = true;
  }

  fecharModalAvaliacao(): void {
    if (this.enviandoAvaliacao) return;
    this.modalAvaliacao = false;
    this.chamadoParaAvaliar = null;
    this.notaSelecionada = 0;
    this.hoverRating = 0;
    this.comentarioAvaliacao = '';
  }

  selecionarNota(nota: number): void {
    this.notaSelecionada = nota;
  }

  getRatingLabel(rating: number): string {
    switch (rating) {
      case 1: return '1 estrela — Muito Ruim';
      case 2: return '2 estrelas — Ruim';
      case 3: return '3 estrelas — Regular';
      case 4: return '4 estrelas — Muito Bom';
      case 5: return '5 estrelas — Excelente!';
      default: return 'Selecione uma nota de 1 a 5 estrelas';
    }
  }

  enviarAvaliacao(): void {
    if (!this.chamadoParaAvaliar || !this.chamadoParaAvaliar.id || this.notaSelecionada === 0) return;

    this.enviandoAvaliacao = true;
    const chamadoId = this.chamadoParaAvaliar.id;
    const nota = this.notaSelecionada;
    const comentario = this.comentarioAvaliacao.trim();

    this.meusChamadosService.avaliarChamado(chamadoId, nota, comentario).subscribe({
      next: () => {
        this.enviandoAvaliacao = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Avaliação Enviada',
          detail: 'Obrigado pelo seu feedback! Sua nota foi registrada com sucesso.'
        });

        // Atualizar objeto local na lista
        const idx = this.chamados.findIndex(c => c.id === chamadoId);
        if (idx !== -1) {
          this.chamados[idx] = {
            ...this.chamados[idx],
            avaliacao_nota: nota,
            avaliacao_comentario: comentario,
            avaliado_em: new Date().toISOString()
          };
        }

        // Atualizar objeto no modal de detalhes se estiver aberto
        if (this.chamadoDetalhes && this.chamadoDetalhes.id === chamadoId) {
          this.chamadoDetalhes = {
            ...this.chamadoDetalhes,
            avaliacao_nota: nota,
            avaliacao_comentario: comentario,
            avaliado_em: new Date().toISOString()
          };
        }

        this.aplicarFiltros();
        this.fecharModalAvaliacao();
      },
      error: (err) => {
        this.enviandoAvaliacao = false;
        console.error('Erro ao enviar avaliação', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível registrar sua avaliação. Tente novamente.'
        });
      }
    });
  }
}