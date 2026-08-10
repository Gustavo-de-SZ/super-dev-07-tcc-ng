import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// Imports do PrimeNG (v18+)
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models e Services
import { Servico } from '../../../models/servico';
import { ServicoService } from '../../../services/servico.service';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { FinanceiroService } from '../../../services/financeiro.service';
import { Equipamento } from '../../../models/equipamento';
import { EquipamentoService } from '../../../services/equipamento.service';

@Component({
  selector: 'app-editar-servico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AutoCompleteModule,
    DatePickerModule,
    ToastModule
  ],
  template: `
    <div class="ns-page-container">
      <p-toast></p-toast>
  
      <header class="ns-page-header">
        <a routerLink="/painel/servicos" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div>
          <h1>Editar Serviço</h1>
          <p>Atualize as informações do serviço</p>
        </div>
      </header>

      <div class="ns-grid-layout" [formGroup]="form">
        <main class="ns-form-column">

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-file-edit text-primary"></i> Informação do Serviço
            </h2>

            <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('titulo')">
              <label for="titulo">Título do serviço *</label>
              <input
                id="titulo"
                type="text"
                formControlName="titulo"
                class="ns-input"
                placeholder="Ex: Formatação e reinstalação do Windows"
              />
              @if (isInvalid('titulo')) {
                <div class="ns-error-message">
                  O título é obrigatório e deve ter pelo menos 4 caracteres
                </div>
              }
            </div>

            <div class="ns-form-group">
              <label>Categoria *</label>
              <div class="ns-category-grid">
                @for (cat of categorias; track (cat.id || cat.label || $index)) {
                  <button
                    type="button"
                    class="ns-category-card"
                    [class.ns-active]="form.get('categoria')?.value === cat.id"
                    (click)="selecionarCategoria(cat.id)"
                  >
                    <i class="pi" [ngClass]="cat.icon"></i>
                    <span>{{ cat.label }}</span>
                  </button>
                }
              </div>
            </div>

            <div class="ns-form-group">
              <label>Modalidade de Atendimento *</label>
              <div class="ns-modalidade-grid">
                <button
                  type="button"
                  class="ns-modalidade-btn"
                  [class.ns-active]="form.get('tipo_atendimento')?.value === 'Presencial'"
                  (click)="form.get('tipo_atendimento')?.setValue('Presencial')"
                >
                  <i class="pi pi-map-marker"></i>
                  <div>
                    <strong>Presencial (No Local)</strong>
                    <small>Atendimento físico no local do cliente</small>
                  </div>
                </button>
                <button
                  type="button"
                  class="ns-modalidade-btn"
                  [class.ns-active]="form.get('tipo_atendimento')?.value === 'Remoto'"
                  (click)="form.get('tipo_atendimento')?.setValue('Remoto')"
                >
                  <i class="pi pi-globe"></i>
                  <div>
                    <strong>Remoto (Online)</strong>
                    <small>Suporte via acesso ou conexão remota</small>
                  </div>
                </button>
              </div>
            </div>

            <div class="ns-form-group">
              <label for="descricao">Descrição do Problema / Solicitação</label>
              <textarea
                id="descricao"
                formControlName="descricao"
                class="ns-input ns-textarea"
                rows="3"
                placeholder="Descreva o serviço detalhadamente..."
              ></textarea>
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-file-check text-primary"></i> Laudo Técnico & Observações
            </h2>

            <div class="ns-form-group">
              <label for="laudo_tecnico">Laudo Técnico / Diagnóstico & Solução</label>
              <textarea
                id="laudo_tecnico"
                formControlName="laudo_tecnico"
                class="ns-input ns-textarea"
                rows="3"
                placeholder="Ex: Identificado problema na fonte. Realizada troca, testes de estresse de 30min com 100% de estabilidade."
              ></textarea>
            </div>

            <div class="ns-form-group mb-0">
              <label for="observacoes">Recomendações / Observações Adicionais</label>
              <textarea
                id="observacoes"
                formControlName="observacoes"
                class="ns-input ns-textarea"
                rows="2"
                placeholder="Ex: Recomendado manter equipamento em local ventilado e limpeza periódica a cada 6 meses."
              ></textarea>
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-user text-primary"></i> Cliente
            </h2>

            <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('cliente')">
              <label>Cliente Vinculado *</label>
              <div class="ns-input-icon-wrapper">
                <i class="pi pi-search ns-icon-left"></i>
                <p-autoComplete
                  formControlName="cliente"
                  [suggestions]="clientesFiltrados"
                  (completeMethod)="filtrarCliente($event)"
                  optionLabel="nome_exibicao"
                  placeholder="Buscar cliente por nome ou empresa..."
                  emptyMessage="Nenhum resultado encontrado"
                  appendTo="body"
                  class="ns-autocomplete"
                  inputStyleClass="ns-has-icon-left"
                >
                  <ng-template let-cliente pTemplate="item">
                    <div class="ns-cliente-suggestion">
                      <div class="ns-cliente-avatar"><i class="pi pi-user"></i></div>
                      <div class="ns-cliente-info">
                        <span class="ns-cliente-nome">{{ cliente.nome_completo || cliente.nome || 'Sem nome' }}</span>
                        <span class="ns-cliente-empresa">{{ cliente.empresa || 'Sem empresa' }}</span>
                      </div>
                    </div>
                  </ng-template>
                  <ng-template pTemplate="empty">
                    <div class="p-3 text-sm text-slate-500 text-center">Nenhum resultado encontrado</div>
                  </ng-template>
                </p-autoComplete>
              </div>
              @if (isInvalid('cliente')) {
                <div class="ns-error-message">
                  A seleção de um cliente é obrigatória
                </div>
              }
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-box text-primary"></i> Equipamento
            </h2>

            <div class="ns-form-group">
              <label>Equipamento Vinculado</label>
              <select
                formControlName="equipamentoId"
                class="ns-input"
                style="width: 100%;"
              >
                <option [ngValue]="null">Nenhum equipamento vinculado</option>
                @for (eqp of equipamentosDoCliente; track eqp.id) {
                  <option [value]="eqp.id">
                    {{ eqp.tipo }} - {{ eqp.marca }} {{ eqp.modelo }} (S/N: {{ eqp.numeroSerie || 'N/A' }})
                  </option>
                }
              </select>
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-calendar text-primary"></i> Agendamento, Valores & Garantia
            </h2>

            <div class="ns-form-row">
              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('data')">
                <label>Data Prevista *</label>
                <p-datePicker
                  formControlName="data"
                  dateFormat="dd/mm/yy"
                  placeholder="dd/mm/yyyy"
                  [showIcon]="true"
                  iconDisplay="input"
                  appendTo="body"
                  class="ns-datepicker"
                ></p-datePicker>
                @if (isInvalid('data')) {
                  <div class="ns-error-message">
                    A data é obrigatória
                  </div>
                }
              </div>

              <div class="ns-form-group">
                <label for="duracao">Duração Estimada</label>
                <div class="ns-input-icon-wrapper">
                  <i class="pi pi-clock ns-icon-left"></i>
                  <input
                    id="duracao"
                    type="text"
                    formControlName="duracao"
                    class="ns-input ns-has-icon-left"
                    placeholder="Ex: 2h 30min"
                  />
                </div>
              </div>
            </div>

            <div class="ns-form-row">
              <div class="ns-form-group">
                <label for="valor">Valor do Serviço (R$)</label>
                <div class="ns-input-icon-wrapper">
                  <span class="ns-prefix-left">R$</span>
                  <input
                    id="valor"
                    type="text"
                    formControlName="valor"
                    class="ns-input ns-has-prefix-left"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div class="ns-form-group">
                <label for="garantia">Prazo de Garantia</label>
                <select id="garantia" formControlName="garantia" class="ns-input">
                  <option value="90 dias">90 dias (Padrão Legal CDC)</option>
                  <option value="30 dias">30 dias</option>
                  <option value="60 dias">60 dias</option>
                  <option value="180 dias">180 dias (6 meses)</option>
                  <option value="1 ano">1 ano (12 meses)</option>
                  <option value="Sem garantia">Sem garantia</option>
                </select>
              </div>
            </div>

            <div class="ns-form-row">
              <div class="ns-form-group">
                <label for="status">Status do Serviço</label>
                <select id="status" formControlName="status" class="ns-input">
                  <option value="Pendente">Pendente</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </section>

        </main>

        <aside class="ns-summary-column">
          <div class="ns-card ns-summary-card">
            <h3>Resumo</h3>

            <div class="ns-summary-list">
              <div class="ns-summary-item">
                <span class="label">Serviço</span>
                <span class="value">{{ form.get('titulo')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Categoria</span>
                <span class="value">{{ getCategoriaLabel() }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Modalidade</span>
                <span class="value" style="display: inline-flex; align-items: center; gap: 4px;">
                  <i class="pi" [ngClass]="form.get('tipo_atendimento')?.value === 'Remoto' ? 'pi-globe text-emerald-500' : 'pi-map-marker text-blue-500'"></i>
                  {{ form.get('tipo_atendimento')?.value || 'Presencial' }}
                </span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Cliente</span>
                <span class="value">{{ getClienteNomeExibicao() }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Data</span>
                <span class="value">{{ formatarDataExibicao(form.get('data')?.value) }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Duração</span>
                <span class="value">{{ form.get('duracao')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Garantia</span>
                <span class="value">{{ form.get('garantia')?.value || '90 dias' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Valor</span>
                <span class="value">{{ formatarValorExibicao(form.get('valor')?.value) }}</span>
              </div>
            </div>

            <div class="ns-summary-status">
              <span>Status</span>
              <span [class]="getBadgeClass(form.get('status')?.value)">
                {{ form.get('status')?.value || 'Pendente' }}
              </span>
            </div>

            <button
              type="button"
              class="tcc-btn-main"
              [disabled]="form.invalid || enviando"
              (click)="atualizarServico()"
            >
              @if (enviando) {
                <i class="pi pi-spin pi-spinner" style="margin-right: 6px;"></i>
              }
              Salvar Alterações
            </button>
            <button type="button" routerLink="/painel/servicos" class="tcc-btn-cancel">
              Cancelar
            </button>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .ns-page-container {
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      background-color: var(--tcc-bg, #f8fafc);
      transition: background-color 0.2s, color 0.2s;
    }

    ::ng-deep body.tp-dark-theme .ns-page-container {
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --border: #223047;
      --border-input: #334155;
      --bg-main: #090e17;
      --bg-card: #131c2c;
      --primary-bg: rgba(59, 130, 246, 0.15);
      --error-bg: rgba(239, 68, 68, 0.05);
      --tcc-surface: var(--bg-card);
      --tcc-text-main: var(--text-main);
      --tcc-text-muted: var(--text-muted);
      --tcc-border: var(--border);
      --tcc-surface-hover: var(--bg-card);
    }

    .ns-page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .ns-page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
    }

    .ns-page-header p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: var(--tcc-text-muted, #64748b);
    }

    .ns-back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-muted, #64748b);
      text-decoration: none;
      transition: all 0.2s;
    }
    .ns-back-btn:hover {
      background: var(--tcc-surface-hover, #f1f5f9);
      color: var(--tcc-text-main, #0f172a);
      border-color: #cbd5e1;
    }

    .ns-grid-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }

    .ns-form-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .ns-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      color: var(--tcc-text-main, #0f172a);
      transition: background-color 0.2s, border-color 0.2s;
    }

    .ns-card-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--tcc-text-main, #0f172a);
    }

    .text-primary {
      color: var(--tcc-primary, #3b82f6);
    }

    .ns-form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .ns-form-group:last-child {
      margin-bottom: 0;
    }

    .ns-form-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--tcc-text-muted, #64748b);
    }

    .ns-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .ns-form-row:last-child {
      margin-bottom: 0;
    }

    .ns-input {
      width: 100%;
      height: 44px;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 14px;
      transition: all 0.2s;
      font-family: inherit;
      background-color: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-main, #0f172a);
      border: 1px solid var(--tcc-border, #cbd5e1);
      box-sizing: border-box;
    }

    .ns-input:focus {
      border-color: #3b82f6;
      outline: none;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input,
    ::ng-deep .ns-datepicker input,
    ::ng-deep .ns-datepicker .p-inputtext {
      width: 100% !important;
      height: 44px !important;
      border-radius: 8px !important;
      padding: 10px 14px !important;
      font-size: 14px !important;
      transition: all 0.2s !important;
      font-family: inherit !important;
      background-color: var(--tcc-surface, #ffffff) !important;
      color: var(--tcc-text-main, #0f172a) !important;
      border: 1px solid var(--tcc-border, #cbd5e1) !important;
      box-sizing: border-box !important;
    }

    ::ng-deep .ns-autocomplete input:focus,
    ::ng-deep .ns-datepicker input:focus {
      border-color: #3b82f6 !important;
      outline: none !important;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
    }

    .ns-textarea {
      resize: vertical;
      min-height: 90px;
      height: auto;
    }

    .ns-input-icon-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
    }

    .ns-icon-left, .ns-prefix-left {
      position: absolute;
      left: 14px;
      color: var(--tcc-text-muted, #64748b);
      z-index: 2;
      pointer-events: none;
    }

    .ns-prefix-left {
      font-size: 14px;
      font-weight: 600;
    }

    ::ng-deep .ns-has-icon-left,
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input {
      padding-left: 38px !important;
    }
    .ns-has-prefix-left {
      padding-left: 38px !important;
    }

    ::ng-deep .ns-autocomplete,
    ::ng-deep .ns-autocomplete .p-autocomplete {
      width: 100% !important;
    }

    ::ng-deep .ns-datepicker,
    ::ng-deep .ns-datepicker.p-datepicker {
      width: 100% !important;
      display: inline-flex !important;
    }

    .ns-modalidade-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .ns-modalidade-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      background: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-main, #334155);
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
    }

    .ns-modalidade-btn i {
      font-size: 1.2rem;
      color: var(--tcc-text-muted, #64748b);
      padding: 8px;
      border-radius: 8px;
      background: rgba(148, 163, 184, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ns-modalidade-btn strong {
      display: block;
      font-size: 0.875rem;
      color: var(--tcc-text-main, #0f172a);
    }

    .ns-modalidade-btn small {
      display: block;
      font-size: 0.75rem;
      color: var(--tcc-text-muted, #64748b);
      line-height: 1.2;
    }

    .ns-modalidade-btn:hover {
      background: var(--tcc-surface-hover, #f8fafc);
      border-color: #3b82f6;
    }

    .ns-modalidade-btn.ns-active {
      border-color: #3b82f6 !important;
      background: rgba(59, 130, 246, 0.08) !important;
    }

    .ns-modalidade-btn.ns-active i {
      color: #3b82f6 !important;
      background: rgba(59, 130, 246, 0.18) !important;
    }

    .ns-category-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
    }

    .ns-category-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--tcc-text-main, #0f172a);
      transition: all 0.2s;
    }

    .ns-category-card i {
      font-size: 18px;
      color: var(--tcc-text-muted, #64748b);
    }

    .ns-category-card span { font-size: 12px; font-weight: 500; }

    .ns-category-card:hover {
      background: var(--tcc-surface-hover, #f1f5f9);
      border-color: #cbd5e1;
    }

    .ns-category-card.ns-active {
      background: rgba(59, 130, 246, 0.1) !important;
      border-color: #3b82f6 !important;
      color: #3b82f6 !important;
    }

    .ns-category-card.ns-active i { color: #3b82f6 !important; }

    .ns-summary-column { position: sticky; top: 24px; }
    .ns-summary-card h3 { font-size: 16px; font-weight: 600; margin: 0 0 20px 0; }

    .ns-summary-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      padding-bottom: 20px;
    }

    .ns-summary-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; font-size: 13px; }
    .ns-summary-item .label { color: var(--tcc-text-muted, #64748b); }
    .ns-summary-item .value { font-weight: 600; text-align: right; color: var(--tcc-text-main, #0f172a); }

    .ns-summary-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      margin-bottom: 24px;
      color: var(--tcc-text-muted, #64748b);
    }

    .badge-concluido {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-andamento {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-pendente {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-cancelado {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .tcc-btn-main {
      width: 100%; background: #3b82f6; color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-bottom: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .tcc-btn-main:hover:not(:disabled) { background: #2563eb; }
    .tcc-btn-main:disabled { opacity: 0.5; cursor: not-allowed; }
    .tcc-btn-cancel { width: 100%; background: transparent; border: none; color: var(--tcc-text-muted, #64748b); font-size: 13px; cursor: pointer; text-align: center; display: block; text-decoration: none; padding: 8px; }
    .tcc-btn-cancel:hover { color: var(--tcc-text-main, #0f172a); }

    .ns-is-invalid label { color: #ef4444 !important; }
    .ns-is-invalid .ns-input,
    .ns-is-invalid ::ng-deep .ns-autocomplete input,
    .ns-is-invalid ::ng-deep .ns-datepicker input {
      border-color: #ef4444 !important;
      background-color: rgba(239, 68, 68, 0.05) !important;
    }

    .ns-error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    /* Fundo do painel do Datepicker e do Autocomplete */
    ::ng-deep body.tp-dark-theme .p-datepicker-panel,
    ::ng-deep body.tp-dark-theme .p-autocomplete-overlay,
    ::ng-deep body.tp-dark-theme .p-autocomplete-panel {
      background-color: #131c2c !important;
      border: 1px solid #223047 !important;
      color: #f1f5f9 !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
    }

    /* Cabeçalho e calendário interno do Datepicker */
    ::ng-deep body.tp-dark-theme .p-datepicker-header {
      background-color: #131c2c !important;
      border-bottom: 1px solid #223047 !important;
      color: #f1f5f9 !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-title,
    ::ng-deep body.tp-dark-theme .p-datepicker-prev-icon,
    ::ng-deep body.tp-dark-theme .p-datepicker-next-icon {
      color: #f1f5f9 !important;
    }

    /* Dias da semana e números do mês */
    ::ng-deep body.tp-dark-theme .p-datepicker-weekday {
      color: #94a3b8 !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day {
      color: #f1f5f9 !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day:not(.p-datepicker-day-selected):hover {
      background-color: #1e293b !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day-selected {
      background-color: #3b82f6 !important;
      color: #ffffff !important;
    }

    /* Itens de sugestão do AutoComplete no Modo Escuro */
    ::ng-deep body.tp-dark-theme .p-autocomplete-option {
      color: #f1f5f9 !important;
      background: transparent !important;
    }

    ::ng-deep body.tp-dark-theme .p-autocomplete-option:hover,
    ::ng-deep body.tp-dark-theme .p-autocomplete-option.p-focus {
      background-color: #1e293b !important;
    }

    .ns-cliente-suggestion { display: flex; align-items: center; gap: 12px; padding: 2px 0; }
    .ns-cliente-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(59, 130, 246, 0.15);
      display: flex; align-items: center; justify-content: center;
      color: #3b82f6;
    }
    .ns-cliente-info { display: flex; flex-direction: column; }
    .ns-cliente-nome { font-size: 14px; font-weight: 500; color: var(--tcc-text-main, #0f172a); }
    .ns-cliente-empresa { font-size: 11px; color: var(--tcc-text-muted, #64748b); }

    @media (max-width: 900px) {
      .ns-grid-layout { grid-template-columns: 1fr; }
      .ns-category-grid { grid-template-columns: repeat(3, 1fr); }
      .ns-form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class EditarServico implements OnInit {
  private fb = inject(FormBuilder);
  private servicoService = inject(ServicoService);
  private clienteService = inject(ClienteService);
  private financeiroService = inject(FinanceiroService);
  private equipamentoService = inject(EquipamentoService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  enviando = false;
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  equipamentosDoCliente: Equipamento[] = [];
  servicoId!: string;
  servicoOriginal: Servico | null = null;

  categorias = [
    { id: 'redes', label: 'Redes', icon: 'pi pi-wifi' },
    { id: 'hardware', label: 'Hardware', icon: 'pi pi-database' },
    { id: 'software', label: 'Software', icon: 'pi pi-desktop' },
    { id: 'seguranca', label: 'Segurança', icon: 'pi pi-shield' },
    { id: 'impressoras', label: 'Impressoras', icon: 'pi pi-print' },
    { id: 'outros', label: 'Outros', icon: 'pi pi-wrench' }
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(4)]],
      categoria: ['redes', Validators.required],
      tipo_atendimento: ['Presencial', Validators.required],
      garantia: ['90 dias', Validators.required],
      descricao: [''],
      laudo_tecnico: [''],
      observacoes: [''],
      cliente: [null, Validators.required],
      equipamentoId: [null],
      data: [new Date(), Validators.required],
      duracao: [''],
      valor: [''],
      status: ['Pendente', Validators.required]
    });

    this.form.get('cliente')?.valueChanges.subscribe(val => {
      if (val && typeof val === 'object' && val.id) {
        this.equipamentoService.getEquipamentosPorCliente(String(val.id)).subscribe({
          next: (equipamentos) => {
            this.equipamentosDoCliente = equipamentos;
            if (equipamentos && equipamentos.length > 0 && !this.form.get('equipamentoId')?.value) {
              this.form.get('equipamentoId')?.setValue(equipamentos[0].id);
            }
          }
        });
      }
    });

    this.carregarClientes();

    this.route.paramMap.subscribe(params => {
      this.servicoId = params.get('id') || '';
      if (this.servicoId) {
        this.carregarServicoParaEdicao(this.servicoId);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  selecionarCategoria(id: string): void {
    this.form.get('categoria')?.setValue(id);
  }

  getCategoriaLabel(): string {
    const currentId = this.form.get('categoria')?.value;
    const cat = this.categorias.find(c => c.id === currentId);
    return cat ? cat.label : '—';
  }

  getClienteNomeExibicao(): string {
    const cli = this.form.get('cliente')?.value;
    if (!cli) return '—';
    if (typeof cli === 'string') return cli;
    return cli.nome_completo || cli.nome_exibicao || cli.nome || '—';
  }

  formatarValorExibicao(valor: any): string {
    if (!valor) return '—';
    const str = String(valor).trim();
    if (str.startsWith('R$')) return str;
    return `R$ ${str}`;
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Concluído': return 'badge-concluido';
      case 'Em Andamento': return 'badge-andamento';
      case 'Cancelado': return 'badge-cancelado';
      default: return 'badge-pendente';
    }
  }

  formatarDataExibicao(data: any): string {
    if (!data) return '—';
    if (data instanceof Date) {
      if (isNaN(data.getTime())) return '—';
      const d = data.getDate().toString().padStart(2, '0');
      const m = (data.getMonth() + 1).toString().padStart(2, '0');
      const y = data.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const str = String(data);
    if (str.toLowerCase().includes('invalid')) return '—';
    if (str.includes('/')) return str;
    if (str.includes('-')) {
      const partes = str.split('T')[0].split('-');
      if (partes.length === 3) {
        if (partes[0].length === 4) {
          return `${partes[2]}/${partes[1]}/${partes[0]}`;
        } else {
          return `${partes[0]}/${partes[1]}/${partes[2]}`;
        }
      }
    }
    return str;
  }

  carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes.map(cliente => ({
          ...cliente,
          nome_exibicao: (cliente as any).nome_completo || cliente.nome || ''
        }));
        // If service was already loaded, sync cliente object
        if (this.servicoOriginal && this.servicoOriginal.cliente) {
          const matched = this.findClienteByName(this.servicoOriginal.cliente);
          if (matched) {
            this.form.patchValue({ cliente: matched });
            if (matched.id) {
              this.equipamentoService.getEquipamentosPorCliente(String(matched.id)).subscribe({
                next: (eqps) => {
                  this.equipamentosDoCliente = eqps;
                }
              });
            }
          }
        }
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
      }
    });
  }

  filtrarCliente(event: any): void {
    const query = event.query ? event.query.toLowerCase() : '';
    this.clientesFiltrados = this.clientes.filter(c =>
      (c.nome_exibicao || '').toLowerCase().includes(query)
    );
  }

  carregarServicoParaEdicao(id: string): void {
    this.servicoService.getServicoById(id).subscribe({
      next: (servico) => {
        this.servicoOriginal = servico;
        const matchedCliente = this.findClienteByName(servico.cliente) || {
          nome: servico.cliente,
          nome_exibicao: servico.cliente
        };

        if (matchedCliente && matchedCliente.id) {
          this.equipamentoService.getEquipamentosPorCliente(String(matchedCliente.id)).subscribe({
            next: (eqps) => {
              this.equipamentosDoCliente = eqps;
            }
          });
        }

        let dataDate = new Date();
        if (servico.data) {
          if (typeof servico.data === 'string' && servico.data.includes('-')) {
            const parts = servico.data.split('T')[0].split('-');
            if (parts.length === 3) {
              dataDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            }
          } else {
            dataDate = new Date(servico.data);
          }
        }

        this.form.patchValue({
          titulo: servico.titulo,
          categoria: this.getCategoriaIdFromLabel(servico.categoria),
          tipo_atendimento: servico.tipo_atendimento || 'Presencial',
          garantia: servico.garantia || '90 dias',
          descricao: servico.descricao || '',
          laudo_tecnico: servico.laudo_tecnico || '',
          observacoes: servico.observacoes || '',
          cliente: matchedCliente,
          equipamentoId: servico.equipamento_id ? servico.equipamento_id : null,
          data: dataDate,
          duracao: servico.duracao || '',
          valor: (servico.valor !== null && servico.valor !== undefined && servico.valor !== '') ? String(servico.valor).replace('R$', '').trim() : '',
          status: servico.status || 'Pendente'
        });
      },
      error: (err) => {
        console.error('Erro ao carregar serviço para edição', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados do serviço.'
        });
        setTimeout(() => this.router.navigate(['/painel/servicos']), 1500);
      }
    });
  }

  private getCategoriaIdFromLabel(label: string): string {
    if (!label) return 'redes';
    const cat = this.categorias.find(c => c.label.toLowerCase() === label.toLowerCase() || c.id.toLowerCase() === label.toLowerCase());
    return cat ? cat.id : 'redes';
  }

  private findClienteByName(nome: string): any | null {
    if (!nome) return null;
    const clean = nome.trim().toLowerCase();
    return this.clientes.find(c =>
      (c.nome_exibicao || '').toLowerCase() === clean ||
      (c.nome_completo || '').toLowerCase() === clean ||
      (c.nome || '').toLowerCase() === clean
    ) || null;
  }

  atualizarServico(): void {
    if (this.form.valid) {
      this.enviando = true;
      const formValue = this.form.value;

      const categoriaMap = {
        redes: 'Redes',
        hardware: 'Hardware',
        software: 'Software',
        seguranca: 'Segurança',
        impressoras: 'Impressoras',
        outros: 'Outros'
      } as const;

      const iconeMap = {
        redes: 'pi-wifi',
        hardware: 'pi-database',
        software: 'pi-desktop',
        seguranca: 'pi-shield',
        impressoras: 'pi-print',
        outros: 'pi-wrench'
      } as const;

      const dataSelecionada = formValue.data;
      let dataFormatada = '';
      if (dataSelecionada instanceof Date) {
        const y = dataSelecionada.getFullYear();
        const m = (dataSelecionada.getMonth() + 1).toString().padStart(2, '0');
        const d = dataSelecionada.getDate().toString().padStart(2, '0');
        dataFormatada = `${y}-${m}-${d}`;
      } else {
        dataFormatada = String(dataSelecionada);
      }

      const categoriaValue = categoriaMap[formValue.categoria as keyof typeof categoriaMap] || 'Redes';
      const clienteVal = formValue.cliente;
      let clienteNome = '';
      if (clienteVal && typeof clienteVal === 'object') {
        clienteNome = clienteVal.nome_exibicao || clienteVal.nome_completo || clienteVal.nome || '';
      } else if (clienteVal) {
        clienteNome = String(clienteVal);
      }

      let rawValorNum = 0;
      if (formValue.valor !== null && formValue.valor !== undefined && formValue.valor !== '') {
        if (typeof formValue.valor === 'number') {
          rawValorNum = isNaN(formValue.valor) ? 0 : formValue.valor;
        } else {
          let str = String(formValue.valor).trim();
          if (str.includes(',') && str.includes('.')) {
            str = str.replace(/\./g, '').replace(',', '.');
          } else if (str.includes(',')) {
            str = str.replace(',', '.');
          }
          const cleaned = str.replace(/[^\d.-]/g, '');
          rawValorNum = parseFloat(cleaned) || 0;
        }
      }

      const servicoPayload: Servico = {
        id: this.servicoOriginal?.id,
        icone: iconeMap[formValue.categoria as keyof typeof iconeMap] || 'pi pi-wrench',
        categoria: categoriaValue,
        titulo: formValue.titulo || '',
        status: formValue.status || 'Pendente',
        cliente: clienteNome,
        data: dataFormatada || new Date().toISOString().split('T')[0],
        duracao: formValue.duracao || '1h',
        valor: rawValorNum as any,
        descricao: formValue.descricao || '',
        tipo_atendimento: formValue.tipo_atendimento || 'Presencial',
        garantia: formValue.garantia || '90 dias',
        laudo_tecnico: formValue.laudo_tecnico || '',
        observacoes: formValue.observacoes || '',
        equipamento_id: formValue.equipamentoId ? String(formValue.equipamentoId) : undefined
      };

      const identifierToUpdate = this.servicoId || (this.servicoOriginal?.id ? String(this.servicoOriginal.id) : this.servicoOriginal?.titulo || formValue.titulo);

      this.servicoService.updateServico(servicoPayload, identifierToUpdate).subscribe({
        next: (response) => {
          // Atualiza financeiro se valor existir
          if (rawValorNum > 0) {
            const transacao = {
              titulo: `Serviço: ${servicoPayload.titulo}`,
              cliente: servicoPayload.cliente,
              data: servicoPayload.data,
              valor: rawValorNum,
              status: servicoPayload.status === 'Concluído' ? 'Pago' as const : 'Pendente' as const
            };
            this.financeiroService.updateTransacao(transacao).subscribe({
              error: () => this.financeiroService.addTransacao(transacao).subscribe()
            });
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Serviço atualizado com sucesso!'
          });
          this.enviando = false;
          setTimeout(() => this.router.navigate(['/painel/servicos']), 1000);
        },
        error: (err) => {
          console.error('Erro ao atualizar serviço', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao atualizar o serviço. Verifique os dados.'
          });
          this.enviando = false;
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Formulário Inválido',
        detail: 'Por favor, preencha todos os campos obrigatórios.'
      });
    }
  }
}