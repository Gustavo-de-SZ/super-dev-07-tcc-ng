import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { RouterModule, Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { Equipamento } from '../../../models/equipamento';
import { EquipamentoService } from '../../../services/equipamento.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MenuModule, PaginatorModule, ToastModule, EmptyStateComponent],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="tcc-client-list">
      @for (cliente of paginatedClientes; track trackByCliente($index, cliente)) {
        <div class="tcc-client-card" [class.tcc-card-app-user]="cliente.usuario_id" (click)="verDetalhes(cliente)">

          <div class="tcc-client-icon-box" [class.app-user]="cliente.usuario_id">
            @if (cliente.foto_perfil) {
              <img [src]="cliente.foto_perfil" alt="Avatar" class="avatar-img" referrerpolicy="no-referrer">
            } @else {
              <i class="pi" [ngClass]="cliente.usuario_id ? 'pi-user' : 'pi-users'"></i>
            }
          </div>

          <div class="tcc-client-content">
            <div class="tcc-client-header">
              <h3 class="tcc-client-name">{{ cliente.nome_completo || cliente.nome }}</h3>
              
              <div class="tcc-client-badges">
                @if (cliente.usuario_id) {
                  <span class="tcc-app-badge" title="Cliente com conta e login no aplicativo">
                    <i class="pi pi-verified"></i> App
                  </span>
                } @else {
                  <span class="tcc-manual-badge" title="Cliente cadastrado manualmente">
                    <i class="pi pi-user-edit"></i> Manual
                  </span>
                }

                @if (cliente.empresa) {
                  <span class="tcc-company-badge"><i class="pi pi-briefcase"></i> {{ cliente.empresa }}</span>
                }
              </div>
            </div>

            <div class="tcc-client-meta">
              @if (cliente.telefone) {
                <span class="tcc-meta-item"><i class="pi pi-phone"></i> <span>{{ formatPhone(cliente.telefone) }}</span></span>
              }
              @if (cliente.endereco || cliente.local) {
                <span class="tcc-meta-item"><i class="pi pi-map-marker"></i> <span class="truncate">{{ cliente.endereco || cliente.local }}</span></span>
              }
              @if (cliente.email) {
                <span class="tcc-meta-item"><i class="pi pi-envelope"></i> <span class="truncate">{{ cliente.email }}</span></span>
              }
            </div>
          </div>

          <div class="tcc-client-right">
            <div class="tcc-client-stats">
              <div class="tcc-mini-stat">
                <span class="stat-value">{{ cliente.servicos_ativos !== undefined ? cliente.servicos_ativos : (cliente.servicosAtivos || 0) }}</span>
                <span class="stat-label">Ativos</span>
              </div>
              <div class="tcc-mini-stat">
                <span class="stat-value">{{ cliente.servicos_concluidos !== undefined ? cliente.servicos_concluidos : (cliente.servicosConcluidos || 0) }}</span>
                <span class="stat-label">Concluídos</span>
              </div>
              <div class="tcc-rating-wrapper">
                @if (cliente.avaliacao !== undefined && cliente.avaliacao !== null && cliente.avaliacao > 0) {
                  <span class="tcc-rating" title="Média das avaliações que este cliente deu a você">
                    <i class="pi pi-star-fill"></i> {{ cliente.avaliacao.toFixed(1) }}
                  </span>
                } @else {
                  <span class="tcc-rating tcc-rating-empty" title="Sem avaliações">
                    <i class="pi pi-star"></i> —
                  </span>
                }
              </div>
            </div>

            <div class="tcc-client-actions" (click)="$event.stopPropagation()">
              <button class="tcc-btn-outline small" (click)="openMenu($event, menu, cliente)">
                Ações <i class="pi pi-chevron-down"></i>
              </button>
            </div>
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
                  @if (clienteDetalhes.foto_perfil) {
                    <img [src]="clienteDetalhes.foto_perfil" alt="Avatar" class="avatar-img" referrerpolicy="no-referrer">
                  } @else {
                    <i class="pi" [ngClass]="clienteDetalhes.usuario_id ? 'pi-user' : 'pi-users'"></i>
                  }
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

          <div class="tcc-modal-tabs">
            <button class="tcc-tab-btn" [class.active]="activeTab === 'detalhes'" (click)="activeTab = 'detalhes'">Detalhes</button>
            <button class="tcc-tab-btn" [class.active]="activeTab === 'equipamentos'" (click)="activeTab = 'equipamentos'">Equipamentos</button>
          </div>

          <div class="tcc-modal-body">
            @if (activeTab === 'detalhes') {
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
            } @else {
              <div class="tcc-equipamentos-section">
                @if (carregandoEquipamentos) {
                  <div style="text-align:center; padding:20px;"><i class="pi pi-spin pi-spinner" style="font-size:24px; color: var(--tcc-primary, #3b82f6);"></i></div>
                } @else if (equipamentos.length > 0) {
                  <div class="tcc-equip-list">
                    @for (eq of equipamentos; track eq.id) {
                      <div class="tcc-equip-card">
                        <div class="eq-icon"><i class="pi pi-desktop"></i></div>
                        <div class="eq-info" style="flex: 1;">
                          <h4>{{ eq.tipo }} {{ eq.marca }} {{ eq.modelo }}</h4>
                          @if (eq.numeroSerie) { <span class="eq-meta">SN: {{ eq.numeroSerie }}</span> }
                        </div>
                        <div class="eq-actions" style="display: flex; gap: 8px;">
                          <button class="tcc-btn-icon" (click)="editarEquipamento(eq)" title="Editar"><i class="pi pi-pencil"></i></button>
                          <button class="tcc-btn-icon text-red-500" (click)="removerEquipamento(eq)" title="Remover"><i class="pi pi-trash"></i></button>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <app-empty-state message="Nenhum equipamento cadastrado."></app-empty-state>
                }
                
                <div class="tcc-equip-form">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>{{ editandoEquipamentoId ? 'Editar Equipamento' : 'Adicionar Novo Equipamento' }}</h4>
                    @if (editandoEquipamentoId) {
                      <button class="tcc-btn-text" (click)="cancelarEdicaoEquipamento()" style="font-size: 12px;">Cancelar Edição</button>
                    }
                  </div>
                  <div class="tcc-equip-form-row">
                    <select [(ngModel)]="novoEquipamento.tipo" class="tcc-input">
                      <option value="Notebook">Notebook</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Impressora">Impressora</option>
                      <option value="Rede">Rede</option>
                      <option value="Outro">Outro</option>
                    </select>
                    <input type="text" [(ngModel)]="novoEquipamento.marca" placeholder="Marca" class="tcc-input">
                    <input type="text" [(ngModel)]="novoEquipamento.modelo" placeholder="Modelo" class="tcc-input">
                  </div>
                  <button class="tcc-btn-main tcc-btn-sm" (click)="salvarEquipamento()" [disabled]="salvandoEquipamento || !novoEquipamento.marca || !novoEquipamento.modelo">
                    @if(salvandoEquipamento){ <i class="pi pi-spin pi-spinner"></i> }
                    {{ editandoEquipamentoId ? 'Atualizar Equipamento' : 'Salvar Equipamento' }}
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="tcc-modal-footer">
            <button class="tcc-btn-danger-outline" (click)="confirmarDesvinculo(clienteDetalhes)">
              @if (clienteDetalhes.usuario_id) {
                <i class="pi pi-user-minus"></i> Desvincular da Minha Base
              } @else {
                <i class="pi pi-trash"></i> Excluir Cliente
              }
            </button>
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
            <h3 class="tcc-confirm-title">{{ clienteParaDesvincular.usuario_id ? 'Desvincular Cliente?' : 'Excluir Cliente?' }}</h3>
            <p class="tcc-confirm-text">
              Deseja remover <strong>{{ clienteParaDesvincular.nome_completo || clienteParaDesvincular.nome }}</strong> da sua base de clientes?
            </p>
            @if (clienteParaDesvincular.usuario_id) {
              <p class="tcc-confirm-subtext">
                O cliente continuará existindo normalmente no aplicativo e seus atendimentos anteriores não serão afetados.
              </p>
            } @else {
              <p class="tcc-confirm-subtext">
                Este cliente foi cadastrado manualmente por você. A exclusão removerá ele da sua lista permanentemente.
              </p>
            }
          </div>

          <div class="tcc-modal-footer">
            <button class="tcc-btn-outline" (click)="cancelarDesvinculo()" [disabled]="desvinculando">
              Cancelar
            </button>
            <button class="tcc-btn-danger" (click)="executarDesvinculo()" [disabled]="desvinculando">
              @if (desvinculando) {
                <i class="pi pi-spin pi-spinner"></i> Removendo...
              } @else {
                <i class="pi pi-user-minus"></i> {{ clienteParaDesvincular.usuario_id ? 'Confirmar Desvínculo' : 'Confirmar Exclusão' }}
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .tcc-client-list { 
      display: flex; 
      flex-direction: column; 
      gap: 16px; 
    }

    .tcc-client-card {
      background-color: var(--tcc-surface, #ffffff); 
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px; 
      display: flex;
      flex-direction: row; 
      align-items: center; 
      gap: 24px; 
      padding: 16px 24px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .tcc-client-card:hover { 
      border-color: var(--tcc-primary, #3b82f6); 
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
      transform: translateY(-1px);
    }
    .tcc-client-card.tcc-card-app-user {
      border-left: 4px solid var(--tcc-primary, #3b82f6);
    }

    .tcc-client-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background-color: var(--tcc-bg, #f1f5f9);
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    .tcc-client-icon-box.app-user {
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--tcc-primary, #3b82f6);
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
    }

    .tcc-client-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .tcc-client-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .tcc-client-name {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-client-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tcc-app-badge {
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--tcc-primary, #3b82f6);
      border: 1px solid rgba(59, 130, 246, 0.2);
      padding: 4px 8px;
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
      padding: 4px 8px;
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
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      color: var(--tcc-text-muted, #64748b);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .tcc-client-meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .tcc-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--tcc-text-secondary, #475569);
    }
    .tcc-meta-item i {
      color: var(--tcc-text-muted, #94a3b8);
      font-size: 14px;
    }
    .truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .tcc-client-right {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-shrink: 0;
    }

    .tcc-client-stats {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-right: 24px;
      border-right: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-mini-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      min-width: 60px;
    }
    .tcc-mini-stat .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
    }
    .tcc-mini-stat .stat-label {
      font-size: 11px;
      color: var(--tcc-text-muted, #64748b);
      font-weight: 500;
      text-transform: uppercase;
    }

    .tcc-rating-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 50px;
    }
    .tcc-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 700;
      color: #eab308;
      background: rgba(234, 179, 8, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
    }
    .tcc-rating.tcc-rating-empty {
      color: var(--tcc-text-muted, #94a3b8);
      background: transparent;
      font-weight: 500;
      padding: 0;
      i { color: var(--tcc-border, #cbd5e1); }
    }

    .tcc-client-actions {
      display: flex;
      align-items: center;
    }

    .tcc-btn-outline.small {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #cbd5e1);
      color: var(--tcc-text-main, #334155);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tcc-btn-outline.small:hover {
      background-color: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #0f172a);
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

    .tcc-modal-tabs {
      display: flex;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      padding: 0 24px;
      gap: 16px;
      background: var(--tcc-surface, #ffffff);
    }
    .tcc-tab-btn {
      background: none;
      border: none;
      padding: 12px 4px;
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tcc-tab-btn:hover { color: var(--tcc-text-main, #0f172a); }
    .tcc-tab-btn.active {
      color: var(--tcc-primary, #3b82f6);
      border-bottom-color: var(--tcc-primary, #3b82f6);
    }
    
    .tcc-equipamentos-section { display: flex; flex-direction: column; gap: 20px; }
    .tcc-equip-list { display: flex; flex-direction: column; gap: 12px; max-height: 250px; overflow-y: auto; padding-right: 4px; }
    .tcc-equip-card { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 8px; background: var(--tcc-bg, #f8fafc); }
    .eq-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(59, 130, 246, 0.1); color: var(--tcc-primary, #3b82f6); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;}
    .eq-info { display: flex; flex-direction: column; gap: 2px; }
    .eq-info h4 { margin: 0; font-size: 14px; color: var(--tcc-text-main, #0f172a); font-weight: 600; }
    .eq-info .eq-meta { font-size: 12px; color: var(--tcc-text-muted, #64748b); }
    
    .tcc-equip-form { padding-top: 16px; border-top: 1px solid var(--tcc-border, #e2e8f0); display: flex; flex-direction: column; gap: 12px; }
    .tcc-equip-form h4 { margin: 0; font-size: 14px; font-weight: 600; color: var(--tcc-text-main, #0f172a); }
    .tcc-equip-form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .tcc-equip-form .tcc-input { width: 100%; padding: 8px 12px; border: 1px solid var(--tcc-border, #cbd5e1); border-radius: 6px; font-size: 13px; font-family: inherit; background: var(--tcc-surface, #ffffff); color: var(--tcc-text-main, #0f172a); }
    .tcc-equip-form .tcc-input:focus { outline: none; border-color: var(--tcc-primary, #3b82f6); }
    .tcc-btn-sm { padding: 8px 16px; font-size: 13px; margin-left: auto; display: inline-flex; }
    .tcc-btn-icon { background: none; border: none; cursor: pointer; color: var(--tcc-text-muted, #64748b); padding: 4px; transition: color 0.2s; }
    .tcc-btn-icon:hover { color: var(--tcc-primary, #3b82f6); }
    .tcc-btn-icon.text-red-500:hover { color: #ef4444; }
    .tcc-btn-text { background: none; border: none; cursor: pointer; color: var(--tcc-primary, #3b82f6); padding: 0; transition: color 0.2s; }
    .tcc-btn-text:hover { text-decoration: underline; }

    .tcc-modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: calc(100vh - 200px);
      overflow-y: auto;
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
  private equipamentoService = inject(EquipamentoService);
  private messageService = inject(MessageService);

  menuItems: MenuItem[] = [];
  selectedCliente: Cliente | null = null;
  clienteDetalhes: Cliente | null = null;
  clienteParaDesvincular: Cliente | null = null;
  desvinculando = false;

  activeTab: 'detalhes' | 'equipamentos' = 'detalhes';
  equipamentos: Equipamento[] = [];
  carregandoEquipamentos = false;
  salvandoEquipamento = false;
  novoEquipamento: any = { tipo: 'Notebook', marca: '', modelo: '' };
  editandoEquipamentoId: string | null = null;

  openMenu(event: MouseEvent, menu: any, cliente: Cliente): void {
    event.stopPropagation();
    this.setMenuContext(cliente);
    menu.toggle(event);
  }

  setMenuContext(cliente: Cliente): void {
    this.selectedCliente = cliente;
    const items: MenuItem[] = [];
    
    if (!cliente.usuario_id) {
      items.push({
        label: 'Editar Cliente',
        icon: 'pi pi-pencil',
        command: () => {
          if (this.selectedCliente) {
            this.editarCliente(this.selectedCliente);
          }
        }
      });
      items.push({ separator: true });
    }

    items.push({
      label: cliente.usuario_id ? 'Desvincular da Base' : 'Excluir Cliente',
      icon: cliente.usuario_id ? 'pi pi-user-minus' : 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => {
        if (this.selectedCliente) {
          this.confirmarDesvinculo(this.selectedCliente);
        }
      }
    });

    this.menuItems = items;
  }

  verDetalhes(cliente: Cliente): void {
    this.clienteDetalhes = cliente;
    this.activeTab = 'detalhes';
    if (cliente.id) {
      this.carregarEquipamentos(cliente.id.toString());
    }
  }

  carregarEquipamentos(clienteId: string): void {
    this.carregandoEquipamentos = true;
    this.equipamentoService.getEquipamentosPorCliente(clienteId).subscribe({
      next: (eqs) => {
        this.equipamentos = eqs;
        this.carregandoEquipamentos = false;
      },
      error: (err) => {
        console.error('Erro ao buscar equipamentos:', err);
        this.equipamentos = [];
        this.carregandoEquipamentos = false;
      }
    });
  }

  editarEquipamento(eq: Equipamento): void {
    if (!eq.id) return;
    this.editandoEquipamentoId = eq.id.toString();
    this.novoEquipamento = {
      tipo: eq.tipo,
      marca: eq.marca,
      modelo: eq.modelo
    };
  }

  cancelarEdicaoEquipamento(): void {
    this.editandoEquipamentoId = null;
    this.novoEquipamento = { tipo: 'Notebook', marca: '', modelo: '' };
  }

  removerEquipamento(eq: Equipamento): void {
    if (!this.clienteDetalhes || !this.clienteDetalhes.id || !eq.id) return;
    if (confirm(`Tem certeza que deseja remover o equipamento ${eq.marca} ${eq.modelo}?`)) {
      this.equipamentoService.deleteEquipamento(this.clienteDetalhes.id.toString(), eq.id.toString()).subscribe({
        next: () => {
          this.equipamentos = this.equipamentos.filter(e => e.id !== eq.id);
          this.messageService.add({ severity: 'success', summary: 'Removido', detail: 'Equipamento removido com sucesso!' });
        },
        error: (err) => {
          console.error('Erro ao remover equipamento:', err);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível remover o equipamento.' });
        }
      });
    }
  }

  salvarEquipamento(): void {
    if (!this.clienteDetalhes || !this.clienteDetalhes.id) return;
    this.salvandoEquipamento = true;

    const payload: Equipamento = {
      clienteId: this.clienteDetalhes.id.toString(),
      tipo: this.novoEquipamento.tipo,
      marca: this.novoEquipamento.marca,
      modelo: this.novoEquipamento.modelo
    };

    if (this.editandoEquipamentoId) {
      this.equipamentoService.updateEquipamento(payload, payload.clienteId, this.editandoEquipamentoId).subscribe({
        next: (res) => {
          this.salvandoEquipamento = false;
          const idx = this.equipamentos.findIndex(e => e.id?.toString() === this.editandoEquipamentoId);
          if (idx !== -1) {
            this.equipamentos[idx] = res;
          }
          this.cancelarEdicaoEquipamento();
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Equipamento atualizado!' });
        },
        error: (err) => {
          console.error('Erro ao atualizar equipamento:', err);
          this.salvandoEquipamento = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar o equipamento.' });
        }
      });
    } else {
      this.equipamentoService.addEquipamento(payload, payload.clienteId).subscribe({
        next: (res) => {
          this.salvandoEquipamento = false;
          this.equipamentos.push(res);
          this.cancelarEdicaoEquipamento();
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Equipamento adicionado!' });
        },
        error: (err) => {
          console.error('Erro ao salvar equipamento:', err);
          this.salvandoEquipamento = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível adicionar o equipamento.' });
        }
      });
    }
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