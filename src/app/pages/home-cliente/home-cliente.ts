import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchSectionComponent } from './components/search-section';
import { ProfessionalCardComponent } from './components/professional-card';
import { Profissional } from '../../shared/models';
import { HomeClienteService } from '../../services/home-cliente.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-cliente-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SearchSectionComponent,
    ProfessionalCardComponent
  ],
  template: `
    <div class="tcc-fade-in tcc-p-lg">
      <div class="tcc-form-card tcc-mb-md">
        <h2 class="tcc-title-lg">Precisa de ajuda com seu equipamento?</h2>
        <p class="tcc-subtitle">Abra um chamado e nossos técnicos irão resolver seu problema rapidamente.</p>
        <button class="tcc-btn-main tcc-mt-sm" [routerLink]="['/cliente/solicitacao']">
          <i class="pi pi-plus"></i> Abrir Novo Chamado
        </button>
      </div>

      <header class="tcc-welcome-header">
        <h1 class="tcc-title-lg">Olá!</h1>
        <p class="tcc-subtitle">Encontre o profissional certo para o seu problema.</p>
      </header>

      <app-search-section [categorias]="categorias"></app-search-section>

      <div class="tcc-favorites-section">
        <div class="tcc-section-header">
          <h2 class="tcc-section-title">
            <span class="tcc-star-icon">⭐</span> Favoritos
          </h2>
        </div>

        <div class="tcc-professionals-grid">
          @for (prof of profissionaisFavoritos; track prof.nome) {
            <app-professional-card [profissional]="prof"></app-professional-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tcc-welcome-header {
      margin-bottom: 32px;
    }

    .tcc-favorites-section {
      margin-top: 48px;
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
      color: var(--tcc-text-main);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tcc-star-icon {
      font-size: 22px;
    }

    .tcc-link {
      color: var(--tcc-primary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .tcc-professionals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    @media (max-width: 768px) {
      .tcc-section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .tcc-professionals-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClienteInicioComponent implements OnInit {
  categorias: string[] = [];
  profissionaisFavoritos: Profissional[] = [];

  constructor(private homeClienteService: HomeClienteService) {}

  ngOnInit(): void {
    this.homeClienteService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Erro ao carregar categorias', err);
        // Clear categorias on error - no fallback mock data
        this.categorias = [];
      }
    });

    this.homeClienteService.getFavoritos().subscribe({
      next: (data) => {
        this.profissionaisFavoritos = data;
      },
      error: (err) => {
        console.error('Erro ao carregar favoritos', err);
        // Clear profissionaisFavoritos on error - no fallback mock data
        this.profissionaisFavoritos = [];
      }
    });
  }
}
