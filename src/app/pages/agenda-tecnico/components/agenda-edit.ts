import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// PrimeNG Modules (v18+)
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models e Services
import { Agendamento, StatusAgendamento, TipoAgendamento } from '../../../models/agendamento';
import { AgendaService } from '../../../services/agenda.service';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';

interface TipoAtendimentoCard {
  label: string;
  icon: string;
  value: TipoAgendamento;
}

@Component({
  selector: 'app-editar-agendamento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SelectModule,
    AutoCompleteModule,
    DatePickerModule,
    ToastModule
  ],
  template: `
    <div class="ns-page-container">
      <p-toast></p-toast>
      
      <header class="ns-page-header">
        <a routerLink="/painel/agenda" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div>
          <h1>Editar Agendamento</h1>
          <p>Atualize as informações do compromisso</p>
        </div>
      </header>

      <div class="ns-grid-layout">
        <main class="ns-form-column">
          <form [formGroup]="form">

         
            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-info-circle text-primary"></i> Informações Básicas
              </h2>

              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('titulo')">
                <label for="titulo">Título do Agendamento *</label>
                <input
                  id="titulo"
                  type="text"
                  formControlName="titulo"
                  class="ns-input"
                  placeholder="Ex: Manutenção preventiva de servidores"
                />
                @if (hasError('titulo', 'required')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Título é obrigatório</span>
                } @else if (hasError('titulo', 'minlength')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Mínimo de 3 caracteres</span>
                }
              </div>

              <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('cliente')">
                <label>Cliente vinculado *</label>
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
                @if (hasError('cliente', 'required')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Cliente é obrigatório</span>
                }
              </div>
            </section>

       
            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-calendar-clock text-primary"></i> Horário e Data
              </h2>

              <div class="ns-form-row-3">
                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('data')">
                  <label for="data">Data *</label>
                  <p-datePicker
                    id="data"
                    formControlName="data"
                    dateFormat="dd/mm/yy"
                    placeholder="dd/mm/yyyy"
                    [showIcon]="true"
                    iconDisplay="input"
                    appendTo="body"
                    class="ns-datepicker"
                  ></p-datePicker>
                  @if (hasError('data', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                  }
                </div>

                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('hora')">
                  <label for="hora">Hora *</label>
                  <div class="ns-input-icon-wrapper">
                    <i class="pi pi-clock ns-icon-left"></i>
                    <input
                      id="hora"
                      type="text"
                      formControlName="hora"
                      class="ns-input ns-has-icon-left"
                      placeholder="00:00"
                      (input)="formatarHora($event)"
                    />
                  </div>
                  @if (hasError('hora', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                  }
                </div>

                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('duracao')">
                  <label for="duracao">Duração Estimada *</label>
                  <div class="ns-input-icon-wrapper">
                    <i class="pi pi-clock ns-icon-left"></i>
                    <input
                      id="duracao"
                      type="text"
                      formControlName="duracao"
                      class="ns-input ns-has-icon-left"
                      placeholder="Ex: 2h"
                    />
                  </div>
                  @if (hasError('duracao', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                  }
                </div>
              </div>
            </section>

            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-briefcase text-primary"></i> Detalhes do Atendimento
              </h2>

              <div class="ns-form-group">
                <label>Modalidade de Atendimento *</label>
                <div class="ns-modalidade-grid">
                  <button
                    type="button"
                    class="ns-modalidade-btn"
                    [class.ns-active]="form.get('tipoAtendimento')?.value === 'Presencial'"
                    (click)="selecionarTipo('Presencial')"
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
                    [class.ns-active]="form.get('tipoAtendimento')?.value === 'Remoto'"
                    (click)="selecionarTipo('Remoto')"
                  >
                    <i class="pi pi-globe"></i>
                    <div>
                      <strong>Remoto (Online)</strong>
                      <small>Suporte via acesso ou conexão remota</small>
                    </div>
                  </button>
                </div>
              </div>

              <div class="ns-form-group mb-0" style="margin-top: 16px;">
                <label>Status *</label>
                <p-select
                  formControlName="status"
                  [options]="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecione o status..."
                  appendTo="body"
                  class="ns-select w-full"
                ></p-select>
              </div>
            </section>

          
            <section class="ns-card">
              <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('observacoes')">
                <label for="observacoes">Observações adicionais (opcional)</label>
                <textarea
                  id="observacoes"
                  formControlName="observacoes"
                  rows="3"
                  placeholder="Instruções de acesso, detalhes específicos, etc."
                  class="ns-input ns-textarea"
                ></textarea>
                @if (hasError('observacoes', 'maxlength')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Máximo 255 caracteres</span>
                }
              </div>
            </section>

          </form>
        </main>

      
        <aside class="ns-summary-column">
          <div class="ns-card ns-summary-card">
            <h3>Resumo do Agendamento</h3>

            <div class="ns-summary-list">
              <div class="ns-summary-item">
                <span class="label">Título</span>
                <span class="value ns-truncate" [title]="form.get('titulo')?.value">
                  {{ form.get('titulo')?.value || '—' }}
                </span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Cliente</span>
                <span class="value ns-truncate" [title]="getNomeCliente()">
                  {{ getNomeCliente() }}
                </span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Data</span>
                <span class="value">{{ formatarDataExibicao() }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Horário</span>
                <span class="value">{{ form.get('hora')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Duração</span>
                <span class="value">{{ form.get('duracao')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Modalidade</span>
                <span class="value" style="display: flex; align-items: center; gap: 6px; justify-content: flex-end;">
                  <i class="pi" [ngClass]="form.get('tipoAtendimento')?.value === 'Remoto' ? 'pi-globe text-emerald-500' : 'pi-map-marker text-blue-500'"></i>
                  {{ form.get('tipoAtendimento')?.value || 'Presencial' }}
                </span>
              </div>
            </div>

            <div class="ns-summary-divider"></div>

            <div class="ns-summary-status">
              <span>Status</span>
              <span class="ns-badge" [ngClass]="getBadgeClass(form.get('status')?.value)">
                {{ form.get('status')?.value || 'Pendente' }}
              </span>
            </div>

            <div class="ns-summary-actions">
              <button
                type="button"
                class="tcc-btn-main"
                [disabled]="form.invalid || enviando"
                (click)="atualizarAgendamento()"
              >
                @if (enviando) {
                  <i class="pi pi-spin pi-spinner" style="margin-right: 6px;"></i>
                }
                Salvar Alterações
              </button>
              <button type="button" routerLink="/painel/agenda" class="tcc-btn-cancel">
                Cancelar
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .ns-page-container {
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

      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, sans-serif;
      background-color: var(--bg-main);
      min-height: 100vh;
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

    .ns-page-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
    .ns-page-header h1 { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0; }
    .ns-page-header p { font-size: 14px; color: var(--text-muted); margin: 0; }

    .ns-back-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 50%;
      color: var(--text-muted); text-decoration: none; transition: background 0.2s; margin-top: 2px;
    }
    .ns-back-btn:hover { background: var(--border); color: var(--text-main); }

    .ns-grid-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
    @media (max-width: 1024px) { .ns-grid-layout { grid-template-columns: 1fr; } }
    .ns-form-column { display: flex; flex-direction: column; gap: 20px; }

    .ns-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      color: var(--text-main);
      transition: all 0.2s;
    }
    .ns-card-title { font-size: 16px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px; }
    .text-primary { color: var(--primary); }

    .ns-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .ns-form-group.mb-0 { margin-bottom: 0; }
    .ns-form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }

    .ns-form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .ns-form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .ns-form-row-2, .ns-form-row-3 { grid-template-columns: 1fr; } }

    ::ng-deep .ns-input, 
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input,
    ::ng-deep .ns-datepicker input,
    ::ng-deep .ns-datepicker .p-inputtext,
    ::ng-deep .ns-select {
      width: 100% !important; 
      height: 44px !important;
      border-radius: 8px !important; 
      padding: 10px 14px !important; 
      font-size: 14px !important; 
      transition: all 0.2s !important; 
      box-shadow: none !important; 
      font-family: inherit !important;
      background-color: var(--bg-card) !important; 
      color: var(--text-main) !important; 
      border: 1px solid var(--border-input) !important; 
      box-sizing: border-box !important;
    }
    ::ng-deep .ns-select { padding: 0 !important; }
    ::ng-deep .ns-select .p-select-label { color: var(--text-main); padding: 10px 14px; font-family: inherit; font-size: 14px; }
    ::ng-deep .ns-select .p-select-dropdown { color: var(--text-muted); }

    ::ng-deep .ns-input::placeholder,
    ::ng-deep .ns-autocomplete input::placeholder,
    ::ng-deep .ns-autocomplete .p-autocomplete-input::placeholder,
    ::ng-deep .ns-datepicker .p-inputtext::placeholder {
      color: var(--text-muted) !important; opacity: 0.7;
    }
    
    ::ng-deep .ns-input:focus, 
    ::ng-deep .ns-autocomplete input:focus,
    ::ng-deep .ns-autocomplete .p-autocomplete-input:focus,
    ::ng-deep .ns-datepicker .p-inputtext:focus,
    ::ng-deep .ns-select:not(.p-disabled).p-focus {
      border-color: var(--primary) !important; outline: none; box-shadow: 0 0 0 1px var(--primary) !important;
    }
    .ns-textarea { resize: vertical; min-height: 80px; }

    .ns-input-icon-wrapper { position: relative; width: 100%; display: flex; align-items: center; }
    .ns-icon-left { position: absolute; left: 14px; color: var(--text-muted); z-index: 2; pointer-events: none; }
    ::ng-deep .ns-has-icon-left,
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input {
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
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
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
      border: 1px solid var(--border-input, #e2e8f0);
      background: var(--bg-card, #ffffff);
      color: var(--text-main, #334155);
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .ns-modalidade-btn i {
      font-size: 1.2rem;
      color: var(--text-muted, #64748b);
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
      color: var(--text-main, #0f172a);
    }

    .ns-modalidade-btn small {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
      line-height: 1.2;
    }

    .ns-modalidade-btn:hover {
      background: var(--bg-main, #f8fafc);
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

    .ns-error-text { color: var(--error); font-size: 12px; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
    .ns-is-invalid label { color: var(--error) !important; }
    .ns-is-invalid ::ng-deep .ns-input, 
    .ns-is-invalid ::ng-deep .ns-autocomplete input,
    .ns-is-invalid ::ng-deep .ns-autocomplete .p-autocomplete-input,
    .ns-is-invalid ::ng-deep .p-inputtext {
      border-color: var(--error) !important;
      background-color: var(--error-bg) !important;
    }

    ::ng-deep .ns-datepicker .p-datepicker-dropdown-icon,
    ::ng-deep .ns-datepicker .p-datepicker-input-icon {
      color: var(--text-muted) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-panel,
    ::ng-deep body.tp-dark-theme .p-autocomplete-overlay,
    ::ng-deep body.tp-dark-theme .p-autocomplete-panel,
    ::ng-deep body.tp-dark-theme .p-select-panel {
      background-color: var(--bg-card) !important;
      border: 1px solid var(--border) !important;
      color: var(--text-main) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-header {
      background-color: var(--bg-card) !important;
      border-bottom: 1px solid var(--border) !important;
      color: var(--text-main) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-title,
    ::ng-deep body.tp-dark-theme .p-datepicker-prev-icon,
    ::ng-deep body.tp-dark-theme .p-datepicker-next-icon {
      color: var(--text-main) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-weekday { color: var(--text-muted) !important; }
    ::ng-deep body.tp-dark-theme .p-datepicker-day { color: var(--text-main) !important; }
    ::ng-deep body.tp-dark-theme .p-datepicker-day:not(.p-datepicker-day-selected):hover { background-color: #1e293b !important; }
    ::ng-deep body.tp-dark-theme .p-datepicker-day-selected { background-color: var(--primary) !important; color: #ffffff !important; }

    ::ng-deep body.tp-dark-theme .p-autocomplete-option,
    ::ng-deep body.tp-dark-theme .p-select-option {
      color: var(--text-main) !important;
      background: transparent !important;
    }
    ::ng-deep body.tp-dark-theme .p-autocomplete-option:hover,
    ::ng-deep body.tp-dark-theme .p-autocomplete-option.p-focus,
    ::ng-deep body.tp-dark-theme .p-select-option:hover,
    ::ng-deep body.tp-dark-theme .p-select-option.p-focus {
      background-color: var(--border) !important;
    }

    .ns-cliente-suggestion { display: flex; align-items: center; gap: 12px; padding: 2px 0; }
    .ns-cliente-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
    .ns-cliente-info { display: flex; flex-direction: column; }
    .ns-cliente-nome { font-size: 14px; font-weight: 500; color: var(--text-main); }
    .ns-cliente-empresa { font-size: 11px; color: var(--text-muted); }

    .ns-summary-column { position: sticky; top: 24px; }
    .ns-summary-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 20px 0; }
    
    .ns-summary-list { display: flex; flex-direction: column; gap: 14px; }
    .ns-summary-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; gap: 16px; }
    .ns-summary-item .label { color: var(--text-muted); font-weight: 500; white-space: nowrap; }
    .ns-summary-item .value { font-weight: 500; text-align: right; color: var(--text-main); }
    .ns-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
    
    .ns-summary-divider { height: 1px; background-color: var(--border); margin: 20px 0; }
    
    .ns-summary-status { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-muted); }
    .ns-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .ns-badge-pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .ns-badge-confirmed { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .ns-badge-done { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .ns-badge-cancelled { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    .ns-summary-actions { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
    .tcc-btn-main {
      width: 100%; background: var(--primary); color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .tcc-btn-main:hover:not(:disabled) { background: #2563eb; }
    .tcc-btn-main:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .tcc-btn-cancel {
      width: 100%; background: transparent; border: none; color: var(--text-muted);
      font-size: 13px; font-weight: 500; cursor: pointer; text-align: center; text-decoration: none;
      padding: 8px; display: block;
    }
    .tcc-btn-cancel:hover { color: var(--text-main); }
  `]
})
export class EditarAgendamento implements OnInit {
  private fb = inject(FormBuilder);
  private agendaService = inject(AgendaService);
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  enviando = false;
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  agendamentoId!: string;
  originalAgendamento: Agendamento | null = null;

