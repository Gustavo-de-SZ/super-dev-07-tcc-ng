import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


interface Compromisso {
  data: string;
  hora: string;
  titulo: string;
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
          <p class="tcc-page-subtitle">Gerencie seus agendamentos e compromissos</p>
        </div>
        
        <button class="tcc-btn-main tcc-btn-with-icon">
          <i class="pi pi-plus"></i>
          Novo Agendamento
        </button>
      </header>

      <div class="tcc-agenda-list">
        @for (item of compromissos; track item.titulo) {
          <div class="tcc-agenda-card">
            
            <div class="tcc-agenda-datetime">
              <span class="tcc-agenda-date">{{ item.data }}</span>
              <span class="tcc-agenda-time">{{ item.hora }}</span>
            </div>

            <div class="tcc-agenda-details">
              <h3 class="tcc-agenda-title">{{ item.titulo }}</h3>
              
              <div class="tcc-agenda-meta">
                <span class="tcc-meta-item">
                  <i class="pi pi-user"></i>
                  {{ item.cliente }}
                </span>
                <span class="tcc-meta-item">
                  <i class="pi pi-clock"></i>
                  Duração: {{ item.duracao }}
                </span>
                <span class="tcc-meta-item">
                  <i class="pi pi-map-marker"></i>
                  {{ item.tipo }}
                </span>
              </div>
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
      gap: 32px;
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

   
    .tcc-agenda-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tcc-agenda-card {
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      border-radius: var(--tcc-radius);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 24px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        border-color: var(--tcc-primary);
        box-shadow: var(--tcc-shadow);
      }
    }

    
    .tcc-agenda-datetime {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #3b82f60d; 
      padding: 12px 16px;
      border-radius: 8px;
      min-width: 80px;
    }

    .tcc-agenda-date {
      font-size: 13px;
      color: var(--tcc-text-muted);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .tcc-agenda-time {
      font-size: 18px;
      color: var(--tcc-primary);
      font-weight: 700;
    }

    
    .tcc-agenda-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tcc-agenda-title {
      margin: 0;
      font-size: 18px;
      color: var(--tcc-text-main);
      font-weight: 600;
    }

    .tcc-agenda-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .tcc-meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--tcc-text-muted);

      i {
        font-size: 16px;
        color: var(--tcc-text-muted);
        opacity: 0.8;
      }
    }

  
    @media (max-width: 768px) {
      .tcc-agenda-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .tcc-agenda-datetime {
        width: 100%;
        flex-direction: row;
        justify-content: flex-start;
        gap: 12px;
        padding: 12px;
      }
      
      .tcc-agenda-date {
        margin-bottom: 0;
      }
    }
  `]
})
export class AgendaTecnico {

  compromissos: Compromisso[] = [
    {
      data: '1 de abr.',
      hora: '15:00',
      titulo: 'Manutenção Preventiva',
      cliente: 'Maria Silva',
      duracao: '2h',
      tipo: 'Presencial'
    },
    {
      data: '2 de abr.',
      hora: '10:00',
      titulo: 'Instalação de Software',
      cliente: 'João Santos',
      duracao: '1.5h',
      tipo: 'Remoto'
    },
    {
      data: '3 de abr.',
      hora: '14:00',
      titulo: 'Configuração de Rede',
      cliente: 'Ana Costa',
      duracao: '3h',
      tipo: 'Presencial'
    }
  ];
}