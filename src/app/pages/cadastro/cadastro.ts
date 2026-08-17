import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { take, switchMap, tap, map, timeout } from 'rxjs/operators';
import { Observable, of, TimeoutError } from 'rxjs';
import { PhoneMaskDirective } from '../../shared/directives/phone-mask.directive';
import { CnpjMaskDirective } from '../../shared/directives/cnpj-mask.directive';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { HttpClient } from '@angular/common/http';
import { ConsultaExternaService } from '../../services/consulta-externa.service';
import { validarCNPJ } from '../../shared/validators/documento.validator';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    ToastModule,
    ButtonModule,
    AutoCompleteModule,
    PhoneMaskDirective,
    CnpjMaskDirective
  ],
  
  template: `
    

    <div class="cd-layout">

      <div class="cd-floating-controls">
        <button
          (click)="theme.toggle()"
          class="tcc-toggle-mode"
          aria-label="Alternar tema"
          id="btnToggleTheme"
        >
          <i [class]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <button
          (click)="logout()"
          class="tcc-btn-outline cd-btn-logout"
          id="btnLogout"
        >
          <i class="pi pi-sign-out"></i>
          Sair
        </button>
      </div>

      <div class="cd-card">

        <div class="cd-header">
          <div class="cd-header-icon">
            <i class="pi pi-user-plus"></i>
          </div>
          <h1 class="cd-title">Conclua seu Cadastro</h1>
          <p class="cd-subtitle">
            Precisamos de mais algumas informações para personalizar sua experiência e liberar o acesso à plataforma.
          </p>
        </div>

        @if (!isRoleFixed()) {
          <div class="cd-section">
            <label class="cd-label cd-label-center">Como você deseja usar a plataforma?</label>
            <div class="cd-grid-2">

              <div
                (click)="setRole('cliente')"
                class="cd-role-card"
                [class.cd-role-active]="selectedRole === 'cliente'"
                id="cardCliente"
              >
                <div class="cd-role-icon cd-icon-blue">
                  <i class="pi pi-user"></i>
                </div>
                <h3 class="cd-role-title">Cliente / Solicitante</h3>
                <p class="cd-role-desc">
                  Preciso de suporte técnico e soluções de TI para mim ou minha empresa.
                </p>
              </div>

              <div
                (click)="setRole('tecnico')"
                class="cd-role-card"
                [class.cd-role-active]="selectedRole === 'tecnico'"
                id="cardTecnico"
              >
                <div class="cd-role-icon cd-icon-emerald">
                  <i class="pi pi-cog"></i>
                </div>
                <h3 class="cd-role-title">Profissional de TI</h3>
                <p class="cd-role-desc">
                  Quero oferecer meus serviços de TI, atender chamados e gerenciar clientes.
                </p>
              </div>

            </div>
          </div>
        } @else {
          <div class="cd-info-box">
            <i class="pi pi-info-circle"></i>
            <span>
              Seu tipo de perfil foi definido como <strong>{{ selectedRole === 'cliente' ? 'Cliente' : 'Profissional de TI' }}</strong> com base nas credenciais de acesso.
            </span>
          </div>
        }

        @if (selectedRole === 'cliente') {
          <form
            [formGroup]="clienteForm"
            (ngSubmit)="submitCliente()"
            class="cd-form"
            id="formCliente"
          >
            <div class="cd-grid-2">

              <div class="cd-field">
                <label for="cliNome" class="cd-label">Nome Completo</label>
                <input
                  id="cliNome"
                  formControlName="nome"
                  type="text"
                  placeholder="Seu nome"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('cliente', 'nome')"
                />
                @if (isFieldInvalid('cliente', 'nome')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i> Nome é obrigatório (mín. 3 letras)
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="cliEmail" class="cd-label">E-mail</label>
                <input
                  id="cliEmail"
                  formControlName="email"
                  type="email"
                  class="ns-input cd-input-disabled"
                  readonly
                />
              </div>

              <div class="cd-field">
                <label for="cliEmpresa" class="cd-label">Empresa / Negócio (Opcional)</label>
                <input
                  id="cliEmpresa"
                  formControlName="empresa"
                  type="text"
                  placeholder="Ex: Minha Empresa S/A (ou deixe em branco)"
                  class="ns-input"
                  
                />
              </div>

              <div class="cd-field">
                <label for="cliTelefone" class="cd-label">Telefone</label>
                <input
                  id="cliTelefone"
                  formControlName="telefone"
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('cliente', 'telefone')"
                  appPhoneMask
                />
                @if (isFieldInvalid('cliente', 'telefone')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i>
                    @if (clienteForm.get('telefone')?.hasError('required')) {
                      Telefone é obrigatório
                    } @else if (clienteForm.get('telefone')?.hasError('invalidPhone')) {
                      Formato inválido. Use (XX) 99999-9999
                    } @else if (clienteForm.get('telefone')?.hasError('invalidPhoneLength')) {
                      Telefone deve ter 10 ou 11 dígitos
                    } @else if (clienteForm.get('telefone')?.hasError('invalidMobileFormat')) {
                      Para celular, o terceiro dígito deve ser 9 (ex: (11) 99999-9999)
                    } @else if (clienteForm.get('telefone')?.hasError('invalidAreaCode')) {
                      DDD inválido. DDDS válidos: 11-99, exceto: 00,01,02,03,05,08,09,10
                    } @else {
                      Formato inválido. Use (XX) 99999-9999
                    }
                  </span>
                }
              </div>

              <div class="cd-field">
                <div class="ns-form-group" [class.has-error]="isFieldInvalid('cliente', 'local')">
                  <label class="ns-label" for="cliCep">
                    CEP de Atuação <span class="ns-required">*</span>
                  </label>
                  <div class="ns-input-wrap">
                    <i class="pi pi-map-marker ns-input-icon"></i>
                    <input id="cliCep" type="text" formControlName="cep" class="ns-input ns-with-icon w-full" placeholder="Digite seu CEP (apenas números)" maxlength="9" (input)="buscarCepDirect($event, 'cliente', 'local')">
                  </div>
                  @if (clienteForm.get('local')?.value) {
                    <div style="margin-top: 8px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.9em; color: #475569;">
                      <i class="pi pi-check-circle" style="color: #3b82f6; margin-right: 6px;"></i>
                      <strong>Localização:</strong> {{ clienteForm.get('local')?.value }}
                    </div>
                  } @else {
                     <div style="margin-top: 8px; font-size: 0.85em; color: #ef4444;">
                        Digite um CEP válido para carregar o endereço.
                     </div>
                  }
                </div>
              </div>

              <div class="cd-field">
                <label for="cliTipo" class="cd-label">Perfil de Cliente</label>
                <p-select
                  id="cliTipo"
                  formControlName="tipoCliente"
                  [options]="tipoClienteOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="ns-select ns-select-inner"
                ></p-select>
              </div>

            </div>

            <div class="cd-form-actions">
              <button
                type="submit"
                class="tcc-btn-main cd-btn-submit"
                [disabled]="loading"
                id="btnSubmitCliente"
              >
                @if (loading) {
                  <i class="pi pi-spin pi-spinner"></i>
                } @else {
                  <i class="pi pi-check"></i>
                }
                Concluir Registro
              </button>
            </div>
          </form>
        }

        @if (selectedRole === 'tecnico') {
          <form
            [formGroup]="tecnicoForm"
            (ngSubmit)="submitTecnico()"
            class="cd-form"
            id="formTecnico"
          >
            <div class="cd-grid-2">

              <div class="cd-field">
                <label for="tecNome" class="cd-label">Nome Completo</label>
                <input
                  id="tecNome"
                  formControlName="nome"
                  type="text"
                  placeholder="Seu nome"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('tecnico', 'nome')"
                />
                @if (isFieldInvalid('tecnico', 'nome')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i> Nome é obrigatório (mín. 3 letras)
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="tecEmail" class="cd-label">E-mail</label>
                <input
                  id="tecEmail"
                  formControlName="email"
                  type="email"
                  class="ns-input cd-input-disabled"
                  readonly
                />
              </div>

              <div class="cd-field">
                <label for="tecEspec" class="cd-label">Especialidade Principal</label>
                <p-select
                  id="tecEspec"
                  formControlName="especialidadePrincipal"
                  [options]="especialidadeOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="ns-select ns-select-inner"
                ></p-select>
              </div>

              <div class="cd-field">
                <div class="cd-label-row">
                  <label for="tecCnpj" class="cd-label">CNPJ</label>
                  @if (buscandoCnpj) {
                    <span class="cd-cnpj-loading"><i class="pi pi-spin pi-spinner"></i> Consultando Receita...</span>
                  }
                </div>
                <input
                  id="tecCnpj"
                  formControlName="cnpj"
                  type="text"
                  placeholder="Ex: 00.000.000/0000-00"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('tecnico', 'cnpj')"
                  appCnpjMask
                  (blur)="onCnpjBlur()"
                  (input)="onCnpjInput($event)"
                />
                @if (isFieldInvalid('tecnico', 'cnpj')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i>
                    @if (tecnicoForm.get('cnpj')?.hasError('required')) {
                      CNPJ é obrigatório
                    } @else if (tecnicoForm.get('cnpj')?.hasError('invalidCNPJLength')) {
                      CNPJ deve ter 14 dígitos
                    } @else if (tecnicoForm.get('cnpj')?.hasError('invalidCNPJ')) {
                      CNPJ inválido
                    } @else {
                      CNPJ inválido
                    }
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="tecTelefone" class="cd-label">Telefone Celular</label>
                <input
                  id="tecTelefone"
                  formControlName="telefone"
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('tecnico', 'telefone')"
                  appPhoneMask
                />
                @if (isFieldInvalid('tecnico', 'telefone')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i>
                    @if (tecnicoForm.get('telefone')?.hasError('required')) {
                      Telefone é obrigatório
                    } @else if (tecnicoForm.get('telefone')?.hasError('invalidPhone')) {
                      Formato inválido. Use (XX) 99999-9999
                    } @else if (tecnicoForm.get('telefone')?.hasError('invalidPhoneLength')) {
                      Telefone deve ter 10 ou 11 dígitos
                    } @else if (tecnicoForm.get('telefone')?.hasError('invalidMobileFormat')) {
                      Para celular, o terceiro dígito deve ser 9 (ex: (11) 99999-9999)
                    } @else if (tecnicoForm.get('telefone')?.hasError('invalidAreaCode')) {
                      DDD inválido. DDDS válidos: 11-99, exceto: 00,01,02,03,05,08,09,10
                    } @else {
                      Formato inválido. Use (XX) 99999-9999
                    }
                  </span>
                }
              </div>

              <div class="cd-field">
                <div class="ns-form-group" [class.has-error]="isFieldInvalid('tecnico', 'local')">
                  <label class="ns-label" for="tecCep">
                    CEP de Atuação <span class="ns-required">*</span>
                  </label>
                  <div class="ns-input-wrap">
                    <i class="pi pi-map-marker ns-input-icon"></i>
                    <input id="tecCep" type="text" formControlName="cep" class="ns-input ns-with-icon w-full" placeholder="Digite seu CEP (apenas números)" maxlength="9" (input)="buscarCepDirect($event, 'tecnico', 'local')">
                  </div>
                  @if (tecnicoForm.get('local')?.value) {
                    <div style="margin-top: 8px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.9em; color: #475569;">
                      <i class="pi pi-check-circle" style="color: #3b82f6; margin-right: 6px;"></i>
                      <strong>Localização:</strong> {{ tecnicoForm.get('local')?.value }}
                    </div>
                  } @else {
                     <div style="margin-top: 8px; font-size: 0.85em; color: #ef4444;">
                        Digite um CEP válido para carregar o endereço.
                     </div>
                  }
                </div>
              </div>

              <div class="cd-field">
                <label for="tecTempo" class="cd-label">Tempo Médio Resposta</label>
                <p-select
                  id="tecTempo"
                  formControlName="tempoResposta"
                  [options]="tempoRespostaOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="ns-select ns-select-inner"
                ></p-select>
              </div>

            </div>

            <div class="cd-form-actions">
              <button
                type="submit"
                class="tcc-btn-main cd-btn-submit cd-btn-emerald"
                [disabled]="loading"
                id="btnSubmitTecnico"
              >
                @if (loading) {
                  <i class="pi pi-spin pi-spinner"></i>
                } @else {
                  <i class="pi pi-check"></i>
                }
                Concluir Registro
              </button>
            </div>
          </form>
        }

        @if (!selectedRole) {
          <div class="cd-empty-state">
            Por favor, selecione seu perfil acima para preencher os dados correspondentes.
          </div>
        }

      </div>
    </div>
  `,
  styles: `
    .cd-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background-color: var(--tcc-bg);
      color: var(--tcc-text-main);
      transition: background-color 0.3s ease;
      position: relative;
    }
    .cd-floating-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cd-btn-logout {
      height: 38px !important;
      border-radius: 20px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      font-size: 12px !important;
      padding: 0 16px !important;
    }
    .cd-card {
      width: 100%;
      max-width: 672px;
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 32px;
      transition: all 0.3s ease;
    }
    @media (min-width: 768px) {
      .cd-card {
        padding: 48px;
      }
    }
    .cd-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .cd-header-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background-color: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
      border-radius: 50%;
      margin-bottom: 16px;
      font-size: 20px;
    }
    .cd-title {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      margin-top: 0;
    }
    .cd-subtitle {
      color: var(--tcc-text-muted);
      font-size: 14px;
      max-width: 440px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .cd-section {
      margin-bottom: 40px;
    }
    .cd-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      color: var(--tcc-text-muted);
    }
    .cd-label-center {
      text-align: center;
      margin-bottom: 16px;
    }
    .cd-grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    @media (min-width: 768px) {
      .cd-grid-2 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .cd-role-card {
      border: 2px solid var(--tcc-border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .cd-role-card:hover {
      border-color: var(--tcc-text-muted);
    }
    .cd-role-active {
      border-color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.03);
    }
    .cd-role-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      font-size: 20px;
      transition: transform 0.2s ease;
    }
    .cd-role-card:hover .cd-role-icon {
      transform: scale(1.1);
    }
    .cd-icon-blue {
      background-color: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
    }
    .cd-icon-emerald {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .cd-role-title {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 4px;
      margin-top: 0;
    }
    .cd-role-desc {
      font-size: 12px;
      color: var(--tcc-text-muted);
      line-height: 1.6;
      margin: 0;
    }
    .cd-info-box {
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 12px;
      background-color: rgba(59, 130, 246, 0.05);
      border: 1px solid rgba(59, 130, 246, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cd-info-box i {
      color: #3b82f6;
      font-size: 18px;
    }
    .cd-info-box span {
      font-size: 12px;
      line-height: 1.5;
    }
    .cd-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .cd-field {
      display: flex;
      flex-direction: column;
    }
    .cd-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .cd-label-row .cd-label {
      margin-bottom: 0;
    }
    .cd-cnpj-loading {
      font-size: 11px;
      color: var(--primary, #3b82f6);
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .cd-error {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .cd-form-actions {
      padding-top: 16px;
      margin-top: 8px;
      border-top: 1px solid var(--tcc-border);
      display: flex;
      justify-content: flex-end;
    }
    .cd-btn-submit {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }
    .cd-btn-emerald {
      background-color: #10b981 !important;
    }
    .cd-btn-emerald:hover {
      background-color: #059669 !important;
    }
    .cd-empty-state {
      text-align: center;
      padding: 24px 0;
      color: var(--tcc-text-muted);
      font-size: 14px;
      font-style: italic;
    }

    ::ng-deep .ns-input {
      width: 100% !important;
      height: 44px !important;
      border-radius: 8px !important;
      padding: 0 16px !important;
      background: var(--tcc-bg) !important;
      color: var(--tcc-text-main) !important;
      border: 1px solid var(--tcc-border) !important;
      box-sizing: border-box !important;
      transition: all 0.2s ease !important;
    }
    ::ng-deep .ns-input:focus {
      outline: none !important;
      border-color: var(--tcc-primary) !important;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12) !important;
    }
    ::ng-deep .ns-input-error {
      border-color: #ef4444 !important;
    }
    ::ng-deep .cd-input-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--tcc-surface-hover) !important;
    }
    ::ng-deep .ns-select {
      width: 100% !important;
      border-radius: 8px !important;
      box-sizing: border-box !important;
    }
    ::ng-deep .ns-select-inner {
      width: 100% !important;
      height: 44px !important;
      border-radius: 8px !important;
      background: var(--tcc-bg) !important;
      color: var(--tcc-text-main) !important;
      border: 1px solid var(--tcc-border) !important;
      display: flex;
      align-items: center;
    }
    ::ng-deep .cd-input-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    ::ng-deep .cd-input-icon i {
      position: absolute;
      left: 12px;
      color: var(--tcc-text-muted);
      z-index: 1;
    }
    ::ng-deep .ns-with-icon {
      padding-left: 36px !important;
    }
    ::ng-deep .cd-full-width {
      width: 100%;
    }
    ::ng-deep .ns-input-wrap {
      position: relative;
    }
    ::ng-deep .ns-input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--tcc-text-muted);
    }
  `,
})
export class Cadastro implements OnInit {
  auth = inject(AuthService);
  profileService = inject(ProfileService);
  theme = inject(ThemeService);
  router = inject(Router);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  http = inject(HttpClient);
  consultaExternaService = inject(ConsultaExternaService);

