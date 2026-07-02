import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { Router } from '@angular/router';
import { AgendaService } from '../../../services/agenda.service';
import { Agendamento } from '../../../models/agendamento';

interface TipoAtendimento {
  label: string;
  value: string;
}

interface StatusInicial {
  label: string;
  value: string;
}

@Component({
  selector: 'app-novo-agendamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputMaskModule,
    ButtonModule,
    SelectModule,
    DialogModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
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
        <form [formGroup]="agendamentoForm" (ngSubmit)="salvar()">

          <h3 class="tcc-form-section-title">Horário e Data</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Título do Agendamento <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="titulo" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="titulo" />
              @if(agendamentoForm.get("titulo")?.touched && agendamentoForm.get("titulo")?.hasError("required")){
                <small class="text-red-600">Título é obrigatório</small>
              } @else if(agendamentoForm.get("titulo")?.touched && agendamentoForm.get("titulo")?.hasError("minlength")){
                <small class="text-red-600">Título deve ter no mínimo 3 caracteres.</small>
              } @else if(agendamentoForm.get("titulo")?.touched && agendamentoForm.get("titulo")?.hasError("maxlength")){
                <small class="text-red-600">Título deve ter no máximo 255 caracteres.</small>
              }
            </div>

            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Cliente <span class="font-bold text-red-700">*</span></label>
              <p-select class="tcc-input"
                id="cliente"
                [options]="clientesOptions"
                placeholder="Selecione um cliente..."
                fluid
                formControlName="cliente"
              />
              @if(agendamentoForm.get("cliente")?.touched && agendamentoForm.get("cliente")?.hasError("required")){
                <small class="text-red-600">Cliente é obrigatório</small>
              }
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label">Data <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="data" type="date" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="data" />
              @if(agendamentoForm.get("data")?.touched && agendamentoForm.get("data")?.hasError("required")){
                <small class="text-red-600">Data é obrigatória</small>
              }
            </div>

            <div class="tcc-form-group">
              <label class="tcc-form-label">Hora <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="hora" type="time" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="hora" />
              @if(agendamentoForm.get("hora")?.touched && agendamentoForm.get("hora")?.hasError("required")){
                <small class="text-red-600">Hora é obrigatória</small>
              }
            </div>

            <div class="tcc-form-group">
              <label class="tcc-form-label">Duração Estimada <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="duracao" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="duracao" />
              @if(agendamentoForm.get("duracao")?.touched && agendamentoForm.get("duracao")?.hasError("required")){
                <small class="text-red-600">Duração estimada é obrigatória</small>
              } @else if(agendamentoForm.get("duracao")?.touched && agendamentoForm.get("duracao")?.hasError("minlength")){
                <small class="text-red-600">Duração deve ter no mínimo 1 caractere.</small>
              } @else if(agendamentoForm.get("duracao")?.touched && agendamentoForm.get("duracao")?.hasError("maxlength")){
                <small class="text-red-600">Duração deve ter no máximo 20 caracteres.</small>
              }
            </div>
          </div>

          <hr class="tcc-divider">

          <h3 class="tcc-form-section-title">Tipo de Atendimento</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label">Tipo de Atendimento <span class="font-bold text-red-700">*</span></label>
              <p-select class="tcc-input"
                id="tipoAtendimento"
                [options]="tipoAtendimentoOptions"
                placeholder="Selecione o tipo de atendimento"
                fluid
                formControlName="tipoAtendimento"
              />
              @if(agendamentoForm.get("tipoAtendimento")?.touched && agendamentoForm.get("tipoAtendimento")?.hasError("required")){
                <small class="text-red-600">Tipo de atendimento é obrigatório</small>
              }
            </div>

            <div class="tcc-form-group">
              <label class="tcc-form-label">Status Inicial <span class="font-bold text-red-700">*</span></label>
              <p-select class="tcc-input"
                id="statusInicial"
                [options]="statusInicialOptions"
                placeholder="Selecione o status inicial"
                fluid
                formControlName="statusInicial"
              />
              @if(agendamentoForm.get("statusInicial")?.touched && agendamentoForm.get("statusInicial")?.hasError("required")){
                <small class="text-red-600">Status inicial é obrigatório</small>
              }
            </div>
          </div>

          <hr class="tcc-divider">

          <h3 class="tcc-form-section-title">Observações</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Observações adicionais (opcional)</label>
              <textarea rows="5" cols="30" pTextarea fluid formControlName="observacoes" id="observacoes" class="tcc-textarea"></textarea>
              @if(agendamentoForm.get("observacoes")?.touched && agendamentoForm.get("observacoes")?.hasError("maxlength")){
                <small class="text-red-600">Observações deve ter no máximo 255 caracteres.</small>
              }
            </div>
          </div>

          <div class="tcc-form-actions">
            <button type="button" class="tcc-btn-cancel" (click)="cancelar()">
              <i class="pi pi-times tcc-mr-sm"></i> Cancelar
            </button>

            <button type="submit" class="tcc-btn-main" [disabled]="agendamentoForm.invalid"
                    [style.opacity]="agendamentoForm.invalid ? '0.6' : '1'"
                    [style.cursor]="agendamentoForm.invalid ? 'not-allowed' : 'pointer'">
              <i class="pi pi-save tcc-mr-sm"></i> Salvar
            </button>
          </div>
        </form>
      </div>

    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; }
    .tcc-page-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
    .tcc-header-title-group { display: flex; flex-direction: column; }

    .tcc-back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--tcc-text-muted, #64748b); cursor: pointer; margin-bottom: 8px; transition: color 0.2s; font-weight: 500; text-decoration: none; }
    .tcc-back-link:hover { color: var(--tcc-primary, #3b82f6); }
    .tcc-back-link i { font-size: 12px; }

    .tcc-title-lg { font-size: 28px; font-weight: 700; color: var(--tcc-text-main, #0f172a); margin: 0 0 6px 0; }
    .tcc-subtitle { color: var(--tcc-text-muted, #64748b); font-size: 16px; margin: 0; }

    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .tcc-form-card { background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }

    .tcc-form-section-title { font-size: 18px; font-weight: 600; color: var(--tcc-text-main, #0f172a); margin: 0 0 20px 0; }
    .tcc-divider { border: 0; height: 1px; background-color: var(--tcc-border, #e2e8f0); margin: 32px 0; }

    .tcc-form-row { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
    .tcc-form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
    .flex-2 { flex: 2; min-width: 300px; }

    .tcc-form-label { font-size: 14px; font-weight: 600; color: var(--tcc-text-main, #334155); }

    .tcc-input { height: 44px; border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 8px; padding: 0 16px; font-size: 14px; color: var(--tcc-text-main, #0f172a); outline: none; transition: all 0.2s; background-color: var(--tcc-surface, #ffffff); font-family: inherit; width: 100%; }
    .tcc-input:focus { border-color: var(--tcc-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .tcc-input::placeholder { color: #94a3b8; }

    .tcc-textarea { min-height: 120px; border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 8px; padding: 12px 16px; font-size: 14px; color: var(--tcc-text-main, #0f172a); outline: none; transition: all 0.2s; background-color: var(--tcc-surface, #ffffff); font-family: inherit; resize: vertical; width: 100%; }
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
  // Following the exact pattern from the model for dependency injection
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly agendaService = inject(AgendaService);

  // Client options for the select
  clientesOptions: { label: string; value: string }[] = [];

  // Tipo de atendimento options
  tipoAtendimentoOptions: TipoAtendimento[] = [
    { label: 'Presencial', value: 'Presencial' },
    { label: 'Remoto', value: 'Remoto' }
  ];

  // Status inicial options
  statusInicialOptions: StatusInicial[] = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Confirmado', value: 'Confirmado' }
  ];

  // Form following the exact validation patterns from the model
  agendamentoForm = this.formBuilder.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    cliente: ['', Validators.required],
    data: ['', Validators.required],
    hora: ['', Validators.required],
    duracao: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
    tipoAtendimento: ['', Validators.required],
    statusInicial: ['', Validators.required],
    observacoes: ['']
  });

  clientes: Cliente[] = [];
  clientesLoading = false;
  clientesError = false;

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.clientesLoading = true;
    this.clientesError = false;
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
        // Convert clientes to options for the p-select
        this.clientesOptions = clientes.map(cliente => ({
          label: `${cliente.nome} (${cliente.empresa || '-'})`,
          value: cliente.nome // Using nome as value, could also use id if available
        }));
        this.clientesLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.clientesLoading = false;
        this.clientesError = true;
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao carregar os clientes"
        });
      }
    });
  }

  salvar() {
    if (this.agendamentoForm.valid) {
      const formData = this.agendamentoForm.getRawValue();

      // Map form data to Agendamento model
      // Using non-null assertion (!) since we've validated the form
      const agendamento: Agendamento = {
        dia: formData.data!, // Note: form has "data" but model uses "dia"
        hora: formData.hora!,
        titulo: formData.titulo!,
        cliente: formData.cliente!,
        duracao: formData.duracao!,
        tipo: formData.tipoAtendimento as ('Presencial' | 'Remoto'),
        status: formData.statusInicial as ('Confirmado' | 'Pendente' | 'Concluído' | 'Cancelado')
        // Note: observacoes field is not in the Agendamento model, so we omit it
        // Note: We're not setting optional fields like id, mes, empresa, servico
      };

      this.agendaService.addAgendamento(agendamento).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Show de bola!",
            detail: "Agendamento cadastrado com sucesso"
          });

          // Reset form after successful submission
          this.limpar();

          // Navigate back to agenda list
          this.router.navigate(['/painel/agenda']);
        },
        error: (err) => {
          console.error('Erro ao salvar agendamento', err);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Ocorreu um erro ao cadastrar o agendamento"
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.agendamentoForm.markAllAsTouched();
      this.messageService.add({
        severity: "error",
        summary: "Erro",
        detail: "Por favor, preencha todos os campos obrigatórios corretamente"
      });
    }
  }

  limpar() {
    this.agendamentoForm.reset();
  }

  cancelar() {
    this.limpar();
    // Navigate back to the agenda list
    this.router.navigate(['/painel/agenda']);
  }
}