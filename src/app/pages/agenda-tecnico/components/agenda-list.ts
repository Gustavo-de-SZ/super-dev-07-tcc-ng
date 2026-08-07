import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { RouterModule, Router } from '@angular/router';
import { Agendamento, StatusAgendamento } from '../../../shared/models';
import { isAgendamentoAtrasado, parseAgendamentoDate } from '../../../shared/utils/agendamento-utils';

// PrimeNG imports
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services
import { AgendaService } from '../../../services/agenda.service';

@Component({
  selector: 'app-agenda-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    PaginatorModule,
    ToastModule,
    EmptyStateComponent
  ],
  template: `
    <p-toast></p-toast>

    <div class="tcc-agenda-list">
      @for (item of paginatedCompromissos; track trackByAgendamento($index, item)) {
        <div class="tcc-agenda-card" [class.card-atrasado]="isAtrasado(item)">
          <div class="tcc-agenda-datetime-col" [class.col-atrasado]="isAtrasado(item)">
            <span class="tcc-date-month">{{ getDisplayMonth(item) }}</span>
            <span class="tcc-date-day">{{ getDisplayDay(item) }}</span>
            <span class="tcc-date-time">{{ item.hora }}</span>
          </div>

          <div class="tcc-agenda-details">
            <div class="tcc-title-row">
              <h3 class="tcc-agenda-title">{{ item.titulo }}</h3>
              
              @if (isAtrasado(item)) {
                <span class="tcc-status-badge badge-atrasado">
                  <i class="pi pi-exclamation-triangle"></i>
                  Atrasado
                </span>
              } @else {
                <span class="tcc-status-badge" [ngClass]="getBadgeClass(item.status)">
                  <i class="pi" [ngClass]="getBadgeIcon(item.status)"></i>
                  {{ item.status }}
                </span>
              }
            </div>

            <div class="tcc-agenda-meta">
              <span class="tcc-meta-item"><i class="pi pi-user"></i> {{ item.cliente || 'Não informado' }}</span>
              <span class="tcc-meta-item"><i class="pi pi-clock"></i> {{ item.duracao || 'Não informada' }}</span>
              <span class="tcc-meta-item">
                <i class="pi" [ngClass]="item.tipo === 'Remoto' ? 'pi-globe text-emerald-500' : 'pi-map-marker text-blue-500'"></i>
                {{ item.tipo || 'Presencial' }}
              </span>
            </div>
          </div>

          <div class="tcc-agenda-actions">
            <button
              type="button"
              class="tcc-btn-outline small"
              (click)="abrirMenu($event, menu, item)"
            >
              Ações <i class="pi pi-chevron-down"></i>
            </button>
          </div>
        </div>
      } @empty {
        <app-empty-state message="Nenhum agendamento encontrado."></app-empty-state>
      }
    </div>

    @if (compromissos.length > rows) {
      <div class="tcc-paginator-container">
        <p-paginator
          (onPageChange)="onPageChange($event)"
          [first]="first"
          [rows]="rows"
          [totalRecords]="compromissos.length"
          [rowsPerPageOptions]="[8, 16, 24, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} agendamentos"
        ></p-paginator>
      </div>
    }


    <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

  
    @if (agendamentoDetalhes) {
      <div class="tcc-modal-backdrop" (click)="fecharDetalhes()">
        <div class="tcc-modal-content tcc-fade-in" (click)="$event.stopPropagation()">
          <div class="tcc-modal-header">
            <div class="tcc-modal-title-box">
              <div class="tcc-modal-icon-box" [class.icon-atrasado]="isAtrasado(agendamentoDetalhes)">
                <i class="pi" [ngClass]="isAtrasado(agendamentoDetalhes) ? 'pi-exclamation-triangle' : 'pi-calendar'"></i>
              </div>
              <div>
                <h2 class="tcc-modal-title">{{ agendamentoDetalhes.titulo }}</h2>
                <span class="tcc-modal-subtitle">Cliente: {{ agendamentoDetalhes.cliente }}</span>
              </div>
            </div>
            <button class="tcc-modal-close" (click)="fecharDetalhes()" title="Fechar">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="tcc-modal-body">
      
            <div class="tcc-modal-highlight">
              <div class="highlight-item">
                <label>Status</label>
                @if (isAtrasado(agendamentoDetalhes)) {
                  <span class="tcc-status-badge badge-atrasado">
                    <i class="pi pi-exclamation-triangle"></i>
                    Atrasado ({{ agendamentoDetalhes.status }})
                  </span>
                } @else {
                  <span class="tcc-status-badge" [ngClass]="getBadgeClass(agendamentoDetalhes.status)">
                    <i class="pi" [ngClass]="getBadgeIcon(agendamentoDetalhes.status)"></i>
                    {{ agendamentoDetalhes.status }}
                  </span>
                }
              </div>
              <div class="highlight-item right">
                <label>Modalidade</label>
                <span class="highlight-type">
                  <i class="pi" [ngClass]="agendamentoDetalhes.tipo === 'Remoto' ? 'pi-globe' : 'pi-map-marker'"></i>
                  {{ agendamentoDetalhes.tipo || 'Presencial' }}
                </span>
              </div>
            </div>

         
            <div class="tcc-modal-info-list">
              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-user"></i></div>
                <div class="info-content">
                  <label>Cliente</label>
                  <span>{{ agendamentoDetalhes.cliente || 'Não informado' }}</span>
                </div>
              </div>

              @if (agendamentoDetalhes.empresa) {
                <div class="tcc-modal-info-item">
                  <div class="info-icon"><i class="pi pi-building"></i></div>
                  <div class="info-content">
                    <label>Empresa</label>
                    <span>{{ agendamentoDetalhes.empresa }}</span>
                  </div>
                </div>
              }

              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-calendar"></i></div>
                <div class="info-content">
                  <label>Data Programada</label>
                  <span>{{ formatarDataCompleta(agendamentoDetalhes) }}</span>
                </div>
              </div>

              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-clock"></i></div>
                <div class="info-content">
                  <label>Horário e Duração</label>
                  <span>{{ agendamentoDetalhes.hora }} ({{ agendamentoDetalhes.duracao || 'Sem duração' }})</span>
                </div>
              </div>

              @if (agendamentoDetalhes.servico) {
                <div class="tcc-modal-info-item full-width">
                  <div class="info-icon"><i class="pi pi-wrench"></i></div>
                  <div class="info-content">
                    <label>Serviço Vinculado</label>
                    <span>{{ agendamentoDetalhes.servico }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="tcc-modal-footer">
            <button type="button" class="tcc-btn-outline" (click)="fecharDetalhes()">Fechar</button>
            <button
              type="button"
              class="tcc-btn-primary"
              [routerLink]="['/painel/agenda', agendamentoDetalhes.id, 'edit']"
              (click)="fecharDetalhes()"
            >
              <i class="pi pi-pencil"></i> {{ isAtrasado(agendamentoDetalhes) ? 'Reagendar' : 'Editar Agendamento' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .tcc-agenda-list { display: flex; flex-direction: column; gap: 12px; }

    .tcc-agenda-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 24px;
      transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s ease;

      &.card-atrasado {
        border-left: 4px solid #f59e0b;
        background: #fffdfa;
      }
    }
    .tcc-agenda-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transform: translateY(-1px);
    }

    .tcc-agenda-datetime-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      width: 64px;
      height: 64px;
      background-color: #eff6ff;
      border-radius: 10px;
      color: var(--tcc-primary, #3b82f6);
      flex-shrink: 0;

      &.col-atrasado {
        background-color: #fef3c7;
        color: #b45309;
      }
    }

    .tcc-date-month { font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .tcc-date-day { font-size: 20px; font-weight: 800; line-height: 1; }
    .tcc-date-time { font-size: 11px; font-weight: 600; opacity: 0.8; }

    .tcc-agenda-details { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .tcc-title-row { display: flex; align-items: center; justify-content: flex-start; gap: 12px; }
    .tcc-agenda-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--tcc-text-main, #0f172a); }

    .tcc-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid;
    }
    .tcc-status-badge i { font-size: 10px; }

    .badge-confirmado { color: #10b981; border-color: #10b981; background-color: #ecfdf5; }
    .badge-concluido { color: #3b82f6; border-color: #3b82f6; background-color: #eff6ff; }
    .badge-pendente { color: #f59e0b; border-color: #f59e0b; background-color: #fffbeb; }
    .badge-cancelado { color: #ef4444; border-color: #ef4444; background-color: #fef2f2; }
    .badge-atrasado { color: #b45309; border-color: #f59e0b; background-color: #fef3c7; }

    .tcc-agenda-meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }
    .tcc-meta-item { display: flex; align-items: center; gap: 6px; }
    .tcc-meta-item i { font-size: 13px; opacity: 0.7; }

    .tcc-agenda-actions { display: flex; align-items: center; gap: 8px; }

    .tcc-btn-outline.small {
      background-color: transparent;
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-main, #475569);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }
    .tcc-btn-outline.small:hover { background-color: var(--tcc-bg, #f8fafc); }

    /* Modal Backdrop and Container */
    .tcc-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 16px;
      animation: tccFadeIn 0.2s ease-out;
    }

    .tcc-modal-content {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      width: 100%;
      max-width: 540px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .tcc-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-modal-title-box { display: flex; align-items: center; gap: 14px; }
    .tcc-modal-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #eff6ff;
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;

      &.icon-atrasado {
        background: #fef3c7;
        color: #d97706;
      }
    }

    .tcc-modal-title {
      font-size: 17px;
      font-weight: 700;
      margin: 0;
      color: var(--tcc-text-main, #0f172a);
    }
    .tcc-modal-subtitle {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-modal-close {
      background: transparent;
      border: none;
      font-size: 18px;
      color: var(--tcc-text-muted, #64748b);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    .tcc-modal-close:hover { background-color: var(--tcc-surface-hover, #f1f5f9); }

    .tcc-modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
      max-height: 70vh;
    }

    .tcc-modal-highlight {
      display: flex;
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 16px;
      justify-content: space-between;
      align-items: center;
    }

    .highlight-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .highlight-item.right {
      align-items: flex-end;
    }

    .highlight-item label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
    }

    .highlight-type {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 14px;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-modal-info-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .tcc-modal-info-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #f1f5f9);
      border-radius: 10px;
    }
    .tcc-modal-info-item.full-width {
      grid-column: span 2;
    }

    .info-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--tcc-bg, #f1f5f9);
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }

    .info-content label {
      font-size: 11px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      text-transform: uppercase;
    }

    .info-content span {
      font-size: 13px;
      font-weight: 500;
      color: var(--tcc-text-main, #0f172a);
      word-break: break-word;
    }

    .tcc-modal-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--tcc-border, #e2e8f0);
      background: var(--tcc-bg, #f8fafc);
    }

    .tcc-btn-primary {
      background: var(--tcc-primary, #3b82f6);
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }
    .tcc-btn-primary:hover {
      background: #2563eb;
    }

    .tcc-btn-outline {
      background: #ffffff;
      border: 1px solid var(--tcc-border, #cbd5e1);
      color: var(--tcc-text-main, #334155);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tcc-btn-outline:hover {
      background: #f1f5f9;
    }

    @keyframes tccFadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    .tcc-paginator-container {
      display: flex;
      justify-content: center;
      margin-top: 8px;
      padding: 8px 0;
    }
  `]
})
export class AgendaList {
  @Input() compromissos: Agendamento[] = [];

