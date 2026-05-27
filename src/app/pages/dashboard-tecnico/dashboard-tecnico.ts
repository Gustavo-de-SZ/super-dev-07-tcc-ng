import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// interfaxces back
interface StatCard {
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;
  corClasse: string;
}

interface Agendamento {
  dia: string;
  hora: string;
  empresa: string;
  servico: string;
  status: 'concluido' | 'pendente';
}

@Component({
  selector: 'app-dashboard-tecnico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-dashboard-wrapper">
      
      <section class="tcc-welcome-section">
        <h1 class="tcc-welcome-title">Bem-vindo de volta, {{ nomeUsuario }}! 👋</h1>
        <p class="tcc-welcome-subtitle">Aqui está um resumo das suas atividades hoje</p>
      </section>

      <section class="tcc-stats-grid">
        @for (stat of stats; track stat.titulo) {
          <div class="tcc-stat-card">
            <div class="tcc-stat-header">
              <div class="tcc-stat-icon-wrapper" [ngClass]="stat.corClasse">
                <i [class]="stat.icone"></i>
              </div>
              <div class="tcc-stat-trend">
                <i class="pi pi-arrow-up-right"></i>
              </div>
            </div>
            <div class="tcc-stat-content">
              <h2>{{ stat.valor }}</h2>
              <span class="tcc-stat-title">{{ stat.titulo }}</span>
              <span class="tcc-stat-desc">{{ stat.descricao }}</span>
            </div>
          </div>
        }
      </section>

      <section class="tcc-details-grid">
        
        <div class="tcc-panel-card">
          <div class="tcc-panel-header">
            <h3><i class="pi pi-calendar"></i> Próximos Agendamentos</h3>
            <a href="#" class="tcc-link-sm">Ver todos</a>
          </div>
          
          <div class="tcc-appointments-list">
            @for (agendamento of agendamentos; track agendamento.empresa) {
              <div class="tcc-appointment-item">
                <div class="tcc-appt-time">
                  <span class="tcc-appt-day">{{ agendamento.dia }}</span>
                  <span class="tcc-appt-hour">{{ agendamento.hora }}</span>
                </div>
                <div class="tcc-appt-info">
                  <h4>{{ agendamento.empresa }}</h4>
                  <p>{{ agendamento.servico }}</p>
                </div>
                <div class="tcc-appt-status">
                  @if (agendamento.status === 'concluido') {
                    <i class="pi pi-check-circle tcc-status-success"></i>
                  } @else {
                    <i class="pi pi-clock tcc-status-warning"></i>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div class="tcc-panel-card">
          <div class="tcc-panel-header">
            <h3>Resumo Semanal</h3>
          </div>
          
          <div class="tcc-summary-list">
            <div class="tcc-progress-item">
              <div class="tcc-progress-labels">
                <span>Taxa de Conclusão</span>
                <strong>94%</strong>
              </div>
              <div class="tcc-progress-track">
                <div class="tcc-progress-bar tcc-bg-success" style="width: 94%;"></div>
              </div>
            </div>

            <div class="tcc-progress-item">
              <div class="tcc-progress-labels">
                <span>Tempo Médio de Resposta</span>
                <strong>1.2h</strong>
              </div>
              <div class="tcc-progress-track">
                <div class="tcc-progress-bar tcc-bg-primary" style="width: 75%;"></div>
              </div>
            </div>

            <div class="tcc-progress-item">
              <div class="tcc-progress-labels">
                <span>Satisfação do Cliente</span>
                <strong>4.8/5.0</strong>
              </div>
              <div class="tcc-progress-track">
                <div class="tcc-progress-bar tcc-bg-warning" style="width: 96%;"></div>
              </div>
            </div>
          </div>

          <div class="tcc-summary-highlight">
            <h2>32</h2>
            <p>Chamados esta semana</p>
          </div>

        </div>
      </section>

    </div>
  `,
  styles: [`
    .tcc-dashboard-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding-bottom: 2rem;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

   
    .tcc-welcome-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .tcc-welcome-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--tcc-text-main);
      margin: 0;
    }
    .tcc-welcome-subtitle {
      color: var(--tcc-text-muted);
      font-size: 1rem;
      margin: 0;
    }

  
    .tcc-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .tcc-stat-card {
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      border-radius: var(--tcc-radius);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--tcc-shadow);
      }
    }
    .tcc-stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .tcc-stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .tcc-stat-trend {
      color: #10b981; 
      font-size: 0.9rem;
    }
    .tcc-stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      
      h2 {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--tcc-text-main);
        margin: 0;
      }
    }
    .tcc-stat-title {
      font-size: 0.9rem;
      color: var(--tcc-text-muted);
    }
    .tcc-stat-desc {
      font-size: 0.8rem;
      color: var(--tcc-text-muted);
      opacity: 0.8;
      margin-top: 0.5rem;
    }

    
    .tcc-icon-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .tcc-icon-orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    .tcc-icon-yellow { background: rgba(234, 179, 8, 0.1); color: #eab308; }
    .tcc-icon-green { background: rgba(16, 185, 129, 0.1); color: #10b981; }

    
    .tcc-details-grid {
      display: grid;
      grid-template-columns: 2fr 1fr; 
      gap: 1.5rem;
    }
    @media (max-width: 1024px) {
      .tcc-details-grid {
        grid-template-columns: 1fr; 
      }
    }

   
    .tcc-panel-card {
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      border-radius: var(--tcc-radius);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .tcc-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--tcc-text-main);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i { color: var(--tcc-primary); }
      }
    }
    .tcc-link-sm {
      font-size: 0.85rem;
      color: var(--tcc-primary);
      text-decoration: none;
      font-weight: 500;
      
      &:hover { text-decoration: underline; }
    }

   
    .tcc-appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .tcc-appointment-item {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem;
      border: 1px solid var(--tcc-border);
      border-radius: 8px;
      background-color: var(--tcc-bg);
      transition: border-color 0.2s ease;

      &:hover { border-color: var(--tcc-primary); }
    }
    .tcc-appt-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: rgba(59, 130, 246, 0.05);
      padding: 0.5rem;
      border-radius: 6px;
      min-width: 60px;
    }
    .tcc-appt-day { font-size: 0.75rem; color: var(--tcc-text-muted); font-weight: 600; }
    .tcc-appt-hour { font-size: 1rem; color: var(--tcc-primary); font-weight: 700; }
    
    .tcc-appt-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      h4 { margin: 0; font-size: 0.95rem; color: var(--tcc-text-main); font-weight: 600; }
      p { margin: 0; font-size: 0.85rem; color: var(--tcc-text-muted); }
    }
    .tcc-status-success { color: #10b981; font-size: 1.2rem; }
    .tcc-status-warning { color: #f97316; font-size: 1.2rem; }

    
    .tcc-summary-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .tcc-progress-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .tcc-progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      
      span { color: var(--tcc-text-muted); }
      strong { color: var(--tcc-text-main); font-weight: 600; }
    }
    .tcc-progress-track {
      width: 100%;
      height: 6px;
      background-color: var(--tcc-bg);
      border-radius: 4px;
      overflow: hidden;
    }
    .tcc-progress-bar {
      height: 100%;
      border-radius: 4px;
    }
    .tcc-bg-success { background-color: #10b981; }
    .tcc-bg-primary { background-color: var(--tcc-primary); }
    .tcc-bg-warning { background-color: #eab308; }

  
    .tcc-summary-highlight {
      margin-top: 1rem;
      padding: 1.5rem;
      background-color: var(--tcc-bg);
      border-radius: 8px;
      text-align: center;
      border: 1px dashed var(--tcc-border);

      h2 {
        font-size: 2rem;
        color: var(--tcc-primary);
        margin: 0 0 0.2rem 0;
      }
      p {
        margin: 0;
        font-size: 0.9rem;
        color: var(--tcc-text-muted);
      }
    }
  `]
})
export class DashboardTecnico {
  
  nomeUsuario = 'João';

 
  stats: StatCard[] = [
    { titulo: 'Clientes Ativos', valor: '24', descricao: '+3 este mês', icone: 'pi pi-users', corClasse: 'tcc-icon-blue' },
    { titulo: 'Chamados Pendentes', valor: '8', descricao: '-2 desde ontem', icone: 'pi pi-ticket', corClasse: 'tcc-icon-orange' },
    { titulo: 'Avaliação Média', valor: '4.8', descricao: 'De 127 avaliações', icone: 'pi pi-star-fill', corClasse: 'tcc-icon-yellow' },
    { titulo: 'Ganhos do Mês', valor: 'R$ 8.450', descricao: '+15% vs mês anterior', icone: 'pi pi-dollar', corClasse: 'tcc-icon-green' }
  ];

  
  agendamentos: Agendamento[] = [
    { dia: 'Hoje', hora: '14:00', empresa: 'Empresa ABC Ltda', servico: 'Manutenção de Rede', status: 'concluido' },
    { dia: 'Hoje', hora: '16:30', empresa: 'Tech Solutions', servico: 'Instalação de Software', status: 'concluido' },
    { dia: 'Amanhã', hora: '10:00', empresa: 'Digital Corp', servico: 'Suporte Técnico', status: 'pendente' },
    { dia: '30 Mar', hora: '15:00', empresa: 'Inovação SA', servico: 'Configuração de Servidor', status: 'pendente' }
  ];
}