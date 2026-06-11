import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-stats-row">
      <div class="tcc-stat-box">
        <span class="tcc-stat-label">Total de Clientes</span>
        <span class="tcc-stat-value text-blue">3</span>
      </div>
      <div class="tcc-stat-box">
        <span class="tcc-stat-label">Ativos Este Mês</span>
        <span class="tcc-stat-value text-green">2</span>
      </div>
      <div class="tcc-stat-box">
        <span class="tcc-stat-label">Novos Este Mês</span>
        <span class="tcc-stat-value text-purple">2</span>
      </div>
    </div>
  `,
  styles: [`
    .tcc-stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .tcc-stat-box {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tcc-stat-label { font-size: 13px; color: var(--tcc-text-muted, #64748b); font-weight: 500; }
    .tcc-stat-value { font-size: 28px; font-weight: 700; }
    .text-blue { color: var(--tcc-primary, #3b82f6); }
    .text-green { color: #10b981; }
    .text-purple { color: #a855f7; }
  `]
})
export class ClientesStats {}