  tiposAtendimento: TipoAtendimentoCard[] = [
    { label: 'Presencial', icon: 'pi pi-building', value: 'Presencial' },
    { label: 'Remoto', icon: 'pi pi-desktop', value: 'Remoto' }
  ];

  statusOptions = [
    { label: 'Confirmado', value: 'Confirmado' },
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Concluído', value: 'Concluído' },
    { label: 'Cancelado', value: 'Cancelado' }
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      cliente: [null, Validators.required],
      data: [new Date(), Validators.required],
      hora: ['', Validators.required],
      duracao: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      tipoAtendimento: ['Presencial', Validators.required],
      status: ['Pendente', Validators.required],
      observacoes: ['', Validators.maxLength(255)]
    });

    this.carregarClientes();

    this.route.paramMap.subscribe(params => {
      this.agendamentoId = params.get('id') || '';
      if (this.agendamentoId) {
        this.carregarAgendamentoParaEdicao(this.agendamentoId);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched));
  }

  selecionarTipo(valor: TipoAgendamento): void {
    this.form.get('tipoAtendimento')?.setValue(valor);
  }

  formatarHora(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{1,2})/, '$1:$2');
    }
    
    event.target.value = value;
    this.form.get('hora')?.setValue(value);
  }

  getNomeCliente(): string {
    const cliente = this.form.get('cliente')?.value;
    if (!cliente) return '—';
    if (typeof cliente === 'object') {
      return (cliente as any).nome_exibicao || (cliente as any).nome_completo || (cliente as any).nome || '—';
    }
    return String(cliente);
  }

  formatarDataExibicao(): string {
    const data = this.form.get('data')?.value;
    if (!data) return '—';
    
    if (data instanceof Date) {
      if (isNaN(data.getTime())) return '—';
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

    const str = String(data);
    if (str.includes('-')) {
      const partes = str.split('T')[0].split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
    }
    return str;
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Confirmado': return 'ns-badge-confirmed';
      case 'Concluído': return 'ns-badge-done';
      case 'Cancelado': return 'ns-badge-cancelled';
      default: return 'ns-badge-pending';
    }
  }

  carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes.map(cliente => ({
          ...cliente,
          nome_exibicao: (cliente as any).nome_completo || cliente.nome || ''
        }));

        // Se o agendamento já tiver sido carregado, sincroniza com o objeto do cliente
        if (this.originalAgendamento && this.originalAgendamento.cliente) {
          const matched = this.findClienteByName(this.originalAgendamento.cliente);
          if (matched) {
            this.form.patchValue({ cliente: matched });
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
      (c.nome_exibicao || c.nome || '').toLowerCase().includes(query)
    );
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

  carregarAgendamentoParaEdicao(id: string): void {
    this.agendaService.getAgendamentos().subscribe({
      next: (agendamentos: Agendamento[]) => {
        const agendamento = agendamentos.find(a => String(a.id) === String(id));
        if (agendamento) {
          this.originalAgendamento = agendamento;

          const clienteNome = agendamento.cliente || '';
          const matchedCliente = this.findClienteByName(clienteNome) || {
            nome: clienteNome,
            nome_completo: clienteNome,
            nome_exibicao: clienteNome
          };

          let dataObj: Date | null = null;
          if (agendamento.dia) {
            if (agendamento.dia.includes('-')) {
              dataObj = new Date(agendamento.dia + 'T12:00:00');
            } else if (agendamento.mes) {
              let mesStr = agendamento.mes.trim();
              if (mesStr.endsWith('.')) {
                mesStr = mesStr.slice(0, -1);
              }
              const ptToEn: Record<string, string> = {
                'janeiro': 'January', 'fevereiro': 'February', 'março': 'March', 'abril': 'April',
                'maio': 'May', 'junho': 'June', 'julho': 'July', 'agosto': 'August',
                'setembro': 'September', 'outubro': 'October', 'novembro': 'November', 'dezembro': 'December',
                'jan': 'Jan', 'fev': 'Feb', 'mar': 'Mar', 'abr': 'Apr', 'mai': 'May', 'jun': 'Jun',
                'jul': 'Jul', 'ago': 'Aug', 'set': 'Sep', 'out': 'Oct', 'nov': 'Nov', 'dez': 'Dec'
              };
              const enMonth = ptToEn[mesStr.toLowerCase()] || mesStr;
              const currentYear = new Date().getFullYear();
              dataObj = new Date(`${enMonth} ${agendamento.dia}, ${currentYear}`);
            }
          }

          if (!dataObj || isNaN(dataObj.getTime())) {
            dataObj = new Date();
          }

          this.form.patchValue({
            titulo: agendamento.titulo || '',
            tipoAtendimento: (agendamento.tipo as TipoAgendamento) || 'Presencial',
            cliente: matchedCliente,
            data: dataObj,
            hora: agendamento.hora || '',
            duracao: agendamento.duracao || '',
            status: agendamento.status || 'Pendente',
            observacoes: (agendamento as any).observacoes || ''
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Agendamento não encontrado'
          });
          setTimeout(() => this.router.navigate(['/painel/agenda']), 1200);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados do agendamento', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar o agendamento'
        });
        setTimeout(() => this.router.navigate(['/painel/agenda']), 1200);
      }
    });
  }

  atualizarAgendamento(): void {
    if (this.form.valid) {
      this.enviando = true;
      const formValue = this.form.getRawValue();

      const clienteVal = formValue.cliente;
      const clienteNomeStr = typeof clienteVal === 'object' && clienteVal !== null
        ? (clienteVal.nome_exibicao || clienteVal.nome_completo || clienteVal.nome || '')
        : String(clienteVal || '');

      const dataSelecionada = formValue.data;
      let diaStr = '15';
      let mesStr = 'Julho';

      if (dataSelecionada instanceof Date && !isNaN(dataSelecionada.getTime())) {
        diaStr = String(dataSelecionada.getDate()).padStart(2, '0');
        const meses = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        mesStr = meses[dataSelecionada.getMonth()];
      } else if (dataSelecionada) {
        const partes = String(dataSelecionada).split('-');
        if (partes.length === 3) {
          diaStr = partes[2];
          const mNum = parseInt(partes[1], 10);
          const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          if (mNum >= 1 && mNum <= 12) {
            mesStr = meses[mNum - 1];
          }
        }
      }

      const agendamento: Agendamento = {
        ...this.originalAgendamento,
        id: this.agendamentoId,
        titulo: formValue.titulo,
        tipo: formValue.tipoAtendimento as TipoAgendamento,
        cliente: clienteNomeStr,
        empresa: this.originalAgendamento?.empresa || '',
        servico: this.originalAgendamento?.servico || '',
        mes: mesStr,
        dia: diaStr,
        hora: formValue.hora,
        duracao: formValue.duracao,
        status: formValue.status as StatusAgendamento
      };

      this.agendaService.updateAgendamento(agendamento).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Agendamento atualizado com sucesso!'
          });
          this.enviando = false;
          setTimeout(() => this.router.navigate(['/painel/agenda']), 1000);
        },
        error: (err) => {
          console.error('Erro ao atualizar agendamento', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao atualizar o agendamento.'
          });
          this.enviando = false;
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
    }
  }
}