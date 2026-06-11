import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-novo-cliente',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <div class="tcc-back-link">
            <i class="pi pi-arrow-left"></i> Voltar para Clientes
          </div>
          <h1 class="tcc-title-lg">Novo Cliente</h1>
          <p class="tcc-subtitle">Adicione um novo cliente à sua base de dados</p>
        </div>
      </header>

      <div class="tcc-form-card">
        <form>
          
          <h3 class="tcc-form-section-title">Informações Principais</h3>
          
          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Nome Completo</label>
              <input type="text" class="tcc-input" placeholder="Ex: João da Silva">
            </div>
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Empresa (Opcional)</label>
              <input type="text" class="tcc-input" placeholder="Ex: Consultoria ABC">
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label">E-mail</label>
              <input type="email" class="tcc-input" placeholder="joao@email.com">
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label">Telefone / WhatsApp</label>
              <input type="tel" class="tcc-input" placeholder="(00) 00000-0000">
            </div>
          </div>

          <hr class="tcc-divider">

          <h3 class="tcc-form-section-title">Endereço</h3>

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Rua / Avenida</label>
              <input type="text" class="tcc-input" placeholder="Ex: Rua das Flores, 123">
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label">Bairro</label>
              <input type="text" class="tcc-input" placeholder="Centro">
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label">Cidade</label>
              <input type="text" class="tcc-input" placeholder="Ex: São Paulo">
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label">Estado</label>
              <select class="tcc-input">
                <option value="" disabled selected>UF</option>
                <option>SP</option>
                <option>RJ</option>
                <option>SC</option>
                <option>MG</option>
                <option>RS</option>
                <option>PR</option>
                </select>
            </div>
            <div class="tcc-form-group">
              <label class="tcc-form-label">CEP</label>
              <input type="text" class="tcc-input" placeholder="00000-000">
            </div>
          </div>

          <div class="tcc-form-actions">
            <button type="button" class="tcc-btn-cancel">Cancelar</button>
            <button type="submit" class="tcc-btn-main">Cadastrar Cliente</button>
          </div>
        </form>
      </div>

    </div>
  `,
  styles: [`
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; }
    .tcc-page-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
    .tcc-header-title-group { display: flex; flex-direction: column; }
    
    .tcc-back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--tcc-text-muted, #64748b); cursor: pointer; margin-bottom: 8px; transition: color 0.2s; font-weight: 500; }
    .tcc-back-link:hover { color: var(--tcc-primary, #3b82f6); }
    .tcc-back-link i { font-size: 12px; }

    .tcc-title-lg { font-size: 28px; font-weight: 700; color: var(--tcc-text-main, #0f172a); margin: 0 0 6px 0; }
    .tcc-subtitle { color: var(--tcc-text-muted, #64748b); font-size: 16px; margin: 0; }

    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .tcc-form-card { background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    
    .tcc-form-section-title { font-size: 18px; font-weight: 600; color: var(--tcc-text-main, #0f172a); margin: 0 0 20px 0; }
    .tcc-divider { border: 0; height: 1px; background-color: var(--tcc-border, #e2e8f0); margin: 32px 0; }

    .tcc-form-row { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
    .tcc-form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
    .flex-2 { flex: 2; min-width: 300px; }

    .tcc-form-label { font-size: 14px; font-weight: 600; color: var(--tcc-text-main, #334155); }
    
    .tcc-input { height: 44px; border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 8px; padding: 0 16px; font-size: 14px; color: var(--tcc-text-main, #0f172a); outline: none; transition: all 0.2s; background-color: var(--tcc-surface, #ffffff); font-family: inherit; }
    .tcc-input:focus { border-color: var(--tcc-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

    .tcc-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--tcc-border, #e2e8f0); }
    
    .tcc-btn-cancel { background-color: transparent; border: 1px solid var(--tcc-border, #e2e8f0); color: var(--tcc-text-main, #475569); padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .tcc-btn-cancel:hover { background-color: var(--tcc-bg, #f8fafc); border-color: #cbd5e1; }
    
    .tcc-btn-main { background-color: var(--tcc-primary, #3b82f6); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
    .tcc-btn-main:hover { background-color: #2563eb; }

    @media (max-width: 768px) {
      .tcc-form-card { padding: 20px; }
      .tcc-form-actions { flex-direction: column-reverse; }
      .tcc-btn-cancel, .tcc-btn-main { width: 100%; }
    }
  `]
})
export class NovoCliente {}