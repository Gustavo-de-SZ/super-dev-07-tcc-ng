import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Agendamento } from '../../../shared/models';
import { parseAgendamentoDate, isAgendamentoAtrasado, isAgendamentoProximo } from '../../../shared/utils/agendamento-utils';

@Component({
  selector: 'app-appointments-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tcc-card-base appt-panel-card">
      <div class="tcc-panel-header">
        <div class="appt-header-title-box">
          <div class="appt-header-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <div>
            <h3>Próximos Agendamentos</h3>
            <span class="appt-header-sub">
              {{ proximosAgendamentos.length > 0 ? (proximosAgendamentos.length + ' agendamento(s) programado(s)') : 'Nenhum agendamento futuro' }}
            </span>
          </div>
        </div>
        <a routerLink="/painel/agenda" class="tcc-link-sm">
          Ver agenda <i class="pi pi-arrow-right" style="font-size: 11px; margin-left: 2px;"></i>
        </a>
      </div>

     
      @if (atrasadosCount > 0) {
        <a 
          routerLink="/painel/agenda" 
          [queryParams]="{filtro: 'Atrasado'}" 
          class="appt-atrasados-alert">
          <div class="alert-content">
            <i class="pi pi-exclamation-triangle alert-icon"></i>
            <span>Você possui <strong>{{ atrasadosCount }} agendamento{{ atrasadosCount > 1 ? 's' : '' }} pendente{{ atrasadosCount > 1 ? 's' : '' }}</strong> de datas anteriores.</span>
          </div>
          <span class="alert-action">
            Regularizar <i class="pi pi-arrow-right" style="font-size: 10px;"></i>
          </span>
        </a>
      }

      @if (proximosAgendamentos.length > 0) {
        <div class="tcc-appointments-list">
          @for (agendamento of proximosAgendamentos.slice(0, 4); track (agendamento.id || agendamento.empresa || $index)) {
            <div class="tcc-appointment-item" [routerLink]="['/painel/agenda']">
              <div class="tcc-appt-time">
                <span class="tcc-appt-day">{{ formatDia(agendamento) }}</span>
                <span class="tcc-appt-hour">{{ formatHora(agendamento) }}</span>
              </div>
              
              <div class="tcc-appt-info">
                <h4 class="tcc-appt-title">
                  {{ agendamento.titulo || agendamento.servico || 'Atendimento Agendado' }}
                </h4>
                <div class="tcc-appt-meta">
                  <span class="tcc-appt-client">
                    <i class="pi pi-user"></i>
                    {{ agendamento.cliente || agendamento.empresa || 'Cliente Particular' }}
                  </span>
                  @if (agendamento.tipo || agendamento.duracao) {
                    <span class="tcc-appt-dot">•</span>
                  }
                  @if (agendamento.tipo) {
                    <span class="tcc-appt-tag">
                      <i class="pi" [ngClass]="agendamento.tipo === 'Remoto' ? 'pi-globe' : 'pi-map-marker'"></i>
                      {{ agendamento.tipo }}
                    </span>
                  }
                  @if (agendamento.duracao) {
                    <span class="tcc-appt-tag">
                      <i class="pi pi-clock"></i>
                      {{ agendamento.duracao }}
                    </span>
                  }
                </div>
              </div>

              <div class="tcc-appt-status">
                <span class="tcc-status-pill" [ngClass]="getStatusClass(agendamento.status)">
                  <i class="pi" [ngClass]="getStatusIcon(agendamento.status)" style="font-size: 11px;"></i>
                  {{ agendamento.status || 'Pendente' }}
                </span>
              </div>
            </div>
          }
        </div>
      }

      @if (proximosAgendamentos.length === 0) {
        <div class="appt-empty">
          <div class="appt-empty-icon">
            <i class="pi pi-calendar-plus"></i>
          </div>
          <h4>Nenhum agendamento futuro</h4>
          <p>Você não possui novos atendimentos agendados para hoje ou datas futuras.</p>
          <button class="tcc-btn-main small" routerLink="/painel/agenda/novo">
            <i class="pi pi-plus" style="font-size: 12px; margin-right: 6px;"></i> Agendar Atendimento
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .appt-panel-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 380px;
    }

    .tcc-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .appt-header-title-box {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        font-size: 17px;
        font-weight: 600;
        color: var(--tcc-text-main, #1e293b);
        margin: 0;
      }
    }

    .appt-header-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .appt-header-sub {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-link-sm {
      font-size: 13px;
      color: var(--tcc-primary, #3b82f6);
      text-decoration: none;
      font-weight: 600;
      display: flex;
      align-items: center;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }
    }

    /* Alerta de agendamentos atrasados */
    .appt-atrasados-alert {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 14px;
      text-decoration: none;
      color: #92400e;
      font-size: 12.5px;
      transition: all 0.2s ease;

      &:hover {
        background: #fef3c7;
        border-color: #fcd34d;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(217, 119, 6, 0.1);
      }

      .alert-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .alert-icon {
        color: #d97706;
        font-size: 14px;
        flex-shrink: 0;
      }

      .alert-action {
        font-weight: 700;
        color: #b45309;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        margin-left: 8px;
      }
    }

    .tcc-appointments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .tcc-appointment-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 16px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      background: var(--tcc-card-bg, #ffffff);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: #93c5fd;
        background: #f8faff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
      }
    }

    .tcc-appt-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 6px 10px;
      border-radius: 10px;
      min-width: 58px;
      flex-shrink: 0;
    }

    .tcc-appt-day {
      font-size: 11px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tcc-appt-hour {
      font-size: 14px;
      color: var(--tcc-primary, #3b82f6);
      font-weight: 800;
    }

    .tcc-appt-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .tcc-appt-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #1e293b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tcc-appt-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
      flex-wrap: nowrap;
      overflow: hidden;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .tcc-appt-client {
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tcc-appt-dot {
      color: #cbd5e1;
    }

    .tcc-appt-tag {
      font-size: 11px;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .tcc-appt-status {
      flex-shrink: 0;
    }

    .tcc-status-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;

      &.status-confirmado {
        background: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
      }

      &.status-pendente {
        background: #fff7ed;
        color: #c2410c;
        border: 1px solid #fed7aa;
      }

      &.status-concluido {
        background: #f0fdf4;
        color: #15803d;
        border: 1px solid #bbf7d0;
      }

      &.status-cancelado {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }
    }

    .appt-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 32px 16px;
      flex: 1;

      .appt-empty-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: #f1f5f9;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-bottom: 12px;
      }

      h4 {
        font-size: 15px;
        font-weight: 600;
        color: var(--tcc-text-main, #1e293b);
        margin: 0 0 6px 0;
      }

      p {
        font-size: 13px;
        color: var(--tcc-text-muted, #64748b);
        margin: 0 0 16px 0;
        max-width: 260px;
        line-height: 1.4;
      }
    }
  `]
})
export class AppointmentsPanelComponent {
  @Input() agendamentos: Agendamento[] = [];

  get proximosAgendamentos(): Agendamento[] {
    return (this.agendamentos || [])
      .filter(a => isAgendamentoProximo(a))
      .sort((a, b) => {
        const dateA = parseAgendamentoDate(a)?.getTime() || 0;
        const dateB = parseAgendamentoDate(b)?.getTime() || 0;
        return dateA - dateB;
      });
  }

  get atrasadosCount(): number {
    return (this.agendamentos || []).filter(a => isAgendamentoAtrasado(a)).length;
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Confirmado': return 'status-confirmado';
      case 'Concluído': return 'status-concluido';
      case 'Cancelado': return 'status-cancelado';
      case 'Pendente':
      default:
        return 'status-pendente';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'Confirmado': return 'pi-calendar-check';
      case 'Concluído': return 'pi-check-circle';
      case 'Cancelado': return 'pi-times-circle';
      case 'Pendente':
      default:
        return 'pi-clock';
    }
  }

  formatDia(ag: any): string {
    if (!ag) return 'Hoje';
    const parsedDate = parseAgendamentoDate(ag);
    if (parsedDate) {
      const day = String(parsedDate.getDate()).padStart(2, '0');
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
    const dia = ag.dia || ag.data;
    if (!dia) return 'Hoje';
    if (typeof dia === 'string') {
      if (/^\d{1,2}$/.test(dia)) return dia;
      const ddmmyyyy = dia.match(/^(\d{2})\/(\d{2})/);
      if (ddmmyyyy) return `${ddmmyyyy[1]}/${ddmmyyyy[2]}`;
      const isodate = dia.match(/^\d{4}-(\d{2})-(\d{2})/);
      if (isodate) return `${isodate[2]}/${isodate[1]}`;
    }
    return String(dia);
  }

  formatHora(ag: any): string {
    if (!ag) return '13:00';
    const hora = ag.hora || ag.horario;
    if (!hora) return '13:00';
    if (typeof hora === 'string' && hora.includes(':')) {
      const parts = hora.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return String(hora);
  }
}
