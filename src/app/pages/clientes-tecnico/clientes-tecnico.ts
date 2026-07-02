import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientesStatsComponent } from './components/cliente-tecnico-stats';
import { ClientesSearch } from './components/cliente-tecnico-search';
import { ClientesList } from './components/clientes-tecnico-list';
import { Cliente } from '../../models/cliente';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-clientes-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ClientesStatsComponent,
    ClientesSearch,
    ClientesList
  ],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <h1 class="tcc-title-lg">Clientes</h1>
          <p class="tcc-subtitle">Gerencie sua base de clientes</p>
        </div>
        
        <button class="tcc-btn-main" routerLink="/painel/clientes/novo">
          <i class="pi pi-plus tcc-mr-sm"></i> Novo Cliente
        </button>
      </header>

      <app-clientes-stats></app-clientes-stats>
      <app-clientes-search></app-clientes-search>
      <app-clientes-list [clientes]="clientes"></app-clientes-list>

    </div>
  `,
  // O styles ficou muito mais limpo, só com o que for estritamente local (se houver)
  styles: []
})
export class ClientesTecnico {
  clientes: Cliente[] = [];

  constructor(private clienteService: ClienteService) {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.clientes = [];
      }
    });
  }
}