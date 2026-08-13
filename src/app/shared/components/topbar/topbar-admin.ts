import { Component, HostListener, OnInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { NotificacaoService, Notificacao } from '../../../services/notificacao.service';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-topbar-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="tcc-topbar">
      <div class="tcc-topbar-brand-indicator">
     
      </div>

      <div class="tcc-topbar-actions">
     
        <button class="tcc-toggle-mode" (click)="toggleTheme()" title="Alternar tema">
          <i [class]="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

     
        <div class="tcc-dropdown-wrapper">
          <button 
            class="tcc-notification-btn" 
            [class.tcc-btn-active]="showNotificationsDropdown"
            (click)="toggleNotificationsDropdown($event)" 
            title="Notificações">
            <i class="pi pi-bell"></i>
            @if (naoLidasCount > 0) {
              <span class="tcc-badge tcc-badge-danger">{{ naoLidasCount }}</span>
            }
          </button>

          @if (showNotificationsDropdown) {
            <div class="tcc-popover tcc-notif-popover" (click)="$event.stopPropagation()">
              <div class="tcc-popover-header">
                <div class="header-title-box">
                  <div class="header-icon-circle notif-icon-bg">
                    <i class="pi pi-bell"></i>
                  </div>
                  <div>
                    <h4 class="popover-title">Notificações do Sistema</h4>
                    <p class="popover-subtitle">Alertas e eventos administrativos</p>
                  </div>
                </div>
                @if (naoLidasCount > 0) {
                  <button class="tcc-action-link" (click)="marcarTodasComoLidas()">Marcar lidas</button>
                }
              </div>

              <div class="tcc-popover-body">
                @if (notificacoes.length === 0) {
                  <div class="empty-state">
                    <div class="empty-icon-circle">
                      <i class="pi pi-check"></i>
                    </div>
                    <p class="empty-title">Tudo limpo por aqui</p>
                    <p class="empty-subtitle">Você não possui notificações pendentes</p>
                  </div>
                } @else {
                  <div class="notif-list">
                    @for (item of notificacoes; track item.id) {
                      <div 
                        class="notif-item" 
                        [class.unread]="!item.lida"
                        (click)="abrirNotificacao(item)">
                        <div class="notif-indicator"></div>
                        <div class="notif-content">
                          <div class="notif-header-line">
                            <span class="notif-title">{{ item.titulo }}</span>
                            <span class="notif-time">{{ item.criado_em | date:'shortTime' }}</span>
                          </div>
                          <p class="notif-message">{{ item.mensagem }}</p>
                        </div>
                        <button class="notif-delete-btn" (click)="excluirNotificacao($event, item.id)" title="Remover">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="tcc-popover-footer">
                @if (temLidas) {
                  <button class="footer-btn" (click)="limparLidas()">
                    <i class="pi pi-trash"></i>
                    <span>Limpar lidas</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <div class="tcc-divider"></div>

       
        <div class="tcc-profile-section" routerLink="/admin/configuracoes" title="Meu Perfil">
          <div class="tcc-profile-info">
            <span class="tcc-profile-name">{{ usuarioNome }}</span>
            <span class="tcc-profile-role">{{ usuarioCargo }}</span>
          </div>
          <div class="tcc-profile-avatar">
            <i class="pi pi-user"></i>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .tcc-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      gap: 16px;
    }

    .tcc-topbar-brand-indicator {
      display: flex;
      align-items: center;
    }

    .admin-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(79, 70, 229, 0.15) 100%);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 20px;
      color: var(--tcc-primary, #2563eb);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;

      i {
        font-size: 13px;
      }
    }

    .tcc-topbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .tcc-toggle-mode, .tcc-notification-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      background-color: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s ease;

      &:hover, &.tcc-btn-active {
        background-color: var(--tcc-bg, #f8fafc);
        color: var(--tcc-text-main, #0f172a);
        border-color: var(--tcc-border-focus, #cbd5e1);
      }
    }

    .tcc-dropdown-wrapper {
      position: relative;
    }

    .tcc-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      border: 2px solid var(--tcc-surface, #ffffff);
    }

    .tcc-badge-danger {
      background-color: #ef4444;
    }

    .tcc-divider {
      width: 1px;
      height: 24px;
      background-color: var(--tcc-border, #e2e8f0);
    }

    .tcc-profile-section {
      display: flex;
      align-items: center;
      gap: 10px;
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

    .tcc-profile-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-profile-role {
      font-size: 11px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-profile-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #1d4ed8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 600;
    }

    /* Popover */
    .tcc-popover {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 360px;
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 14px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      animation: popoverFadeIn 0.2s ease-out;
    }

    @keyframes popoverFadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tcc-popover-header {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--tcc-border, #f1f5f9);
    }

    .header-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #eff6ff;
      color: #2563eb;
      font-size: 14px;
    }

    .popover-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
    }

    .popover-subtitle {
      font-size: 11px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .tcc-action-link {
      background: none;
      border: none;
      font-size: 12px;
      color: #2563eb;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      &:hover { text-decoration: underline; }
    }

    .tcc-popover-body {
      max-height: 340px;
      overflow-y: auto;
      padding: 8px;
    }

    .notif-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
      position: relative;

      &:hover {
        background-color: var(--tcc-bg, #f8fafc);
      }

      &.unread {
        background-color: rgba(59, 130, 246, 0.04);
        .notif-indicator {
          background-color: #3b82f6;
        }
      }
    }

    .notif-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: transparent;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-header-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .notif-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    .notif-time {
      font-size: 11px;
      color: var(--tcc-text-muted, #94a3b8);
    }

    .notif-message {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
      line-height: 1.4;
    }

    .notif-delete-btn {
      background: none;
      border: none;
      color: var(--tcc-text-muted, #94a3b8);
      cursor: pointer;
      padding: 4px;
      font-size: 11px;
      opacity: 0;
      transition: opacity 0.15s ease;
      &:hover { color: #ef4444; }
    }

    .notif-item:hover .notif-delete-btn {
      opacity: 1;
    }

    .empty-state {
      padding: 32px 16px;
      text-align: center;
    }

    .empty-icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--tcc-bg, #f1f5f9);
      color: var(--tcc-text-muted, #94a3b8);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px auto;
      font-size: 20px;
    }

    .empty-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 4px 0;
    }

    .empty-subtitle {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .tcc-popover-footer {
      padding: 10px 16px;
      border-top: 1px solid var(--tcc-border, #f1f5f9);
      display: flex;
      justify-content: flex-end;
    }

    .footer-btn {
      background: none;
      border: none;
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      &:hover { color: #ef4444; }
    }
  `]
})
export class TopbarAdmin implements OnInit, OnDestroy {
  isDark = false;
  usuarioNome = 'Administrador';
  usuarioCargo = 'Administrador Geral';

  showNotificationsDropdown = false;
  notificacoes: Notificacao[] = [];
  naoLidasCount = 0;
  private notifSub?: Subscription;

  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private notificacaoService = inject(NotificacaoService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  get temLidas(): boolean {
    return this.notificacoes.some(n => n.lida);
  }

  constructor() {
    this.isDark = this.themeService.isDark();
    this.setupUser();
  }

  private setupUser(): void {
    // Escuta usuário autenticado
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        if (user.name && !user.name.includes('@')) {
          this.usuarioNome = user.name;
        } else if (user.given_name) {
          this.usuarioNome = user.given_name;
        } else if (user.nickname) {
          this.usuarioNome = user.nickname;
        } else if (user.email) {
          this.usuarioNome = user.email.split('@')[0];
        }
      }
    });

    // Escuta o perfil resolvido pela API
    this.profileService.verificarPerfilExistente().subscribe(profile => {
      if (profile && profile.type === 'admin') {
        this.usuarioCargo = 'Administrador do Sistema';
      }
    });
  }

  ngOnInit(): void {
    this.loadNotificacoes();
    this.notifSub = interval(30000).subscribe(() => {
      this.loadNotificacoes();
    });
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggle();
    this.isDark = this.themeService.isDark();
  }

  toggleNotificationsDropdown(event: Event): void {
    event.stopPropagation();
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showNotificationsDropdown = false;
    }
  }

  loadNotificacoes(): void {
    this.notificacaoService.getNotificacoes().subscribe({
      next: (data) => {
        this.notificacoes = data;
        this.naoLidasCount = data.filter(n => !n.lida).length;
      },
      error: () => {}
    });
  }

  marcarTodasComoLidas(): void {
    this.notificacaoService.marcarLidas().subscribe({
      next: () => {
        this.notificacoes.forEach(n => n.lida = true);
        this.naoLidasCount = 0;
      }
    });
  }

  abrirNotificacao(item: Notificacao): void {
    if (!item.lida) {
      this.notificacaoService.marcarLida(item.id).subscribe({
        next: () => {
          item.lida = true;
          this.naoLidasCount = Math.max(0, this.naoLidasCount - 1);
        }
      });
    }

    this.showNotificationsDropdown = false;

    if (item.link && item.link !== '/pendente-aprovacao' && item.link.trim() !== '') {
      this.router.navigateByUrl(item.link);
    }
  }

  excluirNotificacao(event: Event, id: number): void {
    event.stopPropagation();
    this.notificacaoService.excluirNotificacao(id).subscribe({
      next: () => {
        this.notificacoes = this.notificacoes.filter(n => n.id !== id);
        this.naoLidasCount = this.notificacoes.filter(n => !n.lida).length;
      }
    });
  }

  limparLidas(): void {
    this.notificacaoService.limparLidas().subscribe({
      next: () => {
        this.notificacoes = this.notificacoes.filter(n => !n.lida);
        this.naoLidasCount = this.notificacoes.filter(n => !n.lida).length;
      }
    });
  }
}
