import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar-cliente',
  standalone: true,
  imports: [],
  template: `
    <aside style="width: 260px; height: 100vh; background-color: var(--tcc-surface); border-right: 1px solid var(--tcc-border); display: flex; flex-direction: column; padding: 1.5rem 0; overflow-y: auto;">
      <nav style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1; padding: 0 0.75rem;">
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px; color: var(--tcc-primary);">
          <i class="pi pi-home"></i>
          <span>Início</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-search"></i>
          <span>Buscar Profissionais</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-ticket"></i>
          <span>Meus Chamados</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-calendar"></i>
          <span>Agendamentos</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-star"></i>
          <span>Favoritos</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-history"></i>
          <span>Histórico</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-comments"></i>
          <span>Mensagens</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-credit-card"></i>
          <span>Pagamentos</span>
        </a>
      </nav>
      <hr style="border: none; border-top: 1px solid var(--tcc-border); margin: 1rem 0.75rem; flex-shrink: 0;" />
      <nav style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0 0.75rem; margin-bottom: 1rem;">
        <a href="#" class="tcc-btn-main" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px; text-decoration: none;">
          <i class="pi pi-question-circle"></i>
          <span>Ajuda</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-cog"></i>
          <span>Configurações</span>
        </a>
        <a href="#" class="tcc-btn-text" style="display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 8px;">
          <i class="pi pi-sign-out"></i>
          <span>Sair</span>
        </a>
      </nav>
      <div style="display: flex; justify-content: center; padding: 1rem 0.75rem; border-top: 1px solid var(--tcc-border); flex-shrink: 0;">
        <button class="tcc-toggle-mode">
          <i class="pi pi-arrow-left"></i>
        </button>
      </div>
    </aside>
  `,
  styles: [],
})
export class SidebarClienteComponent {}
