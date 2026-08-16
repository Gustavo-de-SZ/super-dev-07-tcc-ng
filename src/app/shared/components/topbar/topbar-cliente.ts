import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { NotificacaoService, Notificacao } from '../../../services/notificacao.service';
import { RouterModule, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';
import { MeusChamadosService } from '../../../services/meus-chamados.service';
import { Chamado } from '../../../models/chamado';

@Component({
  selector: 'app-topbar-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="tcc-topbar">
      <div class="tcc-topbar-actions">
      
        <button class="tcc-icon-btn" (click)="toggleTheme()" title="Alternar tema">
          <i [class]="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <div class="tcc-dropdown-wrapper">
          <button 
            class="tcc-icon-btn tcc-chat-btn" 
            [class.tcc-btn-active]="showChatDropdown"
            (click)="toggleChatDropdown($event)" 
            title="Conversas e Atendimentos">
            <i class="pi pi-comments"></i>
            @if (chamadosAtivosCount > 0) {
              <span class="tcc-badge tcc-badge-primary">{{ chamadosAtivosCount }}</span>
            }
          </button>

      
          @if (showChatDropdown) {
            <div class="tcc-popover tcc-chat-popover" (click)="$event.stopPropagation()">
              <div class="tcc-popover-header">
                <div class="header-title-box">
                  <div class="header-icon-circle">
                    <i class="pi pi-comments"></i>
                  </div>
                  <div>
                    <h4 class="popover-title">Mensagens & Atendimentos</h4>
                    <p class="popover-subtitle">Acesso rápido aos seus chats de suporte</p>
                  </div>
                </div>
                @if (chamadosAtivosCount > 0) {
                  <span class="active-pill">{{ chamadosAtivosCount }} ativo{{ chamadosAtivosCount > 1 ? 's' : '' }}</span>
                }
              </div>

              <div class="tcc-popover-body">
                @if (carregandoChamados) {
                  <div class="loading-state">
                    <i class="pi pi-spin pi-spinner text-primary"></i>
                    <span>Carregando conversas...</span>
                  </div>
                } @else if (chamados.length === 0) {
                  <div class="empty-state">
                    <div class="empty-icon-circle">
                      <i class="pi pi-comments"></i>
                    </div>
                    <p class="empty-title">Nenhum atendimento em andamento</p>
                    <p class="empty-desc">Quando você tiver um chamado ativo, a conversa em tempo real aparecerá aqui.</p>
                    <a routerLink="/cliente/solicitacao" (click)="showChatDropdown = false" class="empty-action-btn">
                      <i class="pi pi-plus"></i>
                      Nova Solicitação
                    </a>
                  </div>
                } @else {
                  <div class="chat-list">
                    @for (chamado of chamados; track (chamado.id || $index)) {
                      <div class="chat-item" (click)="abrirChat(chamado.id, $event)">
                        <div class="chat-item-status">
                          <span class="status-dot" [ngClass]="getStatusClass(chamado.status)"></span>
                        </div>
                        <div class="chat-item-content">
                          <div class="chat-item-header">
                            <span class="ticket-badge">#{{ chamado.id }}</span>
                            <span class="status-tag" [ngClass]="getStatusClass(chamado.status)">
                              {{ formatarStatus(chamado.status) }}
                            </span>
                          </div>
                          <p class="ticket-title">{{ chamado.titulo || chamado.descricao_problema || 'Atendimento técnico' }}</p>
                          <div class="ticket-meta">
                            <span class="tech-name">
                              <i class="pi pi-user text-xs"></i>
                              {{ chamado.profissional_nome || 'Aguardando técnico' }}
                            </span>
                            @if (chamado.data_criacao || chamado.dataCriacao) {
                              <span class="ticket-date">
                                {{ formatarData(chamado.data_criacao || chamado.dataCriacao) }}
                              </span>
                            }
                          </div>
                        </div>
                        <div class="chat-item-action">
                          <i class="pi pi-chevron-right"></i>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="tcc-popover-footer">
                <a routerLink="/cliente/meus-chamados" (click)="showChatDropdown = false" class="footer-link">
                  <span>Ver todos os chamados</span>
                  <i class="pi pi-arrow-right"></i>
                </a>
              </div>
            </div>
          }
        </div>

    
        <div class="tcc-dropdown-wrapper">
          <button 
            class="tcc-icon-btn tcc-notification-btn" 
            [class.tcc-btn-active]="showNotifications"
            (click)="toggleNotificationsDropdown($event)" 
            title="Notificações">
            <i class="pi pi-bell"></i>
            @if (naoLidasCount > 0) {
              <span class="tcc-badge tcc-badge-danger">{{ naoLidasCount > 9 ? '9+' : naoLidasCount }}</span>
            }
          </button>

          @if (showNotifications) {
            <div class="tcc-popover tcc-notif-popover" (click)="$event.stopPropagation()">
              <div class="tcc-popover-header">
                <div class="header-title-box">
                  <div class="header-icon-circle notif-header-circle">
                    <i class="pi pi-bell"></i>
                  </div>
                  <div>
                    <h4 class="popover-title">Notificações</h4>
                    <p class="popover-subtitle">Alertas e atualizações de status</p>
                  </div>
                </div>
                @if (naoLidasCount > 0) {
                  <button (click)="marcarComoLidas()" class="mark-read-btn" title="Marcar todas como lidas">
                    <i class="pi pi-check text-xs"></i>
                    Marcar lidas
                  </button>
                }
              </div>

              <div class="tcc-popover-body">
                @if (notificacoes.length === 0) {
                  <div class="empty-state">
                    <div class="empty-icon-circle">
                      <i class="pi pi-bell-slash"></i>
                    </div>
                    <p class="empty-title">Tudo em dia!</p>
                    <p class="empty-desc">Você não possui notificações no momento.</p>
                  </div>
                } @else {
                  <div class="notif-list">
                    @for (notif of notificacoes; track (notif.id || $index)) {
                      <div class="notif-item" [class.notif-unread]="!notif.lida" (click)="clicarNotificacao(notif, $event)">
                        <div class="notif-icon-box" [ngClass]="getNotifTipoClass(notif.tipo)">
                          <i [class]="getNotifIcon(notif.tipo)"></i>
                        </div>
                        <div class="notif-content">
                          <div class="notif-top">
                            <span class="notif-title">{{ notif.titulo }}</span>
                            @if (!notif.lida) {
                              <span class="unread-dot" title="Não lida"></span>
                            }
                          </div>
                          <p class="notif-msg">{{ notif.mensagem }}</p>
                          <div class="notif-footer">
                            <span class="notif-time">
                              <i class="pi pi-clock text-xs"></i>
                              {{ formatarTempoRelativo(notif.criado_em) }}
                            </span>
                            <button class="notif-del-btn" (click)="excluirNotificacao(notif.id, $event)" title="Excluir notificação">
                              <i class="pi pi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              @if (temLidas) {
                <div class="tcc-popover-footer">
                  <button (click)="limparLidas($event)" class="footer-action-btn">
                    <i class="pi pi-trash text-xs"></i>
                    <span>Limpar notificações lidas</span>
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <div class="tcc-divider"></div>

    
        <div class="tcc-profile-section" routerLink="/cliente/configuracoes" title="Meu Perfil">
          <div class="tcc-profile-info">
            <span class="tcc-profile-name">{{ userName }}</span>
            <span class="tcc-profile-role">Cliente</span>
          </div>
          <div class="tcc-profile-avatar">
            @if (userAvatar) {
              <img [src]="userAvatar" alt="Avatar" class="avatar-img" referrerpolicy="no-referrer">
            } @else {
              <i class="pi pi-user"></i>
            }
          </div>
          <i class="pi pi-chevron-right tcc-profile-arrow"></i>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .tcc-topbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 14px 0;
      background-color: transparent;
      width: 100%;
      position: relative;
      z-index: 40;
    }

    .tcc-topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .tcc-dropdown-wrapper {
      position: relative;
    }

    .tcc-icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      background-color: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);

      &:hover, &.tcc-btn-active {
        background-color: var(--tcc-bg, #f8fafc);
        color: var(--tcc-primary, #3b82f6);
        border-color: var(--tcc-primary, #3b82f6);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.12);
      }
    }

    .tcc-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      color: white;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--tcc-surface, #ffffff);
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      animation: pulseBadge 2s infinite;

      &.tcc-badge-primary {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      }

      &.tcc-badge-danger {
        background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      }
    }

    @keyframes pulseBadge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }

    .tcc-divider {
      width: 1px;
      height: 28px;
      background-color: var(--tcc-border, #e2e8f0);
      margin: 0 4px;
    }

    /* Popover Container */
    .tcc-popover {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 360px;
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.14), 0 4px 12px -2px rgba(0, 0, 0, 0.08);
      z-index: 1000;
      overflow: hidden;
      animation: fadeInPop 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeInPop {
      from { opacity: 0; transform: translateY(-8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .tcc-popover-header {
      padding: 16px;
      background: linear-gradient(180deg, var(--tcc-bg, #f8fafc) 0%, var(--tcc-surface, #ffffff) 100%);
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-title-box {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .header-icon-circle {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: #eff6ff;
        color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
      }

      .popover-title {
        font-size: 14px;
        font-weight: 700;
        margin: 0;
        color: var(--tcc-text-main, #0f172a);
      }

      .popover-subtitle {
        font-size: 11px;
        margin: 2px 0 0 0;
        color: var(--tcc-text-muted, #64748b);
      }

      .active-pill {
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 12px;
        background: #dbeafe;
        color: #1e40af;
      }

      .mark-read-btn {
        background: none;
        border: none;
        color: var(--tcc-primary, #3b82f6);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        &:hover { text-decoration: underline; }
      }
    }

    .tcc-popover-body {
      max-height: 360px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .loading-state, .empty-state {
      padding: 28px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .tcc-profile-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background-color: var(--tcc-primary-light, #e0e7ff);
      color: var(--tcc-primary, #4338ca);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      i {
        font-size: 16px;
      }
    }
    
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .empty-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--tcc-bg, #f1f5f9);
      color: var(--tcc-text-muted, #94a3b8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      margin-bottom: 4px;
    }

    .empty-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-main, #1e293b);
      margin: 0;
    }

    .empty-desc {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .empty-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--tcc-primary, #3b82f6);
      color: white;
      text-decoration: none;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      transition: background-color 0.2s;

      &:hover {
        background: #2563eb;
      }
    }

    .chat-list {
      display: flex;
      flex-direction: column;
    }

    .chat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border-bottom: 1px solid var(--tcc-border, #f1f5f9);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: var(--tcc-bg, #f8fafc);

        .chat-item-action i {
          transform: translateX(3px);
          color: var(--tcc-primary, #3b82f6);
        }
      }

      .chat-item-status {
        display: flex;
        align-items: center;
      }

      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #94a3b8;

        &.status-andamento { background-color: #22c55e; box-shadow: 0 0 0 2px #dcfce7; }
        &.status-aberto { background-color: #3b82f6; box-shadow: 0 0 0 2px #dbeafe; }
        &.status-orcamento { background-color: #a855f7; box-shadow: 0 0 0 2px #f3e8ff; }
        &.status-concluido { background-color: #64748b; }
      }

      .chat-item-content {
        flex: 1;
        min-width: 0;
      }

      .chat-item-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
      }

      .ticket-badge {
        font-size: 11px;
        font-weight: 700;
        color: var(--tcc-text-muted, #64748b);
      }

      .status-tag {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 1px 6px;
        border-radius: 4px;
        letter-spacing: 0.3px;

        &.status-andamento { background: #dcfce7; color: #15803d; }
        &.status-aberto { background: #dbeafe; color: #1d4ed8; }
        &.status-orcamento { background: #f3e8ff; color: #7e22ce; }
        &.status-concluido { background: #f1f5f9; color: #475569; }
      }

      .ticket-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--tcc-text-main, #0f172a);
        margin: 0 0 4px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ticket-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        color: var(--tcc-text-muted, #64748b);

        .tech-name {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }
      }

      .chat-item-action i {
        font-size: 12px;
        color: var(--tcc-text-muted, #94a3b8);
        transition: all 0.2s ease;
      }
    }

    .notif-header-circle {
      background: #fef2f2;
      color: #ef4444;
    }

    .notif-list {
      display: flex;
      flex-direction: column;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--tcc-border, #f1f5f9);
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: var(--tcc-bg, #f8fafc);

        .notif-del-btn {
          opacity: 1;
          pointer-events: auto;
        }
      }

      &.notif-unread {
        background-color: rgba(59, 130, 246, 0.05);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--tcc-primary, #3b82f6);
        }
      }

      .notif-icon-box {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
        margin-top: 2px;

        &.tipo-info { background: #eff6ff; color: #2563eb; }
        &.tipo-success { background: #ecfdf5; color: #059669; }
        &.tipo-warning { background: #fffbeb; color: #d97706; }
        &.tipo-error { background: #fef2f2; color: #dc2626; }
      }

      .notif-content {
        flex: 1;
        min-width: 0;
      }

      .notif-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .notif-title {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--tcc-text-main, #0f172a);
        line-height: 1.3;
      }

      .unread-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--tcc-primary, #3b82f6);
        flex-shrink: 0;
      }

      .notif-msg {
        margin: 3px 0 6px 0;
        font-size: 12px;
        color: var(--tcc-text-muted, #64748b);
        line-height: 1.4;
        word-break: break-word;
      }

      .notif-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .notif-time {
        font-size: 11px;
        color: var(--tcc-text-muted, #94a3b8);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .notif-del-btn {
        background: none;
        border: none;
        color: var(--tcc-text-muted, #94a3b8);
        font-size: 12px;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        opacity: 0;
        pointer-events: none;
        transition: all 0.2s ease;

        &:hover {
          color: #ef4444;
          background: #fee2e2;
        }
      }
    }

    .tcc-popover-footer {
      padding: 10px 16px;
      background: var(--tcc-bg, #f8fafc);
      border-top: 1px solid var(--tcc-border, #e2e8f0);
      text-align: center;

      .footer-link, .footer-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--tcc-text-muted, #64748b);
        background: none;
        border: none;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: #ef4444;
          text-decoration: underline;
        }
      }
    }

    .tcc-profile-section {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 12px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--tcc-bg, #f8fafc);
      }
    }

    .tcc-profile-info {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .tcc-profile-name { font-size: 13px; font-weight: 600; color: var(--tcc-text-main, #0f172a); }
    .tcc-profile-role { font-size: 11px; color: var(--tcc-text-muted, #64748b); }



    .tcc-profile-arrow { font-size: 11px; color: var(--tcc-text-muted, #94a3b8); }
  `]
})
export class TopbarCliente implements OnInit, OnDestroy {
  showNotifications = false;
  showChatDropdown = false;
  
  private notificacaoService = inject(NotificacaoService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private chamadosService = inject(MeusChamadosService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  notificacoes: Notificacao[] = [];
  naoLidasCount = 0;
  private notifSub?: Subscription;
  private chamadosSub?: Subscription;
  private profilePicSub?: Subscription;

  isDarkMode = false;
  userName = 'Cliente';
  userAvatar?: string;

  chamados: Chamado[] = [];
  chamadosAtivosCount = 0;
  carregandoChamados = false;

  get temLidas(): boolean {
    return this.notificacoes.some(n => n.lida);
  }

  constructor() {
    this.profileService.obterPerfilCliente().subscribe({
      next: (perfil) => {
        if (perfil?.nome_completo) {
          this.userName = perfil.nome_completo;
        }
      },
      error: () => {}
    });

    this.profilePicSub = this.profileService.profilePicture$.subscribe(pic => {
      if (pic) this.userAvatar = pic;
    });

    this.authService.user$.subscribe({
      next: (user: any) => {
        if (user && this.userName === 'Cliente') {
          if (user.given_name) {
            this.userName = user.given_name;
          } else if (user.name && !user.name.includes('@')) {
            this.userName = user.name;
          } else if (user.nickname && !user.nickname.includes('@')) {
            this.userName = user.nickname;
          }
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar perfil do Auth0', err);
      }
    });
  }

  ngOnInit() {
    this.loadNotificacoes();
    this.loadChamados();
    this.notifSub = interval(30000).subscribe(() => {
      this.loadNotificacoes();
      this.loadChamados();
    });
  }

  loadNotificacoes() {
    this.notificacaoService.getNotificacoes().subscribe({
      next: notifs => {
        this.notificacoes = notifs;
        this.naoLidasCount = notifs.filter(n => !n.lida).length;
      },
      error: () => {}
    });
  }

  loadChamados() {
    this.chamadosService.getChamados().subscribe({
      next: (lista) => {
        const todos = lista || [];
        const ativos = todos.filter(c => {
          const s = (c.status || '').toUpperCase();
          return !s.includes('CONCLU') && !s.includes('CANCEL') && !s.includes('FINALIZ') && !s.includes('FECHAD');
        });
        this.chamados = ativos.slice(0, 5);
        this.chamadosAtivosCount = ativos.length;
        this.carregandoChamados = false;
      },
      error: () => {
        this.carregandoChamados = false;
      }
    });
  }

  toggleChatDropdown(event: Event) {
    event.stopPropagation();
    this.showChatDropdown = !this.showChatDropdown;
    if (this.showChatDropdown) {
      this.showNotifications = false;
      this.carregandoChamados = true;
      this.loadChamados();
    }
  }

  toggleNotificationsDropdown(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showChatDropdown = false;
      this.loadNotificacoes();
    }
  }

  abrirChat(chamadoId: number | string | undefined, event: Event) {
    event.stopPropagation();
    this.showChatDropdown = false;
    if (chamadoId) {
      this.router.navigate(['/cliente/chat', chamadoId]);
    }
  }

  clicarNotificacao(notif: Notificacao, event: Event) {
    event.stopPropagation();
    if (!notif.lida) {
      notif.lida = true;
      this.naoLidasCount = Math.max(0, this.naoLidasCount - 1);
      this.notificacaoService.marcarLida(notif.id).subscribe();
    }

    this.showNotifications = false;

    if (notif.link && notif.link !== '/pendente-aprovacao' && notif.link.trim() !== '') {
      this.router.navigateByUrl(notif.link);
    }
  }

  excluirNotificacao(id: number, event: Event) {
    event.stopPropagation();
    this.notificacaoService.excluirNotificacao(id).subscribe(() => {
      this.notificacoes = this.notificacoes.filter(n => n.id !== id);
      this.naoLidasCount = this.notificacoes.filter(n => !n.lida).length;
    });
  }

  limparLidas(event: Event) {
    event.stopPropagation();
    this.notificacaoService.limparLidas().subscribe(() => {
      this.notificacoes = this.notificacoes.filter(n => !n.lida);
    });
  }

  marcarComoLidas() {
    this.notificacaoService.marcarLidas().subscribe(() => {
      this.naoLidasCount = 0;
      this.notificacoes.forEach(n => n.lida = true);
    });
  }

  getNotifIcon(tipo: string): string {
    switch (tipo) {
      case 'info': return 'pi pi-info-circle';
      case 'success': return 'pi pi-check-circle';
      case 'warning': return 'pi pi-exclamation-triangle';
      case 'error': return 'pi pi-times-circle';
      default: return 'pi pi-bell';
    }
  }

  getNotifTipoClass(tipo: string): string {
    switch (tipo) {
      case 'info': return 'tipo-info';
      case 'success': return 'tipo-success';
      case 'warning': return 'tipo-warning';
      case 'error': return 'tipo-error';
      default: return 'tipo-info';
    }
  }

  formatarTempoRelativo(dataStr: any): string {
    if (!dataStr) return '';
    try {
      const data = new Date(dataStr);
      if (isNaN(data.getTime())) return '';
      const agora = new Date();
      const diffMs = agora.getTime() - data.getTime();
      const diffSeg = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSeg / 60);
      const diffHoras = Math.floor(diffMin / 60);
      const diffDias = Math.floor(diffHoras / 24);

      if (diffSeg < 60) return 'Agora mesmo';
      if (diffMin < 60) return `há ${diffMin} min`;
      if (diffHoras < 24) return `há ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
      if (diffDias === 1) return 'Ontem';
      if (diffDias < 7) return `há ${diffDias} dias`;
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('tp-dark-theme', this.isDarkMode);
  }

  formatarStatus(status: string | undefined): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'ABERTO': return 'Aberto';
      case 'EM_ORCAMENTO': return 'Em Orçamento';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      default: return status || 'Pendente';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'EM_ANDAMENTO': return 'status-andamento';
      case 'ABERTO': return 'status-aberto';
      case 'EM_ORCAMENTO': return 'status-orcamento';
      case 'CONCLUIDO': return 'status-concluido';
      default: return 'status-aberto';
    }
  }

  formatarData(dataStr: any): string {
    if (!dataStr) return '';
    try {
      const data = new Date(dataStr);
      if (isNaN(data.getTime())) return '';
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showChatDropdown = false;
      this.showNotifications = false;
    }
  }

  ngOnDestroy() {
    if (this.notifSub) this.notifSub.unsubscribe();
    if (this.chamadosSub) this.chamadosSub.unsubscribe();
    if (this.profilePicSub) this.profilePicSub.unsubscribe();
  }
}