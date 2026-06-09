import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsGridComponent } from './components/stats-grid';
import { AppointmentsPanelComponent } from './components/appointments-panel';
import { WeeklySummaryComponent } from './components/weekly-summary';
import { StatCard, Agendamento } from '../../shared/models';

@Component({
  selector: 'app-dashboard-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    StatsGridComponent,
    AppointmentsPanelComponent,
    WeeklySummaryComponent
  ],
  template: `
    <div class="tcc-fade-in tcc-p-lg">
      <section class="tcc-gap-md">
        <div>
          <h1 class="tcc-title-lg">Bem-vindo de volta, {{ nomeUsuario }}! 👋</h1>
          <p class="tcc-subtitle">Aqui está um resumo das suas atividades hoje</p>
        </div>
      </section>

      <app-stats-grid [stats]="stats"></app-stats-grid>

      <div class="tcc-grid-2-1">
        <app-appointments-panel [agendamentos]="agendamentos"></app-appointments-panel>
        <app-weekly-summary></app-weekly-summary>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardTecnico {
  nomeUsuario = 'João';

  stats: StatCard[] = [
    {
      titulo: 'Clientes Ativos',
      valor: '24',
      descricao: '+3 este mês',
      icone: 'pi pi-users',
      corClasse: 'tcc-icon-blue'
    },
    {
      titulo: 'Chamados Pendentes',
      valor: '8',
      descricao: '-2 desde ontem',
      icone: 'pi pi-circle-fill',
      corClasse: 'tcc-icon-orange'
    },
    {
      titulo: 'Avaliação Média',
      valor: '4.8',
      descricao: 'De 127 avaliações',
      icone: 'pi pi-star-fill',
      corClasse: 'tcc-icon-yellow'
    },
    {
      titulo: 'Ganhos do Mês',
      valor: 'R$ 8.450',
      descricao: '+15% vs mês anterior',
      icone: 'pi pi-money-bill',
      corClasse: 'tcc-icon-green'
    }
  ];

  agendamentos: Agendamento[] = [
    {
      dia: 'Hoje',
      hora: '14:00',
      empresa: 'Empresa ABC Ltda',
      servico: 'Manutenção de Rede',
      status: 'concluido'
    },
    {
      dia: 'Hoje',
      hora: '16:30',
      empresa: 'Tech Solutions',
      servico: 'Instalação de Software',
      status: 'pendente'
    },
    {
      dia: 'Amanhã',
      hora: '10:00',
      empresa: 'Digital Corp',
      servico: 'Suporte Técnico',
      status: 'pendente'
    },
    {
      dia: '30 Mar',
      hora: '15:00',
      empresa: 'Inovação SA',
      servico: 'Configuração de Servidor',
      status: 'pendente'
    }
  ];
}
