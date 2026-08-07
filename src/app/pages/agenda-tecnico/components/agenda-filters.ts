import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Agendamento } from '../../../shared/models';
import { isAgendamentoAtrasado } from '../../../shared/utils/agendamento-utils';

@Component({
  selector: 'app-agenda-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-filters-pills">
      <button class="tcc-pill" [class.active]="selectedFilter === 'Todos'" (click)="selectFilter('Todos')">
        Todos ({{ compromissos.length }})
      </button>
      <button class="tcc-pill" [class.active]="selectedFilter === 'Confirmado'" (click)="selectFilter('Confirmado')">
        Confirmado ({{ countConfirmados() }})
      </button>
      <button class="tcc-pill" [class.active]="selectedFilter === 'Pendente'" (click)="selectFilter('Pendente')">
        Pendente ({{ countPendentes() }})
      </button>
      <button 
        class="tcc-pill pill-atrasado" 
        [class.active]="selectedFilter === 'Atrasado'" 
        (click)="selectFilter('Atrasado')">
        @if (countAtrasados() > 0) {
          <i class="pi pi-exclamation-triangle"></i>
        }
        Atrasados ({{ countAtrasados() }})
      </button>
      <button class="tcc-pill" [class.active]="selectedFilter === 'Concluído'" (click)="selectFilter('Concluído')">
        Concluído ({{ countStatus('Concluído') }})
      </button>
      <button class="tcc-pill" [class.active]="selectedFilter === 'Cancelado'" (click)="selectFilter('Cancelado')">
        Cancelado ({{ countStatus('Cancelado') }})
      </button>
    </div>
  `,
  styles: [`
    .tcc-filters-pills {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .tcc-pill {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-muted, #64748b);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background-color: var(--tcc-bg, #f8fafc);
        border-color: #cbd5e1;
      }

      &.active {
        background-color: var(--tcc-primary, #3b82f6);
        color: white;
        border-color: var(--tcc-primary, #3b82f6);
      }

      &.pill-atrasado {
        i {
          color: #d97706;
          font-size: 12px;
        }

        &.active {
          background-color: #d97706;
          border-color: #d97706;
          color: white;

          i {
            color: white;
          }
        }
      }
    }
  `]
})
export class AgendaFilters {
  @Input() compromissos: Agendamento[] = [];
  @Input() set currentFilter(val: string) {
    if (val) this.selectedFilter = val;
  }
  @Output() filterChange = new EventEmitter<string>();

  selectedFilter: string = 'Todos';

  countStatus(status: string): number {
    return this.compromissos.filter(c => c.status === status).length;
  }

  countPendentes(): number {
    return this.compromissos.filter(c => c.status === 'Pendente' && !isAgendamentoAtrasado(c)).length;
  }

  countConfirmados(): number {
    return this.compromissos.filter(c => c.status === 'Confirmado' && !isAgendamentoAtrasado(c)).length;
  }

  countAtrasados(): number {
    return this.compromissos.filter(c => isAgendamentoAtrasado(c)).length;
  }

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterChange.emit(filter);
  }
}