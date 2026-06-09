import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financeiro-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-stats-grid">
      <div class="tcc-stat-card">
        <div class="tcc-stat-header">
          <div class="tcc-stat-icon success">
            <i class="pi pi-dollar"></i>
          </div>
          <span class="tcc-stat-title">Receita Total</span>
        </div>
        <div class="tcc-stat-value success-text">R$ 750</div>
        <div class="tcc-stat-desc success-text"><i class="pi pi-arrow-up-right"></i> +12% este mês</div>
      </div>

      <div class="tcc-stat-card">
        <div class="tcc-stat-header">
          <div class="tcc-stat-icon warning">
            <i class="pi pi-credit-card"></i>
          </div>
          <span class="tcc-stat-title">A Receber</span>
        </div>
        <div class="tcc-stat-value warning-text">R$ 180</div>
        <div class="tcc-stat-desc">1 pendente</div>
      </div>

      <div class="tcc-stat-card">
        <div class="tcc-stat-header">
          <div class="tcc-stat-icon info">
            <i class="pi pi-chart-line"></i>
          </div>
          <span class="tcc-stat-title">Ticket Médio</span>
        </div>
        <div class="tcc-stat-value info-text">R$ 250</div>
        <div class="tcc-stat-desc">Por serviço</div>
      </div>
    </div>
  `,
  styles: [`
    .tcc-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .tcc-stat-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
    }

    .tcc-stat-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tcc-stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      
      &.success { background-color: #dcfce7; color: #16a34a; }
      &.warning { background-color: #ffedd5; color: #ea580c; }
      &.info { background-color: #eff6ff; color: #2563eb; }
    }

    .tcc-stat-title { font-size: 14px; color: var(--tcc-text-muted, #64748b); font-weight: 500; }
    .tcc-stat-value { font-size: 28px; font-weight: 700; }
    .tcc-stat-desc { font-size: 13px; color: var(--tcc-text-muted, #94a3b8); display: flex; align-items: center; gap: 4px; }
    
    .success-text { color: #16a34a; }
    .warning-text { color: #ea580c; }
    .info-text { color: #2563eb; }
  `]
})
export class FinanceiroStatsComponent {}
