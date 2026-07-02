import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // ✨ IMPORTANTE: Import do Router e RouterModule
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';

interface Estado {
  label: string;
  value: string;
}

@Component({
  selector: 'app-novo-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule, // ✨ CORREÇÃO: Necessário para o routerLink funcionar no HTML
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
          <a class="tcc-back-link" routerLink="/painel/clientes">
            <i class="pi pi-arrow-left"></i> Voltar para Clientes
          </a>
          <h1 class="tcc-title-lg">Novo Cliente</h1>
          <p class="tcc-subtitle">Adicione um novo cliente à sua base de dados</p>
        </div>
      </header>

      <div class="tcc-form-card">
        <form [formGroup]="clienteForm" (ngSubmit)="cadastrar()">

          <h3 class="tcc-form-section-title">Informações Principais</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label" for="nome">Nome Completo <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="nome" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="nome" />
              @if(clienteForm.get("nome")?.touched && clienteForm.get("nome")?.hasError("required")){
                <small class="text-red-600">Nome é obrigatório</small>
              } @else if(clienteForm.get("nome")?.touched && clienteForm.get("nome")?.hasError("minlength")){
                <small class="text-red-600">Nome deve ter no mínimo 3 caracteres.</small>
              } @else if(clienteForm.get("nome")?.touched && clienteForm.get("nome")?.hasError("maxlength")){
                <small class="text-red-600">Nome deve ter no máximo 255 caracteres.</small>
              }
            </div>
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label" for="empresa">Empresa (Opcional)</label>
              <input pInputText id="empresa" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="empresa" />
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="email">E-mail <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="email" type="email" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="email" />
              @if(clienteForm.get("email")?.touched && clienteForm.get("email")?.hasError("required")){
                <small class="text-red-600">E-mail é obrigatório</small>
              } @else if(clienteForm.get("email")?.touched && clienteForm.get("email")?.hasError("email")){
                <small class="text-red-600">E-mail inválido.</small>
              }
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="telefone">Telefone / WhatsApp <span class="font-bold text-red-700">*</span></label>
              <p-inputmask class="tcc-input" mask="(99) 99999-9999" placeholder="(99) 99999-9999" fluid id="telefone" formControlName="telefone"></p-inputmask>
              @if(clienteForm.get("telefone")?.touched && clienteForm.get("telefone")?.hasError("required")){
                <small class="text-red-600">Telefone é obrigatório</small>
              }
            </div>
          </div>

          <hr class="tcc-divider">

          <h3 class="tcc-form-section-title">Endereço</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label" for="rua">Rua / Avenida <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="rua" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="rua" />
              @if(clienteForm.get("rua")?.touched && clienteForm.get("rua")?.hasError("required")){
                <small class="text-red-600">Rua é obrigatória</small>
              }
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="numero">Número <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="numero" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="numero" />
              @if(clienteForm.get("numero")?.touched && clienteForm.get("numero")?.hasError("required")){
                <small class="text-red-600">Número é obrigatório</small>
              }
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="complemento">Complemento</label>
              <input pInputText id="complemento" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="complemento" />
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label" for="bairro">Bairro <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="bairro" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="bairro" />
              @if(clienteForm.get("bairro")?.touched && clienteForm.get("bairro")?.hasError("required")){
                <small class="text-red-600">Bairro é obrigatório</small>
              }
            </div>
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label" for="cidade">Cidade <span class="font-bold text-red-700">*</span></label>
              <input pInputText id="cidade" class="flex-auto tcc-input" autocomplete="off" fluid formControlName="cidade" />
              @if(clienteForm.get("cidade")?.touched && clienteForm.get("cidade")?.hasError("required")){
                <small class="text-red-600">Cidade é obrigatória</small>
              }
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label" for="cep">CEP <span class="font-bold text-red-700">*</span></label>
              <p-inputmask class="tcc-input" mask="99999-999" placeholder="99999-999" fluid id="cep" formControlName="cep"></p-inputmask>
              @if(clienteForm.get("cep")?.touched && clienteForm.get("cep")?.hasError("required")){
                <small class="text-red-600">CEP é obrigatório</small>
              } @else if(clienteForm.get("cep")?.touched && clienteForm.get("cep")?.hasError("pattern")){
                <small class="text-red-600">CEP inválido</small>
              }
            </div>
          </div>ap

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label" for="observacoes">Observações</label>
              <textarea rows="5" cols="30" pTextarea fluid formControlName="observacoes" id="observacoes" class="tcc-textarea"></textarea>
            </div>
          </div>

         <div class="tcc-form-actions">
  <button type="button" class="tcc-btn-cancel" (click)="cancelar()">
    <i class="pi pi-times tcc-mr-sm"></i> Cancelar
  </button>

  <button type="submit" class="tcc-btn-main" [disabled]="clienteForm.invalid" 
          [style.opacity]="clienteForm.invalid ? '0.6' : '1'" 
          [style.cursor]="clienteForm.invalid ? 'not-allowed' : 'pointer'">
    <i class="pi pi-save tcc-mr-sm"></i> Cadastrar Cliente
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

    /* Ajuste para responsividade */
    @media (max-width: 768px) {
      .tcc-form-card { padding: 20px; }
      .tcc-form-actions { flex-direction: column-reverse; }
      .tcc-btn-cancel, .tcc-btn-main { width: 100%; }
      p-button { width: 100%; }
    }
  `]
})
export class NovoCliente {
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService); // ✨ CORREÇÃO: Router injetado para navegação



  clienteForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    telefone: ['', [Validators.required, Validators.maxLength(15)]],
    empresa: [''],
    rua: ['', [Validators.required, Validators.maxLength(255)]],
    numero: ['', [Validators.required, Validators.maxLength(10)]], // Agora preenchível!
    complemento: [''], // Agora preenchível!
    bairro: ['', [Validators.required, Validators.maxLength(100)]],
    cidade: ['', [Validators.required, Validators.maxLength(100)]],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    observacoes: ['']
  });

  cadastrar() {
    if (this.clienteForm.valid) {
      const formData = this.clienteForm.getRawValue();

      // Map form data to Cliente model
      // Using non-null assertion (!) since we've validated the form
      const cliente: Cliente = {
        nome: formData.nome!,
        empresa: formData.empresa ?? '', // Optional field, default to empty string if null
        avaliacao: 0, // Default value, not in form
        email: formData.email!,
        telefone: formData.telefone!,
        local: `${formData.rua!}, ${formData.numero!}${formData.complemento ? ` ${formData.complemento}` : ''}, ${formData.bairro!}, ${formData.cidade!} - ${formData.cep!}`, // Construct address from form fields
        servicosAtivos: 0, // Default value, not in form
        servicosConcluidos: 0 // Default value, not in form
      };

      this.clienteService.addClienteTecnico(cliente).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Show de bola!",
            detail: "Cliente cadastrado com sucesso"
          });

          this.limpar();

          // Opcional: Voltar para a tela anterior automaticamente após sucesso
          // setTimeout(() => this.router.navigate(['/painel/clientes']), 1500);
        },
        error: (err) => {
          console.error('Erro ao salvar cliente', err);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Ocorreu um erro ao cadastrar o cliente"
          });
        }
      });
    } else {
      this.clienteForm.markAllAsTouched();
      this.messageService.add({
        severity: "error",
        summary: "Erro",
        detail: "Por favor, preencha todos os campos obrigatórios corretamente"
      });
    }
  }

  limpar() {
    this.clienteForm.reset();
  }

  cancelar() {
    this.limpar();
    // ✨ CORREÇÃO: Botão cancelar agora direciona de volta
    this.router.navigate(['/painel/clientes']);
  }
}