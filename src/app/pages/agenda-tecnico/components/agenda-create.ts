import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-novo-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">

      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <a class="tcc-back-link" routerLink="/painel/agenda">
            <i class="pi pi-arrow-left"></i> Voltar para Agenda
          </a>
          <h1 class="tcc-title-lg">Novo Agendamento</h1>
          <p class="tcc-subtitle">Preencha os dados para marcar um novo compromisso</p>
        </div>
      </header>

      <div class="tcc-form-card">
        <form>
          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Título do Agendamento</label>
              <input type="text" class="tcc-input" placeholder="Ex: Manutenção Preventiva">
            </div>
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Cliente</label>
              <select class="tcc-input" [(ngModel)]="selectedClienteId">
                <option value="" disabled selected>Selecione um cliente...</option>
                <option *ngFor="let cliente of clientes" [value]="cliente.email">
                  {{ cliente.nome }} ({{ cliente.empresa }})
                </option>
              </select>
              <div *ngIf="clientesLoading" class="tcc-loading-text">Carregando clientes...</div>
              <div *ngIf="clientesError" class="tcc-error-text">Erro ao carregar clientes</div>
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label">Data</label>
              <input type="date" class="tcc-input">
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label">Hora</label>
              <input type="time" class="tcc-input">
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label">Duração Estimada</label>
              <input type="text" class="tcc-input" placeholder="Ex: 2h 30min">
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label">Tipo de Atendimento</label>
              <select class="tcc-input">
                <option>Presencial</option>
                <option>Remoto</option>
              </select>
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label">Status Inicial</label>
              <select class="tcc-input">
                <option>Pendente</option>
                <option>Confirmado</option>
              </select>
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label">Observações adicionais (opcional)</label>
              <textarea class="tcc-textarea" placeholder="Detalhes sobre o problema relatado, endereço específico, etc..."></textarea>
            </div>
          </div>

          <div class="tcc-form-actions">
            <button type="button" class="tcc-btn-cancel" (click)="cancelar()">Cancelar</button>
            <button type="submit" class="tcc-btn-main" (click)="salvar()">Salvar Agendamento</button>
          </div>
        </form>
      </div>

    </div>
  `,
  styles: [`
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; }
    .tcc-page-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
    .tcc-header-title-group { display: flex; flex-direction: column; }

    .tcc-back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--tcc-text-muted, #64748b); cursor: pointer; margin-bottom: 8px; transition: color 0.2s; font-weight: 500; }
    .tcc-back-link:hover { color: var(--tcc-primary, #3b82f6); }
    .tcc-back-link i { font-size: 12px; }

    .tcc-title-lg { font-size: 28px; font-weight: 700; color: var(--tcc-text-main, #0f172a); margin: 0 0 6px 0; }
    .tcc-subtitle { color: var(--tcc-text-muted, #64748b); font-size: 16px; margin: 0; }

    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* Estilos do Formulário */
    .tcc-form-card { background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }

    .tcc-form-row { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
    .tcc-form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
    .flex-2 { flex: 2; min-width: 300px; }

    .tcc-form-label { font-size: 14px; font-weight: 600; color: var(--tcc-text-main, #334155); }

    .tcc-input { height: 44px; border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 8px; padding: 0 16px; font-size: 14px; color: var(--tcc-text-main, #0f172a); outline: none; transition: all 0.2s; background-color: var(--tcc-surface, #ffffff); font-family: inherit; }
    .tcc-input:focus { border-color: var(--tcc-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .tcc-input::placeholder { color: #94a3b8; }

    .tcc-textarea { min-height: 120px; border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 8px; padding: 12px 16px; font-size: 14px; color: var(--tcc-text-main, #0f172a); outline: none; transition: all 0.2s; background-color: var(--tcc-surface, #ffffff); font-family: inherit; resize: vertical; }
    .tcc-textarea:focus { border-color: var(--tcc-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .tcc-textarea::placeholder { color: #94a3b8; }

    .tcc-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--tcc-border, #e2e8f0); }

    .tcc-btn-cancel { background-color: transparent; border: 1px solid var(--tcc-border, #e2e8f0); color: var(--tcc-text-main, #475569); padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .tcc-btn-cancel:hover { background-color: var(--tcc-bg, #f8fafc); border-color: #cbd5e1; }

    .tcc-btn-main { background-color: var(--tcc-primary, #3b82f6); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
    .tcc-btn-main:hover { background-color: #2563eb; }

    .tcc-loading-text {
      font-size: 14px;
      color: var(--tcc-primary, #3b82f6);
      font-style: italic;
      margin-top: 4px;
      display: block;
    }

    .tcc-error-text {
      font-size: 14px;
      color: var(--tcc-error, #dc2626);
      margin-top: 4px;
      display: block;
    }

    @media (max-width: 768px) {
      .tcc-form-card { padding: 20px; }
      .tcc-form-actions { flex-direction: column-reverse; }
      .tcc-btn-cancel, .tcc-btn-main { width: 100%; }
    }
  `]
})
export class NovoAgendamento {
  clientes: Cliente[] = [];
  clientesLoading = false;
  clientesError = false;
  selectedClienteId: string = '';

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.clientesLoading = true;
    this.clientesError = false;
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
        this.clientesLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.clientesLoading = false;
        this.clientesError = true;
      }
    });
  }

  cancelar(): void {
    // Implementar navegação de volta ou limpeza do form
    console.log('Cancelar agendamento');
  }

  salvar(): void {
    // Implementar lógica de salvamento usando AgendaService (que ainda precisa ser criado/atualizado)
    console.log('Salvar agendamento com cliente:', this.selectedClienteId);
    // TODO: Implementar chamada para AgendaService.create()
  }
}