  user: any = null;
  selectedRole: 'cliente' | 'tecnico' | null = null;
  loading = false;
  buscandoCnpj = false;
  ultimoCnpjBuscado = '';
  hasRoleInToken = false;

  // For city autocomplete
  cidades: any[] = []; 
  filteredCidades: any[] = []; 
  sugestoesLocal: string[] = [];

  clienteForm!: FormGroup;
  tecnicoForm!: FormGroup;

  tipoClienteOptions = [
    { label: 'Individual (Pessoa Física)', value: 'Individual' },
    { label: 'PME (Pequena e Média Empresa)', value: 'PME' },
    { label: 'Corporate (Grande Empresa)', value: 'Corporate' }
  ];

  especialidadeOptions = [
    { label: 'Suporte Técnico & Help Desk', value: 'Suporte Técnico' },
    { label: 'Redes e Infraestrutura', value: 'Redes' },
    { label: 'Segurança da Informação', value: 'Segurança' },
    { label: 'Desenvolvimento e Sistemas', value: 'Software' },
    { label: 'Manutenção de Hardware e Servidores', value: 'Hardware' },
    { label: 'Outros', value: 'Outros' }
  ];

  tempoRespostaOptions = [
    { label: 'Rápido (Em até 15 minutos)', value: 'Em até 15 min' },
    { label: 'Express (Em até 30 minutos)', value: 'Em até 30 min' },
    { label: 'Padrão (Em até 1 hora)', value: 'Em até 1 hora' },
    { label: 'Flexível (Em até 2 horas)', value: 'Em até 2 horas' }
  ];

