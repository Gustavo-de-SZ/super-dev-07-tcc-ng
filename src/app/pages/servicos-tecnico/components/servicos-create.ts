import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// Imports do PrimeNG (v18+)
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { take } from 'rxjs/operators';

// Models e Services
import { Servico } from '../../../models/servico';
import { ServicoService } from '../../../services/servico.service';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { Equipamento } from '../../../models/equipamento';
import { EquipamentoService } from '../../../services/equipamento.service';
import { FinanceiroService } from '../../../services/financeiro.service';
import { AgendaService } from '../../../services/agenda.service';

@Component({
  selector: 'app-novo-servico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AutoCompleteModule,
    DatePickerModule,
    ToastModule,
    InputNumberModule
  ],
  
  template: `
    <div class="ns-page-container">
      <header class="ns-page-header">
        <a routerLink="/painel/servicos" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div>
          <h1>Novo Serviço</h1>
          <p>Registre um novo serviço para um cliente</p>
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
                    <i [class]="cat.icon"></i>
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
                placeholder="Descreva o serviço a ser realizado, sintomas e problema identificado..."
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
              <div class="ns-input-icon-wrapper">
                <i class="pi pi-search ns-icon-left"></i>
                <p-autoComplete
                    formControlName="cliente"
                    [suggestions]="clientesFiltrados"
                    (completeMethod)="filtrarCliente($event)"
                    (onSelect)="aoSelecionarCliente($event)"
                    optionLabel="nome_exibicao"
                    placeholder="Buscar cliente por nome ou empresa..."
                    [forceSelection]="true"
                    emptyMessage="Nenhum resultado encontrado"
                    appendTo="body"
                    class="ns-autocomplete"
                    inputStyleClass="ns-has-icon-left">
                  <ng-template let-cliente pTemplate="item">
                    <div class="ns-cliente-suggestion">
                      <div class="ns-cliente-avatar"><i class="pi pi-user"></i></div>
                      <div class="ns-cliente-info">
                        <span class="cliente-nome">{{ cliente.nome_completo || cliente.nome || 'Sem nome' }}</span>
                        <span class="cliente-empresa">{{ cliente.empresa || 'Sem empresa' }}</span>
                      </div>
                    </div>
                  </ng-template>
                  <ng-template pTemplate="empty">
                    <div class="p-3 text-sm text-slate-500 text-center">Nenhum resultado encontrado</div>
                  </ng-template>
                </p-autoComplete>
              </div>
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-box text-primary"></i> Equipamento
            </h2>

            <div class="ns-form-group">
              <label>Equipamento Vinculado</label>
              <div style="display: flex; gap: 8px;">

                <select
                  formControlName="equipamentoId"
                  class="ns-input"
                  style="flex: 1;"
                  >
                  <option [ngValue]="null" disabled selected>Selecione um equipamento...</option>
                  @for (eqp of equipamentosDoCliente; track trackByEquipamento($index, eqp)) {
                    <option [value]="eqp.id">
                      {{ eqp.tipo }} - {{ eqp.marca }} {{ eqp.modelo }} (S/N: {{ eqp.numeroSerie || 'N/A' }})
                    </option>
                  }
                </select>

                <button
                  type="button"
                  class="tcc-btn-outline"
                  (click)="abrirModalNovoEquipamento()"
                  style="white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; padding: 0 16px; border-radius: 8px; font-weight: 500; cursor: pointer;">
                  <i class="pi pi-plus"></i> Novo
                </button>
              </div>
              @if (!form.get('cliente')?.value) {
                <small style="color: var(--tcc-text-muted, #64748b); margin-top: 4px; display: block;">
                  Selecione um cliente primeiro para carregar o inventário, ou clique em "+ Novo" para cadastrar.
                </small>
              }
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
              </div>

              <div class="ns-form-group">
                <label for="duracao">Duração estimada</label>
                <div class="ns-input-icon-wrapper">
                  <i class="pi pi-clock ns-icon-left"></i>
                  <input id="duracao" type="text" formControlName="duracao" class="ns-input ns-has-icon-left" placeholder="Ex: 2h" />
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
                <span class="value">{{ form.get('cliente')?.value?.nome_exibicao || form.get('cliente')?.value?.nome_completo || form.get('cliente')?.value?.nome || form.get('cliente')?.value || '—' }}</span>
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
                <span class="value">{{ form.get('valor')?.value ? 'R$ ' + form.get('valor')?.value : '—' }}</span>
              </div>
            </div>

            <div class="ns-summary-status">
              <span>Status inicial</span>
              <span class="ns-badge-pending">Pendente</span>
            </div>

            <button type="button" class="tcc-btn-main" [disabled]="form.invalid || enviando" (click)="salvarServico()" style="display:flex; align-items:center; gap:8px;">
                @if(enviando) { <i class="pi pi-spin pi-spinner"></i> }
              Criar Serviço
            </button>
            <button type="button" routerLink="/painel/servicos" class="tcc-btn-cancel">
              Cancelar
            </button>
          </div>
        </aside>

      </div>
    </div>
    

    @if (mostrandoModalNovoEquipamento) {
      <div class="tcc-modal-overlay" (click)="mostrandoModalNovoEquipamento = false" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(6px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px;">
        <div class="tcc-modal" style="background: var(--tcc-surface, #ffffff); border-radius: 16px; width: 100%; max-width: 540px; padding: 28px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.25); border: 1px solid var(--tcc-border, #e2e8f0);" (click)="$event.stopPropagation()">
          <div class="tcc-modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--tcc-border, #e2e8f0); padding-bottom: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(59, 130, 246, 0.12); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                <i class="pi pi-box"></i>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; color: var(--tcc-text-main, #0f172a); font-weight: 700;">Novo Equipamento</h3>
                <p style="margin: 0; font-size: 0.825rem; color: var(--tcc-text-muted, #64748b);">Cadastre e vincule um equipamento para este serviço</p>
              </div>
            </div>
            <button type="button" class="tcc-close-btn" style="background: transparent; border: none; font-size: 1.1rem; cursor: pointer; color: var(--tcc-text-muted, #94a3b8); padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center;" (click)="mostrandoModalNovoEquipamento = false">
              <i class="pi pi-times"></i>
            </button>
          </div>
          
          <form [formGroup]="equipamentoForm" (ngSubmit)="salvarNovoEquipamento()">
            <div class="tcc-modal-body" style="display: flex; flex-direction: column; gap: 16px;">
              
              <div class="tcc-form-group">
                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--tcc-text-main, #334155); margin-bottom: 6px;">Cliente Vinculado</label>
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 10px;">
                  <div style="width: 36px; height: 36px; border-radius: 8px; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                    <i class="pi pi-user"></i>
                  </div>
                  <div style="display: flex; flex-direction: column; overflow: hidden;">
                    <span style="font-weight: 700; color: var(--tcc-text-main, #0f172a); font-size: 0.95rem;">{{ getSelectedClientName() }}</span>
                    <span style="font-size: 0.775rem; color: var(--tcc-text-muted, #64748b);">Equipamento será vinculado automaticamente a este cliente</span>
                  </div>
                </div>
              </div>

              <div class="tcc-form-group">
                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--tcc-text-main, #334155); margin-bottom: 6px;">Tipo de Equipamento *</label>
                <select formControlName="tipo" class="ns-input" style="width: 100%;">
                  <option value="Notebook">Notebook</option>
                  <option value="Desktop">Desktop / Computador</option>
                  <option value="Impressora">Impressora</option>
                  <option value="Servidor">Servidor</option>
                  <option value="Rede">Rede / Roteador / Switch</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              
              <div class="ns-form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="tcc-form-group">
                  <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--tcc-text-main, #334155); margin-bottom: 6px;">Marca *</label>
                  <input type="text" formControlName="marca" class="ns-input" placeholder="Ex: Dell, Samsung, Lenovo" style="width: 100%;" />
                </div>
                <div class="tcc-form-group">
                  <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--tcc-text-main, #334155); margin-bottom: 6px;">Modelo *</label>
                  <input type="text" formControlName="modelo" class="ns-input" placeholder="Ex: Inspiron 15, ThinkPad" style="width: 100%;" />
                </div>
              </div>
              
              <div class="tcc-form-group">
                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--tcc-text-main, #334155); margin-bottom: 6px;">Número de Série (opcional)</label>
                <input type="text" formControlName="numeroSerie" class="ns-input" placeholder="Ex: SN123456789" style="width: 100%;" />
              </div>
              
              <div class="tcc-form-group">
                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--tcc-text-main, #334155); margin-bottom: 6px;">Observações (opcional)</label>
                <textarea formControlName="observacoes" class="ns-input" rows="2" placeholder="Detalhes ou estado do equipamento..." style="width: 100%;"></textarea>
              </div>
            </div>
            
            <div class="tcc-modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--tcc-border, #e2e8f0);">
              <button type="button" class="tcc-btn-cancel" style="width: auto; padding: 8px 16px;" (click)="mostrandoModalNovoEquipamento = false">Cancelar</button>
              <button type="submit" class="tcc-btn-main" style="width: auto; margin-bottom: 0; padding: 8px 20px; display: inline-flex; align-items: center; gap: 6px;" [disabled]="equipamentoForm.invalid || salvandoEquipamento">
                @if (!salvandoEquipamento) {
                  <i class="pi pi-check"></i>
                } @else {
                  <i class="pi pi-spin pi-spinner"></i>
                }
                {{ salvandoEquipamento ? 'Salvando...' : 'Salvar Equipamento' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`

    .ns-page-container {
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      background-color: var(--bg-main, #f8fafc);
      --primary: #3b82f6;
      --primary-bg: #eff6ff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --border-input: #94a3b8;
      --bg-main: #f8fafc;
      --bg-card: #ffffff;
      --error: #ef4444;
      --error-bg: #fef2f2;
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
      /* Override tcc variables for components */
      --tcc-surface: var(--bg-card);
      --tcc-text-main: var(--text-main);
      --tcc-text-muted: var(--text-muted);
      --tcc-border: var(--border);
      --tcc-surface-hover: var(--bg-card);
    }

    .ns-page-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
    .ns-page-header h1 { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0; }
    .ns-page-header p { font-size: 14px; color: var(--text-muted); margin: 0; }

    .ns-back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s;
      border: 1px solid var(--border);
      background-color: var(--bg-card);
    }
    .ns-back-btn:hover {
      background-color: var(--primary-bg);
      color: var(--primary);
      border-color: var(--primary);
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
      box-shadow: var(--tcc-shadow, 0 1px 3px rgba(0,0,0,0.1));
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
      color: #3b82f6;
    }

    .ns-form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .ns-form-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--tcc-text-muted, #64748b);
    }

    .ns-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    ::ng-deep .ns-input,
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
      box-shadow: none !important;
      font-family: inherit !important;
      background-color: var(--tcc-surface, #ffffff) !important;
      color: var(--tcc-text-main, #0f172a) !important;
      border: 1px solid var(--tcc-border, #e2e8f0) !important;
      box-sizing: border-box !important;
    }

    ::ng-deep .ns-input::placeholder,
    ::ng-deep .ns-autocomplete input::placeholder,
    ::ng-deep .ns-autocomplete .p-autocomplete-input::placeholder,
    ::ng-deep .ns-datepicker input::placeholder,
    ::ng-deep .ns-datepicker .p-inputtext::placeholder {
      color: var(--tcc-text-muted, #94a3b8) !important;
      opacity: 0.7;
    }

    ::ng-deep .ns-input:focus,
    ::ng-deep .ns-autocomplete input:focus,
    ::ng-deep .ns-autocomplete .p-autocomplete-input:focus,
    ::ng-deep .ns-datepicker input:focus,
    ::ng-deep .ns-datepicker .p-inputtext:focus {
      border-color: #3b82f6 !important;
      outline: none !important;
      box-shadow: 0 0 0 1px #3b82f6 !important;
    }

    .ns-textarea {
      resize: vertical;
      min-height: 80px;
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
    }

    ::ng-deep .ns-has-icon-left,
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input {
      padding-left: 38px !important;
    }
    ::ng-deep .ns-has-prefix-left { padding-left: 38px !important; }
    ::ng-deep .ns-autocomplete,
    ::ng-deep .ns-autocomplete .p-autocomplete {
      width: 100% !important;
    }
    ::ng-deep .ns-datepicker,
    ::ng-deep .ns-datepicker.p-datepicker {
      width: 100% !important;
      display: inline-flex !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    /* Força o ícone nativo do datepicker a herdar a cor correta */
    ::ng-deep .ns-datepicker .p-datepicker-dropdown-icon,
    ::ng-deep .ns-datepicker .p-datepicker-input-icon {
      color: var(--tcc-text-muted) !important;
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
      border-color: var(--tcc-text-muted, #94a3b8);
    }

    .ns-category-card.ns-active {
      background: rgba(59, 130, 246, 0.15) !important;
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
    .ns-summary-item .value { font-weight: 500; text-align: right; color: var(--tcc-text-main, #0f172a); }

    .ns-summary-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      margin-bottom: 24px;
      color: var(--tcc-text-muted, #64748b);
    }

    .ns-badge-pending {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .tcc-btn-main {
      width: 100%; background: #3b82f6; color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-bottom: 12px;
    }
    .tcc-btn-main:hover:not(:disabled) { background: #2563eb; }
    .tcc-btn-main:disabled { opacity: 0.5; cursor: not-allowed; }
    .tcc-btn-cancel { width: 100%; background: transparent; border: none; color: var(--tcc-text-muted, #64748b); font-size: 13px; cursor: pointer; text-align: center; }
    .tcc-btn-cancel:hover { color: var(--tcc-text-main, #0f172a); }


    .ns-is-invalid label { color: #ef4444 !important; }
    .ns-is-invalid ::ng-deep .ns-input,
    .ns-is-invalid ::ng-deep .p-autocomplete-input,
    .ns-is-invalid ::ng-deep .p-inputtext {
      border-color: #ef4444 !important;
      background-color: rgba(239, 68, 68, 0.05) !important;
    }


    /* Fundo do painel do Datepicker e do Autocomplete */
    ::ng-deep body.tp-dark-theme .p-datepicker-panel,
    ::ng-deep body.tp-dark-theme .p-autocomplete-overlay,
    ::ng-deep body.tp-dark-theme .p-autocomplete-panel {
      background-color: var(--bg-card, #131c2c) !important;
      border: 1px solid var(--border, #223047) !important;
      color: var(--text-main, #f1f5f9) !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
    }

    /* Cabeçalho e calendário interno do Datepicker */
    ::ng-deep body.tp-dark-theme .p-datepicker-header {
      background-color: var(--bg-card, #131c2c) !important;
      border-bottom: 1px solid var(--border, #223047) !important;
      color: var(--text-main, #f1f5f9) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-title,
    ::ng-deep body.tp-dark-theme .p-datepicker-prev-icon,
    ::ng-deep body.tp-dark-theme .p-datepicker-next-icon {
      color: var(--text-main, #f1f5f9) !important;
    }

    /* Dias da semana e números do mês */
    ::ng-deep body.tp-dark-theme .p-datepicker-weekday {
      color: var(--text-muted, #94a3b8) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day {
      color: var(--text-main, #f1f5f9) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day:not(.p-datepicker-day-selected):hover {
      background-color: #1e293b !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day-selected {
      background-color: var(--primary, #3b82f6) !important;
      color: #ffffff !important;
    }

    /* Itens de sugestão do AutoComplete no Modo Escuro */
    ::ng-deep body.tp-dark-theme .p-autocomplete-option {
      color: var(--text-main, #f1f5f9) !important;
      background: transparent !important;
    }

    ::ng-deep body.tp-dark-theme .p-autocomplete-option:hover,
    ::ng-deep body.tp-dark-theme .p-autocomplete-option.p-focus {
      background-color: #1e293b !important;
    }

    .ns-cliente-suggestion { display: flex; align-items: center; gap: 12px; padding: 2px 0; }
    .ns-cliente-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--primary-bg, #e2e8f0);
      display: flex; align-items: center; justify-content: center;
      color: var(--tcc-text-muted, #64748b);
    }
    .ns-cliente-info { display: flex; flex-direction: column; }
    .ns-cliente-nome { font-size: 14px; font-weight: 500; color: var(--text-main, #0f172a); }
    .ns-cliente-empresa { font-size: 11px; color: var(--tcc-text-muted, #64748b); }
  `]
})
export class NovoServico implements OnInit {
  private fb = inject(FormBuilder);
  private servicoService = inject(ServicoService);
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private equipamentoService = inject(EquipamentoService);
  private financeiroService = inject(FinanceiroService);
  private agendaService = inject(AgendaService);
  private route = inject(ActivatedRoute);

  private fromAgendamentoId: string | number | null = null;

  form!: FormGroup;
  enviando = false;
  clientes: Cliente[] = [];
  clientesFiltrados: any[] = [];

  // Equipamento properties
  equipamentosDoCliente: Equipamento[] = [];
  mostrandoModalNovoEquipamento = false;
  salvandoEquipamento = false;
  equipamentoForm!: FormGroup;

  categorias = [
    { id: 'redes', label: 'Redes', icon: 'pi pi-wifi' },
    { id: 'hardware', label: 'Hardware', icon: 'pi pi-database' },
    { id: 'software', label: 'Software', icon: 'pi pi-desktop' },
    { id: 'seguranca', label: 'Segurança', icon: 'pi pi-shield' },
    { id: 'impressoras', label: 'Impressoras', icon: 'pi pi-print' },
    { id: 'outros', label: 'Outros', icon: 'pi pi-wrench' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.initEquipamentoForm();

    // Load clientes first, then handle query params
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes.map(cliente => {
          const nomeParaExibicao = (cliente as any).nome_completo
            || cliente.nome
            || '';
          return {
            ...cliente,
            nome_exibicao: nomeParaExibicao
          };
        });
        this.handleQueryParams();
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar clientes para autocompletar'
        });
        this.handleQueryParams();
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(4)]],
      categoria: ['redes', Validators.required],
      tipo_atendimento: ['Presencial', Validators.required],
      garantia: ['90 dias', Validators.required],
      descricao: [''],
      laudo_tecnico: [''],
      observacoes: [''],
      cliente: [null, Validators.required],
      data: [new Date(), Validators.required],
      duracao: [''],
      valor: [''],
      equipamentoId: [null]
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
      } else {
        this.equipamentosDoCliente = [];
        this.form.get('equipamentoId')?.setValue(null);
      }
    });
  }

  private initEquipamentoForm(): void {
    this.equipamentoForm = this.fb.group({
      tipo: ['Notebook', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      numeroSerie: [''],
      observacoes: ['']
    });
  }

  private handleQueryParams(): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['fromAgendamento']) {
        this.fromAgendamentoId = params['fromAgendamento'];
        this.messageService.add({
          severity: 'info',
          summary: 'Agendamento Convertido',
          detail: 'Preencha os detalhes finais (como equipamento e valor) para registrar o serviço.'
        });

        this.form.patchValue({
          titulo: params['titulo'] || '',
          duracao: params['duracao'] || this.form.get('duracao')?.value || '',
          status: 'Concluído'
        });

        if (params['tipo']) {
          const tipoNorm = String(params['tipo']).toLowerCase().includes('remoto') ? 'Remoto' : 'Presencial';
          this.form.patchValue({ tipo_atendimento: tipoNorm });
        }

        if (params['cliente']) {
          const clientParam = String(params['cliente']).trim();
          const clientNorm = this.normalizeText(clientParam);

          const foundClient = this.clientes.find(c => {
            const nomeExib = this.normalizeText((c as any).nome_exibicao || '');
            const nomeComp = this.normalizeText((c as any).nome_completo || '');
            const nomeSimples = this.normalizeText(c.nome || '');
            return (
              (nomeExib && (nomeExib === clientNorm || nomeExib.includes(clientNorm) || clientNorm.includes(nomeExib))) ||
              (nomeComp && (nomeComp === clientNorm || nomeComp.includes(clientNorm) || clientNorm.includes(nomeComp))) ||
              (nomeSimples && (nomeSimples === clientNorm || nomeSimples.includes(clientNorm) || clientNorm.includes(nomeSimples)))
            );
          });

          if (foundClient) {
            this.form.patchValue({
              cliente: foundClient
            });
            // Trigger the client selection to load equipment
            this.aoSelecionarCliente({ value: foundClient });
          } else {
            const fallbackClient = {
              nome: clientParam,
              nome_completo: clientParam,
              nome_exibicao: clientParam
            };
            this.form.patchValue({
              cliente: fallbackClient
            });
          }
        }
      }
    });
  }

  getClienteAtivo(): Cliente | null {
    const val = this.form.get('cliente')?.value;
    if (!val) return null;
    if (typeof val === 'object' && val.id) return val;

    const nameStr = typeof val === 'string' ? val : (val.nome_exibicao || val.nome_completo || val.nome || '');
    if (!nameStr) return null;

    const norm = this.normalizeText(nameStr);
    const found = this.clientes.find(c => {
      const nExib = this.normalizeText((c as any).nome_exibicao || '');
      const nComp = this.normalizeText((c as any).nome_completo || '');
      const nNome = this.normalizeText(c.nome || '');
      return (
        (nExib && (nExib === norm || nExib.includes(norm) || norm.includes(nExib))) ||
        (nComp && (nComp === norm || nComp.includes(norm) || norm.includes(nComp))) ||
        (nNome && (nNome === norm || nNome.includes(norm) || norm.includes(nNome)))
      );
    });

    if (found) {
      this.form.patchValue({ cliente: found }, { emitEvent: false });
      return found;
    }
    return null;
  }

  private normalizeText(str: string): string {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';
  }

  abrirModalNovoEquipamento(): void {
    const clienteAtivo = this.getClienteAtivo();
    if (!clienteAtivo || !clienteAtivo.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecione um Cliente',
        detail: 'Por favor, selecione um cliente no formulário antes de cadastrar um novo equipamento.'
      });
      this.form.get('cliente')?.markAsTouched();
      return;
    }

    this.equipamentoForm.reset({
      tipo: 'Notebook',
      marca: '',
      modelo: '',
      numeroSerie: '',
      observacoes: ''
    });
    this.mostrandoModalNovoEquipamento = true;
  }

  getSelectedClientName(): string {
    const c = this.getClienteAtivo() || this.form.get('cliente')?.value;
    if (!c) return 'Nenhum cliente selecionado';
    return c.nome_exibicao || c.nome_completo || c.nome || 'Cliente selecionado';
  }

  salvarNovoEquipamento(): void {
    if (this.salvandoEquipamento) return;

    if (this.equipamentoForm.valid) {
      const cliente = this.getClienteAtivo();
      const clienteId = cliente?.id ? String(cliente.id) : '';

      if (!clienteId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Selecione um cliente no formulário antes de cadastrar o equipamento.'
        });
        return;
      }

      this.salvandoEquipamento = true;
      const equipamento: Equipamento = {
        clienteId: clienteId,
        tipo: this.equipamentoForm.get('tipo')?.value || 'Outro',
        marca: this.equipamentoForm.get('marca')?.value || '',
        modelo: this.equipamentoForm.get('modelo')?.value || '',
        numeroSerie: this.equipamentoForm.get('numeroSerie')?.value || '',
        observacoes: this.equipamentoForm.get('observacoes')?.value || ''
      };

      this.equipamentoService.addEquipamento(equipamento, clienteId).subscribe({
        next: (response: any) => {
          this.salvandoEquipamento = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Equipamento cadastrado e vinculado com sucesso!'
          });
          this.mostrandoModalNovoEquipamento = false;

          // Reload equipment list for the client and select the newly created one
          this.equipamentoService.getEquipamentosPorCliente(clienteId).subscribe({
            next: (equipamentos) => {
              this.equipamentosDoCliente = equipamentos;
              if (response && response.id) {
                this.form.get('equipamentoId')?.setValue(response.id);
              } else if (equipamentos.length > 0) {
                this.form.get('equipamentoId')?.setValue(equipamentos[equipamentos.length - 1].id);
              }
            },
            error: (err) => console.error('Erro ao recarregar equipamentos', err)
          });
        },
        error: (err) => {
          this.salvandoEquipamento = false;
          console.error('Erro ao salvar equipamento', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao cadastrar o equipamento. Por favor, tente novamente.'
          });
        }
      });
    } else {
      this.equipamentoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos obrigatórios (Marca e Modelo).'
      });
    }
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

  formatarDataExibicao(data: any): string {
    if (!data) return '—';
    if (data instanceof Date) {
      if (isNaN(data.getTime())) return '—';
      const d = data.getDate().toString().padStart(2, '0');
      const m = (data.getMonth() + 1).toString().padStart(2, '0');
      const y = data.getFullYear();
      return `${d}/${m}/${y}`;
    }

    let str = String(data);
    if (str.toLowerCase().includes('invalid')) {
      return '—';
    }
    if (str.includes('/')) {
      return str;
    }
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
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const d = parsed.getDate().toString().padStart(2, '0');
      const m = (parsed.getMonth() + 1).toString().padStart(2, '0');
      const y = parsed.getFullYear();
      return `${d}/${m}/${y}`;
    }
    return str;
  }

  carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes.map(cliente => {
          // Use nome_completo if available, otherwise fall back to nome
          const nomeParaExibicao = (cliente as any).nome_completo
            || cliente.nome
            || '';
          return {
            ...cliente,
            nome_exibicao: nomeParaExibicao
          };
        });
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar clientes para autocompletar'
        });
      }
    });
  }

  filtrarCliente(event: any): void {
    const query = event.query ? event.query.toLowerCase() : '';

    // Filtra pelo nome_exibicao (mesmo campo usado para exibição)
    this.clientesFiltrados = this.clientes.filter(c =>
      (c as any).nome_exibicao.toLowerCase().includes(query)
    );
  }

  

  salvarServico(): void {
    if (this.enviando) return;
    this.enviando = true;
    if (this.form.valid) {
      // Map form values to Servico interface
      const formValue = this.form.value;

      // Map category ID to the exact string expected by the backend
      const categoriaMap = {
        redes: 'Redes',
        hardware: 'Hardware',
        software: 'Software',
        seguranca: 'Segurança',
        impressoras: 'Impressoras',
        outros: 'Outros'
      } as const;

      // Map category ID to icon
      const iconeMap = {
        redes: 'pi pi-wifi',
        hardware: 'pi pi-database',
        software: 'pi pi-desktop',
        seguranca: 'pi pi-shield',
        impressoras: 'pi pi-print',
        outros: 'pi pi-wrench'
      } as const;

      // Format date as YYYY-MM-DD (ISO format) for the API
      const dataSelecionada = formValue.data;
      let dataFormatada = '';
      if (dataSelecionada instanceof Date) {
        const y = dataSelecionada.getFullYear();
        const m = (dataSelecionada.getMonth() + 1).toString().padStart(2, '0');
        const d = dataSelecionada.getDate().toString().padStart(2, '0');
        dataFormatada = `${y}-${m}-${d}`;
      } else {
        dataFormatada = String(dataSelecionada || '');
      }

      const categoriaValue = categoriaMap[formValue.categoria as keyof typeof categoriaMap] || 'Redes';

      // Safe extraction of client name whether it's an object or string
      const clienteVal = formValue.cliente;
      let clienteNome = '';
      if (clienteVal && typeof clienteVal === 'object') {
        clienteNome = clienteVal.nome_exibicao || clienteVal.nome_completo || clienteVal.nome || '';
      } else if (clienteVal) {
        clienteNome = String(clienteVal);
      }

      // Parse valor into number supporting formats like "1.500,00", "1500,00", "1500"
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

      const servico: Servico = {
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
        equipamento_id: formValue.equipamentoId ? String(formValue.equipamentoId) : undefined,
        origem_agendamento_id: this.fromAgendamentoId ? this.fromAgendamentoId : undefined
      };

      // Call the service to save (backend orchestrates financeiro, agendamento and notifications atomically)
      this.servicoService.addServico(servico).subscribe({
        next: (response) => {
          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Serviço cadastrado com sucesso!'
          });
          // Reset form
          this.form.reset();
          this.enviando = false;
          // Navigate to services list page
          setTimeout(() => this.router.navigate(['/painel/servicos']), 1000);
        },
        error: (err) => {
          this.enviando = false;
          console.error('Erro ao salvar serviço', err);
          const detailMsg = typeof err?.error?.detail === 'string'
            ? err.error.detail
            : (Array.isArray(err?.error?.detail) ? err.error.detail.map((d: any) => d.msg || d.message).join(', ') : 'Ocorreu um erro ao cadastrar o serviço. Por favor, tente novamente.');
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao Salvar',
            detail: detailMsg
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
    }
  }

  // Helper method to get icon based on category
  private getCategoriaIcon(): string {
    const categoriaId = this.form.get('categoria')?.value;
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.icon : 'pi pi-wrench'; // Default to wrench icon
  }

  /**
   * Handles client selection from autocomplete
   * @param event The select event from p-autoComplete
   */
  aoSelecionarCliente(event: any): void {
    const clienteSelecionado = event.value;
    if (clienteSelecionado && clienteSelecionado.id) {
      this.equipamentoService.getEquipamentosPorCliente(clienteSelecionado.id)
        .subscribe({
          next: (equipamentos) => {
            this.equipamentosDoCliente = equipamentos;
            if (equipamentos && equipamentos.length > 0) {
              this.form.get('equipamentoId')?.setValue(equipamentos[0].id);
            } else {
              this.form.get('equipamentoId')?.setValue(null);
            }
          },
          error: (err) => {
            console.error('Erro ao buscar equipamentos', err);
            this.equipamentosDoCliente = [];
            this.form.get('equipamentoId')?.setValue(null);
          }
        });
    } else {
      this.equipamentosDoCliente = [];
      this.form.get('equipamentoId')?.setValue(null);
    }
  }

  /**
   * Track function for equipment items to handle cases where id might be empty/null
   * @param index The index of the item
   * @param item The equipment item
   * @returns A unique identifier for tracking
   */
  trackByEquipamento(index: number, item: Equipamento): any {
    // Prefer id if available, otherwise use index to ensure uniqueness
    return item.id || index;
  }
}