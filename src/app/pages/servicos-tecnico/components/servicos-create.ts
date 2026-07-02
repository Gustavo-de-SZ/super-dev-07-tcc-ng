import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models e Services
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { ServicoService } from '../../../services/servico.service';
import { Servico } from '../../../models/servico';

@Component({
  selector: 'app-novo-servico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    AutoCompleteModule,
    DatePickerModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <a class="tcc-back-link" (click)="cancelar()">
            <i class="pi pi-arrow-left"></i> Voltar para Serviços
          </a>
          <h1 class="tcc-title-lg">Novo Serviço</h1>
          <p class="tcc-subtitle">Registre os detalhes do serviço prestado</p>
        </div>
      </header>

      <div class="tcc-form-card">
        <form [formGroup]="servicoForm" (ngSubmit)="salvar()">
          
          <h3 class="tcc-form-section-title">Dados Básicos</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label" for="titulo">Título do Serviço <span class="tcc-required">*</span></label>
              <input pInputText id="titulo" autocomplete="off" formControlName="titulo" placeholder="Ex: Formatação de Computador" />
              @if(servicoForm.get("titulo")?.touched && servicoForm.get("titulo")?.hasError("required")){
                <small class="tcc-error-text">Título é obrigatório</small>
              }
            </div>

            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Cliente vinculado <span class="tcc-required">*</span></label>
              <p-autoComplete 
                formControlName="cliente" 
                [suggestions]="clientesFiltrados" 
                (completeMethod)="filtrarCliente($event)"
                field="nome_exibicao"
                placeholder="Busque por nome ou empresa..."
                [forceSelection]="true"
                appendTo="body"
                [dropdown]="true"> 
                  <ng-template let-cliente pTemplate="item">
                    <div class="tcc-custom-item">
                      <span class="tcc-item-title">{{cliente.nome_completo || cliente.nome}}</span>
                      <small class="tcc-item-subtitle">{{cliente.empresa || 'Sem empresa vinculada'}}</small>
                    </div>
                  </ng-template>
              </p-autoComplete>
              @if(servicoForm.get("cliente")?.touched && servicoForm.get("cliente")?.hasError("required")){
                <small class="tcc-error-text">Cliente vinculado é obrigatório</small>
              }
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="categoria">Categoria (Ícone) <span class="tcc-required">*</span></label>
              <p-select 
                id="categoria"
                [options]="categoriaOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione a categoria"
                appendTo="body"
                formControlName="categoria">
                  <ng-template #selectedItem let-selectedOption>
                    <div class="tcc-custom-select-item">
                      <i [class]="'pi ' + selectedOption.value"></i>
                      <span>{{ selectedOption.label }}</span>
                    </div>
                  </ng-template>
                  <ng-template let-categoria pTemplate="item">
                    <div class="tcc-custom-select-item">
                      <i [class]="'pi ' + categoria.value"></i>
                      <span>{{ categoria.label }}</span>
                    </div>
                  </ng-template>
              </p-select>
              @if(servicoForm.get("categoria")?.touched && servicoForm.get("categoria")?.hasError("required")){
                <small class="tcc-error-text">Categoria é obrigatória</small>
              }
            </div>

            <div class="tcc-form-group">
              <label class="tcc-form-label">Data de Execução <span class="tcc-required">*</span></label>
              <p-datePicker 
                formControlName="dataExecucao" 
                dateFormat="dd/mm/yy" 
                [showIcon]="true" 
                appendTo="body">
              </p-datePicker>
              @if(servicoForm.get("dataExecucao")?.touched && servicoForm.get("dataExecucao")?.hasError("required")){
                <small class="tcc-error-text">Data de execução é obrigatória</small>
              }
            </div>
          </div>

          <hr class="tcc-divider">

          <h3 class="tcc-form-section-title">Valores e Status</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="valor">Valor (R$) <span class="tcc-required">*</span></label>
              <input pInputText id="valor" type="number" step="0.01" autocomplete="off" formControlName="valor" placeholder="0,00" />
              @if(servicoForm.get("valor")?.touched && servicoForm.get("valor")?.hasError("required")){
                <small class="tcc-error-text">Valor é obrigatório</small>
              }
            </div>

            <div class="tcc-form-group">
              <label class="tcc-form-label" for="status">Status do Serviço <span class="tcc-required">*</span></label>
              <p-select 
                id="status"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o status"
                appendTo="body"
                formControlName="status">
              </p-select>
              @if(servicoForm.get("status")?.touched && servicoForm.get("status")?.hasError("required")){
                <small class="tcc-error-text">Status do serviço é obrigatório</small>
              }
            </div>
          </div>

          <hr class="tcc-divider">

          <h3 class="tcc-form-section-title">Detalhes do Serviço</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="tempoGasto">Tempo Gasto <span class="tcc-required">*</span></label>
              <input pInputText id="tempoGasto" autocomplete="off" formControlName="tempoGasto" placeholder="Ex: 2h 30m" />
              @if(servicoForm.get("tempoGasto")?.touched && servicoForm.get("tempoGasto")?.hasError("required")){
                <small class="tcc-error-text">Tempo gasto é obrigatório</small>
              }
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="descricaoTecnica">Descrição Técnica do Serviço</label>
              <textarea pTextarea formControlName="descricaoTecnica" id="descricaoTecnica" rows="4" style="resize: vertical;"></textarea>
            </div>
          </div>

          <div class="tcc-form-actions">
            <button type="button" class="tcc-btn-cancel" (click)="cancelar()">
              <i class="pi pi-times tcc-mr-sm"></i> Cancelar
            </button>

            <button type="submit" class="tcc-btn-main" [disabled]="servicoForm.invalid"
                    [style.opacity]="servicoForm.invalid ? '0.6' : '1'"
                    [style.cursor]="servicoForm.invalid ? 'not-allowed' : 'pointer'">
              <i class="pi pi-save tcc-mr-sm"></i> Cadastrar Serviço
            </button>
          </div>
        </form>
      </div>

    </div>
    <p-toast position="bottom-right"></p-toast>
  `,
  styles: [`
    /* Estrutura Geral */
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; background-color: transparent; }
    .tcc-page-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-bottom: 12px; }
    
    .tcc-back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--tcc-text-muted, #64748b); cursor: pointer; margin-bottom: 8px; font-weight: 500; text-decoration: none; transition: color 0.2s;}
    .tcc-back-link:hover { color: var(--tcc-primary, #3b82f6); }
    .tcc-title-lg { font-size: 28px; font-weight: 700; color: var(--tcc-text-main, #0f172a); margin: 0 0 6px 0; }
    .tcc-subtitle { color: var(--tcc-text-muted, #64748b); font-size: 16px; margin: 0; }

    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .tcc-form-card { background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0); border-radius: var(--tcc-radius, 12px); padding: 32px; box-shadow: var(--tcc-shadow, 0 4px 20px #00000008); }
    .tcc-form-section-title { font-size: 18px; font-weight: 600; color: var(--tcc-text-main, #0f172a); margin: 0 0 20px 0; }
    .tcc-divider { border: 0; height: 1px; background-color: var(--tcc-border, #e2e8f0); margin: 32px 0; }

    /* Alinhamento de Grids e Labels */
    .tcc-form-row { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 24px; width: 100%; }
    .tcc-form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 250px; width: 100%; }
    .flex-2 { flex: 2; min-width: 350px; }
    
    .tcc-form-label { font-size: 14px; font-weight: 600; color: var(--tcc-text-main, #0f172a); margin: 0; display: block; }
    .tcc-required { color: #dc2626; font-weight: bold; }
    .tcc-error-text { color: #dc2626; font-size: 12px; margin-top: 4px; }

    /* Customização interna das opções (Select e AutoComplete) */
    .tcc-custom-item { display: flex; flex-direction: column; gap: 4px; }
    .tcc-item-title { font-weight: 600; color: var(--tcc-text-main); }
    .tcc-item-subtitle { color: var(--tcc-text-muted); font-size: 12px; }
    .tcc-custom-select-item { display: flex; align-items: center; gap: 10px; }

    /* BOTÕES */
    .tcc-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--tcc-border, #e2e8f0); }
    .tcc-btn-cancel { background-color: transparent; border: 1px solid var(--tcc-border, #e2e8f0); color: var(--tcc-text-muted, #64748b); padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .tcc-btn-cancel:hover { background-color: var(--tcc-surface-hover, #f1f5f9); border-color: var(--tcc-text-muted, #64748b); }
    .tcc-btn-main { background-color: var(--tcc-primary, #3b82f6); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .tcc-btn-main:hover { background-color: var(--tcc-primary-hover, #2563eb); }
    .tcc-mr-sm { margin-right: 6px; }

    /* * CORREÇÃO CRÍTICA DO PRIMENG (BORDAS, PADDING E WIDTH)
     * O ::ng-deep é obrigatório aqui para perfurar o encapsulamento e aplicar o estilo 
     * diretamente nos elementos nativos que o PrimeNG gera internamente.
     */

    /* Garante que os containers (wrappers) ocupem 100% da flexbox */
    :host ::ng-deep p-autocomplete,
    :host ::ng-deep p-select,
    :host ::ng-deep p-datepicker {
      display: block !important;
      width: 100% !important;
    }

    /* Recria as bordas e paddings dos inputs que estão flutuando transparentes */
    :host ::ng-deep input.p-inputtext,
    :host ::ng-deep textarea.p-textarea,
    :host ::ng-deep .p-autocomplete-input,
    :host ::ng-deep .p-datepicker-input {
      width: 100% !important;
      border: 1px solid var(--tcc-border, #cbd5e1) !important;
      border-radius: 6px !important;
      padding: 0.75rem 1rem !important;
      background-color: var(--tcc-surface, #ffffff) !important;
      color: var(--tcc-text-main, #0f172a) !important;
      font-family: inherit;
      box-shadow: none !important;
      box-sizing: border-box !important;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    /* O p-select precisa de um tratamento especial porque ele é uma div que funciona como botão */
    :host ::ng-deep .p-select {
      width: 100% !important;
      border: 1px solid var(--tcc-border, #cbd5e1) !important;
      border-radius: 6px !important;
      background-color: var(--tcc-surface, #ffffff) !important;
      color: var(--tcc-text-main, #0f172a) !important;
      padding: 0 !important; /* Retira o padding de fora... */
      display: flex !important;
      align-items: center;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    /* ...e aplica o padding no label interno para a área clicável ficar do tamanho certo */
    :host ::ng-deep .p-select .p-select-label {
      padding: 0.75rem 1rem !important;
      width: 100%;
    }

    /* Retira qualquer borda duplicada que o p-autocomplete possa gerar internamente */
    :host ::ng-deep .p-autocomplete .p-inputtext {
      border: none !important; 
    }

    /* Efeitos visuais ao focar (clicar) nos inputs */
    :host ::ng-deep input.p-inputtext:focus,
    :host ::ng-deep textarea.p-textarea:focus,
    :host ::ng-deep .p-select:focus-within,
    :host ::ng-deep .p-autocomplete-input:focus,
    :host ::ng-deep .p-datepicker-input:focus {
      border-color: var(--tcc-primary, #3b82f6) !important;
      outline: none !important;
      box-shadow: 0 0 0 1px var(--tcc-primary, #3b82f6) !important;
    }
  `]
})
export class NovoServico implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly servicoService = inject(ServicoService);

  clientes: Cliente[] = [];
  clientesFiltrados: any[] = [];

  categoriaOptions = [
    { label: 'Manutenção (Desktop)', value: 'pi-desktop' },
    { label: 'Redes (Wi-Fi)', value: 'pi-wifi' },
    { label: 'Hardware (HD/SSD)', value: 'pi-database' },
    { label: 'Segurança (Antivírus)', value: 'pi-shield' }
  ];

  statusOptions = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Em Andamento', value: 'Em Andamento' },
    { label: 'Concluído', value: 'Concluído' }
  ];

  servicoForm = this.formBuilder.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    cliente: ['', Validators.required],
    categoria: ['', Validators.required],
    dataExecucao: ['', Validators.required],
    valor: ['', [Validators.required, Validators.min(0.01)]],
    status: ['', Validators.required],
    tempoGasto: ['', Validators.required],
    descricaoTecnica: ['']
  });

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes.map(cliente => ({
          ...cliente,
          nome_exibicao: `${(cliente as any).nome_completo || cliente.nome} ${cliente.empresa ? ' - ' + cliente.empresa : ''}`
        }));
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.messageService.add({ severity: "error", summary: "Erro", detail: "Ocorreu um erro ao carregar os clientes" });
      }
    });
  }

  filtrarCliente(event: any) {
    const query = event.query.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c => 
      (c as any).nome_exibicao.toLowerCase().includes(query)
    );
  }

  salvar() {
    if (this.servicoForm.valid) {
      const formData = this.servicoForm.getRawValue();

      const servico: any = {
        titulo: formData.titulo,
        cliente: formData.cliente, 
        icone: formData.categoria, 
        data: formData.dataExecucao,
        valor: Number(formData.valor), 
        status: formData.status,
        duracao: formData.tempoGasto,
        descricaoTecnica: formData.descricaoTecnica
      };

      this.servicoService.addServico(servico).subscribe({
        next: () => {
          this.messageService.add({ severity: "success", summary: "Sucesso", detail: "Serviço registrado com sucesso" });
          this.router.navigate(['/painel/servicos']);
        },
        error: (err) => {
          console.error('Erro ao salvar serviço', err);
          this.messageService.add({ severity: "error", summary: "Erro", detail: "Ocorreu um erro ao registrar o serviço" });
        }
      });
    } else {
      this.servicoForm.markAllAsTouched();
    }
  }

  cancelar() {
    this.router.navigate(['/painel/servicos']);
  }
}