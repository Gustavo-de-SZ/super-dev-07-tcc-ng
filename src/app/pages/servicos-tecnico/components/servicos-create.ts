import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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

@Component({
  selector: 'app-novo-servico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AutoCompleteModule,
    DatePickerModule,
    ToastModule
  ],
  providers: [MessageService],
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
              <i class="pi pi-file-edit text-primary"></i> Informações do Serviço
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
                @for (cat of categorias; track cat.id) {
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
              <label for="descricao">Descrição</label>
              <textarea
                id="descricao"
                formControlName="descricao"
                class="ns-input ns-textarea"
                rows="4"
                placeholder="Descreva o serviço a ser realizado, problema identificado..."
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
                    optionLabel="nome_exibicao"
                    placeholder="Buscar cliente por nome ou empresa..."
                    [forceSelection]="true"
                    appendTo="body"
                    styleClass="ns-autocomplete"
                    inputStyleClass="ns-has-icon-left"> 
                      <ng-template let-cliente pTemplate="item">
                        <div class="ns-cliente-suggestion">
                          <div class="ns-cliente-avatar"><i class="pi pi-user"></i></div>
                          <div class="ns-cliente-info">
                            <span class="ns-cliente-nome">{{ cliente.nome_completo || cliente.nome || 'Sem nome' }}</span>
                            <span class="ns-cliente-empresa">{{ cliente.empresa || 'Sem empresa' }}</span>
                          </div>
                        </div>
                      </ng-template>
                  </p-autoComplete>
              </div>
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-calendar text-primary"></i> Agendamento e Valor
            </h2>

            <div class="ns-form-row">
              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('data')">
                <label>Data *</label>
                <p-datePicker
                  formControlName="data"
                  dateFormat="dd/mm/yy"
                  placeholder="mm/dd/yyyy"
                  [showIcon]="true"
                  iconDisplay="input"
                  appendTo="body"
                  styleClass="ns-datepicker"
                ></p-datePicker>
              </div>

              <div class="ns-form-group">
                <label for="duracao">Duração estimada</label>
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
              </div>

              <div class="ns-form-group">
                <label for="valor">Valor (R$)</label>
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
                <span class="label">Cliente</span>
                <span class="value">{{ form.get('cliente')?.value?.nome || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Data</span>
                <span class="value">{{ form.get('data')?.value ? (form.get('data')?.value | date:'dd/MM/yyyy') : '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Duração</span>
                <span class="value">{{ form.get('duracao')?.value || '—' }}</span>
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

            <button type="button" class="ns-btn-submit" [disabled]="form.invalid" (click)="salvarServico()">
              Criar Serviço
            </button>
            <button type="button" routerLink="/painel/servicos" class="ns-btn-cancel">
              Cancelar
            </button>
          </div>
        </aside>

      </div>
    </div>
    <p-toast position="bottom-right"></p-toast>
  `,
  styles: [`
    
    .ns-page-container {
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      background-color: var(--tcc-bg, #f8fafc); /* Força o fundo da página a obedecer seu tema */
      transition: background-color 0.2s, color 0.2s;
    }

    .ns-page-header h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 4px 0;
    }

    .ns-page-header p {
      font-size: 14px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .ns-back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: var(--tcc-text-muted, #64748b);
      text-decoration: none;
      transition: background 0.2s;
    }

    .ns-back-btn:hover {
      background: var(--tcc-surface-hover, #e2e8f0);
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
    ::ng-deep .ns-autocomplete .p-autocomplete-input,
    ::ng-deep .ns-datepicker .p-inputtext {
      width: 100%;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 14px;
      transition: all 0.2s;
      box-shadow: none;
      font-family: inherit;
      background-color: var(--tcc-surface, #ffffff) !important;
      color: var(--tcc-text-main, #0f172a) !important;
      border: 1px solid var(--tcc-border, #e2e8f0) !important;
    }

    ::ng-deep .ns-input::placeholder,
    ::ng-deep .ns-autocomplete .p-autocomplete-input::placeholder,
    ::ng-deep .ns-datepicker .p-inputtext::placeholder {
      color: var(--tcc-text-muted, #94a3b8) !important;
      opacity: 0.7;
    }

    ::ng-deep .ns-input:focus,
    ::ng-deep .ns-autocomplete .p-autocomplete-input:focus,
    ::ng-deep .ns-datepicker .p-inputtext:focus {
      border-color: #3b82f6 !important;
      outline: none;
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

    .ns-has-icon-left { padding-left: 38px !important; }
    .ns-has-prefix-left { padding-left: 38px !important; }
    ::ng-deep .ns-autocomplete { width: 100%; }
    ::ng-deep .ns-datepicker { width: 100% !important; display: inline-flex !important; }

    /* Força o ícone nativo do datepicker a herdar a cor correta */
    ::ng-deep .ns-datepicker .p-datepicker-dropdown-icon,
    ::ng-deep .ns-datepicker .p-datepicker-input-icon {
      color: var(--tcc-text-muted) !important;
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

    .ns-btn-submit {
      width: 100%; background: #3b82f6; color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-bottom: 12px;
    }
    .ns-btn-submit:hover:not(:disabled) { background: #2563eb; }
    .ns-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .ns-btn-cancel { width: 100%; background: transparent; border: none; color: var(--tcc-text-muted, #64748b); font-size: 13px; cursor: pointer; text-align: center; }
    .ns-btn-cancel:hover { color: var(--tcc-text-main, #0f172a); }


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
      background-color: var(--tcc-surface, #131c2c) !important;
      border: 1px solid var(--tcc-border, #223047) !important;
      color: var(--tcc-text-main, #f1f5f9) !important;
      box-shadow: var(--tcc-shadow) !important;
    }

    /* Cabeçalho e calendário interno do Datepicker */
    ::ng-deep body.tp-dark-theme .p-datepicker-header {
      background-color: var(--tcc-surface, #131c2c) !important;
      border-bottom: 1px solid var(--tcc-border, #223047) !important;
      color: var(--tcc-text-main, #f1f5f9) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-title,
    ::ng-deep body.tp-dark-theme .p-datepicker-prev-icon,
    ::ng-deep body.tp-dark-theme .p-datepicker-next-icon {
      color: var(--tcc-text-main, #f1f5f9) !important;
    }

    /* Dias da semana e números do mês */
    ::ng-deep body.tp-dark-theme .p-datepicker-weekday {
      color: var(--tcc-text-muted, #94a3b8) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day {
      color: var(--tcc-text-main, #f1f5f9) !important;
    }

    /* Efeitos de Hover e Seleção nos dias do Datepicker */
    ::ng-deep body.tp-dark-theme .p-datepicker-day:not(.p-datepicker-day-selected):hover {
      background-color: var(--tcc-surface-hover, #1e293b) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day-selected {
      background-color: #3b82f6 !important;
      color: #ffffff !important;
    }

    /* Itens de sugestão do AutoComplete no Modo Escuro */
    ::ng-deep body.tp-dark-theme .p-autocomplete-option {
      color: var(--tcc-text-main, #f1f5f9) !important;
      background: transparent !important;
    }

    ::ng-deep body.tp-dark-theme .p-autocomplete-option:hover,
    ::ng-deep body.tp-dark-theme .p-autocomplete-option.p-focus {
      background-color: var(--tcc-surface-hover, #1e293b) !important;
    }

    .ns-cliente-suggestion { display: flex; align-items: center; gap: 12px; padding: 2px 0; }
    .ns-cliente-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--tcc-surface-hover, #e2e8f0);
      display: flex; align-items: center; justify-content: center;
      color: var(--tcc-text-muted, #64748b);
    }
    .ns-cliente-info { display: flex; flex-direction: column; }
    .ns-cliente-nome { font-size: 14px; font-weight: 500; color: var(--tcc-text-main, #0f172a); }
    .ns-cliente-empresa { font-size: 11px; color: var(--tcc-text-muted, #64748b); }
  `]
})
export class NovoServico implements OnInit {
  private fb = inject(FormBuilder);
  private servicoService = inject(ServicoService);
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  form!: FormGroup;
  clientes: Cliente[] = [];
  clientesFiltrados: any[] = [];

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
      descricao: [''],
      cliente: [null, Validators.required],
      data: [new Date(), Validators.required],
      duracao: [''],
      valor: ['']
    });

    // Load clientes for autocomplete
    this.carregarClientes();
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
      const dataFormatada = dataSelecionada instanceof Date
        ? dataSelecionada.toISOString().split('T')[0]
        : String(dataSelecionada);

      const categoriaValue = categoriaMap[formValue.categoria as keyof typeof categoriaMap];

      const servico: Servico = {
        icone: iconeMap[formValue.categoria as keyof typeof iconeMap] || 'pi pi-wrench', // Map to icon
        categoria: categoriaValue, // Properly typed
        titulo: formValue.titulo,
        status: 'Pendente', // Default status for new services
        cliente: formValue.cliente?.nome || '', // Safe access to client name
        data: dataFormatada,
        duracao: formValue.duracao || '',
        valor: formValue.valor || '',
        descricao: formValue.descricao || ''
      };

      
      // Call the service to save the service
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
          // Set default values if needed (like category and date)
          this.form.patchValue({
            categoria: 'redes',
            data: new Date()
          });
          // Navigate to services list page
          setTimeout(() => this.router.navigate(['/painel/servicos']), 1000);
        },
        error: (err) => {
          // Log error for debugging (acceptable use of console.error)
          console.error('Erro ao salvar serviço', err);
          // Show error message to user
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao cadastrar o serviço. Por favor, tente novamente.'
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
}