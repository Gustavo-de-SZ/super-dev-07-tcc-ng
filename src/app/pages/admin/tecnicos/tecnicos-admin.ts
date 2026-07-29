import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, TecnicoAdmin } from '../../../services/admin.service';

@Component({
  selector: 'app-tecnicos-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-fade-in tcc-p-lg">
      <section class="tcc-gap-md mb-8">
        <div>
          <h1 class="tcc-title-lg">Aprovar Técnicos</h1>
          <p class="tcc-subtitle">Gerencie os cadastros de profissionais na plataforma</p>
        </div>
      </section>

      <div class="tcc-card-base p-0" style="padding: 0;">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center" style="border-bottom: 1px solid var(--tcc-border); padding: 24px;">
           <h2 class="tcc-title-md m-0">Pendentes ({{ pendingTecnicos.length }})</h2>
           <button class="tcc-btn-outline small">
              <i class="pi pi-filter mr-2"></i> Filtrar
           </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left" style="border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--tcc-border); background: var(--tcc-bg);">
                <th class="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Profissional</th>
                <th class="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th class="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                <th class="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th class="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tecnico of pendingTecnicos" class="hover:bg-gray-50/50 transition-colors" style="border-bottom: 1px solid var(--tcc-border);">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <!-- Fake Avatar para seguir o layout de lista -->
                    <div class="tcc-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">
                      {{ tecnico.nome_fantasia ? tecnico.nome_fantasia.charAt(0) : '?' }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 m-0">{{ tecnico.nome_fantasia || 'Nome não informado' }}</p>
                      <p class="text-sm text-gray-500 m-0 mt-1">{{ tecnico.telefone }} - CNPJ: {{ tecnico.cnpj }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="text-sm text-gray-700 block max-w-xs truncate" [title]="tecnico.descricao_servicos">{{ tecnico.descricao_servicos || 'Nenhuma descrição' }}</span>
                </td>
                <td class="p-4 text-sm text-gray-600">
                  {{ tecnico.criado_em | date:'dd/MM/yyyy' }}
                </td>
                <td class="p-4 text-center">
                  <!-- TCC Badge style -->
                  <span class="tcc-status-badge" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 500; background: #fffbeb; color: #b45309;">
                    <i class="pi pi-clock" style="font-size: 10px;"></i> Pendente
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex justify-end gap-2">
                     <button class="tcc-btn-primary" style="padding: 8px 12px; background: #10b981; color: white;" title="Aprovar" (click)="aprovar(tecnico)">
                       <i class="pi pi-check" *ngIf="!loadingAction[tecnico.id]"></i>
                       <i class="pi pi-spin pi-spinner" *ngIf="loadingAction[tecnico.id] === 'aprovar'"></i>
                     </button>
                     <button class="tcc-btn-outline" style="padding: 8px 12px; color: #ef4444; border-color: #ef4444;" title="Rejeitar" (click)="rejeitar(tecnico)">
                       <i class="pi pi-times" *ngIf="!loadingAction[tecnico.id]"></i>
                       <i class="pi pi-spin pi-spinner" *ngIf="loadingAction[tecnico.id] === 'rejeitar'"></i>
                     </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TecnicosAdmin implements OnInit {
  pendingTecnicos: TecnicoAdmin[] = [];
  loading = true;
  loadingAction: { [key: number]: string } = {};

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.carregarPendentes();
  }

  carregarPendentes() {
    this.loading = true;
    this.adminService.getTecnicosPendentes().subscribe({
      next: (tecnicos) => {
        this.pendingTecnicos = tecnicos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar técnicos', err);
        this.loading = false;
      }
    });
  }

  aprovar(tecnico: TecnicoAdmin) {
    this.loadingAction[tecnico.id] = 'aprovar';
    this.adminService.aprovarTecnico(tecnico.id).subscribe({
      next: () => {
        this.pendingTecnicos = this.pendingTecnicos.filter(t => t.id !== tecnico.id);
        delete this.loadingAction[tecnico.id];
      },
      error: (err) => {
        console.error('Erro ao aprovar', err);
        delete this.loadingAction[tecnico.id];
      }
    });
  }

  rejeitar(tecnico: TecnicoAdmin) {
    this.loadingAction[tecnico.id] = 'rejeitar';
    this.adminService.rejeitarTecnico(tecnico.id).subscribe({
      next: () => {
        this.pendingTecnicos = this.pendingTecnicos.filter(t => t.id !== tecnico.id);
        delete this.loadingAction[tecnico.id];
      },
      error: (err) => {
        console.error('Erro ao rejeitar', err);
        delete this.loadingAction[tecnico.id];
      }
    });
  }
}