  first: number = 0;
  rows: number = 8;

  get paginatedCompromissos(): Agendamento[] {
    return this.compromissos.slice(this.first, this.first + this.rows);
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  menuItems: MenuItem[] = [];
  selectedItem: Agendamento | null = null;
  agendamentoDetalhes: Agendamento | null = null;

  constructor(
    private agendaService: AgendaService,
    private router: Router,
    private messageService: MessageService
  ) {}

  isAtrasado(item: Agendamento | null | undefined): boolean {
    return isAgendamentoAtrasado(item);
  }

  abrirMenu(event: Event, menu: any, item: Agendamento): void {
    event.stopPropagation();
    this.selectedItem = item;
    const atrasado = this.isAtrasado(item);

    this.menuItems = [
      {
        label: 'Ver Detalhes',
        icon: 'pi pi-eye',
        command: () => this.abrirDetalhes(item)
      },
      {
        label: atrasado ? 'Reagendar / Editar' : 'Editar',
        icon: 'pi pi-pencil',
        command: () => {
          if (item.id) {
            this.router.navigate(['/painel/agenda', item.id, 'edit']);
          }
        }
      },
      {
        label: 'Marcar como Concluído (Gerar Serviço)',
        icon: 'pi pi-check-circle',
        command: () => this.convertToService(item)
      },
      {
        label: 'Cancelar Agendamento',
        icon: 'pi pi-times',
        command: () => this.updateStatus(item, 'Cancelado')
      },
      {
        separator: true
      },
      {
        label: 'Excluir Agendamento',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.excluirAgendamento(item)
      }
    ];
    menu.toggle(event);
  }

  abrirDetalhes(item: Agendamento): void {
    this.agendamentoDetalhes = item;
  }

  fecharDetalhes(): void {
    this.agendamentoDetalhes = null;
  }

  updateStatus(item: Agendamento, newStatus: StatusAgendamento): void {
    const updatedItem: Agendamento = { ...item, status: newStatus };
    this.agendaService.updateAgendamento(updatedItem).subscribe({
      next: (updated) => {
        const index = this.compromissos.findIndex(i => i.id === item.id);
        if (index !== -1) {
          this.compromissos[index] = { ...this.compromissos[index], ...updatedItem };
        }
        if (this.agendamentoDetalhes && this.agendamentoDetalhes.id === item.id) {
          this.agendamentoDetalhes.status = newStatus;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Status Atualizado',
          detail: `Status alterado para ${newStatus}`
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível atualizar o status. Tente novamente.'
        });
      }
    });
  }