  ngOnInit(): void {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      empresa: [''],
      cep: [''],
      local: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['', [Validators.required, this.phoneNumberValidator]],
      tipoCliente: ['Individual', [Validators.required]]
    });

    this.tecnicoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      especialidadePrincipal: ['Suporte Técnico', [Validators.required]],
      cnpj: ['', [Validators.required, this.cnpjValidator]],
      cep: [''],
      local: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['', [Validators.required, this.phoneNumberValidator]],
      tempoResposta: ['Em até 1 hora', [Validators.required]]
    });

    this.auth.user$.subscribe(u => {
      if (u) {
        this.user = u;
        const email = u.email || '';
        this.clienteForm.patchValue({ nome: '', email: email });
        this.tecnicoForm.patchValue({ nome: '', email: email });
        const roles = u['https://tcc-ng.com/roles'] || [];
        if (roles.length > 0) {
          const role = roles[0].toLowerCase();
          if (role === 'cliente' || role === 'tecnico') {
            this.selectedRole = role as 'cliente' | 'tecnico';
            this.hasRoleInToken = true;
          }
        }
      }
    });
  }
  buscarCepDirect(event: any, groupName: string, controlName: string) {
    const query = (event.target.value || '').trim();
    const cepMatch = query.replace(/\D/g, '');
    const targetForm = groupName === 'cliente' ? this.clienteForm : this.tecnicoForm;

    if (cepMatch.length === 8) {
      this.consultaExternaService.consultarCep(cepMatch).subscribe({
        next: (data: any) => {
          if (data) {
            const enderecoFormatado = `${data.logradouro}, ${data.bairro}, ${data.cidade} - ${data.uf}`;
            targetForm.patchValue({ [controlName]: enderecoFormatado });
          } else {
             targetForm.patchValue({ [controlName]: '' });
          }
        },
        error: () => targetForm.patchValue({ [controlName]: '' })
      });
    } else {
        if (cepMatch.length === 0 || cepMatch.length > 5) {
            targetForm.patchValue({ [controlName]: '' });
        }
    }
  }

  isRoleFixed(): boolean {
    return this.hasRoleInToken;
  }

  setRole(role: 'cliente' | 'tecnico'): void {
    if (!this.isRoleFixed()) {
      this.selectedRole = role;
    }
  }

  isFieldInvalid(formType: 'cliente' | 'tecnico', field: string): boolean {
    const form = formType === 'cliente' ? this.clienteForm : this.tecnicoForm;
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  private phoneNumberValidator(control: any): { [key: string]: any } | null {
    const value = control.value;

    // Allow empty values (required validator will handle empty case)
    if (!value) {
      return null;
    }

    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // Validate digit count: should be 10 or 11 digits
    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
      return { 'invalidPhoneLength': true };
    }

    // Validate area code (DDD) - should be between 11 and 99 and not in invalid ranges
    const areaCode = parseInt(digitsOnly.substring(0, 2));
    // Invalid area codes in Brazil: 00, 01, 02, 03, 05, 08, 09, 10 and above 99
    const invalidAreaCodes = [0, 1, 2, 3, 5, 8, 9, 10];
    if (areaCode < 11 || areaCode > 99 || invalidAreaCodes.includes(areaCode)) {
      return { 'invalidAreaCode': true };
    }

    // For 11-digit numbers, the third digit (after area code) should be 9 (mobile)
    if (digitsOnly.length === 11 && digitsOnly[2] !== '9') {
      return { 'invalidMobileFormat': true };
    }

    return null;
  }

  private cnpjValidator(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    const clean = String(value).replace(/\D/g, '');
    if (clean.length === 0) return null;
    if (clean.length !== 14) return { 'invalidCNPJLength': true };
    return validarCNPJ(clean) ? null : { 'invalidCNPJ': true };
  }

  onCnpjBlur(): void {
    const cnpj = this.tecnicoForm.get('cnpj')?.value;
    if (cnpj) {
      this.buscarDadosCnpj(cnpj);
    }
  }

  onCnpjInput(event: any): void {
    const val = event?.target ? event.target.value : event;
    const clean = String(val || '').replace(/\D/g, '');
    if (clean.length === 14 && clean !== this.ultimoCnpjBuscado) {
      this.buscarDadosCnpj(clean);
    }
  }

  buscarDadosCnpj(cnpj: string): void {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return;
    if (clean === this.ultimoCnpjBuscado) return;

    this.buscandoCnpj = true;
    this.ultimoCnpjBuscado = clean;

    this.consultaExternaService.consultarCnpj(clean).subscribe({
      next: (data) => {
        this.buscandoCnpj = false;
        if (data && (data.razaoSocial || data.nomeFantasia)) {
          let nomeEmpresa = data.nomeFantasia || data.razaoSocial || '';
          if (nomeEmpresa && data.cnpj) {
            const cleanCnpj = data.cnpj.replace(/\D/g, '');
            if (cleanCnpj.length === 14) {
              const root = cleanCnpj.substring(0, 8);
              const formattedRoot = `${root.substring(0, 2)}.${root.substring(2, 5)}.${root.substring(5, 8)}`;
              if (nomeEmpresa.startsWith(formattedRoot)) {
                nomeEmpresa = nomeEmpresa.substring(formattedRoot.length).trim();
              } else if (nomeEmpresa.startsWith(root)) {
                nomeEmpresa = nomeEmpresa.substring(root.length).trim();
              }
            }
          }
          const currentNome = this.tecnicoForm.get('nome')?.value;
          const currentLocal = this.tecnicoForm.get('local')?.value;
          const currentTelefone = this.tecnicoForm.get('telefone')?.value;

          const patchObj: any = {};
          if (!currentNome || currentNome.trim().length === 0) {
            patchObj.nome = nomeEmpresa;
          }
          if (!currentLocal || currentLocal.trim().length === 0) {
            patchObj.local = data.uf ? `${data.municipio} - ${data.uf}` : data.municipio;
          }
          if (!currentTelefone || currentTelefone.trim().length === 0) {
            if (data.telefone) {
              patchObj.telefone = data.telefone;
            }
          }

          if (Object.keys(patchObj).length > 0) {
            this.tecnicoForm.patchValue(patchObj);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'CNPJ Localizado (Receita)',
            detail: `${nomeEmpresa} - ${data.municipio}/${data.uf}`
          });
        }
      },
      error: () => {
        this.buscandoCnpj = false;
      }
    });
  }

  private checkProfileExistsAndRedirect(): Observable<boolean> {
    // Check if profile already exists for this user
    return this.profileService.verificarPerfilExistente().pipe(
      tap((result: { exists: boolean; type: 'cliente' | 'tecnico' | 'admin' | null }) => {
        if (result.exists) {
          this.profileService.redirecionarParaPainelCorrespondente(result);
        }
      }),
      map((result: { exists: boolean; type: 'cliente' | 'tecnico' | 'admin' | null }) => result.exists)
    );
  }

  submitCliente(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    // Check if profile already exists before submitting
    this.checkProfileExistsAndRedirect().pipe(
      take(1),
      switchMap(exists => {
        if (exists) {
          // Already redirected in tap operator, just return empty observable
          return of(null);
        }

        this.loading = true;
        const formValue = this.clienteForm.getRawValue();
        const email = formValue.email || this.user?.email || 'cliente@tcc-ng.com';
        const clienteData = {
          ...formValue,
          email: email,
          avaliacao: 5.0,
          servicosAtivos: 0,
          servicosConcluidos: 0,
          status: 'Ativo'
        };

        return this.profileService.criarPerfilCliente(clienteData).pipe(
          map(res => ({ res, email })) // Return both result and email for use in subscribe
        );
      })
    ).subscribe({
      next: (result) => {
        if (result) { // Only proceed if we didn't redirect due to existing profile
          // Local persistence and state update
          localStorage.setItem(`tcc_profile_completed_${result.email}`, 'true');
          this.profileService.setPerfilCriado('cliente');
          this.messageService.add({
            severity: 'success',
            summary: 'Cadastro Concluído',
            detail: 'Seu perfil de cliente foi criado com sucesso!',
            life: 3000
          });
          setTimeout(() => {
            this.router.navigate(['/cliente/inicio']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao criar perfil de cliente. Tente novamente.',
          life: 4000
        });
        console.error(err);
      }
    });
  }

  submitTecnico(): void {
    if (this.tecnicoForm.invalid) {
      this.tecnicoForm.markAllAsTouched();
      return;
    }

    // Check if profile already exists before submitting
    this.checkProfileExistsAndRedirect().pipe(
      take(1),
      switchMap(exists => {
        if (exists) {
          // Already redirected in tap operator, just return empty observable
          return of(null);
        }

        this.loading = true;
        const formValue = this.tecnicoForm.getRawValue();
        const email = formValue.email || this.user?.email || 'tecnico@tcc-ng.com';
        const tecnicoData = {
          nome: formValue.nome,
          email: email,
          especialidadePrincipal: formValue.especialidadePrincipal,
          local: formValue.local,
          telefone: formValue.telefone,
          tempoResposta: formValue.tempoResposta,
          cnpj: formValue.cnpj
        };

        return this.profileService.criarPerfilTecnico(tecnicoData).pipe(
          map(res => ({ res, email })) // Return both result and email for use in subscribe
        );
      })
    ).subscribe({
      next: (result) => {
        if (result) { // Only proceed if we didn't redirect due to existing profile
          // Local persistence and state update
          localStorage.setItem(`tcc_profile_completed_${result.email}`, 'true');
          this.profileService.setPerfilCriado('tecnico', result.res.aprovado_pelo_admin);
          this.messageService.add({
            severity: 'success',
            summary: 'Cadastro Concluído',
            detail: 'Seu perfil de profissional foi criado com sucesso!',
            life: 3000
          });
          setTimeout(() => {
            // Navigate to appropriate page based on approval status
            if (result.res.aprovado_pelo_admin) {
              this.router.navigate(['/painel/dashboard']);
            } else {
              this.router.navigate(['/pendente-aprovacao']);
            }
          }, 1500);
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao criar o perfil de técnico. Tente novamente.',
          life: 4000
        });
        console.error(err);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}