import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { first, Observable, of, switchMap } from 'rxjs';
import { CnpjMaskDirective } from '../../shared/directives/cnpj-mask.directive';
import { ConsultaExternaService } from '../../services/consulta-externa.service';
import { validarCNPJ } from '../../shared/validators/documento.validator';

// Interface for what we send to PUT /tecnicos/me
interface TecnicoUpdateRequest {
  nome: string;
  telefone: string;
  cnpj: string;
  descricao_servicos: string;
  endereco?: string;
}

// Interface for what we send to PUT /clientes/me
interface ClienteUpdateRequest {
  nome: string;
  telefone?: string;
  empresa?: string;
  local?: string;
}

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ToastModule,
    AutoCompleteModule,
    CnpjMaskDirective
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="cfg-page tcc-fade-in">
    
      <header class="cfg-page-header">
        <div class="cfg-header-text">
          <h1 class="cfg-title">Configurações da Conta</h1>
          <p class="cfg-subtitle">Gerencie suas informações de perfil, dados de contato e preferências.</p>
        </div>
        <div class="cfg-role-badge" [ngClass]="userRole === 'admin' ? 'badge-admin' : (userRole === 'tecnico' ? 'badge-tecnico' : 'badge-cliente')">
          <i class="pi" [ngClass]="userRole === 'admin' ? 'pi-shield' : (userRole === 'tecnico' ? 'pi-wrench' : 'pi-user')"></i>
          <span>{{ userRole === 'admin' ? 'Administrador' : (userRole === 'tecnico' ? 'Perfil Técnico' : 'Perfil Cliente') }}</span>
        </div>
      </header>

    
      @if (isLoadingInitialData) {
        <div class="cfg-skeleton-wrapper">
          <div class="cfg-skeleton-banner"></div>
          <div class="cfg-skeleton-card"></div>
        </div>
      } @else {
    
        <div class="cfg-profile-banner">
          <div class="cfg-banner-cover"></div>
          <div class="cfg-banner-body">
            <div class="cfg-avatar-wrapper">
              @if (userPicture) {
                <img [src]="userPicture" alt="Foto do Usuário" class="cfg-avatar-img" />
              } @else {
                <div class="cfg-avatar-fallback" [ngClass]="userRole === 'admin' ? 'avatar-admin' : (userRole === 'tecnico' ? 'avatar-tecnico' : 'avatar-cliente')">
                  {{ getUserInitials() }}
                </div>
              }
              <div class="cfg-avatar-status" title="Conta ativa">
                <i class="pi pi-check"></i>
              </div>
              <div class="cfg-avatar-edit-overlay" (click)="fileInput.click()">
                <i class="pi pi-camera"></i>
              </div>
              <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none" />
            </div>

            <div class="cfg-user-meta">
              <div class="cfg-user-name-row">
                <h2 class="cfg-user-name">
                  {{ getDisplayName() || (userRole === 'admin' ? 'Administrador' : (userRole === 'tecnico' ? 'Técnico Especialista' : 'Cliente')) }}
                </h2>
                <span class="cfg-status-pill">
                  <i class="pi pi-shield"></i> Conta Verificada
                </span>
              </div>
              <p class="cfg-user-email">
                <i class="pi pi-envelope"></i> {{ userEmail }}
              </p>
            </div>
          </div>
        </div>

      
        <form [formGroup]="form" (ngSubmit)="salvarConfiguracoes()" class="cfg-form-container">
          
        
          <section class="cfg-section-card">
            <div class="cfg-section-header">
              <div class="cfg-section-icon icon-blue">
                <i class="pi pi-lock"></i>
              </div>
              <div>
                <h3 class="cfg-section-title">Acesso & Identificação</h3>
                <p class="cfg-section-desc">Dados da conta vinculados ao login e canais de contato direto</p>
              </div>
            </div>

            <div class="cfg-grid-2">
           
              <div class="cfg-form-group">
                <label class="cfg-label" for="cfg-email">E-mail da Conta</label>
                <div class="cfg-input-icon-wrap readonly">
                  <i class="pi pi-envelope"></i>
                  <input
                    id="cfg-email"
                    formControlName="email"
                    type="text"
                    class="cfg-input"
                    readonly
                  />
                  <span class="cfg-readonly-badge" title="E-mail fixo da autenticação">
                    <i class="pi pi-lock"></i> Fixo
                  </span>
                </div>
                <span class="cfg-hint">O e-mail de login é gerenciado pela autenticação e não pode ser alterado.</span>
              </div>

            
              <div class="cfg-form-group" [class.has-error]="isInvalid('telefone')">
                <label class="cfg-label" for="cfg-tel">
                  Telefone / WhatsApp <span class="cfg-required">*</span>
                </label>
                <div class="cfg-input-icon-wrap">
                  <i class="pi pi-phone"></i>
                  <input
                    id="cfg-tel"
                    formControlName="telefone"
                    type="text"
                    class="cfg-input"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                @if (isInvalid('telefone')) {
                  <span class="cfg-error-text">
                    <i class="pi pi-exclamation-circle"></i> O telefone para contato é obrigatório.
                  </span>
                }
              </div>
            </div>
          </section>

        
          @if (userRole === 'tecnico') {
            <section class="cfg-section-card">
              <div class="cfg-section-header">
                <div class="cfg-section-icon icon-purple">
                  <i class="pi pi-briefcase"></i>
                </div>
                <div>
                  <h3 class="cfg-section-title">Informações Profissionais & Serviços</h3>
                  <p class="cfg-section-desc">Essas informações são exibidas aos clientes ao visualizarem seu perfil e serviços</p>
                </div>
              </div>

              <div class="cfg-grid-2">
              
                <div class="cfg-form-group" [class.has-error]="isInvalid('nome_fantasia')">
                  <label class="cfg-label" for="cfg-nome-fantasia">
                    Nome Fantasia / Nome do Negócio <span class="cfg-required">*</span>
                  </label>
                  <div class="cfg-input-icon-wrap">
                    <i class="pi pi-id-card"></i>
                    <input
                      id="cfg-nome-fantasia"
                      formControlName="nome_fantasia"
                      type="text"
                      class="cfg-input"
                      placeholder="Ex: GS Informática & Redes"
                    />
                  </div>
                  @if (isInvalid('nome_fantasia')) {
                    <span class="cfg-error-text">
                      <i class="pi pi-exclamation-circle"></i> O Nome Fantasia é obrigatório.
                    </span>
                  }
                </div>

                <div class="cfg-form-group" [class.has-error]="isInvalid('cnpj')">
                  <div class="cfg-label-row">
                    <label class="cfg-label" for="cfg-cnpj">
                      CNPJ <span class="cfg-optional">(Opcional)</span>
                    </label>
                    @if (buscandoCnpj) {
                      <span class="cfg-cnpj-loading"><i class="pi pi-spin pi-spinner"></i> Consultando Receita...</span>
                    }
                  </div>
                  <div class="cfg-input-icon-wrap">
                    <i class="pi pi-building"></i>
                    <input
                      id="cfg-cnpj"
                      formControlName="cnpj"
                      type="text"
                      class="cfg-input"
                      placeholder="00.000.000/0000-00"
                      appCnpjMask
                      (blur)="onCnpjBlur()"
                      (input)="onCnpjInput($event)"
                    />
                  </div>
                  @if (isInvalid('cnpj')) {
                    <span class="cfg-error-text">
                      <i class="pi pi-exclamation-circle"></i> CNPJ inválido ou incompleto.
                    </span>
                  }
                </div>

             
                <div class="cfg-form-group" [class.has-error]="isInvalid('especialidade')">
                  <label class="cfg-label" for="cfg-especialidade">
                    Especialidade Principal <span class="cfg-required">*</span>
                  </label>
                  <div class="cfg-select-wrap">
                    <i class="pi pi-cog cfg-select-left-icon"></i>
                    <select id="cfg-especialidade" formControlName="especialidade" class="cfg-select">
                      <option value="Suporte Técnico">Suporte Técnico & Help Desk</option>
                      <option value="Redes">Redes e Infraestrutura</option>
                      <option value="Segurança">Segurança da Informação</option>
                      <option value="Software">Desenvolvimento e Sistemas</option>
                      <option value="Hardware">Manutenção de Hardware e Servidores</option>
                      <option value="Outros">Outros Serviços Especializados</option>
                    </select>
                    <i class="pi pi-chevron-down cfg-select-arrow"></i>
                  </div>
                </div>

              
                <div class="cfg-form-group" [class.has-error]="isInvalid('local')">
                  <label class="cfg-label" for="cfg-local">
                    CEP de Atuação <span class="cfg-required">*</span>
                  </label>
                  <div class="cfg-input-icon-wrap" style="display: flex; width: 100%; position: relative;">
                    <i class="pi pi-map-marker" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); z-index: 2; pointer-events: none;"></i>
                    <input type="text" formControlName="cep" class="cfg-input w-full" style="padding-left: 40px;" placeholder="Digite seu CEP (apenas números)" maxlength="9" (input)="buscarCepDirect($event, 'local')">
                  </div>
                  @if (form.get('local')?.value) {
                    <div style="margin-top: 8px; padding: 10px; background: var(--tcc-bg, #f8fafc); border-radius: 6px; border: 1px solid var(--tcc-border, #e2e8f0); font-size: 0.9em; color: var(--tcc-text-main, #475569);">
                      <i class="pi pi-check-circle" style="color: var(--tcc-primary, #3b82f6); margin-right: 6px;"></i>
                      <strong>Localização:</strong> {{ form.get('local')?.value }}
                    </div>
                  } @else {
                     <div style="margin-top: 8px; font-size: 0.85em; color: var(--tcc-danger, #ef4444);">
                        Digite um CEP válido para carregar o endereço.
                     </div>
                  }
                </div>

                
                <div class="cfg-form-group col-span-2" [class.has-error]="isInvalid('tempoResposta')">
                  <label class="cfg-label" for="cfg-tempo">
                    Tempo Médio de Resposta <span class="cfg-required">*</span>
                  </label>
                  <div class="cfg-select-wrap">
                    <i class="pi pi-clock cfg-select-left-icon"></i>
                    <select id="cfg-tempo" formControlName="tempoResposta" class="cfg-select">
                      <option value="Em até 15 min">Rápido (Em até 15 minutos)</option>
                      <option value="Em até 30 min">Express (Em até 30 minutos)</option>
                      <option value="Em até 1 hora">Padrão (Em até 1 hora)</option>
                      <option value="Em até 2 horas">Flexível (Em até 2 horas)</option>
                    </select>
                    <i class="pi pi-chevron-down cfg-select-arrow"></i>
                  </div>
                  <span class="cfg-hint">Essas informações definem sua disponibilidade e facilitam a busca de novos clientes.</span>
                </div>
                
                <div class="cfg-form-group col-span-2">
                  <label class="cfg-label" for="cfg-bio">
                    Sobre os Serviços (Bio)
                  </label>
                  <div class="cfg-input-icon-wrap" style="align-items: flex-start;">
                    <i class="pi pi-align-left" style="top: 14px; transform: none;"></i>
                    <textarea
                      id="cfg-bio"
                      formControlName="bio"
                      class="cfg-input w-full"
                      style="padding-left: 40px; padding-top: 10px; min-height: 100px; resize: vertical;"
                      placeholder="Descreva brevemente os serviços que você oferece, sua experiência e diferenciais..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </section>
          }

       
          @if (userRole === 'cliente') {
            <section class="cfg-section-card">
              <div class="cfg-section-header">
                <div class="cfg-section-icon icon-emerald">
                  <i class="pi pi-user-edit"></i>
                </div>
                <div>
                  <h3 class="cfg-section-title">Dados Pessoais & Localização</h3>
                  <p class="cfg-section-desc">Mantenha seus dados atualizados para facilitar o atendimento técnico presencial</p>
                </div>
              </div>

              <div class="cfg-grid-2">
              
                <div class="cfg-form-group" [class.has-error]="isInvalid('nome_completo')">
                  <label class="cfg-label" for="cfg-nome-completo">
                    Nome Completo <span class="cfg-required">*</span>
                  </label>
                  <div class="cfg-input-icon-wrap">
                    <i class="pi pi-user"></i>
                    <input
                      id="cfg-nome-completo"
                      formControlName="nome_completo"
                      type="text"
                      class="cfg-input"
                      placeholder="Ex: João da Silva"
                    />
                  </div>
                  @if (isInvalid('nome_completo')) {
                    <span class="cfg-error-text">
                      <i class="pi pi-exclamation-circle"></i> O Nome Completo é obrigatório.
                    </span>
                  }
                </div>

          
                <div class="cfg-form-group">
                  <label class="cfg-label" for="cfg-empresa">
                    Empresa / Razão Social <span class="cfg-optional">(Opcional)</span>
                  </label>
                  <div class="cfg-input-icon-wrap">
                    <i class="pi pi-building"></i>
                    <input
                      id="cfg-empresa"
                      formControlName="empresa"
                      type="text"
                      class="cfg-input"
                      placeholder="Ex: Empresa Silva Ltda"
                    />
                  </div>
                </div>

           
                <div class="cfg-form-group col-span-2" [class.has-error]="isInvalid('endereco')">
                  <label class="cfg-label" for="cfg-endereco">
                    CEP <span class="cfg-required">*</span>
                  </label>
                  <div class="cfg-input-icon-wrap" style="display: flex; width: 100%; position: relative;">
                    <i class="pi pi-map-marker" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); z-index: 2; pointer-events: none;"></i>
                    <input type="text" formControlName="cep" class="cfg-input w-full" style="padding-left: 40px;" placeholder="Digite seu CEP (apenas números)" maxlength="9" (input)="buscarCepDirect($event, 'endereco')">
                  </div>
                  @if (form.get('endereco')?.value) {
                    <div style="margin-top: 8px; padding: 10px; background: var(--tcc-bg, #f8fafc); border-radius: 6px; border: 1px solid var(--tcc-border, #e2e8f0); font-size: 0.9em; color: var(--tcc-text-main, #475569);">
                      <i class="pi pi-check-circle" style="color: var(--tcc-primary, #3b82f6); margin-right: 6px;"></i>
                      <strong>Localização:</strong> {{ form.get('endereco')?.value }}
                    </div>
                  } @else {
                     <div style="margin-top: 8px; font-size: 0.85em; color: var(--tcc-danger, #ef4444);">
                        Digite um CEP válido para carregar o endereço.
                     </div>
                  }
                </div>
              </div>
            </section>
          }

          @if (userRole === 'admin') {
            <section class="cfg-section-card">
              <div class="cfg-section-header">
                <div class="cfg-section-icon icon-purple">
                  <i class="pi pi-shield"></i>
                </div>
                <div>
                  <h3 class="cfg-section-title">Acesso Administrativo</h3>
                  <p class="cfg-section-desc">Sua conta possui acesso irrestrito para gerenciar técnicos, clientes e configurações da plataforma</p>
                </div>
              </div>

              <div class="cfg-grid-2">
                <div class="cfg-form-group">
                  <label class="cfg-label" for="cfg-admin-nome">Nome / Identificação</label>
                  <div class="cfg-input-icon-wrap">
                    <i class="pi pi-user"></i>
                    <input
                      id="cfg-admin-nome"
                      formControlName="nome"
                      type="text"
                      class="cfg-input"
                      placeholder="Administrador"
                    />
                  </div>
                </div>

                <div class="cfg-form-group">
                  <label class="cfg-label" for="cfg-admin-cargo">Nível de Permissão</label>
                  <div class="cfg-input-icon-wrap readonly">
                    <i class="pi pi-verified"></i>
                    <input
                      id="cfg-admin-cargo"
                      formControlName="cargo"
                      type="text"
                      class="cfg-input"
                      readonly
                    />
                    <span class="cfg-readonly-badge"><i class="pi pi-lock"></i> Total</span>
                  </div>
                </div>
              </div>
            </section>
          }

       
          <div class="cfg-action-bar">
            <button
              type="button"
              class="cfg-btn-secondary"
              (click)="cancelar()"
              [disabled]="loading"
            >
              <i class="pi pi-times"></i>
              Cancelar
            </button>
            <button
              type="submit"
              class="cfg-btn-primary"
              [disabled]="form.invalid || loading || !temAlteracoes"
            >
              @if (loading) {
                <i class="pi pi-spin pi-spinner"></i>
                Salvando...
              } @else {
                <i class="pi pi-check"></i>
                Salvar Alterações
              }
            </button>
          </div>

        </form>
      }
    </div>
  `,
  styles: [`
    /* ==========================================================================
       Configurações Page Scoped Styles
       ========================================================================== */
    .cfg-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1000px;
      margin: 0 auto;
      padding-bottom: 40px;
    }

    /* Page Header */
    .cfg-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .cfg-header-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cfg-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .cfg-subtitle {
      font-size: 15px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .cfg-role-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .badge-admin {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      color: #6b21a8;
      border: 1px solid #e9d5ff;
    }

    .badge-tecnico {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .badge-cliente {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    /* Profile Banner */
    .cfg-profile-banner {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      transition: box-shadow 0.2s ease;
    }

    .cfg-profile-banner:hover {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
    }

    .cfg-banner-cover {
      height: 90px;
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #0ea5e9 100%);
      position: relative;
    }

    .cfg-banner-body {
      padding: 0 28px 20px 28px;
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      background: var(--tcc-surface, #ffffff);
    }

    .cfg-avatar-wrapper {
      margin-top: -45px;
      position: relative;
      flex-shrink: 0;
      z-index: 2;
    }

    .cfg-avatar-img,
    .cfg-avatar-fallback {
      width: 88px;
      height: 88px;
      border-radius: 20px;
      border: 4px solid var(--tcc-surface, #ffffff);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      object-fit: cover;
    }

    .cfg-avatar-wrapper {
      cursor: pointer;
    }

    .cfg-avatar-wrapper:hover .cfg-avatar-edit-overlay {
      opacity: 1;
    }

    .cfg-avatar-edit-overlay {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 5;
    }

    .cfg-avatar-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
    }

    .avatar-admin {
      background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);
    }

    .avatar-tecnico {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .avatar-cliente {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .cfg-avatar-status {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #10b981;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      border: 2px solid var(--tcc-surface, #ffffff);
    }

    .cfg-user-meta {
      padding-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .cfg-user-name-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .cfg-user-name {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }

    .cfg-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 12px;
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .cfg-user-email {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Form Container */
    .cfg-form-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Section Cards */
    .cfg-section-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 22px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
    }

    .cfg-section-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
    }

    .cfg-section-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .icon-blue {
      background: #eff6ff;
      color: #3b82f6;
    }

    .icon-purple {
      background: #faf5ff;
      color: #8b5cf6;
    }

    .icon-emerald {
      background: #ecfdf5;
      color: #10b981;
    }

    .cfg-section-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 2px 0;
    }

    .cfg-section-desc {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    /* Grid Form */
    .cfg-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .col-span-2 {
      grid-column: span 2;
    }

    /* Form Group & Inputs */
    .cfg-form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cfg-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cfg-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-main, #334155);
    }

    .cfg-cnpj-loading {
      font-size: 11px;
      color: var(--primary, #3b82f6);
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .cfg-required {
      color: #ef4444;
    }

    .cfg-optional {
      font-size: 12px;
      color: var(--tcc-text-muted, #94a3b8);
      font-weight: normal;
    }

    .cfg-input-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .cfg-input-icon-wrap > i {
      position: absolute;
      left: 14px;
      color: var(--tcc-text-muted, #94a3b8);
      font-size: 15px;
      pointer-events: none;
      transition: color 0.2s;
    }

    .cfg-input {
      width: 100%;
      height: 46px;
      padding: 0 14px 0 42px;
      border: 1px solid var(--tcc-border, #cbd5e1);
      background: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-main, #0f172a);
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .cfg-input:focus {
      border-color: var(--tcc-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .cfg-input:focus + i,
    .cfg-input-icon-wrap:focus-within > i {
      color: var(--tcc-primary, #3b82f6);
    }

    .cfg-input-icon-wrap.readonly .cfg-input {
      background: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-muted, #64748b);
      border-color: var(--tcc-border, #e2e8f0);
      cursor: not-allowed;
      padding-right: 76px;
    }

    .cfg-readonly-badge {
      position: absolute;
      right: 12px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      background: var(--tcc-border, #e2e8f0);
      padding: 3px 8px;
      border-radius: 6px;
    }

    /* Custom Select Dropdowns */
    .cfg-select-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .cfg-select-left-icon {
      position: absolute;
      left: 14px;
      color: var(--tcc-text-muted, #94a3b8);
      font-size: 15px;
      pointer-events: none;
      transition: color 0.2s;
    }

    .cfg-select-arrow {
      position: absolute;
      right: 14px;
      color: var(--tcc-text-muted, #94a3b8);
      font-size: 12px;
      pointer-events: none;
    }

    .cfg-select {
      width: 100%;
      height: 46px;
      padding: 0 36px 0 42px;
      border: 1px solid var(--tcc-border, #cbd5e1);
      background: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-main, #0f172a);
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .cfg-select:focus {
      border-color: var(--tcc-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .cfg-select-wrap:focus-within > .cfg-select-left-icon {
      color: var(--tcc-primary, #3b82f6);
    }

    .cfg-hint {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      line-height: 1.4;
    }

    .cfg-form-group.has-error .cfg-input,
    .cfg-form-group.has-error .cfg-select {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .cfg-form-group.has-error .cfg-input:focus,
    .cfg-form-group.has-error .cfg-select:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .cfg-error-text {
      font-size: 12px;
      color: #ef4444;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }

    /* Action Bar */
    .cfg-action-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding: 20px 28px;
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
    }

    .cfg-btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      border-radius: 10px;
      border: 1px solid var(--tcc-border, #cbd5e1);
      background: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-main, #475569);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cfg-btn-secondary:hover:not(:disabled) {
      background: var(--tcc-bg, #f8fafc);
      border-color: var(--tcc-primary, #3b82f6);
      color: var(--tcc-primary, #3b82f6);
    }

    .cfg-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 26px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.25);
      transition: all 0.2s ease;
    }

    .cfg-btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
      transform: translateY(-1px);
    }

    .cfg-btn-primary:disabled,
    .cfg-btn-secondary:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* Skeleton Loading */
    .cfg-skeleton-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .cfg-skeleton-banner {
      height: 180px;
      border-radius: 16px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .cfg-skeleton-card {
      height: 320px;
      border-radius: 16px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .cfg-grid-2 {
        grid-template-columns: 1fr;
      }

      .col-span-2 {
        grid-column: span 1;
      }

      .cfg-banner-body {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .cfg-action-bar {
        flex-direction: column-reverse;
      }

      .cfg-btn-primary,
      .cfg-btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ConfiguracoesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private location = inject(Location);
  private consultaExternaService = inject(ConsultaExternaService);
  private http = inject(HttpClient);

  form!: FormGroup;
  userRole: 'cliente' | 'tecnico' | 'admin' = 'tecnico';
  loading = false;
  isLoadingInitialData = true;
  buscandoCnpj = false;
  ultimoCnpjBuscado = '';

  sugestoesLocal: string[] = [];
  municipiosCache: string[] = [];
  
  buscarCepDirect(event: any, controlName: string) {
    const query = (event.target.value || '').trim();
    const cepMatch = query.replace(/\D/g, '');
    if (cepMatch.length === 8) {
      this.consultaExternaService.consultarCep(cepMatch).subscribe({
        next: (data: any) => {
          if (data) {
            const enderecoFormatado = `${data.logradouro}, ${data.bairro}, ${data.cidade} - ${data.uf}`;
            this.form.patchValue({ [controlName]: enderecoFormatado });
          } else {
             this.form.patchValue({ [controlName]: '' });
          }
        },
        error: () => this.form.patchValue({ [controlName]: '' })
      });
    } else {
        if (cepMatch.length === 0 || cepMatch.length > 5) {
            this.form.patchValue({ [controlName]: '' });
        }
    }
  }

  userEmail = '';
  userPicture = '';
  selectedPhotoFile: File | null = null;
  private initialFormData: any = {};

  private cnpjValidator(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    const clean = String(value).replace(/\D/g, '');
    if (clean.length === 0) return null;
    if (clean.length !== 14) return { 'invalidCNPJLength': true };
    return validarCNPJ(clean) ? null : { 'invalidCNPJ': true };
  }

  onCnpjBlur(): void {
    const cnpj = this.form?.get('cnpj')?.value;
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
          const currentNome = this.form.get('nome_fantasia')?.value;
          const currentLocal = this.form.get('local')?.value;
          const currentTelefone = this.form.get('telefone')?.value;

          const patchObj: any = {};
          if (!currentNome || currentNome.trim().length === 0) {
            patchObj.nome_fantasia = nomeEmpresa;
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
            this.form.patchValue(patchObj);
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

  ngOnInit() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/admin')) {
      this.userRole = 'admin';
    } else if (currentUrl.includes('/cliente')) {
      this.userRole = 'cliente';
    } else {
      this.userRole = 'tecnico';
    }

    this.profileService.verificarPerfilExistente().pipe(first()).subscribe(profile => {
      if (profile && profile.type === 'admin') {
        this.userRole = 'admin';
      }
    });

    this.auth.user$.pipe(first()).subscribe(user => {
      if (user) {
        const roles = (user as any)['https://tcc-ng.com/roles'] || [];
        if (Array.isArray(roles) && roles.length > 0) {
          if (roles.includes('admin')) {
            this.userRole = 'admin';
          } else if (roles.includes('cliente')) {
            this.userRole = 'cliente';
          } else {
            this.userRole = 'tecnico';
          }
        }
        this.userEmail = user.email || '';
        this.userPicture = user.picture || '';
        this.initForm(user.email || '');
        this.carregarDadosPerfil();
        
        // Sobrescrever se houver foto no perfil customizado
        this.profileService.profilePicture$.subscribe((pic: any) => {
          if (pic) this.userPicture = pic;
        });
      } else {
        this.initForm('');
        this.carregarDadosPerfil();
      }
    });
  }

  initForm(email: string) {
    if (this.userRole === 'admin') {
      this.form = this.fb.group({
        email: [{ value: email, disabled: true }],
        nome: [this.userEmail ? this.userEmail.split('@')[0] : 'Administrador', Validators.required],
        cargo: [{ value: 'Administrador da Plataforma', disabled: true }]
      });
    } else if (this.userRole === 'tecnico') {
      this.form = this.fb.group({
        email: [{ value: email, disabled: true }],
        telefone: ['', Validators.required],
        nome_fantasia: ['', Validators.required],
        cnpj: ['', [this.cnpjValidator]],
        especialidade: ['Suporte Técnico', Validators.required],
        local: ['', Validators.required],
        cep: [''],
        tempoResposta: ['Em até 1 hora', Validators.required],
        bio: ['']
      });
    } else {
      this.form = this.fb.group({
        email: [{ value: email, disabled: true }],
        telefone: ['', Validators.required],
        nome_completo: ['', Validators.required],
        empresa: [''],
        endereco: ['', Validators.required],
        cep: ['']
      });
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form?.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getDisplayName(): string {
    if (!this.form) return '';
    if (this.userRole === 'admin') {
      return this.form.get('nome')?.value || this.userEmail.split('@')[0] || 'Administrador';
    }
    if (this.userRole === 'tecnico') {
      return this.form.get('nome_fantasia')?.value || '';
    }
    return this.form.get('nome_completo')?.value || '';
  }

  get temAlteracoes(): boolean {
    if (this.selectedPhotoFile !== null) return true;
    if (!this.initialFormData || Object.keys(this.initialFormData).length === 0) return false;
    const current = this.form.getRawValue();
    return Object.keys(this.initialFormData).some(key => current[key] !== this.initialFormData[key]);
  }

  getUserInitials(): string {
    const name = this.getDisplayName();
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (this.userRole === 'admin') return 'AD';
    return this.userRole === 'tecnico' ? 'T' : 'C';
  }

  private parseDescricao(descricao: string | undefined): { especialidade: string; local: string; tempoResposta: string; bio: string } {
    if (!descricao) {
      return { especialidade: 'Suporte Técnico', local: '', tempoResposta: 'Em até 1 hora', bio: '' };
    }

    let especialidade = 'Suporte Técnico';
    let local = '';
    let tempoResposta = 'Em até 1 hora';
    let bio = '';

    const parts = descricao.split('|').map(p => p.trim());
    for (const part of parts) {
      if (part.toLowerCase().startsWith('especialidade:')) {
        especialidade = part.replace(/^especialidade:\s*/i, '').trim();
      } else if (part.toLowerCase().startsWith('local:')) {
        local = part.replace(/^local:\s*/i, '').trim();
      } else if (part.toLowerCase().startsWith('tempo de resposta:')) {
        tempoResposta = part.replace(/^tempo de resposta:\s*/i, '').trim();
      } else {
        bio += (bio ? ' ' : '') + part;
      }
    }

    return { especialidade, local, tempoResposta, bio };
  }

  private formatDescricao(especialidade: string, local: string, tempoResposta: string, bio: string): string {
    const parts: string[] = [];
    if (especialidade) parts.push(`Especialidade: ${especialidade}`);
    if (local) parts.push(`Local: ${local}`);
    if (tempoResposta) parts.push(`Tempo de resposta: ${tempoResposta}`);
    if (bio) parts.push(bio);
    return parts.join(' | ');
  }

  carregarDadosPerfil() {
    if (this.userRole === 'admin') {
      this.isLoadingInitialData = false;
      this.initialFormData = { nome: this.form.get('nome')?.value };
      return;
    }

    this.isLoadingInitialData = true;

    const getProfile$: Observable<any> = this.userRole === 'tecnico'
      ? this.profileService.obterPerfilTecnico()
      : this.profileService.obterPerfilCliente();

    getProfile$.pipe(first()).subscribe({
      next: (data: any) => {
        if (this.userRole === 'tecnico') {
          const parsedDesc = this.parseDescricao(data.descricao_servicos);
          const patchData = {
            telefone: data.telefone || '',
            nome_fantasia: data.nome_fantasia || '',
            cnpj: data.cnpj || '',
            especialidade: parsedDesc.especialidade,
            local: parsedDesc.local || data.endereco || '',
            tempoResposta: parsedDesc.tempoResposta,
            bio: parsedDesc.bio
          };
          this.form.patchValue(patchData);
          this.initialFormData = { ...patchData };
        } else {
          const patchData = {
            telefone: data.telefone || '',
            nome_completo: data.nome_completo || data.nomeCompleto || '',
            empresa: data.empresa || '',
            endereco: data.endereco || data.local || ''
          };
          this.form.patchValue(patchData);
          this.initialFormData = { ...patchData };
        }
        this.isLoadingInitialData = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar perfil:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar seus dados. Por favor, tente novamente.'
        });
        this.isLoadingInitialData = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedPhotoFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userPicture = e.target?.result as string;
        this.form.markAsDirty(); // Habilita o botão salvar
      };
      reader.readAsDataURL(file);
    }
  }

  salvarConfiguracoes() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.userRole === 'admin') {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Configurações de administrador salvas com sucesso!',
        life: 2500
      });
      setTimeout(() => {
        this.voltar();
      }, 1000);
      return;
    }

    this.loading = true;
    const formData = this.form.getRawValue();

    let saveProfile$: Observable<any>;

    let localValue = formData.local;
    if (typeof localValue === 'object' && localValue !== null && localValue.value) {
      localValue = localValue.value;
    }

    let enderecoValue = formData.endereco;
    if (typeof enderecoValue === 'object' && enderecoValue !== null && enderecoValue.value) {
      enderecoValue = enderecoValue.value;
    }

    if (this.userRole === 'tecnico') {
      const descricaoFormatada = this.formatDescricao(
        formData.especialidade,
        localValue,
        formData.tempoResposta,
        formData.bio
      );
      saveProfile$ = this.profileService.atualizarPerfilTecnico({
        nome: formData.nome_fantasia,
        telefone: formData.telefone,
        cnpj: formData.cnpj,
        descricao_servicos: descricaoFormatada,
        local: localValue
      } as TecnicoUpdateRequest);
    } else {
      saveProfile$ = this.profileService.atualizarPerfilCliente({
        nome: formData.nome_completo,
        telefone: formData.telefone,
        empresa: formData.empresa,
        local: enderecoValue
      } as ClienteUpdateRequest);
    }

    const saveFlow$ = this.selectedPhotoFile 
      ? this.profileService.uploadFotoPerfil(this.selectedPhotoFile).pipe(
          switchMap(() => saveProfile$)
        )
      : saveProfile$;

    saveFlow$.pipe(first()).subscribe({
      next: (_: any) => {
        this.loading = false;
        this.initialFormData = { ...formData };
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Configurações atualizadas com sucesso!',
          life: 2500
        });
        setTimeout(() => {
          this.voltar();
        }, 1000);
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Erro ao salvar perfil:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao atualizar configurações. Por favor, tente novamente.'
        });
      }
    });
  }

  cancelar() {
    this.voltar();
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      if (this.userRole === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (this.userRole === 'tecnico') {
        this.router.navigate(['/painel/dashboard']);
      } else {
        this.router.navigate(['/cliente/home']);
      }
    }
  }
}