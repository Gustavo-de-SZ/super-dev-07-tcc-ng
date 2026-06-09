import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceiroStatsComponent } from './components/financeiro-stats';
import { FinanceiroTransactionsComponent } from './components/financeiro-transactions';

interface Transacao {
  titulo: string;
  cliente: string;
  data: string;
  valor: number;
  status: 'Pago' | 'Pendente';
}

@Component({
  selector: 'app-financeiro-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    FinanceiroStatsComponent,
    FinanceiroTransactionsComponent
  ],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header">
        <div>
          <h1 class="tcc-title-lg">Financeiro</h1>
          <p class="tcc-subtitle">Acompanhe suas receitas e transações</p>
        </div>
      </header>

      <app-financeiro-stats></app-financeiro-stats>
      <app-financeiro-transactions [transacoes]="transacoes"></app-financeiro-transactions>
    </div>
  `,
  styles: [`
    .tcc-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding: 0;
    }

    .tcc-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .tcc-title-lg {
      font-size: 28px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 6px 0;
    }

    .tcc-subtitle {
      color: var(--tcc-text-muted, #64748b);
      font-size: 16px;
      margin: 0;
    }

    .tcc-fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FinanceiroTecnico {
  transacoes: Transacao[] = [
    { titulo: 'Manutenção Preventiva', cliente: 'Maria Silva', data: '02/04/2026', valor: 240, status: 'Pago' },
    { titulo: 'Instalação Software', cliente: 'João Santos', data: '01/04/2026', valor: 180, status: 'Pendente' },
    { titulo: 'Configuração Rede', cliente: 'Ana Costa', data: '28/03/2026', valor: 360, status: 'Pago' },
    { titulo: 'Suporte Técnico', cliente: 'Maria Silva', data: '25/03/2026', valor: 150, status: 'Pago' }
  ];
}