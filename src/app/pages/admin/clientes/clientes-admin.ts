import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, ClienteAdmin } from '../../../services/admin.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-clientes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, PaginatorModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <div class="header-badge">
            <i class="pi pi-shield"></i>
            <span>Administração</span>
          </div>
          <h1 class="tcc-title-lg">Base de Clientes</h1>
          <p class="tcc-subtitle">Visualização e monitoramento de clientes com conta cadastrada no aplicativo</p>
        </div>

        <div class="header-actions">
          <button class="tcc-btn-secondary" (click)="carregarClientes()" [disabled]="loading">
            <i class="pi" [class.pi-spin]="loading" [class.pi-spinner]="loading" [class.pi-refresh]="!loading"></i>
            <span>Atualizar</span>
          </button>
        </div>
      </header>

   
      <div class="filters-bar-card">
        <div class="count-badge-box">
          <span class="total-label">Total de Clientes:</span>
          <span class="total-count">{{ clientes.length }}</span>
        </div>

        <div class="search-box">
          <i class="pi pi-search search-icon"></i>
          <input 
            type="text" 
            [(ngModel)]="termoBusca" 
            (ngModelChange)="onSearchChange()"
            placeholder="Buscar por nome, empresa, email ou telefone..."
            class="search-input" />
          @if (termoBusca) {
            <button class="clear-search-btn" (click)="termoBusca = ''; onSearchChange()">
              <i class="pi pi-times"></i>
            </button>
          }
        </div>
      </div>

    
      <div class="tcc-card-base table-container">
        @if (loading) {
          <div class="loading-state-box">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Carregando clientes cadastrados...</p>
          </div>
        } @else if (clientesFiltrados.length === 0) {
          <div class="empty-state-box">
            <div class="empty-icon-circle">
              <i class="pi pi-building"></i>
            </div>
            <h3 class="empty-title">Nenhum cliente encontrado</h3>
            <p class="empty-desc">
              @if (termoBusca) {
                Nenhum resultado corresponde à busca "{{ termoBusca }}".
              } @else {
                Ainda não há clientes cadastrados na plataforma.
              }
            </p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="tcc-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Empresa</th>
                  <th>Contato</th>
                  <th>Data de Cadastro</th>
                  <th class="text-center">Chamados</th>
                </tr>
              </thead>
              <tbody>
                @for (cliente of paginatedClientes; track (cliente.id || $index)) {
                  <tr class="table-row">
                    <td>
                      <div class="client-user-cell">
                        <div class="client-avatar">
                          {{ cliente.nome_completo ? cliente.nome_completo.charAt(0).toUpperCase() : 'C' }}
                        </div>
                        <div class="client-info">
                          <span class="client-name">{{ cliente.nome_completo }}</span>
                          <span class="client-email">{{ cliente.email || 'Email não informado' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge-company">{{ cliente.empresa || '-' }}</span>
                    </td>
                    <td>
                      <span class="text-muted">{{ cliente.telefone || '-' }}</span>
                    </td>
                    <td>
                      <span class="text-muted">{{ cliente.criado_em | date:'dd/MM/yyyy' }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge-chamados">{{ cliente.total_chamados || 0 }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (clientesFiltrados.length > rows) {
            <div class="paginator-wrapper">
              <p-paginator
                (onPageChange)="onPageChange($event)"
                [first]="first"
                [rows]="rows"
                [totalRecords]="clientesFiltrados.length"
                [rowsPerPageOptions]="[10, 20, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords} clientes"
              ></p-paginator>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .tcc-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .tcc-page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(37, 99, 235, 0.08);
      color: var(--tcc-primary, #2563eb);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
      width: fit-content;
    }

    .tcc-title-lg {
      font-size: 26px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 4px 0;
    }

    .tcc-subtitle {
      font-size: 14px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .tcc-btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: var(--tcc-surface, #ffffff);
      color: var(--tcc-text-main, #0f172a);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background-color: var(--tcc-bg, #f8fafc);
        border-color: var(--tcc-border-focus, #cbd5e1);
      }
    }

    /* Filters Bar */
    .filters-bar-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .count-badge-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .total-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
    }

    .total-count {
      background-color: rgba(37, 99, 235, 0.1);
      color: var(--tcc-primary, #2563eb);
      font-size: 13px;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 12px;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 420px;
      min-width: 260px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--tcc-text-muted, #94a3b8);
      font-size: 14px;
    }

    .search-input {
      width: 100%;
      padding: 9px 36px 9px 36px;
      border-radius: 10px;
      border: 1px solid var(--tcc-border, #e2e8f0);
      background-color: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #0f172a);
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        border-color: var(--tcc-primary, #3b82f6);
        background-color: var(--tcc-surface, #ffffff);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      }
    }

    .clear-search-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--tcc-text-muted, #94a3b8);
      cursor: pointer;
      padding: 2px;
      font-size: 12px;
      &:hover { color: var(--tcc-text-main, #0f172a); }
    }

    /* Main Table Container */
    .table-container {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .tcc-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 14px 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--tcc-text-muted, #64748b);
        border-bottom: 1px solid var(--tcc-border, #e2e8f0);
        background-color: var(--tcc-bg, #f8fafc);
      }

      td {
        padding: 16px 20px;
        border-bottom: 1px solid var(--tcc-border, #f1f5f9);
        vertical-align: middle;
      }

      tbody tr:hover {
        background-color: var(--tcc-bg, #f8fafc);
      }
    }

    .client-user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .client-avatar {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
    }

    .client-info {
      display: flex;
      flex-direction: column;
    }

    .client-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    .client-email {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
    }

    .badge-company {
      font-size: 13px;
      color: var(--tcc-text-main, #0f172a);
      font-weight: 500;
    }

    .badge-chamados {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 8px;
      border-radius: 12px;
      background: var(--tcc-bg, #f1f5f9);
      color: var(--tcc-text-main, #0f172a);
      font-size: 12px;
      font-weight: 700;
    }

    .text-center { text-align: center; }
    .text-muted { font-size: 13px; color: var(--tcc-text-muted, #64748b); }

    .loading-state-box {
      padding: 64px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--tcc-text-muted, #64748b);

      i { font-size: 28px; color: var(--tcc-primary, #2563eb); }
    }

    .empty-state-box {
      padding: 64px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .empty-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 12px;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 4px 0;
    }

    .empty-desc {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
      margin: 0;
    }

    .paginator-wrapper {
      padding: 12px 20px;
      border-top: 1px solid var(--tcc-border, #f1f5f9);
      display: flex;
      justify-content: center;
    }
  `]
})
export class ClientesAdmin implements OnInit {
  clientes: ClienteAdmin[] = [];
  clientesFiltrados: ClienteAdmin[] = [];
  termoBusca = '';
  loading = true;

  first = 0;
  rows = 10;

  get paginatedClientes(): ClienteAdmin[] {
    if (!this.clientesFiltrados) return [];
    if (this.first >= this.clientesFiltrados.length && this.clientesFiltrados.length > 0) {
      this.first = 0;
    }
    return this.clientesFiltrados.slice(this.first, this.first + this.rows);
  }

  constructor(
    private adminService: AdminService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.loading = true;
    this.adminService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a lista de clientes.'
        });
      }
    });
  }

  onSearchChange() {
    this.first = 0;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let lista = [...this.clientes];

    if (this.termoBusca && this.termoBusca.trim()) {
      const q = this.termoBusca.toLowerCase().trim();
      lista = lista.filter(c => 
        (c.nome_completo && c.nome_completo.toLowerCase().includes(q)) ||
        (c.empresa && c.empresa.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.telefone && c.telefone.toLowerCase().includes(q))
      );
    }

    this.clientesFiltrados = lista;
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }
}
