import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { RouterModule, Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule, PaginatorModule, ToastModule, EmptyStateComponent],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="tcc-client-list">
      @for (cliente of paginatedClientes; track trackByCliente($index, cliente)) {
        <div class="tcc-client-card" [class.tcc-card-app-user]="cliente.usuario_id">

          <div class="tcc-client-icon-box" [class.app-user]="cliente.usuario_id">
            <i class="pi" [ngClass]="cliente.usuario_id ? 'pi-user-check' : 'pi-users'"></i>
          </div>

          <div class="tcc-client-content">
            <div class="tcc-client-header">
              <h3>{{ cliente.nome_completo || cliente.nome }}</h3>

            
              @if (cliente.usuario_id) {
                <span class="tcc-app-badge" title="Cliente com conta e login no aplicativo">
                  <i class="pi pi-verified"></i> Usuário App
                </span>
              } @else {
                <span class="tcc-manual-badge" title="Cliente cadastrado manualmente">
                  <i class="pi pi-user-edit"></i> Manual
                </span>
              }

              @if (cliente.empresa) {
                <span class="tcc-company-badge">{{ cliente.empresa }}</span>
              }

              @if (cliente.avaliacao !== undefined && cliente.avaliacao !== null && cliente.avaliacao > 0) {
                <span class="tcc-rating" title="Média das avaliações que este cliente deu a você">
                  <i class="pi pi-star-fill"></i> {{ cliente.avaliacao.toFixed(1) }}
                </span>
              } @else {
                <span class="tcc-rating tcc-rating-empty" title="Cliente ainda não avaliou nenhum chamado">
                  <i class="pi pi-star"></i> —
                </span>
              }
            </div>

            <div class="tcc-client-meta">
              @if (cliente.email) {
                <span class="tcc-meta-item"><i class="pi pi-envelope"></i> {{ cliente.email }}</span>
              }
              @if (cliente.telefone) {
                <span class="tcc-meta-item"><i class="pi pi-phone"></i> {{ formatPhone(cliente.telefone) }}</span>
              }
              @if (cliente.endereco || cliente.local) {
                <span class="tcc-meta-item"><i class="pi pi-map-marker"></i> {{ cliente.endereco || cliente.local }}</span>
              }
            </div>
          </div>

          <div class="tcc-client-stats">
            <div class="tcc-mini-stat">
              <span>Ativos</span>
              <strong>{{ cliente.servicos_ativos !== undefined ? cliente.servicos_ativos : (cliente.servicosAtivos || 0) }}</strong>
            </div>
            <div class="tcc-mini-stat">
              <span>Concluídos</span>
              <strong>{{ cliente.servicos_concluidos !== undefined ? cliente.servicos_concluidos : (cliente.servicosConcluidos || 0) }}</strong>
            </div>
          </div>

          <div class="tcc-client-actions">
            <button class="tcc-btn-outline small" (click)="openMenu($event, menu, cliente)">
              Ações <i class="pi pi-chevron-down"></i>
            </button>
          </div>

        </div>
      } @empty {
        <app-empty-state message="Nenhum cliente encontrado."></app-empty-state>
      }
    </div>

    @if (clientes.length > rows) {
      <div class="tcc-paginator-container">
        <p-paginator
          (onPageChange)="onPageChange($event)"
          [first]="first"
          [rows]="rows"
          [totalRecords]="clientes.length"
          [rowsPerPageOptions]="[8, 16, 24, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
        ></p-paginator>
      </div>
    }
   
    <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

   
    @if (clienteDetalhes) {
      <div class="tcc-modal-backdrop" (click)="fecharDetalhes()">
        <div class="tcc-modal-content tcc-fade-in" (click)="$event.stopPropagation()">
          <div class="tcc-modal-header">
            <div class="tcc-modal-title-box">
              <div class="tcc-modal-avatar" [class.app-user]="clienteDetalhes.usuario_id">
                <i class="pi" [ngClass]="clienteDetalhes.usuario_id ? 'pi-user-check' : 'pi-user'"></i>
              </div>
              <div>
                <div class="tcc-modal-title-row">
                  <h2 class="tcc-modal-title">{{ clienteDetalhes.nome_completo || clienteDetalhes.nome }}</h2>
                  @if (clienteDetalhes.usuario_id) {
                    <span class="tcc-app-badge"><i class="pi pi-verified"></i> Conta no App</span>
                  } @else {
                    <span class="tcc-manual-badge"><i class="pi pi-user-edit"></i> Cadastro Manual</span>
                  }
                </div>
                <span class="tcc-modal-subtitle">{{ clienteDetalhes.empresa || 'Cliente Particular' }}</span>
              </div>
            </div>
            <button class="tcc-modal-close" (click)="fecharDetalhes()" title="Fechar">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="tcc-modal-body">
            <div class="tcc-modal-stats-grid">
              <div class="tcc-modal-stat-card">
                <span class="stat-num text-blue">{{ clienteDetalhes.servicos_ativos !== undefined ? clienteDetalhes.servicos_ativos : (clienteDetalhes.servicosAtivos || 0) }}</span>
                <span class="stat-lbl">Chamados Ativos</span>
              </div>
              <div class="tcc-modal-stat-card">
                <span class="stat-num text-green">{{ clienteDetalhes.servicos_concluidos !== undefined ? clienteDetalhes.servicos_concluidos : (clienteDetalhes.servicosConcluidos || 0) }}</span>
                <span class="stat-lbl">Concluídos</span>
              </div>
              <div class="tcc-modal-stat-card">
                <span class="stat-num text-amber">
                  @if (clienteDetalhes.avaliacao !== undefined && clienteDetalhes.avaliacao !== null && clienteDetalhes.avaliacao > 0) {
                    <i class="pi pi-star-fill" style="font-size: 14px; margin-right: 4px;"></i>{{ clienteDetalhes.avaliacao.toFixed(1) }}
                  } @else {
                    <i class="pi pi-star" style="font-size: 14px; margin-right: 4px; color: #94a3b8;"></i>—
                  }
                </span>
                <span class="stat-lbl">{{ (clienteDetalhes.avaliacao && clienteDetalhes.avaliacao > 0) ? 'Nota do Cliente' : 'Sem Avaliação' }}</span>
              </div>
            </div>

            <div class="tcc-modal-info-list">
              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-envelope"></i></div>
                <div class="info-content">
                  <label>E-mail</label>
                  <span>{{ clienteDetalhes.email || 'Não informado' }}</span>
                </div>
              </div>

              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-phone"></i></div>
                <div class="info-content">
                  <label>Telefone / WhatsApp</label>
                  <span>{{ formatPhone(clienteDetalhes.telefone) || 'Não informado' }}</span>
                </div>
              </div>

              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-map-marker"></i></div>
                <div class="info-content">
                  <label>Endereço / Local</label>
                  <span>{{ clienteDetalhes.endereco || clienteDetalhes.local || 'Não informado' }}</span>
                </div>
              </div>

              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-briefcase"></i></div>
                <div class="info-content">
                  <label>Empresa</label>
                  <span>{{ clienteDetalhes.empresa || 'Pessoa Física / Não informado' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="tcc-modal-footer">
            @if (clienteDetalhes.usuario_id) {
              <button class="tcc-btn-danger-outline" (click)="confirmarDesvinculo(clienteDetalhes)">
                <i class="pi pi-user-minus"></i> Desvincular da Minha Base
              </button>
            }
            <button class="tcc-btn-outline" (click)="fecharDetalhes()">Fechar</button>
            <button class="tcc-btn-main" (click)="editarCliente(clienteDetalhes)">
              <i class="pi pi-pencil" style="margin-right: 6px;"></i> Editar Cliente
            </button>
          </div>
        </div>
      </div>
    }

 
    @if (clienteParaDesvincular) {
      <div class="tcc-modal-backdrop" (click)="cancelarDesvinculo()">
        <div class="tcc-modal-content tcc-confirm-modal tcc-fade-in" (click)="$event.stopPropagation()">
          <div class="tcc-confirm-body">
            <div class="tcc-confirm-icon-box">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
            <h3 class="tcc-confirm-title">Desvincular Cliente?</h3>
            <p class="tcc-confirm-text">
              Deseja remover <strong>{{ clienteParaDesvincular.nome_completo || clienteParaDesvincular.nome }}</strong> da sua base de clientes?
            </p>
            <p class="tcc-confirm-subtext">
              O cliente continuará existindo normalmente no aplicativo e seus atendimentos anteriores não serão afetados.
            </p>
          </div>

          <div class="tcc-modal-footer">
            <button class="tcc-btn-outline" (click)="cancelarDesvinculo()" [disabled]="desvinculando">
              Cancelar
            </button>
            <button class="tcc-btn-danger" (click)="executarDesvinculo()" [disabled]="desvinculando">
              @if (desvinculando) {
                <i class="pi pi-spin pi-spinner"></i> Removendo...
              } @else {
                <i class="pi pi-user-minus"></i> Confirmar Desvínculo
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .tcc-client-list { display: flex; flex-direction: column; gap: 12px; }

    .tcc-client-card {
      background-color: var(--tcc-surface, #ffffff); 
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px; 
      padding: 16px 24px;
      display: flex; 
      align-items: center; 
      gap: 24px; 
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .tcc-client-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
    .tcc-client-card.tcc-card-app-user {
      border-left: 4px solid var(--tcc-primary, #3b82f6);
    }

    .tcc-client-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background-color: #f1f5f9;
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .tcc-client-icon-box.app-user {
      background-color: #eff6ff;
      color: var(--tcc-primary, #3b82f6);
    }

    .tcc-client-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tcc-client-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .tcc-client-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    /* BADGES DE TIPO DE CONTA */
    .tcc-app-badge {
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--tcc-primary, #3b82f6);
      border: 1px solid rgba(59, 130, 246, 0.2);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .tcc-manual-badge {
      background-color: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-muted, #64748b);
      border: 1px solid var(--tcc-border, #e2e8f0);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .tcc-company-badge {
      background-color: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      color: #eab308;
    }

    .tcc-rating.tcc-rating-empty {
      color: var(--tcc-text-muted, #94a3b8);
      font-weight: 500;
      i { color: #cbd5e1; }
    }

    .tcc-rating i {
      font-size: 12px;
    }

    .tcc-client-meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tcc-meta-item i {
      font-size: 13px;
      opacity: 0.7;
    }

    .tcc-client-stats {
      display: flex;
      gap: 24px;
      padding: 0 24px;
      border-left: 1px solid var(--tcc-border, #e2e8f0);
      border-right: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-mini-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .tcc-mini-stat span {
      font-size: 11px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-mini-stat strong {
      font-size: 16px;
      color: var(--tcc-text-main, #0f172a);
      font-weight: 700;
    }

    .tcc-client-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tcc-btn-outline.small {
      background-color: transparent;
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-main, #475569);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }
    .tcc-btn-outline.small:hover {
      background-color: var(--tcc-bg, #f8fafc);
    }

    /* Modal Styles */
    .tcc-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 16px;
    }

    .tcc-modal-content {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .tcc-confirm-modal {
      max-width: 440px;
    }

    .tcc-confirm-body {
      padding: 28px 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .tcc-confirm-icon-box {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background-color: #fef2f2;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;
    }

    .tcc-confirm-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 8px 0;
    }

    .tcc-confirm-text {
      font-size: 14px;
      color: var(--tcc-text-main, #334155);
      margin: 0 0 8px 0;
      line-height: 1.5;
    }

    .tcc-confirm-subtext {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
      line-height: 1.4;
    }

    .tcc-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-modal-title-box {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .tcc-modal-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tcc-modal-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background-color: #f1f5f9;
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .tcc-modal-avatar.app-user {
      background-color: #eff6ff;
      color: var(--tcc-primary, #3b82f6);
    }

    .tcc-modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-modal-subtitle {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-modal-close {
      background: transparent;
      border: none;
      color: var(--tcc-text-muted, #94a3b8);
      font-size: 16px;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .tcc-modal-close:hover {
      background-color: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .tcc-modal-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .tcc-modal-stat-card {
      background-color: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
    }

    .stat-num {
      font-size: 18px;
      font-weight: 700;
    }

    .stat-lbl {
      font-size: 11px;
      color: var(--tcc-text-muted, #64748b);
      font-weight: 500;
    }

    .text-blue { color: var(--tcc-primary, #3b82f6); }
    .text-green { color: #10b981; }
    .text-amber { color: #f59e0b; display: flex; align-items: center; justify-content: center; }

    .tcc-modal-info-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .tcc-modal-info-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 14px;
      background-color: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
    }

    .info-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--tcc-primary, #3b82f6);
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
      overflow: hidden;
    }

    .info-content label {
      font-size: 11px;
      color: var(--tcc-text-muted, #64748b);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-content span {
      font-size: 13px;
      color: var(--tcc-text-main, #0f172a);
      font-weight: 500;
      word-break: break-word;
    }

    .tcc-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      background-color: var(--tcc-surface, #ffffff);
      flex-wrap: wrap;
    }

    .tcc-btn-main {
      background-color: var(--tcc-primary, #3b82f6);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.2s;
    }
    .tcc-btn-main:hover {
      opacity: 0.9;
    }

    .tcc-btn-outline {
      background-color: transparent;
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-main, #475569);
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .tcc-btn-outline:hover {
      background-color: var(--tcc-bg, #f8fafc);
    }

    .tcc-btn-danger-outline {
      background-color: transparent;
      border: 1px solid #fecaca;
      color: #ef4444;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-right: auto;
      transition: all 0.2s;
    }
    .tcc-btn-danger-outline:hover {
      background-color: #fef2f2;
      border-color: #ef4444;
    }

    .tcc-btn-danger {
      background-color: #ef4444;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.2s;
    }
    .tcc-btn-danger:hover:not(:disabled) {
      opacity: 0.9;
    }
    .tcc-btn-danger:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tcc-paginator-container {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 6px 12px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .tcc-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.97); }
      to { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 768px) {
      .tcc-client-card { flex-direction: column; align-items: flex-start; }
      .tcc-client-stats { border: none; padding: 0; padding-top: 12px; border-top: 1px solid var(--tcc-border, #e2e8f0); width: 100%; justify-content: space-around; }
      .tcc-client-actions { width: 100%; justify-content: flex-end; }
      .tcc-modal-stats-grid { grid-template-columns: 1fr; }
      .tcc-btn-danger-outline { margin-right: 0; width: 100%; justify-content: center; }
    }
  `]
})
export class ClientesList {
  @Input() clientes: Cliente[] = [];
  @Output() clienteDesvinculado = new EventEmitter<void>();

  first: number = 0;
  rows: number = 8;

  get paginatedClientes(): Cliente[] {
    if (!this.clientes) return [];
    if (this.first >= this.clientes.length && this.clientes.length > 0) {
      this.first = 0;
    }
    return this.clientes.slice(this.first, this.first + this.rows);
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  private router = inject(Router);
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);

  menuItems: MenuItem[] = [];
  selectedCliente: Cliente | null = null;
  clienteDetalhes: Cliente | null = null;
  clienteParaDesvincular: Cliente | null = null;
  desvinculando = false;

  openMenu(event: MouseEvent, menu: any, cliente: Cliente): void {
    event.stopPropagation();
    this.setMenuContext(cliente);
    menu.toggle(event);
  }

  setMenuContext(cliente: Cliente): void {
    this.selectedCliente = cliente;
    const items: MenuItem[] = [
      {
        label: 'Ver Detalhes',
        icon: 'pi pi-eye',
        command: () => {
          if (this.selectedCliente) {
            this.verDetalhes(this.selectedCliente);
          }
        }
      },
      {
        label: 'Editar Cliente',
        icon: 'pi pi-pencil',
        command: () => {
          if (this.selectedCliente) {
            this.editarCliente(this.selectedCliente);
          }
        }
      }
    ];

    if (cliente.usuario_id) {
      items.push({
        separator: true
      });
      items.push({
        label: 'Desvincular da Base',
        icon: 'pi pi-user-minus',
        styleClass: 'text-red-500',
        command: () => {
          if (this.selectedCliente) {
            this.confirmarDesvinculo(this.selectedCliente);
          }
        }
      });
    }

    this.menuItems = items;
  }

  verDetalhes(cliente: Cliente): void {
    this.clienteDetalhes = cliente;
  }

  fecharDetalhes(): void {
    this.clienteDetalhes = null;
  }

  editarCliente(cliente: Cliente): void {
    this.fecharDetalhes();
    const id = cliente.id !== undefined && cliente.id !== null ? cliente.id : (cliente.email || cliente.nome);
    this.router.navigate(['/painel/clientes', id, 'edit']);
  }

  confirmarDesvinculo(cliente: Cliente): void {
    this.fecharDetalhes();
    this.clienteParaDesvincular = cliente;
  }

  cancelarDesvinculo(): void {
    this.clienteParaDesvincular = null;
    this.desvinculando = false;
  }

  executarDesvinculo(): void {
    if (!this.clienteParaDesvincular || !this.clienteParaDesvincular.id) return;
    this.desvinculando = true;

    this.clienteService.desvincularClienteTecnico(this.clienteParaDesvincular.id).subscribe({
      next: () => {
        this.desvinculando = false;
        const nome = this.clienteParaDesvincular?.nome_completo || this.clienteParaDesvincular?.nome;
        this.messageService.add({
          severity: 'success',
          summary: 'Desvinculado',
          detail: `${nome} foi removido da sua base de clientes.`
        });
        this.clienteParaDesvincular = null;
        this.clienteDesvinculado.emit();
      },
      error: (err) => {
        this.desvinculando = false;
        console.error('Erro ao desvincular cliente:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível desvincular o cliente.'
        });
      }
    });
  }

  trackByCliente(index: number, item: Cliente): any {
    return item.id || item.email || index;
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }
}