  excluirAgendamento(item: Agendamento): void {
    if (!item.id) return;
    if (confirm(`Tem certeza que deseja excluir o agendamento "${item.titulo}"?`)) {
      this.agendaService.deleteAgendamento(item.id).subscribe({
        next: () => {
          this.compromissos = this.compromissos.filter(i => i.id !== item.id);
          if (this.agendamentoDetalhes?.id === item.id) {
            this.fecharDetalhes();
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Excluído',
            detail: 'Agendamento removido com sucesso!'
          });
        },
        error: (err) => {
          console.error('Erro ao excluir agendamento', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível excluir o agendamento.'
          });
        }
      });
    }
  }

  convertToService(item: Agendamento): void {
    const nomeCliente = typeof item.cliente === 'object' && item.cliente !== null
      ? ((item.cliente as any).nome_exibicao || (item.cliente as any).nome_completo || (item.cliente as any).nome || '')
      : String(item.cliente || '');

    this.router.navigate(['/painel/servicos/novo'], {
      queryParams: {
        fromAgendamento: item.id,
        cliente: nomeCliente,
        titulo: item.titulo || '',
        duracao: item.duracao || '',
        tipo: item.tipo || 'Presencial'
      }
    });
  }

  formatarDataCompleta(item: Agendamento): string {
    const parsed = parseAgendamentoDate(item);
    if (parsed) {
      const d = String(parsed.getDate()).padStart(2, '0');
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const y = parsed.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const dia = item.dia || '';
    if (dia.includes('-')) {
      const parts = dia.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return `${dia} de ${item.mes || ''}`;
  }

  getDisplayDay(item: Agendamento): string {
    const parsed = parseAgendamentoDate(item);
    if (parsed) {
      return String(parsed.getDate()).padStart(2, '0');
    }
    const dia = item.dia || '15';
    if (dia.includes('-')) {
      const partes = dia.split('-');
      if (partes.length === 3) {
        return partes[2];
      }
    } else if (dia.includes('/')) {
      const partes = dia.split('/');
      if (partes.length === 3) {
        return partes[0];
      }
    }
    return dia;
  }

  getDisplayMonth(item: Agendamento): string {
    const parsed = parseAgendamentoDate(item);
    if (parsed) {
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      return meses[parsed.getMonth()];
    }
    const dia = item.dia || '';
    let mes = item.mes || 'Julho';

    let monthNum = 0;
    if (dia.includes('-')) {
      const partes = dia.split('-');
      if (partes.length === 3) {
        monthNum = parseInt(partes[1], 10);
      }
    } else if (dia.includes('/')) {
      const partes = dia.split('/');
      if (partes.length === 3) {
        monthNum = parseInt(partes[1], 10);
      }
    }

    if (monthNum >= 1 && monthNum <= 12) {
      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      mes = meses[monthNum - 1];
    }

    if (mes.endsWith('.')) {
      mes = mes.slice(0, -1);
    }

    if (mes.length > 3) {
      return mes.substring(0, 3).toUpperCase();
    }
    return mes.toUpperCase();
  }

  getBadgeClass(status?: string): string {
    switch (status) {
      case 'Confirmado': return 'badge-confirmado';
      case 'Concluído': return 'badge-concluido';
      case 'Pendente': return 'badge-pendente';
      case 'Cancelado': return 'badge-cancelado';
      default: return 'badge-pendente';
    }
  }

  getBadgeIcon(status?: string): string {
    switch (status) {
      case 'Confirmado': return 'pi-check-circle';
      case 'Concluído': return 'pi-check';
      case 'Pendente': return 'pi-clock';
      case 'Cancelado': return 'pi-times-circle';
      default: return 'pi-info-circle';
    }
  }

  trackByAgendamento(index: number, item: Agendamento): any {
    return item.id && item.id.trim() !== '' ? item.id : index;
  }
}