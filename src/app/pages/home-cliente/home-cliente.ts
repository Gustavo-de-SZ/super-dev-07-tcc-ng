import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Profissional {
  nome: string;
  especialidade: string;
  nota: number;
  avaliacoes: number;
  tempoResposta: string;
  local: string;
  status: 'online' | 'offline';
}

@Component({
  selector: 'app-cliente-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-page-wrapper">
      
      <header class="tcc-welcome-header">
        <h1 class="tcc-title">Olá, Maria!</h1>
        <p class="tcc-subtitle">Encontre o profissional certo para o seu problema.</p>
      </header>

      <div class="tcc-search-section">
        <div class="tcc-main-search-input">
          <i class="pi pi-search"></i>
          <input type="text" placeholder="Buscar por serviço ou especialidade...">
        </div>

        <div class="tcc-categories-row">
          @for (categoria of categorias; track categoria) {
            <button class="tcc-category-pill">
              <i class="pi" [ngClass]="getIconForCategory(categoria)"></i>
              {{ categoria }}
            </button>
          }
        </div>

        <button class="tcc-btn-primary">
          Ver todos os profissionais <i class="pi pi-angle-right"></i>
        </button>
      </div>

      <div class="tcc-favorites-section">
        <div class="tcc-section-header">
          <h2 class="tcc-section-title">
            <span class="tcc-star-icon">⭐</span> Favoritos
          </h2>
          <a href="#" class="tcc-link">Buscar mais profissionais &rarr;</a>
        </div>

        <div class="tcc-professionals-grid">
          @for (prof of profissionaisFavoritos; track prof.nome) {
            <div class="tcc-professional-card">
              
              <div class="tcc-card-header">
                <div class="tcc-avatar">
                  <i class="pi pi-user"></i>
                </div>
                <div class="tcc-prof-info">
                  <h3 class="tcc-prof-name">
                    {{ prof.nome }}
                    <span class="tcc-status-dot" [class.online]="prof.status === 'online'"></span>
                  </h3>
                  <p class="tcc-prof-specialty">{{ prof.especialidade }}</p>
                </div>
              </div>

              <div class="tcc-card-stats">
                <span class="tcc-stat-item">⭐ {{ prof.nota }} ({{ prof.avaliacoes }})</span>
                <span class="tcc-stat-item"><i class="pi pi-clock"></i> ~{{ prof.tempoResposta }}</span>
                <span class="tcc-stat-item"><i class="pi pi-map-marker"></i> {{ prof.local }}</span>
              </div>

              <button class="tcc-btn-secondary-full">
                Ver perfil e contratar
              </button>

            </div>
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    .tcc-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 1100px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tcc-title {
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

    .tcc-search-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }

    .tcc-main-search-input {
      display: flex;
      align-items: center;
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 0 20px;
      height: 54px;
      width: 100%;
      max-width: 650px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);

      i {
        color: var(--tcc-text-muted, #94a3b8);
        margin-right: 14px;
        font-size: 18px;
      }

      input {
        border: none;
        background: transparent;
        color: var(--tcc-text-main, #0f172a);
        font-size: 15px;
        width: 100%;
        height: 100%;
        outline: none;
        &::placeholder { color: var(--tcc-text-muted, #94a3b8); }
      }
    }

    .tcc-categories-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tcc-category-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-muted, #475569);
      padding: 10px 18px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--tcc-primary, #3b82f6);
        color: var(--tcc-primary, #3b82f6);
        background-color: rgba(59, 130, 246, 0.03);
      }
    }

    .tcc-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--tcc-primary, #3b82f6);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);

      &:hover { background-color: #2563eb; }
    }

    .tcc-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .tcc-section-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tcc-link {
      color: var(--tcc-primary, #3b82f6);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }

    .tcc-professionals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .tcc-professional-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);

      &:hover {
        border-color: var(--tcc-primary, #3b82f6);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      }
    }

    .tcc-card-header { display: flex; align-items: center; gap: 16px; }

    .tcc-avatar {
      width: 48px;
      height: 48px;
      background-color: #eff6ff;
      color: #3b82f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .tcc-prof-info { flex: 1; }

    .tcc-prof-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tcc-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #cbd5e1;
      &.online { background-color: #10b981; }
    }

    .tcc-prof-specialty {
      margin: 0;
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-card-stats {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 13px;
      color: var(--tcc-text-muted, #475569);
    }

    .tcc-stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      i { font-size: 13px; opacity: 0.8; }
    }

    .tcc-btn-secondary-full {
      width: 100%;
      background-color: #eff6ff;
      color: #3b82f6;
      border: none;
      padding: 11px 0;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      &:hover { background-color: #dbeafe; }
    }
  `]
})
export class ClienteInicioComponent {

  categorias = ['Redes', 'Hardware', 'Software', 'Segurança', 'Impressoras', 'Dispositivos'];

  profissionaisFavoritos: Profissional[] = [
    {
      nome: 'Carlos Silva',
      especialidade: 'Redes e Infraestrutura',
      nota: 4.9,
      avaliacoes: 87,
      tempoResposta: '1h',
      local: 'São Paulo',
      status: 'online'
    },
    {
      nome: 'Ana Santos',
      especialidade: 'Segurança da Informação',
      nota: 5.0,
      avaliacoes: 54,
      tempoResposta: '45min',
      local: 'São Paulo',
      status: 'online'
    },
    {
      nome: 'Pedro Costa',
      especialidade: 'Hardware e Manutenção',
      nota: 4.7,
      avaliacoes: 42,
      tempoResposta: '2h',
      local: 'Guarulhos',
      status: 'offline'
    }
  ];

  getIconForCategory(categoria: string): string {
    const iconMap: { [key: string]: string } = {
      'Redes': 'pi-wifi',
      'Hardware': 'pi-server',
      'Software': 'pi-desktop',
      'Segurança': 'pi-shield',
      'Impressoras': 'pi-print',
      'Dispositivos': 'pi-mobile'
    };
    return iconMap[categoria] || 'pi-cog';
  }
}