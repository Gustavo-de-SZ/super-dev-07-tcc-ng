import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { StatsGridComponent } from '../../dashboard-tecnico/components/stats-grid';
import { StatCard } from '../../../shared/models';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, StatsGridComponent],
  template: `
    <div class="tcc-fade-in tcc-p-lg">
      <section class="tcc-gap-md mb-8">
        <div>
          <h1 class="tcc-title-lg">Visão Geral - Admin</h1>
          <p class="tcc-subtitle">Resumo das métricas da plataforma</p>
        </div>
      </section>

      <app-stats-grid *ngIf="!loading; else loadingState" [stats]="statsData"></app-stats-grid>

      <ng-template #loadingState>
        <section class="tcc-grid-auto">
          <!-- Esqueletos tcc-card-base animados -->
          <div class="tcc-card-base animate-pulse">
            <div class="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <!-- (Repita 3x) -->
          <div class="tcc-card-base animate-pulse">
            <div class="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div class="tcc-card-base animate-pulse">
            <div class="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </section>
      </ng-template>

      <div class="tcc-card-base mt-8">
        <h2 class="tcc-title-md mb-4">Ações Rápidas</h2>
        <div class="tcc-grid-2-1">
          <button routerLink="/admin/tecnicos" class="tcc-btn-outline" style="justify-content: flex-start; padding: 16px; height: auto;">
             <div class="flex items-center gap-4">
               <i class="pi pi-check-circle text-blue-500 text-2xl"></i>
               <div style="text-align: left;">
                 <p class="font-medium text-gray-900 m-0">Aprovar Técnicos</p>
                 <p class="text-sm text-gray-500 m-0">Analise cadastros pendentes na plataforma</p>
               </div>
             </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardAdmin implements OnInit {
  statsData: StatCard[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getEstatisticasDashboard().subscribe({
      next: (data) => {
        // Conversão dos dados em StatCard pro Componente Genérico
        this.statsData = [
          {
            titulo: 'Técnicos Pendentes', valor: data.pendentes.toString(),
            descricao: 'Aguardando aprovação', icone: 'pi pi-user-plus', corClasse: 'tcc-icon-orange'
          },
          {
            titulo: 'Total de Técnicos', valor: data.totalTecnicos.toString(),
            descricao: 'Técnicos cadastrados', icone: 'pi pi-users', corClasse: 'tcc-icon-blue'
          },
          {
            titulo: 'Total de Clientes', valor: data.totalClientes.toString(),
            descricao: 'Clientes cadastrados', icone: 'pi pi-building', corClasse: 'tcc-icon-green'
          }
        ];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas', err);
        this.loading = false;
      }
    });
  }
}
