import { AutoCompleteModule } from 'primeng/autocomplete';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// Imports do PrimeNG (v18+)
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models e Services
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { ConsultaExternaService } from '../../../services/consulta-externa.service';

@Component({
  selector: 'app-editar-cliente',
  standalone: true,
  imports: [
    AutoCompleteModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ToastModule
  ],
  
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
   
      <header class="tcc-page-header">
        <div class="tcc-header-title-group" style="flex-direction: row; align-items: center; gap: 16px;">
          <a routerLink="/painel/clientes" class="tcc-btn-outline small" style="border-radius: 50%; width: 40px; height: 40px; padding: 0; display: flex; justify-content: center; align-items: center;">
            <i class="pi pi-chevron-left"></i>
          </a>
          <div>
            <h1 class="tcc-title-lg">Editar Cliente</h1>
            <p class="tcc-subtitle">Atualize as informações de contato e endereço</p>
          </div>
        </div>
      </header>

      <div class="tcc-grid-layout">
        <main class="tcc-form-column">
          <section class="tcc-card">
            <h2 class="tcc-card-title" style="font-size: 18px; font-weight: 600; margin-bottom: 24px; color: var(--tcc-text-main);">
              <i class="pi pi-user-edit" style="color: var(--tcc-primary); margin-right: 8px;"></i> Dados do Cliente
            </h2>

            @if (clienteTemApp) {
              <div class="tcc-alert tcc-alert-info" style="margin-bottom: 24px;">
                <i class="pi pi-info-circle"></i>
                <div>
                  <strong>Usuário do Aplicativo</strong>
                  <p style="margin: 4px 0 0; font-size: 13px;">Este cliente possui uma conta no aplicativo. Dados pessoais como Nome, E-mail e Telefone só podem ser alterados pelo próprio cliente através do app.</p>
                </div>
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="atualizarCliente()">

              <div class="tcc-form-row">
                <div class="tcc-form-group" [class.is-invalid]="isInvalid('nome')">
                  <label>Nome Completo *</label>
                  <input type="text" formControlName="nome" class="tcc-input" placeholder="Digite o nome completo">
                  @if (isInvalid('nome')) {
                    <div class="tcc-error-message">O nome é obrigatório</div>
                  }
                </div>

                <div class="tcc-form-group" [class.is-invalid]="isInvalid('email')">
                  <label>E-mail</label>
                  <input type="email" formControlName="email" class="tcc-input" placeholder="Digite o e-mail (opcional)">
                  @if (isInvalid('email')) {
                    <div class="tcc-error-message">O e-mail deve ser válido</div>
                  }
                </div>
              </div>

              <div class="tcc-form-row">
                <div class="tcc-form-group" [class.is-invalid]="isInvalid('telefone')">
                  <label>Telefone / WhatsApp</label>
                  <input type="tel" formControlName="telefone" class="tcc-input" placeholder="(xx) xxxxx-xxxx">
                </div>

                <div class="tcc-form-group">
                  <label>Empresa</label>
                  <input type="text" formControlName="empresa" class="tcc-input" placeholder="Nome da empresa">
                </div>
              </div>

              <div class="tcc-form-row" style="grid-template-columns: 1fr;">
                <div class="tcc-form-group">
                  <label>Local / Endereço</label>
                  <p-autoComplete
                      id="editLocal"
                      formControlName="local"
                      [suggestions]="filteredCidades"
                      (completeMethod)="filterCidades($event)"
                      field="label"
                      placeholder="Ex: São Paulo - SP"
                      emptyMessage="Nenhum resultado encontrado"
                      inputStyleClass="tcc-input"
                      [styleClass]="isInvalid('local') ? 'tcc-input-error' : ''"
                      autocomplete="off"
                      styleClass="w-full"
                    ></p-autoComplete>
                </div>
              </div>

            </form>
          </section>
        </main>

        <aside class="tcc-summary-column">
          <div class="tcc-card" style="position: sticky; top: 24px;">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 20px 0; color: var(--tcc-text-main);">Ações</h3>

            <div class="tcc-summary-actions" style="display: flex; flex-direction: column; gap: 12px;">
              <button type="button" class="tcc-btn-main" [disabled]="form.invalid || enviando || !temAlteracoes" (click)="atualizarCliente()" style="width: 100%; justify-content: center;">
                @if(enviando) { <i class="pi pi-spin pi-spinner"></i> }
                Salvar Alterações
              </button>
              <button type="button" routerLink="/painel/clientes" class="tcc-btn-outline" style="width: 100%; justify-content: center; text-align: center;">
                Cancelar
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; }
    .tcc-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .tcc-header-title-group { display: flex; flex-direction: column; }
    .tcc-title-lg { font-size: 28px; font-weight: 700; color: var(--tcc-text-main, #0f172a); margin: 0 0 6px 0; }
    .tcc-subtitle { color: var(--tcc-text-muted, #64748b); font-size: 16px; margin: 0; }

    .tcc-grid-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }
    
    @media (max-width: 900px) {
      .tcc-grid-layout { grid-template-columns: 1fr; }
    }

    .tcc-form-column { display: flex; flex-direction: column; gap: 20px; }

    .tcc-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .tcc-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    @media (max-width: 600px) {
      .tcc-form-row { grid-template-columns: 1fr; }
    }

    .tcc-form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tcc-form-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--tcc-text-main, #334155);
    }

    ::ng-deep .tcc-input {
      width: 100% !important;
      height: 44px !important;
      border-radius: 8px !important;
      padding: 10px 14px !important;
      font-size: 14px !important;
      transition: all 0.2s !important;
      box-shadow: none !important;
      font-family: inherit !important;
      background-color: var(--tcc-bg, #f8fafc) !important;
      color: var(--tcc-text-main, #0f172a) !important;
      border: 1px solid var(--tcc-border, #cbd5e1) !important;
      box-sizing: border-box !important;
    }
    ::ng-deep .tcc-input:focus {
      background-color: var(--tcc-surface, #ffffff) !important;
      border-color: var(--tcc-primary, #3b82f6) !important;
      outline: none;
    }
    ::ng-deep .tcc-input:disabled {
      background-color: var(--tcc-bg, #f1f5f9) !important;
      color: var(--tcc-text-muted, #64748b) !important;
      cursor: not-allowed;
      opacity: 0.8;
      border-color: var(--tcc-border, #e2e8f0) !important;
    }
    
    ::ng-deep .w-full .p-autocomplete { width: 100%; display: flex; }

    .is-invalid label { color: #ef4444 !important; }
    .is-invalid ::ng-deep .tcc-input {
      border-color: #ef4444 !important;
      background-color: #fef2f2 !important;
    }
    .tcc-error-message { color: #ef4444; font-size: 12px; margin-top: 4px; }

    .tcc-btn-main {
      background-color: var(--tcc-primary, #3b82f6);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }
    .tcc-btn-main:hover:not(:disabled) { background-color: #2563eb; }
    .tcc-btn-main:disabled { opacity: 0.6; cursor: not-allowed; }

    .tcc-btn-outline {
      background-color: transparent;
      border: 1px solid var(--tcc-border, #cbd5e1);
      color: var(--tcc-text-main, #334155);
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .tcc-btn-outline:hover {
      background-color: var(--tcc-bg, #f1f5f9);
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-alert-info {
      background-color: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      gap: 12px;
      color: var(--tcc-text-main, #0f172a);
    }
    .tcc-alert-info i { color: var(--tcc-primary, #3b82f6); font-size: 20px; margin-top: 2px; }

    .tcc-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class EditarCliente implements OnInit {
  cidades: any[] = [];
  filteredCidades: any[] = [];
  private readonly http = inject(HttpClient);
  private consultaExternaService = inject(ConsultaExternaService);
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  enviando = false;
  initialFormData: any = null;
  clienteTemApp = false;
  clienteIdentificador!: string | number;

  ngOnInit(): void {
    this.carregarCidades();
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.email]],
      telefone: [''],
      empresa: [''],
      local: ['']
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id') || params.get('email');
      if (!idParam || idParam.toLowerCase() === 'null') {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Identificador do cliente inválido.' });
        setTimeout(() => this.router.navigate(['/painel/clientes']), 1000);
        return;
      }
      this.clienteIdentificador = idParam;
      this.carregarClienteParaEdicao(this.clienteIdentificador);
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get temAlteracoes(): boolean {
    if (!this.initialFormData) return false;
    return JSON.stringify(this.form.getRawValue()) !== JSON.stringify(this.initialFormData);
  }

  carregarClienteParaEdicao(identificador: string | number): void {
    this.clienteService.getClienteByEmail(identificador).subscribe({
      next: (cliente: any) => {
        this.clienteTemApp = !!cliente.usuario_id;
        const localValue = cliente.endereco || cliente.local || '';
        
        this.form.patchValue({
          nome: cliente.nome_completo || cliente.nome || '',
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          empresa: cliente.empresa || '',
          local: localValue ? { label: localValue, value: localValue } : null
        });

        // Se o cliente tem app, desabilita a edição dos dados base que pertencem a ele
        if (this.clienteTemApp) {
          this.form.get('nome')?.disable();
          this.form.get('email')?.disable();
          this.form.get('telefone')?.disable();
        }
        
        this.initialFormData = this.form.getRawValue();
      },
      error: (err: any) => {
        console.error('Erro ao carregar cliente para edição', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar dados do cliente.' });
        setTimeout(() => this.router.navigate(['/painel/clientes']), 1000);
      }
    });
  }

  atualizarCliente(): void {
    if (this.enviando) return;
    if (this.form.valid) {
      this.enviando = true;
      // Usar getRawValue para pegar até os campos desabilitados
      const formValue = this.form.getRawValue();
      if (formValue.local && typeof formValue.local === "object") {
        formValue.local = (formValue.local as any).value;
      }

      const cliente: Partial<Cliente> = {
        email: formValue.email || undefined,
        nome: formValue.nome,
        empresa: formValue.empresa,
        telefone: formValue.telefone,
        local: formValue.local
      };

      this.clienteService.updateCliente(cliente as Cliente, this.clienteIdentificador).subscribe({
        next: (_) => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado com sucesso!' });
          this.enviando = false;
          setTimeout(() => this.router.navigate(['/painel/clientes']), 1000);
        },
        error: (err: any) => {
          console.error('Erro ao atualizar cliente', err);
          this.enviando = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao atualizar o cliente.' });
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Erro de Validação', detail: 'Preencha os campos obrigatórios.' });
    }
  }

  carregarCidades() {
    this.consultaExternaService.consultarMunicipios().subscribe({
      next: (municipios) => {
        if (municipios && municipios.length > 0) {
          this.cidades = municipios.map(m => ({ label: m.formatado, value: m.formatado }));
          this.filteredCidades = this.cidades.slice(0, 20);
        }
      },
      error: (err) => console.error('Erro ao carregar cidades:', err)
    });
  }

  filterCidades(event: any): void {
    const query = event.query;
    this.filteredCidades = this.filterCidade(query, this.cidades);
  }

  filterCidade(query: string, cidades: any[]): any[] {
    const lowerQuery = query.toLowerCase();
    return cidades.filter(c => c.label.toLowerCase().indexOf(lowerQuery) === 0);
  }
}