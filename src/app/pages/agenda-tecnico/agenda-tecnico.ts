import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Compromisso {
  mes: string;
  dia: string;
  hora: string;
  titulo: string;
  status: 'Confirmado' | 'Pendente' | 'Concluído' | 'Cancelado';
  cliente: string;
  duracao: string;
  tipo: 'Presencial' | 'Remoto';
}

@Component({
  selector: 'app-agenda-tecnico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-page-wrapper">
      
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <h1 class="tcc-page-title">Agenda</h1>
          <p class="tcc-page-subtitle">Gerencie seus agendamentos</p>
        </div>
        
        <button class="tcc-btn-main tcc-btn-with-icon">
          <i class="pi pi-plus"></i>
          Novo Agendamento
        </button>
      </header>

      <div class="tcc-filters-row">
        <button class="tcc-filter-pill active">Todos (8)</button>
        <button class="tcc-filter-pill">Confirmado (3)</button>
        <button class="tcc-filter-pill">Pendente (3)</button>
        <button class="tcc-filter-pill">Concluído (1)</button>
        <button class="tcc-filter-pill">Cancelado (1)</button>
      </div>

      <div class="tcc-search-toolbar">
        <div class="tcc-input-group tcc-search-input">
          <i class="pi pi-search"></i>
          <input type="text" placeholder="Buscar cliente ou serviço...">
        </div>
        
        <div class="tcc-input-group tcc-date-input">
          <i class="pi pi-calendar"></i>
          <input type="text" placeholder="mm/dd/yyyy">
        </div>

        <select class="tcc-select-input">
          <option>Todos locais</option>
          <option>Presencial</option>
          <option>Remoto</option>
        </select>
      </div>


      <div class="tcc-agenda-list">
        @for (item of compromissos; track item.titulo) {
          <div class="tcc-agenda-card">
            
            <div class="tcc-agenda-datetime-col">
              <span class="tcc-date-month">{{ item.mes }}</span>
              <span class="tcc-date-day">{{ item.dia }}</span>
              <span class="tcc-date-time">{{ item.hora }}</span>
            </div>

            <div class="tcc-agenda-details">
              <div class="tcc-title-row">
                <h3 class="tcc-agenda-title">{{ item.titulo }}</h3>
                <span class="tcc-badge" [ngClass]="getBadgeClass(item.status)">
                  {{ item.status }}
                </span>
              </div>
              
              <div class="tcc-agenda-meta">
                <span class="tcc-meta-item">
                  <i class="pi pi-user"></i> {{ item.cliente }}
                </span>
                <span class="tcc-meta-item">
                  <i class="pi pi-clock"></i> {{ item.duracao }}
                </span>
                <span class="tcc-meta-item">
                  <i class="pi pi-map-marker"></i> {{ item.tipo }}
                </span>
              </div>
            </div>

            <div class="tcc-agenda-actions">
              <button class="tcc-btn-outline">
                Ações <i class="pi pi-chevron-down"></i>
              </button>
            </div>

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .tcc-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px; 
      padding-bottom: 32px;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tcc-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .tcc-header-title-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tcc-page-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--tcc-text-main);
      margin: 0;
    }

    .tcc-page-subtitle {
      color: var(--tcc-text-muted);
      font-size: 16px;
      margin: 0;
    }

    .tcc-btn-with-icon {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      font-size: 15px;
      cursor: pointer;
    }

    .tcc-filters-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tcc-filter-pill {
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      color: var(--tcc-text-muted);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--tcc-primary);
        color: var(--tcc-primary);
      }

      &.active {
        background-color: var(--tcc-primary);
        border-color: var(--tcc-primary);
        color: #ffffff;
      }
    }

    .tcc-search-toolbar {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .tcc-input-group {
      display: flex;
      align-items: center;
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      border-radius: 8px;
      padding: 0 16px;
      height: 44px;
      transition: border-color 0.2s;

      &:focus-within {
        border-color: var(--tcc-primary);
      }

      i {
        color: var(--tcc-text-muted);
        margin-right: 12px;
      }

      input {
        border: none;
        background: transparent;
        color: var(--tcc-text-main);
        font-size: 14px;
        width: 100%;
        outline: none;
        
        &::placeholder {
          color: var(--tcc-text-muted);
          opacity: 0.7;
        }
      }
    }

    .tcc-search-input {
      flex: 1;
      min-width: 250px;
    }

    .tcc-date-input {
      width: 180px;
    }

    .tcc-select-input {
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      color: var(--tcc-text-main);
      border-radius: 8px;
      padding: 0 16px;
      height: 44px;
      font-size: 14px;
      outline: none;
      cursor: pointer;
      width: 160px;
    }

    .tcc-results-count {
      font-size: 13px;
      color: var(--tcc-text-muted);
      margin: -8px 0 0 0;
    }

   
    .tcc-agenda-list {
      display: flex;
      flex-direction: column;
      gap: 12px; 
    }

    .tcc-agenda-card {
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      border-radius: var(--tcc-radius);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 24px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        border-color: var(--tcc-primary);
        box-shadow: var(--tcc-shadow);
      }
    }

  
    .tcc-agenda-datetime-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;
      border-right: 1px solid var(--tcc-border);
      padding-right: 24px;
    }

    .tcc-date-month {
      font-size: 12px;
      color: var(--tcc-text-muted);
      text-transform: capitalize;
    }

    .tcc-date-day {
      font-size: 22px;
      font-weight: 700;
      color: var(--tcc-primary);
      line-height: 1.2;
    }

    .tcc-date-time {
      font-size: 13px;
      color: var(--tcc-text-muted);
      margin-top: 4px;
    }

   
    .tcc-agenda-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tcc-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tcc-agenda-title {
      margin: 0;
      font-size: 16px;
      color: var(--tcc-text-main);
      font-weight: 600;
    }

   
    .tcc-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: capitalize;
    }

    .badge-confirmado {
      background-color: #10b9811a;
      color: #10b981;
      border: 1px solid #10b98140;
    }

    .badge-pendente {
      background-color: #f59e0b1a;
      color: #d97706;
      border: 1px solid #f59e0b40;
    }

    .badge-concluido {
      background-color: #3b82f61a;
      color: #3b82f6;
      border: 1px solid #3b82f640;
    }

    .badge-cancelado {
      background-color: #ef44441a;
      color: #ef4444;
      border: 1px solid #ef444440;
    }

   
    .tcc-agenda-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .tcc-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--tcc-text-muted);

      i {
        font-size: 14px;
        opacity: 0.7;
      }
    }

    /* Botão de Ações */
    .tcc-btn-outline {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: transparent;
      border: 1px solid var(--tcc-border);
      color: var(--tcc-text-main);
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: var(--tcc-bg);
        border-color: var(--tcc-text-muted);
      }
      
      i {
        font-size: 10px;
      }
    }

    
  `]
})
export class AgendaTecnico {


  getBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Confirmado': 'badge-confirmado',
      'Pendente': 'badge-pendente',
      'Concluído': 'badge-concluido',
      'Cancelado': 'badge-cancelado'
    };
    return statusMap[status] || 'badge-pendente';
  }

  
  compromissos: Compromisso[] = [
    {
      mes: 'Mai', dia: '28', hora: '09:00',
      titulo: 'Manutenção Preventiva',
      status: 'Confirmado',
      cliente: 'Maria Silva',
      duracao: '2h',
      tipo: 'Presencial'
    },
    {
      mes: 'Mai', dia: '28', hora: '11:30',
      titulo: 'Instalação de Software',
      status: 'Pendente',
      cliente: 'João Santos',
      duracao: '1.5h',
      tipo: 'Remoto'
    },
    {
      mes: 'Mai', dia: '29', hora: '14:00',
      titulo: 'Configuração de Rede',
      status: 'Confirmado',
      cliente: 'Ana Costa',
      duracao: '3h',
      tipo: 'Presencial'
    },
    {
      mes: 'Mai', dia: '29', hora: '16:00',
      titulo: 'Recuperação de Dados',
      status: 'Pendente',
      cliente: 'Carlos Souza',
      duracao: '2h',
      tipo: 'Presencial'
    },
    {
      mes: 'Mai', dia: '30', hora: '10:00',
      titulo: 'Suporte Remoto',
      status: 'Concluído',
      cliente: 'Fernanda Lima',
      duracao: '1h',
      tipo: 'Remoto'
    },
    {
      mes: 'Mai', dia: '30', hora: '13:00',
      titulo: 'Formatação e Reinstalação',
      status: 'Cancelado',
      cliente: 'Ricardo Alves',
      duracao: '4h',
      tipo: 'Presencial'
    },
    {
      mes: 'Jun', dia: '2', hora: '09:30',
      titulo: 'Instalação de Impressora',
      status: 'Pendente',
      cliente: 'Patrícia Rocha',
      duracao: '1h',
      tipo: 'Presencial'
    }
  ];
}