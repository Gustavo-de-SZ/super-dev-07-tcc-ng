import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { InputMaskModule } from 'primeng/inputmask';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { HttpClient } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';
import { ConsultaExternaService } from '../../../services/consulta-externa.service';

@Component({
  selector: 'app-novo-cliente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    InputMaskModule,
    AutoCompleteModule,
    ToastModule
  ],
  template: `
    <div class="ns-page-container">
      
      <header class="ns-page-header">
        <a routerLink="/painel/clientes" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div class="ns-header-title-box">
          <h1>Adicionar Cliente</h1>
          <p>Vincule um usuário real do aplicativo ou realize um cadastro manual</p>
        </div>
      </header>

   
      <div class="ns-tab-bar">
        <button 
          type="button" 
          class="ns-tab-btn" 
          [class.active]="modoAba === 'busca'"
          (click)="setAba('busca')"
        >
          <i class="pi pi-search"></i>
          <span>Buscar Usuário da Plataforma</span>
          <span class="ns-tab-badge">Recomendado</span>
        </button>

        <button 
          type="button" 
          class="ns-tab-btn" 
          [class.active]="modoAba === 'manual'"
          (click)="setAba('manual')"
        >
          <i class="pi pi-user-edit"></i>
          <span>Cadastrar Manualmente (Sem App)</span>
        </button>
      </div>

    
      @if (modoAba === 'busca') {
        <div class="ns-search-section tcc-fade-in">
          <div class="ns-card ns-search-hero">
            <div class="ns-search-header-text">
              <h2><i class="pi pi-users text-primary"></i> Usuários Cadastrados no App</h2>
              <p>Pesquise pelo nome, e-mail ou telefone para vincular clientes que já possuem conta na plataforma à sua carteira.</p>
            </div>

            <div class="ns-search-input-wrapper">
              <i class="pi pi-search ns-search-icon"></i>
              <input 
                type="text" 
                class="ns-search-input" 
                placeholder="Digite o nome, e-mail ou telefone do cliente..." 
                [(ngModel)]="termoBusca"
                (input)="onSearchInput()"
              />
              @if (termoBusca) {
                <button type="button" class="ns-search-clear" (click)="limparBusca()" title="Limpar busca">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>
          </div>

       
          <div class="ns-results-container">
            @if (buscandoUsuarios) {
              <div class="ns-loading-state">
                <i class="pi pi-spin pi-spinner text-primary"></i>
                <p>Buscando usuários cadastrados na plataforma...</p>
              </div>
            } @else if (usuariosEncontrados.length > 0) {
              <div class="ns-users-grid">
                @for (usuario of usuariosEncontrados; track usuario.id) {
                  <div class="ns-user-card" [class.ns-user-linked]="usuario.ja_vinculado">
                    <div class="ns-user-card-top">
                      <div class="ns-user-avatar">
                        {{ getInitials(usuario.nome_completo || usuario.nome) }}
                      </div>
                      <div class="ns-user-info">
                        <div class="ns-user-title-row">
                          <h3 class="ns-user-name">{{ usuario.nome_completo || usuario.nome }}</h3>
                          @if (usuario.empresa) {
                            <span class="ns-badge-company">{{ usuario.empresa }}</span>
                          }
                        </div>
                        <div class="ns-user-meta">
                          @if (usuario.email) {
                            <span class="ns-meta-pill"><i class="pi pi-envelope"></i> {{ usuario.email }}</span>
                          }
                          @if (usuario.telefone) {
                            <span class="ns-meta-pill"><i class="pi pi-phone"></i> {{ formatPhone(usuario.telefone) }}</span>
                          }
                          @if (usuario.endereco || usuario.local) {
                            <span class="ns-meta-pill"><i class="pi pi-map-marker"></i> {{ usuario.endereco || usuario.local }}</span>
                          }
                        </div>
                      </div>
                    </div>

                    <div class="ns-user-card-footer">
                      <div class="ns-user-status">
                        <span class="ns-badge-app-user"><i class="pi pi-verified"></i> Conta Ativa no App</span>
                        @if (usuario.avaliacao && usuario.avaliacao > 0) {
                          <span class="ns-badge-rating"><i class="pi pi-star-fill"></i> {{ usuario.avaliacao.toFixed(1) }}</span>
                        }
                      </div>

                      <div class="ns-user-actions">
                        @if (usuario.ja_vinculado) {
                          <span class="ns-badge-linked">
                            <i class="pi pi-check-circle"></i> Já na sua base
                          </span>
                        } @else {
                          <button 
                            type="button" 
                            class="tcc-btn-link" 
                            [disabled]="vinculandoId === usuario.id"
                            (click)="vincularCliente(usuario)"
                          >
                            @if (vinculandoId === usuario.id) {
                              <i class="pi pi-spin pi-spinner"></i>
                              <span>Vinculando...</span>
                            } @else {
                              <i class="pi pi-user-plus"></i>
                              <span>Adicionar à Minha Base</span>
                            }
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else if (termoBusca && !buscandoUsuarios) {
              <div class="ns-empty-results">
                <div class="ns-empty-icon">
                  <i class="pi pi-user-minus"></i>
                </div>
                <h3>Nenhum cliente encontrado</h3>
                <p>Não encontramos nenhum usuário cadastrado com o termo "<strong>{{ termoBusca }}</strong>".</p>
                <button type="button" class="tcc-btn-switch-manual" (click)="preencherManualComBusca()">
                  <i class="pi pi-user-edit"></i> Cadastrar manualmente este cliente
                </button>
              </div>
            } @else {
              <div class="ns-empty-prompt">
                <i class="pi pi-search ns-prompt-icon"></i>
                <h3>Buscar clientes na plataforma</h3>
                <p>Comece a digitar acima para localizar clientes que utilizam o aplicativo.</p>
              </div>
            }
          </div>
        </div>
      }

  
      @if (modoAba === 'manual') {
        <div class="ns-grid-layout tcc-fade-in">
          
          <main class="ns-form-column">
            <form [formGroup]="clienteForm">

              <section class="ns-card">
                <h2 class="ns-card-title">
                  <i class="pi pi-user text-primary"></i> Informações Principais
                </h2>
                
                <div class="ns-form-row-2">
                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('nome')">
                    <label for="nome">Nome Completo *</label>
                    <input id="nome" type="text" formControlName="nome" class="ns-input" placeholder="Ex: João Silva" />
                    @if (hasError('nome', 'required')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> Nome é obrigatório</span>
                    } @else if (hasError('nome', 'minlength')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> Mínimo de 3 caracteres</span>
                    }
                  </div>

                  <div class="ns-form-group">
                    <label for="empresa">Empresa (Opcional)</label>
                    <input id="empresa" type="text" formControlName="empresa" class="ns-input" placeholder="Ex: Tech Solutions" />
                  </div>
                </div>

                <div class="ns-form-row-2">
                  <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('email')">
                    <label for="email">E-mail</label>
                    <input id="email" type="email" formControlName="email" class="ns-input" placeholder="exemplo@email.com" />
                  </div>

                  <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('telefone')">
                    <label for="telefone">Telefone / WhatsApp *</label>
                    <p-inputmask
                      id="telefone"
                      formControlName="telefone"
                      mask="(99) 99999-9999"
                      placeholder="(99) 99999-9999"
                      class="ns-input"
                    ></p-inputmask>
                    @if (hasError('telefone', 'required')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> Telefone é obrigatório</span>
                    }
                  </div>
                </div>
              </section>

              <section class="ns-card">
                <h2 class="ns-card-title">
                  <i class="pi pi-map-marker text-primary"></i> Localização / Endereço
                </h2>

                <div class="ns-form-row-3-cep">
                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('cep')">
                    <div class="ns-label-row">
                      <label for="cep">CEP *</label>
                      @if (buscandoCep) {
                        <span class="ns-cep-loading"><i class="pi pi-spin pi-spinner"></i> Buscando...</span>
                      }
                    </div>
                    <p-inputmask
                      id="cep"
                      formControlName="cep"
                      mask="99999-999"
                      placeholder="00000-000"
                      class="ns-input"
                      (onBlur)="onCepBlur()"
                      (onInput)="onCepInput($event)"
                    ></p-inputmask>
                    @if (hasError('cep', 'required')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> CEP obrigatório</span>
                    } @else if (hasError('cep', 'pattern')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> CEP inválido</span>
                    }
                  </div>

                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('rua')" style="grid-column: span 2;">
                    <label for="rua">Rua / Avenida *</label>
                    <input id="rua" type="text" formControlName="rua" class="ns-input" placeholder="Ex: Av. Central" />
                    @if (hasError('rua', 'required')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> Rua é obrigatória</span>
                    }
                  </div>
                </div>

                <div class="ns-form-row-3">
                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('numero')">
                    <label for="numero">Número *</label>
                    <input id="numero" type="text" formControlName="numero" class="ns-input" placeholder="Ex: 123" />
                    @if (hasError('numero', 'required')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                    }
                  </div>

                  <div class="ns-form-group">
                    <label for="complemento">Complemento</label>
                    <input id="complemento" type="text" formControlName="complemento" class="ns-input" placeholder="Ex: Bloco A" />
                  </div>

                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('bairro')">
                    <label for="bairro">Bairro *</label>
                    <input id="bairro" type="text" formControlName="bairro" class="ns-input" placeholder="Ex: Centro" />
                    @if (hasError('bairro', 'required')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                    }
                  </div>
                </div>

                <div class="ns-form-row-2">
                  <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('cidade')">
                    <label for="cidade">Cidade *</label>
                    <p-autoComplete
                        id="cidade"
                        formControlName="cidade"
                        [suggestions]="filteredCidades"
                        (completeMethod)="filterCidades($event)"
                        field="label"
                        placeholder="Ex: São Paulo - SP"
                        emptyMessage="Nenhum resultado encontrado"
                        inputStyleClass="ns-input"
                        [styleClass]="isInvalid('cidade') ? 'ns-input-error' : ''"
                        autocomplete="off"
                      ></p-autoComplete>
                    @if (hasError('cidade', 'required')) {
                      <span class="ns-error-text"><i class="pi pi-info-circle"></i> Cidade é obrigatória</span>
                    }
                  </div>
                </div>
              </section>

              <section class="ns-card">
                <div class="ns-form-group mb-0">
                  <label for="observacoes">Observações adicionais (opcional)</label>
                  <textarea 
                    id="observacoes" 
                    formControlName="observacoes" 
                    class="ns-input ns-textarea" 
                    rows="4" 
                    placeholder="Restrições de horário, detalhes técnicos do cliente, etc."
                  ></textarea>
                </div>
              </section>

            </form>
          </main>

          <aside class="ns-summary-column">
            <div class="ns-card ns-summary-card">
              <h3>Resumo do Cadastro Manual</h3>

              <div class="ns-summary-list">
                <div class="ns-summary-item">
                  <span class="label">Nome</span>
                  <span class="value ns-truncate" [title]="clienteForm.get('nome')?.value">{{ clienteForm.get('nome')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Empresa</span>
                  <span class="value ns-truncate" [title]="clienteForm.get('empresa')?.value">{{ clienteForm.get('empresa')?.value || 'Particular' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">E-mail</span>
                  <span class="value ns-truncate" [title]="clienteForm.get('email')?.value">{{ clienteForm.get('email')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Contato</span>
                  <span class="value">{{ clienteForm.get('telefone')?.value || '—' }}</span>
                </div>
              </div>

              <div class="ns-summary-divider"></div>

              <div class="ns-summary-address-box">
                <span class="ns-address-title"><i class="pi pi-map"></i> Visualização do Endereço:</span>
                <p class="ns-address-preview">{{ getEnderecoPreview() }}</p>
              </div>

              <div class="ns-summary-actions">
                <button type="button" class="tcc-btn-main" [disabled]="clienteForm.invalid || enviando" (click)="cadastrar()" style="display:flex; align-items:center; justify-content:center; gap:8px;">
                  @if(enviando) { <i class="pi pi-spin pi-spinner"></i> }
                  Cadastrar Cliente
                </button>
                <button type="button" class="tcc-btn-cancel" (click)="cancelar()">
                  Cancelar
                </button>
              </div>
            </div>
          </aside>

        </div>
      }

    </div>
  `,
  styles: [`
    .ns-page-container {
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --primary-bg: #eff6ff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --border-input: #94a3b8;
      --bg-main: #f8fafc;
      --bg-card: #ffffff;
      --error: #ef4444;
      --error-bg: #fef2f2;
      --success: #10b981;
      --success-bg: #ecfdf5;

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
      --success-bg: rgba(16, 185, 129, 0.15);
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

    /* TAB BAR */
    .ns-tab-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }
    .ns-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted);
      transition: all 0.2s ease;
    }
    .ns-tab-btn:hover {
      background: var(--primary-bg);
      color: var(--primary);
    }
    .ns-tab-btn.active {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    }
    .ns-tab-btn.active .ns-tab-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }
    .ns-tab-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--primary-bg);
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* BUSCA HERO */
    .ns-search-hero {
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .ns-search-header-text h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ns-search-header-text p {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0;
    }
    .ns-search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .ns-search-icon {
      position: absolute;
      left: 16px;
      color: var(--text-muted);
      font-size: 16px;
      pointer-events: none;
    }
    .ns-search-input {
      width: 100%;
      height: 48px;
      padding: 12px 42px 12px 46px;
      border-radius: 10px;
      border: 1.5px solid var(--border-input);
      background-color: var(--bg-card);
      color: var(--text-main);
      font-size: 15px;
      outline: none;
      transition: all 0.2s ease;
    }
    .ns-search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-bg);
    }
    .ns-search-clear {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
    }
    .ns-search-clear:hover {
      color: var(--text-main);
    }

    /* RESULTADOS DA BUSCA */
    .ns-users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 16px;
    }
    .ns-user-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .ns-user-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(0,0,0,0.06);
      border-color: var(--primary);
    }
    .ns-user-card.ns-user-linked {
      border-color: rgba(16, 185, 129, 0.4);
      background: linear-gradient(to bottom right, var(--bg-card), var(--success-bg));
    }
    .ns-user-card-top {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .ns-user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    }
    .ns-user-info {
      flex: 1;
      min-width: 0;
    }
    .ns-user-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 6px;
    }
    .ns-user-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ns-badge-company {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      background: var(--border);
      color: var(--text-muted);
      border-radius: 6px;
    }
    .ns-user-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ns-meta-pill {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
      word-break: break-all;
    }
    .ns-meta-pill i {
      color: var(--primary);
      font-size: 12px;
    }

    .ns-user-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 14px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .ns-user-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ns-badge-app-user {
      font-size: 11px;
      font-weight: 600;
      color: var(--primary);
      background: var(--primary-bg);
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .ns-badge-rating {
      font-size: 12px;
      font-weight: 700;
      color: #f59e0b;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .ns-badge-linked {
      font-size: 12px;
      font-weight: 700;
      color: var(--success);
      background: var(--success-bg);
      padding: 6px 12px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .tcc-btn-link {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s, transform 0.1s;
    }
    .tcc-btn-link:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .tcc-btn-link:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ESTADOS DE BUSCA */
    .ns-loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 60px 20px;
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px dashed var(--border);
    }
    .ns-loading-state i { font-size: 28px; }
    .ns-loading-state p { color: var(--text-muted); font-size: 14px; margin: 0; }

    .ns-empty-results, .ns-empty-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 50px 20px;
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px dashed var(--border);
    }
    .ns-empty-icon, .ns-prompt-icon {
      font-size: 36px;
      color: var(--text-muted);
      margin-bottom: 12px;
      opacity: 0.6;
    }
    .ns-empty-results h3, .ns-empty-prompt h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 6px 0;
    }
    .ns-empty-results p, .ns-empty-prompt p {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0 0 16px 0;
      max-width: 420px;
    }
    .tcc-btn-switch-manual {
      background: var(--primary-bg);
      color: var(--primary);
      border: 1px solid var(--primary);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tcc-btn-switch-manual:hover {
      background: var(--primary);
      color: #ffffff;
    }

    /* GRID LAYOUT DO FORM MANUAL */
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
    .ns-label-row { display: flex; align-items: center; justify-content: space-between; }
    .ns-cep-loading { font-size: 11px; color: var(--primary); font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }
    
    .ns-form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .ns-form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .ns-form-row-3-cep { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
    @media (max-width: 768px) { .ns-form-row-2, .ns-form-row-3, .ns-form-row-3-cep { grid-template-columns: 1fr; } }

    ::ng-deep .ns-input:not(p-inputmask) {
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
    ::ng-deep p-inputmask.ns-input {
      width: 100% !important;
      display: inline-flex !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
    }
    ::ng-deep p-inputmask.ns-input input,
    ::ng-deep p-inputmask.ns-input .p-inputtext {
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
    ::ng-deep .ns-input::placeholder,
    ::ng-deep p-inputmask.ns-input input::placeholder {
      color: var(--text-muted) !important;
      opacity: 0.7;
    }
    ::ng-deep .ns-input:focus, 
    ::ng-deep p-inputmask.ns-input input:focus {
      border-color: var(--primary) !important;
      outline: none !important;
      box-shadow: 0 0 0 1px var(--primary) !important;
    }
    .ns-textarea { resize: vertical; min-height: 100px; }

    .ns-error-text { color: var(--error); font-size: 12px; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
    .ns-is-invalid label { color: var(--error) !important; }
    .ns-is-invalid ::ng-deep .ns-input:not(p-inputmask), 
    .ns-is-invalid ::ng-deep p-inputmask.ns-input input {
      border-color: var(--error) !important;
      background-color: var(--error-bg) !important;
    }

    .ns-summary-column { position: sticky; top: 24px; }
    .ns-summary-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 20px 0; }
    
    .ns-summary-list { display: flex; flex-direction: column; gap: 14px; }
    .ns-summary-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; gap: 16px; }
    .ns-summary-item .label { color: var(--text-muted); font-weight: 500; white-space: nowrap; }
    .ns-summary-item .value { font-weight: 500; text-align: right; color: var(--text-main); }
    .ns-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
    
    .ns-summary-divider { height: 1px; background-color: var(--border); margin: 20px 0; }
    
    .ns-summary-address-box { background: var(--bg-main); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
    .ns-address-title { font-size: 12px; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
    .ns-address-preview { font-size: 13px; color: var(--text-main); margin: 0; line-height: 1.4; word-break: break-word; }

    .ns-summary-actions { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
    
    .tcc-btn-main {
      width: 100%; background: var(--primary); color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .tcc-btn-main:hover:not(:disabled) { background: var(--primary-hover); }
    .tcc-btn-main:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .tcc-btn-cancel { width: 100%; background: transparent; border: none; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; text-align: center; transition: color 0.2s; }
    .tcc-btn-cancel:hover { color: var(--text-main); text-decoration: underline; }

    .tcc-fade-in {
      animation: fadeIn 0.25s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NovoCliente implements OnInit, OnDestroy {
  modoAba: 'busca' | 'manual' = 'busca';

  // Estados da Busca
  termoBusca = '';
  buscandoUsuarios = false;
  usuariosEncontrados: Cliente[] = [];
  vinculandoId: number | null = null;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Estados do Cadastro Manual
  enviando = false;
  buscandoCep = false;
  ultimoCepBuscado = '';
  cidades: any[] = [];
  filteredCidades: any[] = [];

  private readonly http = inject(HttpClient);
  private readonly consultaExternaService = inject(ConsultaExternaService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);

  clienteForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    email: [''],
    telefone: ['', [Validators.required, Validators.maxLength(15)]],
    empresa: [''],
    rua: ['', [Validators.required, Validators.maxLength(255)]],
    numero: ['', [Validators.required, Validators.maxLength(10)]],
    complemento: [''],
    bairro: ['', [Validators.required, Validators.maxLength(100)]],
    cidade: ['', [Validators.required, Validators.maxLength(100)]],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    observacoes: ['']
  });

  ngOnInit() {
    this.carregarCidades();
    this.setupSearch();
    // Inicia buscando clientes da plataforma
    this.buscarUsuarios('');
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  setAba(aba: 'busca' | 'manual') {
    this.modoAba = aba;
  }

  // --- LÓGICA DE BUSCA & VÍNCULO ---
  private setupSearch() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(termo => {
      this.buscarUsuarios(termo);
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.termoBusca);
  }

  limparBusca() {
    this.termoBusca = '';
    this.buscarUsuarios('');
  }

  buscarUsuarios(termo: string) {
    this.buscandoUsuarios = true;
    this.clienteService.pesquisarUsuariosReais(termo).subscribe({
      next: (clientes) => {
        this.usuariosEncontrados = clientes;
        this.buscandoUsuarios = false;
      },
      error: (err) => {
        console.error('Erro ao buscar usuários reais:', err);
        this.buscandoUsuarios = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro na busca',
          detail: 'Não foi possível carregar os usuários da plataforma'
        });
      }
    });
  }

  vincularCliente(usuario: Cliente) {
    if (!usuario.id) return;
    this.vinculandoId = usuario.id;

    this.clienteService.vincularClienteTecnico(usuario.id).subscribe({
      next: () => {
        this.vinculandoId = null;
        usuario.ja_vinculado = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Cliente Vinculado!',
          detail: `${usuario.nome_completo || usuario.nome} foi adicionado à sua base com sucesso.`
        });
      },
      error: (err) => {
        this.vinculandoId = null;
        console.error('Erro ao vincular cliente:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível vincular este cliente à sua base.'
        });
      }
    });
  }

  preencherManualComBusca() {
    this.modoAba = 'manual';
    if (this.termoBusca) {
      if (this.termoBusca.includes('@')) {
        this.clienteForm.patchValue({ email: this.termoBusca });
      } else if (/\d{4,}/.test(this.termoBusca)) {
        this.clienteForm.patchValue({ telefone: this.termoBusca });
      } else {
        this.clienteForm.patchValue({ nome: this.termoBusca });
      }
    }
  }

  getInitials(nome?: string): string {
    if (!nome) return 'CL';
    const parts = nome.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  }

  formatPhone(phone?: string): string {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (clean.length === 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  // --- LÓGICA DO CADASTRO MANUAL ---
  isInvalid(controlName: string): boolean {
    const control = this.clienteForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.clienteForm.get(controlName);
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched));
  }

  onCepBlur() {
    const cep = this.clienteForm.get('cep')?.value;
    if (cep) {
      this.buscarEnderecoPorCep(cep);
    }
  }

  onCepInput(event: any) {
    const val = event?.target ? event.target.value : event;
    const clean = String(val || '').replace(/\D/g, '');
    if (clean.length === 8 && clean !== this.ultimoCepBuscado) {
      this.buscarEnderecoPorCep(clean);
    }
  }

  buscarEnderecoPorCep(cep: string) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    if (clean === this.ultimoCepBuscado) return;

    this.buscandoCep = true;
    this.ultimoCepBuscado = clean;

    this.consultaExternaService.consultarCep(clean).subscribe({
      next: (data) => {
        this.buscandoCep = false;
        if (data && (data.logradouro || data.bairro || data.cidade)) {
          const cidadeFormatada = data.uf ? `${data.cidade} - ${data.uf}` : data.cidade;
          this.clienteForm.patchValue({
            rua: data.logradouro || this.clienteForm.get('rua')?.value || '',
            bairro: data.bairro || this.clienteForm.get('bairro')?.value || '',
            cidade: cidadeFormatada || this.clienteForm.get('cidade')?.value || '',
            complemento: data.complemento || this.clienteForm.get('complemento')?.value || ''
          });

          setTimeout(() => {
            const numInput = document.getElementById('numero');
            if (numInput) numInput.focus();
          }, 100);

          this.messageService.add({
            severity: 'info',
            summary: 'CEP Localizado',
            detail: `${data.logradouro ? data.logradouro + ', ' : ''}${data.bairro} (${data.cidade}/${data.uf})`
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'CEP não localizado',
            detail: 'Não encontramos o endereço para este CEP. Você pode preencher manualmente.'
          });
        }
      },
      error: () => {
        this.buscandoCep = false;
      }
    });
  }

  getEnderecoPreview(): string {
    const f = this.clienteForm.value;
    if (!f.rua && !f.numero && !f.bairro && !f.cidade) return 'Nenhum endereço informado.';
    
    let endereco = f.rua || '—';
    endereco += `, ${f.numero || 'S/N'}`;
    if (f.complemento) endereco += ` (${f.complemento})`;
    if (f.bairro) endereco += `, ${f.bairro}`;
    if (f.cidade) endereco += ` - ${typeof f.cidade === "object" ? (f.cidade as any).value : f.cidade}`;
    if (f.cep) endereco += ` [CEP: ${f.cep}]`;
    
    return endereco;
  }

  cadastrar() {
    if (this.enviando) return;
    this.enviando = true;
    if (this.clienteForm.valid) {
      const formData = this.clienteForm.getRawValue();

      const enderecoCompleto = `${formData.rua!}, ${formData.numero!}${formData.complemento ? ` ${formData.complemento}` : ''}, ${formData.bairro!}, ${formData.cidade!} - ${formData.cep!}`;

      const cliente: Cliente = {
        nome: formData.nome!,
        empresa: formData.empresa ?? '',
        avaliacao: 0,
        email: formData.email ?? '',
        telefone: formData.telefone!,
        local: enderecoCompleto,
        servicosAtivos: 0,
        servicosConcluidos: 0,
        tipoCliente: null,
        status: null
      };

      this.clienteService.addClienteTecnico(cliente).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Cliente cadastrado com sucesso'
          });

          this.limpar();
          this.enviando = false;
          setTimeout(() => this.router.navigate(['/painel/clientes']), 1000);
        },
        error: (err: any) => {
          console.error('Erro ao salvar cliente', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao cadastrar o cliente'
          });
          this.enviando = false;
        }
      });
    } else {
      this.enviando = false;
      this.clienteForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
    }
  }

  limpar() {
    this.clienteForm.reset();
  }

  cancelar() {
    this.limpar();
    this.router.navigate(['/painel/clientes']);
  }

  carregarCidades() {
    this.consultaExternaService.consultarMunicipios().subscribe({
      next: (municipios) => {
        if (municipios && municipios.length > 0) {
          this.cidades = municipios.map(m => ({ label: m.formatado, value: m.formatado }));
          this.filteredCidades = this.cidades.slice(0, 20);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar cidades:', err);
      }
    });
  }

  filterCidades(event: any): void {
    const query = event.query;
    this.filteredCidades = this.filterCidade(query, this.cidades);
  }

  filterCidade(query: string, cidades: any[]): any[] {
    const filtered: any[] = [];
    const lowerQuery = query.toLowerCase();
    for (let i = 0; i < cidades.length; i++) {
      const cidade = cidades[i];
      if (cidade.label.toLowerCase().indexOf(lowerQuery) === 0) {
        filtered.push(cidade);
      }
    }
    return filtered;
  }
}