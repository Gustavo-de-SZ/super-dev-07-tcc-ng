import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, interval, of } from 'rxjs';
import { takeUntil, switchMap, startWith, catchError, first } from 'rxjs/operators';
import { ChatService, ChatContexto, Mensagem } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="chat-page-wrapper">
      
     
      <div class="chat-card shadow-sm">

       
        <header class="chat-header">
          <div class="header-left">
            <button class="btn-back" (click)="voltar()" title="Voltar para a lista">
              <i class="pi pi-arrow-left"></i>
            </button>

            <div class="avatar-wrapper">
              <div class="user-avatar" [ngClass]="destinatarioTipo === 'PROFISSIONAL' ? 'avatar-tecnico' : 'avatar-cliente'">
                {{ destinatarioIniciais }}
              </div>
              <span class="status-indicator online" title="Online"></span>
            </div>

            <div class="interlocutor-info">
              <div class="name-row">
                <h2 class="interlocutor-name">{{ destinatarioNome }}</h2>
                <span class="role-badge" [ngClass]="destinatarioTipo === 'PROFISSIONAL' ? 'badge-tecnico' : 'badge-cliente'">
                  <i class="pi" [ngClass]="destinatarioTipo === 'PROFISSIONAL' ? 'pi-wrench' : 'pi-user'"></i>
                  {{ destinatarioTipo === 'PROFISSIONAL' ? 'Técnico Especialista' : 'Cliente Solicitante' }}
                </span>
              </div>
              <div class="meta-row">
                @if (destinatarioTelefone) {
                  <a [href]="'tel:' + destinatarioTelefone" class="contact-link">
                    <i class="pi pi-phone"></i> {{ destinatarioTelefone }}
                  </a>
                  <span class="meta-divider">•</span>
                }
                <span class="status-text">Atendimento em tempo real</span>
              </div>
            </div>
          </div>

          <div class="header-right">
            <div class="ticket-status-pill" [ngClass]="getStatusClass(statusChamado)">
              <span class="ticket-id-tag">#{{ ticketId }}</span>
              <span class="status-label">{{ getStatusLabel(statusChamado) }}</span>
            </div>

            <button class="btn-icon-action" 
                    [class.active]="isContextoExpandido"
                    (click)="toggleContexto()" 
                    title="Alternar detalhes do chamado">
              <i class="pi" [ngClass]="isContextoExpandido ? 'pi-chevron-up' : 'pi-info-circle'"></i>
            </button>

            <button class="btn-icon-action" 
                    [class.spinning]="carregandoMensagens"
                    (click)="recarregarMensagens()" 
                    title="Atualizar mensagens">
              <i class="pi pi-refresh"></i>
            </button>
          </div>
        </header>

     
        @if (contexto && isContextoExpandido) {
          <div class="ticket-context-banner">
            <div class="context-content">
              <div class="context-main">
                <div class="context-badges">
                  @if (contexto.categoria_nome) {
                    <span class="context-chip category">
                      <i class="pi pi-tag"></i> {{ contexto.categoria_nome }}
                    </span>
                  }
                  <span class="context-chip date">
                    <i class="pi pi-calendar"></i> Criado em {{ formatData(contexto.data_criacao) }}
                  </span>
                </div>
                <h4 class="context-title">{{ contexto.titulo }}</h4>
                <p class="context-desc">{{ contexto.descricao_problema }}</p>
              </div>

              @if (contexto.anexo) {
                <div class="context-attachment">
                  <button class="btn-view-attachment" (click)="abrirAnexoModal()">
                    <i class="pi pi-image"></i>
                    <span>Ver Anexo / Foto</span>
                  </button>
                </div>
              }
            </div>
          </div>
        }

     
        <div #scrollContainer class="messages-container" (scroll)="onScroll($event)">
          
          @if (carregandoContexto && mensagens.length === 0) {
            <div class="chat-loading-state">
              <i class="pi pi-spin pi-spinner text-primary text-3xl"></i>
              <p>Carregando conversa...</p>
            </div>
          } @else if (mensagens.length === 0) {
            <div class="chat-empty-state">
              <div class="empty-icon-circle">
                <i class="pi pi-comments"></i>
              </div>
              <h3>Inicie o atendimento!</h3>
              <p>Envie uma mensagem abaixo para tirar dúvidas, alinhar horários ou combinar o serviço.</p>
            </div>
          } @else {
            <div class="messages-stream">
              @for (msg of mensagens; track (msg.id || $index)) {
                <div class="message-row" [class.row-mine]="isMinhaMensagem(msg)" [class.row-other]="!isMinhaMensagem(msg)">
                  
                  @if (!isMinhaMensagem(msg)) {
                    <div class="bubble-avatar" [ngClass]="msg.remetenteTipo === 'PROFISSIONAL' ? 'avatar-tecnico' : 'avatar-cliente'">
                      {{ getIniciais(msg.remetenteNome) }}
                    </div>
                  }

                  <div class="message-bubble" [class.bubble-mine]="isMinhaMensagem(msg)" [class.bubble-other]="!isMinhaMensagem(msg)">
                    @if (!isMinhaMensagem(msg)) {
                      <div class="bubble-header">
                        <span class="sender-name">{{ msg.remetenteNome }}</span>
                        @if (msg.remetenteTipo) {
                          <span class="sender-role-tag">
                            {{ msg.remetenteTipo === 'PROFISSIONAL' ? 'Técnico' : (msg.remetenteTipo === 'CLIENTE' ? 'Cliente' : 'Suporte') }}
                          </span>
                        }
                      </div>
                    }

                    <div class="bubble-body">{{ msg.texto }}</div>

                    <div class="bubble-footer">
                      <span class="bubble-time">{{ formatTime(msg.dataEnvio) }}</span>
                      @if (isMinhaMensagem(msg)) {
                        <i class="pi pi-check text-xs ml-1 opacity-80"></i>
                      }
                    </div>
                  </div>

                </div>
              }
            </div>
          }

         
          @if (showScrollBottom) {
            <button class="btn-scroll-bottom" (click)="scrollToBottom(true)" title="Ir para mensagens recentes">
              <i class="pi pi-arrow-down"></i>
            </button>
          }
        </div>

      
     
        @if (isChatEncerrado()) {
          <div class="chat-closed-bar">
            <div class="closed-content">
              <div class="closed-icon-badge" [class.cancelled]="statusChamado.includes('CANCEL')">
                <i class="pi" [ngClass]="statusChamado.includes('CANCEL') ? 'pi-times-circle' : 'pi-lock'"></i>
              </div>
              <div class="closed-info">
                <h4 class="closed-title">
                  {{ statusChamado.includes('CANCEL') ? 'Atendimento Cancelado' : 'Atendimento Concluído' }}
                </h4>
                <p class="closed-subtitle">
                  Este chamado foi {{ statusChamado.includes('CANCEL') ? 'cancelado' : 'finalizado' }}. O histórico de mensagens está disponível em modo somente leitura.
                </p>
              </div>
              <div class="closed-actions">
                <button class="btn-action-outline" (click)="voltar()">
                  <i class="pi pi-arrow-left"></i> Voltar aos Chamados
                </button>
              </div>
            </div>
          </div>
        } @else {
       
          <div class="quick-replies-bar">
            <span class="quick-title">Sugestões rápidas:</span>
            <div class="chips-scroll">
              @for (reply of getSugestoesRapidas(); track reply) {
                <button class="reply-chip" (click)="usarSugestao(reply)">
                  {{ reply }}
                </button>
              }
            </div>
          </div>

       
          <div class="chat-input-bar">
            <div class="input-container">
              <textarea 
                #messageInput
                [(ngModel)]="novaMensagem" 
                (keydown)="onKeydown($event)"
                placeholder="Digite sua mensagem aqui... (Enter para enviar, Shift+Enter para nova linha)"
                rows="1"
                class="chat-textarea"></textarea>
              
              <button 
                class="btn-send" 
                [disabled]="!novaMensagem.trim() || enviando" 
                (click)="enviar()"
                title="Enviar mensagem">
                @if (enviando) {
                  <i class="pi pi-spin pi-spinner"></i>
                } @else {
                  <i class="pi pi-send"></i>
                }
              </button>
            </div>
          </div>
        }

      </div>

     
      @if (isAnexoModalAberto && contexto?.anexo; as anexoUrl) {
        <div class="tcc-modal-backdrop" (click)="fecharAnexoModal()">
          <div class="tcc-modal-card attachment-modal" (click)="$event.stopPropagation()">
            <div class="tcc-modal-header">
              <div class="modal-title-group">
                <i class="pi pi-image text-primary"></i>
                <h3 class="tcc-modal-title">Anexo do Chamado #{{ ticketId }}</h3>
              </div>
              <button class="tcc-modal-close-btn" (click)="fecharAnexoModal()">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="tcc-modal-body text-center p-4">
              <img [src]="anexoUrl" alt="Anexo do Chamado" class="attachment-preview-img" />
            </div>
            <div class="tcc-modal-footer">
              <a [href]="anexoUrl" target="_blank" download class="tcc-btn-outline">
                <i class="pi pi-download"></i> Abrir em Nova Aba
              </a>
              <button class="tcc-btn-main" (click)="fecharAnexoModal()">
                Fechar
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .chat-page-wrapper {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      height: calc(100vh - 120px);
      min-height: 580px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    .chat-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    }

    /* Header */
    .chat-header {
      padding: 1rem 1.25rem;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      z-index: 2;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      min-width: 0;
    }

    .btn-back {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .btn-back:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: translateX(-2px);
    }

    .avatar-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      color: white;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .avatar-tecnico {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
    }

    .avatar-cliente {
      background: linear-gradient(135deg, #059669, #047857);
    }

    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .status-indicator.online {
      background: #10b981;
      box-shadow: 0 0 0 1px #10b981;
    }

    .interlocutor-info {
      min-width: 0;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .interlocutor-name {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      border-radius: 20px;
      font-size: 0.725rem;
      font-weight: 600;
    }

    .badge-tecnico {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    .badge-cliente {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 0.15rem;
    }

    .contact-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .contact-link:hover {
      text-decoration: underline;
    }

    .meta-divider {
      color: #cbd5e1;
    }

    .status-text {
      color: #10b981;
      font-weight: 500;
    }

    /* Header Right */
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      flex-shrink: 0;
    }

    .ticket-status-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .ticket-id-tag {
      font-weight: 700;
      opacity: 0.85;
    }

    .status-aberto {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .status-andamento {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    .status-concluido {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .status-cancelado {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .btn-icon-action {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-icon-action:hover, .btn-icon-action.active {
      background: #f8fafc;
      color: #2563eb;
      border-color: #cbd5e1;
    }

    .btn-icon-action.spinning i {
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Context Banner */
    .ticket-context-banner {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.875rem 1.25rem;
      animation: slideDown 0.25s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .context-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .context-main {
      flex: 1;
      min-width: 250px;
    }

    .context-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .context-chip {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .context-chip.category {
      background: #e0e7ff;
      color: #3730a3;
    }

    .context-chip.date {
      background: #f1f5f9;
      color: #64748b;
    }

    .context-title {
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
    }

    .context-desc {
      margin: 0;
      font-size: 0.85rem;
      color: #475569;
      line-height: 1.4;
    }

    .btn-view-attachment {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #2563eb;
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-view-attachment:hover {
      background: #eff6ff;
      border-color: #93c5fd;
    }

    /* Messages Stream Container */
    .messages-container {
      flex: 1;
      padding: 1.25rem;
      overflow-y: auto;
      background: #f8fafc;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .chat-loading-state, .chat-empty-state {
      margin: auto;
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .empty-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin: 0 auto 1rem auto;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }

    .chat-empty-state h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .chat-empty-state p {
      margin: 0;
      font-size: 0.875rem;
      max-width: 320px;
    }

    .messages-stream {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .message-row {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
      width: 100%;
    }

    .row-mine {
      justify-content: flex-end;
    }

    .row-other {
      justify-content: flex-start;
    }

    .bubble-avatar {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;
      flex-shrink: 0;
    }

    .message-bubble {
      max-width: 68%;
      padding: 0.75rem 1rem;
      border-radius: 16px;
      font-size: 0.9rem;
      line-height: 1.45;
      position: relative;
      word-break: break-word;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .bubble-mine {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }

    .bubble-other {
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
    }

    .bubble-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .sender-name {
      font-size: 0.775rem;
      font-weight: 700;
      color: #334155;
    }

    .sender-role-tag {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      background: #f1f5f9;
      color: #64748b;
    }

    .bubble-body {
      white-space: pre-wrap;
    }

    .bubble-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 0.35rem;
      font-size: 0.7rem;
    }

    .bubble-mine .bubble-footer {
      color: rgba(255, 255, 255, 0.75);
    }

    .bubble-other .bubble-footer {
      color: #94a3b8;
    }

    .btn-scroll-bottom {
      position: absolute;
      bottom: 1rem;
      right: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #ffffff;
      color: #2563eb;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 5;
    }

    .btn-scroll-bottom:hover {
      background: #eff6ff;
      transform: translateY(-2px);
    }

    /* Quick Replies Bar */
    .quick-replies-bar {
      padding: 0.5rem 1.25rem;
      background: #ffffff;
      border-top: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow: hidden;
    }

    .quick-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      white-space: nowrap;
    }

    .chips-scroll {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.25rem 0;
      scrollbar-width: none;
    }

    .chips-scroll::-webkit-scrollbar {
      display: none;
    }

    .reply-chip {
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #334155;
      font-size: 0.775rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .reply-chip:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      color: #1d4ed8;
      transform: translateY(-1px);
    }

    /* Input Bar */
    .chat-input-bar {
      padding: 0.875rem 1.25rem 1.25rem 1.25rem;
      background: #ffffff;
      border-top: 1px solid #f1f5f9;
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 24px;
      padding: 0.35rem 0.5rem 0.35rem 1rem;
      transition: all 0.2s ease;
    }

    .input-container:focus-within {
      background: #ffffff;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }

    .chat-textarea {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-family: inherit;
      font-size: 0.925rem;
      color: #0f172a;
      resize: none;
      max-height: 120px;
      line-height: 1.4;
      padding: 0.35rem 0;
    }

    .btn-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s ease;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }

    .btn-send:hover:not(:disabled) {
      transform: scale(1.05);
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
    }

    .btn-send:disabled {
      background: #cbd5e1;
      color: #94a3b8;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Chat Closed / Read-Only Banner */
    .chat-closed-bar {
      padding: 1.25rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .closed-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .closed-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #f0fdf4;
      color: #16a34a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;

      &.cancelled {
        background: #fef2f2;
        color: #ef4444;
      }
    }
    .closed-info {
      flex: 1;
      min-width: 220px;
    }
    .closed-title {
      margin: 0 0 2px 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
    }
    .closed-subtitle {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.4;
    }
    .closed-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .btn-action-outline {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
        color: #0f172a;
      }
    }

    /* Modal */
    .attachment-modal {
      max-width: 600px;
    }

    .attachment-preview-img {
      max-width: 100%;
      max-height: 65vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .tcc-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .tcc-modal-card {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 550px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalScale 0.2s ease-out;
    }

    @keyframes modalScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .tcc-modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title-group {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .tcc-modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .tcc-modal-close-btn {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .tcc-modal-close-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .tcc-modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }

    .tcc-modal-footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .tcc-btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.1rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.875rem;
      background: white;
      border: 1px solid #cbd5e1;
      color: #334155;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tcc-btn-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .tcc-btn-main {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.875rem;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border: none;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tcc-btn-main:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-1px);
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private destroy$ = new Subject<void>();

  ticketId = '';
  contexto: ChatContexto | null = null;
  mensagens: Mensagem[] = [];

  meuAuth0Id = '';
  meuUsuarioId: string | number = '';
  meuNome = 'Você';
  meuTipo: 'CLIENTE' | 'PROFISSIONAL' | 'ADMIN' | string = 'CLIENTE';

  destinatarioNome = 'Suporte Técnico';
  destinatarioTipo: 'CLIENTE' | 'PROFISSIONAL' | string = 'PROFISSIONAL';
  destinatarioIniciais = 'ST';
  destinatarioTelefone: string | null = null;
  statusChamado = 'ABERTO';

  isContextoExpandido = true;
  isAnexoModalAberto = false;
  showScrollBottom = false;

  novaMensagem = '';
  enviando = false;
  carregandoContexto = true;
  carregandoMensagens = false;

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ticketId = id;
        this.carregarDadosIniciais();
        this.iniciarPollingMensagens();
      }
    });

    // Obter dados do Auth0
    this.authService.user$.pipe(first()).subscribe(user => {
      if (user) {
        this.meuAuth0Id = user.sub || '';
        this.meuNome = user.nickname || user.given_name || (user.name?.includes('@') ? user.name.split('@')[0] : user.name) || 'Você';
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarDadosIniciais() {
    this.carregandoContexto = true;
    this.chatService.getContexto(this.ticketId).pipe(
      catchError(err => {
        console.error('Erro ao carregar contexto do chat:', err);
        this.carregandoContexto = false;
        return of(null);
      })
    ).subscribe(ctx => {
      this.carregandoContexto = false;
      if (ctx) {
        this.contexto = ctx;
        this.statusChamado = ctx.status;
        this.destinatarioNome = ctx.destinatario_nome;
        this.destinatarioTipo = ctx.destinatario_tipo;
        this.destinatarioIniciais = this.getIniciais(ctx.destinatario_nome);
        this.destinatarioTelefone = ctx.destinatario_telefone || null;

        if (ctx.usuario_atual) {
          this.meuUsuarioId = ctx.usuario_atual.id || '';
          this.meuAuth0Id = ctx.usuario_atual.auth0_id || this.meuAuth0Id;
          this.meuNome = ctx.usuario_atual.nome || this.meuNome;
          this.meuTipo = ctx.usuario_atual.tipo;
        }
      }
    });
  }

  iniciarPollingMensagens() {
    interval(3000).pipe(
      startWith(0),
      switchMap(() => {
        if (!this.ticketId) return of([]);
        return this.chatService.getMensagens(this.ticketId).pipe(
          catchError(err => {
            console.error('Erro ao buscar mensagens do chat:', err);
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(msgs => {
      const isInitialOrNew = msgs.length > this.mensagens.length;
      this.mensagens = msgs;
      if (isInitialOrNew) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  recarregarMensagens() {
    this.carregandoMensagens = true;
    this.chatService.getMensagens(this.ticketId).pipe(
      catchError(() => of([]))
    ).subscribe(msgs => {
      this.mensagens = msgs;
      this.carregandoMensagens = false;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  isMinhaMensagem(msg: Mensagem): boolean {
    if (this.meuUsuarioId && String(msg.remetenteId) === String(this.meuUsuarioId)) {
      return true;
    }
    if (this.meuAuth0Id && msg.remetenteId === this.meuAuth0Id) {
      return true;
    }
    if (this.meuTipo && msg.remetenteTipo && msg.remetenteTipo === this.meuTipo) {
      return true;
    }
    if (this.meuNome && msg.remetenteNome === this.meuNome) {
      return true;
    }
    return false;
  }

  isChatEncerrado(): boolean {
    const s = (this.statusChamado || '').toUpperCase();
    return s.includes('CONCLU') || s.includes('FINALIZ') || s.includes('CANCEL') || s.includes('FECHAD');
  }

  enviar() {
    if (this.isChatEncerrado()) return;
    const texto = this.novaMensagem.trim();
    if (!texto || this.enviando || !this.ticketId) return;

    this.novaMensagem = '';
    this.enviando = true;

    this.chatService.enviarMensagem(this.ticketId, texto).subscribe({
      next: (novaMsg) => {
        this.mensagens.push(novaMsg);
        this.enviando = false;
        setTimeout(() => this.scrollToBottom(true), 50);
        // Atualizar contexto caso o status tenha mudado
        if (this.contexto && this.statusChamado === 'ABERTO') {
          this.statusChamado = 'EM_ANDAMENTO';
        }
      },
      error: (err) => {
        console.error('Erro ao enviar mensagem:', err);
        this.enviando = false;
      }
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (this.isChatEncerrado()) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviar();
    }
  }

  usarSugestao(texto: string) {
    this.novaMensagem = texto;
    this.enviar();
  }

  getSugestoesRapidas(): string[] {
    if (this.meuTipo === 'PROFISSIONAL') {
      return [
        'Olá! Já estou analisando seu chamado.',
        'Estou a caminho do local.',
        'Poderia me enviar mais fotos do problema?',
        'Atendimento concluído com sucesso!'
      ];
    } else {
      return [
        'Olá! Em quanto tempo você poderá me atender?',
        'O equipamento já está disponível para análise.',
        'Muito obrigado pela ajuda!',
        'Preciso de mais esclarecimentos.'
      ];
    }
  }

  voltar() {
    if (this.router.url.includes('/cliente/')) {
      this.router.navigate(['/cliente/meus-chamados']);
    } else {
      this.router.navigate(['/painel/chamados']);
    }
  }

  toggleContexto() {
    this.isContextoExpandido = !this.isContextoExpandido;
  }

  abrirAnexoModal() {
    this.isAnexoModalAberto = true;
  }

  fecharAnexoModal() {
    this.isAnexoModalAberto = false;
  }

  onScroll(event: any) {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;
    const threshold = 120;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    this.showScrollBottom = !isNearBottom;
  }

  scrollToBottom(force = false) {
    try {
      if (this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTo({ top: el.scrollHeight, behavior: force ? 'smooth' : 'auto' });
      }
    } catch (err) {}
  }

  getIniciais(nome: string): string {
    if (!nome) return '??';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s.includes('ANDAMENTO')) return 'status-andamento';
    if (s.includes('CONCLU') || s.includes('FINALIZ')) return 'status-concluido';
    if (s.includes('CANCEL')) return 'status-cancelado';
    return 'status-aberto';
  }

  getStatusLabel(status: string): string {
    const s = (status || '').toUpperCase();
    if (s.includes('ANDAMENTO')) return 'Em Andamento';
    if (s.includes('CONCLU') || s.includes('FINALIZ')) return 'Concluído';
    if (s.includes('CANCEL')) return 'Cancelado';
    return 'Aberto';
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatData(isoString: string): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}