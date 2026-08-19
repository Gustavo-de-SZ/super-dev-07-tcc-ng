import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HomeClienteService } from '../../services/home-cliente.service';

interface ProfissionalParsed {
  id: number | string;
  nome_fantasia?: string;
  email?: string;
  fotoUrl?: string;
  descricao_servicos?: string;
  especialidade: string;
  local: string;
  tempoResposta: string;
  bio: string;
  aprovado: boolean;
  avaliacao_media: number | null;
  total_avaliacoes: number;
  distanciaKm?: number;
}

@Component({
  selector: 'app-buscar-profissionais',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginatorModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <p-toast></p-toast>
      
     
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <h1 class="tcc-title-lg">Buscar Profissionais</h1>
          <p class="tcc-subtitle">Encontre especialistas de TI certificados e verificados para o seu atendimento</p>
        </div>
      </header>

   
      <div class="tcc-filter-card">
        <div class="tcc-search-box">
          <i class="pi pi-search"></i>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="aplicarFiltros()" 
            placeholder="Buscar por nome, especialidade ou cidade..."
            class="tcc-search-input"
          />
          @if (searchTerm) {
            <button class="tcc-clear-btn" (click)="searchTerm = ''; aplicarFiltros()">
              <i class="pi pi-times"></i>
            </button>
          }
        </div>

      
        <div class="tcc-chips-group">
          @for (cat of categoriasFiltro; track cat) {
            <button
              class="tcc-chip"
              [class.active]="categoriaSelecionada === cat"
              (click)="setCategoria(cat)"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>

      
      @if (loading) {
        <div class="tcc-center-content py-lg">
          <i class="pi pi-spinner pi-spin tcc-spinner"></i>
          <p>Buscando profissionais disponíveis...</p>
        </div>
      } @else if (filteredProfissionais.length === 0) {
        <div class="tcc-empty-state">
          <div class="tcc-empty-icon">
            <i class="pi pi-user-times"></i>
          </div>
          <h3>Nenhum profissional encontrado</h3>
          <p>
            @if (searchTerm || categoriaSelecionada !== 'Todos') {
              Tente buscar com outros termos ou selecione outra categoria.
            } @else {
              Não há profissionais disponíveis no momento.
            }
          </p>
          @if (searchTerm || categoriaSelecionada !== 'Todos') {
            <button class="tcc-btn-outline mt-3" (click)="resetFiltros()">
              Limpar Filtros
            </button>
          }
        </div>
      } @else {
    
        <div class="tcc-prof-grid">
          @for (prof of paginatedProfissionais; track (prof.id || prof.email || $index)) {
            <div class="tcc-prof-card" (click)="abrirPerfil(prof)">
         
              <button
                (click)="toggleFavorito(prof); $event.stopPropagation()"
                class="tcc-btn-fav"
                [class.active]="isFavorito(prof.id)"
                [title]="isFavorito(prof.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
              >
                <i class="pi" [ngClass]="isFavorito(prof.id) ? 'pi-star-fill' : 'pi-star'"></i>
              </button>

            
              <div class="tcc-prof-header">
                <div class="tcc-prof-avatar">
                  @if (prof.fotoUrl) {
                    <img [src]="prof.fotoUrl" alt="Avatar">
                  } @else {
                    <span>{{ (prof.nome_fantasia || prof.email || 'P')[0] }}</span>
                  }
                </div>

                <div class="tcc-prof-title">
                  <h3 class="tcc-prof-name">
                    {{ prof.nome_fantasia || prof.email }}
                  </h3>
                  <div class="tcc-badges-row">
                    <span class="tcc-badge-pill blue">
                      <i class="pi pi-desktop"></i> Técnico de TI
                    </span>
                    <span class="tcc-status-verified">
                      <i class="pi pi-verified"></i> Verificado
                    </span>
                    @if (prof.avaliacao_media != null) {
                      <span class="tcc-rating-badge">
                        <i class="pi pi-star-fill"></i> {{ prof.avaliacao_media }}
                        <span class="rating-count">({{ prof.total_avaliacoes }})</span>
                      </span>
                    }
                  </div>
                </div>
              </div>

              <div class="tcc-prof-meta-grid">
                <div class="tcc-meta-item">
                  <i class="pi pi-wrench"></i>
                  <span>{{ prof.especialidade }}</span>
                </div>

                @if (prof.distanciaKm != null) {
                  <div class="tcc-meta-item">
                    <i class="pi pi-compass"></i>
                    <span>A {{ prof.distanciaKm }} km de você</span>
                  </div>
                }
                <div class="tcc-meta-item">
                  <i class="pi pi-clock"></i>
                  <span>{{ prof.tempoResposta }}</span>
                </div>
              </div>

          
              @if (prof.bio) {
                <p class="tcc-prof-desc">
                  {{ prof.bio }}
                </p>
              }

          
              <div class="tcc-prof-footer" (click)="$event.stopPropagation()">
                <a
                  class="tcc-btn-solicitar"
                  [routerLink]="['/cliente/solicitacao']"
                  [queryParams]="{ profId: prof.id }"
                >
                  <span>Solicitar</span>
                  <i class="pi pi-arrow-right"></i>
                </a>
              </div>

            </div>
          }
        </div>

         
        @if (filteredProfissionais.length > rows) {
          <div class="tcc-paginator-container">
            <p-paginator
              (onPageChange)="onPageChange($event)"
              [first]="first"
              [rows]="rows"
              [totalRecords]="filteredProfissionais.length"
              [rowsPerPageOptions]="[9, 18, 27, 45]"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} profissionais"
            ></p-paginator>
          </div>
        }
      }

   
      @if (perfilModal) {
        <div class="tcc-modal-backdrop" (click)="fecharPerfil()">
          <div class="tcc-modal-content" (click)="$event.stopPropagation()">
            
            <div class="tcc-modal-header">
              <div class="tcc-modal-title-group">
                <span class="tcc-modal-badge">Perfil do Profissional</span>
                <h2>{{ perfilModal.nome_fantasia || perfilModal.email }}</h2>
              </div>
              <button class="tcc-modal-close" (click)="fecharPerfil()">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="tcc-modal-body">
              <div class="tcc-profile-modal-hero">
                <div class="tcc-prof-avatar-lg">
                  @if (perfilModal.fotoUrl) {
                    <img [src]="perfilModal.fotoUrl" alt="Avatar">
                  } @else {
                    <span>{{ (perfilModal.nome_fantasia || perfilModal.email || 'P')[0] }}</span>
                  }
                </div>
                <div class="tcc-profile-modal-info">
                  <h3>{{ perfilModal.nome_fantasia || perfilModal.email }}</h3>
                  <p class="tcc-email-text"><i class="pi pi-envelope"></i> {{ perfilModal.email }}</p>
                  <div class="tcc-badges-row mt-2">
                    <span class="tcc-status-verified"><i class="pi pi-verified"></i> Aprovado & Verificado</span>
                  </div>

                
                  <div class="tcc-avaliacao-hero">
                    @if (perfilModal.avaliacao_media != null) {
                      <div class="avaliacao-stars">
                        @for (star of [1,2,3,4,5]; track star) {
                          <i class="pi" [ngClass]="star <= (perfilModal.avaliacao_media || 0) ? 'pi-star-fill star-filled' : 'pi-star star-empty'"></i>
                        }
                      </div>
                      <span class="avaliacao-score">{{ perfilModal.avaliacao_media }}</span>
                      <span class="avaliacao-count">({{ perfilModal.total_avaliacoes }} avaliação{{ perfilModal.total_avaliacoes > 1 ? 'ões' : '' }})</span>
                    } @else {
                      <span class="avaliacao-empty"><i class="pi pi-star"></i> Ainda sem avaliações</span>
                    }
                  </div>
                </div>
              </div>

              <div class="tcc-modal-grid-2">
                <div class="tcc-info-box">
                  <span class="info-label">Especialidade</span>
                  <strong class="info-val">{{ perfilModal.especialidade }}</strong>
                </div>
                <div class="tcc-info-box">
                  <span class="info-label">Tempo Resposta</span>
                  <strong class="info-val">{{ perfilModal.tempoResposta }}</strong>
                </div>
              </div>

              <div class="tcc-modal-section">
                <span class="info-label">Sobre os Serviços</span>
                <div class="tcc-desc-box">
                  {{ perfilModal.bio || perfilModal.descricao_servicos || 'Profissional qualificado para manutenção de computadores, suporte a redes, segurança e infraestrutura.' }}
                </div>
              </div>
            </div>

            <div class="tcc-modal-footer">
              <button
                class="tcc-btn-fav-modal"
                [class.active]="isFavorito(perfilModal.id)"
                (click)="toggleFavorito(perfilModal)"
              >
                <i class="pi" [ngClass]="isFavorito(perfilModal.id) ? 'pi-star-fill' : 'pi-star'"></i>
                <span>{{ isFavorito(perfilModal.id) ? 'Favorito' : 'Favoritar' }}</span>
              </button>

              <div class="ml-auto" style="display: flex; gap: 10px;">
                <button class="tcc-btn-outline" (click)="fecharPerfil()">
                  Fechar
                </button>
                <a
                  class="tcc-btn-main"
                  [routerLink]="['/cliente/solicitacao']"
                  [queryParams]="{ profId: perfilModal.id }"
                  (click)="fecharPerfil()"
                >
                  <i class="pi pi-send"></i> Solicitar Atendimento
                </a>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .tcc-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 0;
    }
    .tcc-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Page Header */
    .tcc-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .tcc-title-lg {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      letter-spacing: -0.02em;
    }
    .tcc-subtitle {
      margin: 6px 0 0 0;
      color: var(--tcc-text-muted, #64748b);
      font-size: 0.95rem;
    }

    /* Filter Card */
    .tcc-filter-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .tcc-search-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;

      i.pi-search {
        position: absolute;
        left: 16px;
        color: #94a3b8;
        font-size: 16px;
      }
      .tcc-clear-btn {
        position: absolute;
        right: 14px;
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        &:hover { color: #475569; }
      }
    }
    .tcc-search-input {
      width: 100%;
      padding: 13px 40px 13px 46px;
      border: 1px solid var(--tcc-border, #cbd5e1);
      border-radius: 12px;
      font-size: 14px;
      background: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #0f172a);
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: #3b82f6;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    /* Categories Chips */
    .tcc-chips-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tcc-chip {
      background: var(--tcc-bg, #f1f5f9);
      border: 1px solid transparent;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: var(--tcc-text-muted, #475569);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e2e8f0;
      }
      &.active {
        background: var(--tcc-primary, #3b82f6);
        color: #ffffff;
      }
    }

    /* Grid of Cards */
    .tcc-prof-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
      gap: 20px;
    }
    .tcc-prof-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);

      &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 10px 20px -5px rgba(0,0,0,0.06);
        transform: translateY(-2px);
      }
    }

    .tcc-btn-fav {
      position: absolute;
      top: 18px;
      right: 18px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 15px;

      &:hover {
        background: #fefce8;
        border-color: #fef08a;
        color: #eab308;
      }
      &.active {
        background: #fefce8;
        border-color: #fef08a;
        color: #eab308;
      }
    }

    .tcc-prof-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
      padding-right: 36px;
    }
    .tcc-prof-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      overflow: hidden;
      flex-shrink: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .tcc-prof-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tcc-prof-name {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
      cursor: pointer;
      &:hover { color: var(--tcc-primary, #3b82f6); }
    }
    .tcc-badges-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tcc-badge-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      &.blue { background: #eff6ff; color: #2563eb; }
    }
    .tcc-status-verified {
      font-size: 11px;
      font-weight: 600;
      color: #16a34a;
      background: #f0fdf4;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      i { font-size: 12px; }
    }

    /* Rating Badge (Card) */
    .tcc-rating-badge {
      font-size: 11px;
      font-weight: 700;
      color: #d97706;
      background: #fffbeb;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      i { font-size: 11px; color: #f59e0b; }
      .rating-count {
        font-weight: 500;
        color: #92400e;
        opacity: 0.7;
      }
    }

    /* Rating Hero (Modal) */
    .tcc-avaliacao-hero {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      padding: 8px 14px;
      background: #fffbeb;
      border-radius: 10px;
      border: 1px solid #fef3c7;
    }
    .avaliacao-stars {
      display: flex;
      gap: 2px;
    }
    .star-filled {
      color: #f59e0b;
      font-size: 16px;
    }
    .star-empty {
      color: #d1d5db;
      font-size: 16px;
    }
    .avaliacao-score {
      font-size: 1.1rem;
      font-weight: 800;
      color: #b45309;
    }
    .avaliacao-count {
      font-size: 0.8rem;
      color: #92400e;
      opacity: 0.7;
    }
    .avaliacao-empty {
      font-size: 0.85rem;
      color: #9ca3af;
      display: flex;
      align-items: center;
      gap: 6px;
      i { color: #d1d5db; }
    }

    /* Meta Grid */
    .tcc-prof-meta-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: var(--tcc-bg, #f8fafc);
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--tcc-border, #f1f5f9);
      margin-bottom: 12px;
    }
    .tcc-meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--tcc-text-muted, #475569);
      i { color: #3b82f6; font-size: 13px; width: 14px; text-align: center; }
    }

    .tcc-prof-desc {
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
      line-height: 1.5;
      margin: 0 0 16px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tcc-prof-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--tcc-border, #f1f5f9);
      margin-top: auto;
    }
    .tcc-btn-solicitar {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      &:hover {
        background: #2563eb;
        color: #ffffff;
      }
    }

    /* Buttons */
    .tcc-btn-main {
      background: var(--tcc-primary, #3b82f6);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      &:hover { background: #2563eb; }
    }
    .tcc-btn-outline {
      background: transparent;
      border: 1px solid var(--tcc-border, #cbd5e1);
      color: var(--tcc-text-main, #334155);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      &:hover { background: var(--tcc-bg, #f8fafc); }
    }
    .tcc-btn-fav-modal {
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #cbd5e1);
      color: var(--tcc-text-muted, #64748b);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      &.active {
        background: #fefce8;
        border-color: #fef08a;
        color: #ca8a04;
      }
    }

    /* Paginator */
    .tcc-paginator-container {
      margin-top: 8px;
      display: flex;
      justify-content: center;
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 6px 12px;
    }

    /* Modals */
    .tcc-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .tcc-modal-content {
      background: var(--tcc-surface, #ffffff);
      border-radius: 18px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .tcc-modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .tcc-modal-title-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      h2 { margin: 0; font-size: 1.25rem; color: var(--tcc-text-main, #0f172a); }
    }
    .tcc-modal-badge {
      font-size: 11px;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      padding: 2px 8px;
      border-radius: 6px;
      width: fit-content;
    }
    .tcc-modal-close {
      background: transparent;
      border: none;
      font-size: 16px;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      &:hover { background: #f1f5f9; color: #334155; }
    }
    .tcc-modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .tcc-profile-modal-hero {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--tcc-bg, #f8fafc);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--tcc-border, #e2e8f0);
    }
    .tcc-prof-avatar-lg {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 700;
      overflow: hidden;
      flex-shrink: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .tcc-profile-modal-info {
      flex: 1;
      h3 { margin: 0; font-size: 17px; color: var(--tcc-text-main, #0f172a); }
      .tcc-email-text { margin: 4px 0 0 0; font-size: 13px; color: var(--tcc-text-muted, #64748b); display: flex; align-items: center; gap: 6px; }
    }
    .tcc-modal-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .tcc-info-box {
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .info-val {
      font-size: 13px;
      color: var(--tcc-text-main, #0f172a);
    }
    .tcc-modal-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tcc-desc-box {
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 14px;
      line-height: 1.6;
      color: var(--tcc-text-main, #334155);
      white-space: pre-wrap;
    }
    .tcc-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--tcc-bg, #f8fafc);
    }
    .ml-auto { margin-left: auto; }

    /* Empty State & Loader */
    .tcc-center-content { text-align: center; color: var(--tcc-text-muted); }
    .py-lg { padding: 60px 0; }
    .tcc-spinner { font-size: 32px; color: var(--tcc-primary, #3b82f6); margin-bottom: 12px; }
    .tcc-empty-state {
      background: var(--tcc-surface, #ffffff);
      border: 1px dashed var(--tcc-border, #cbd5e1);
      border-radius: 16px;
      padding: 48px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .tcc-empty-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--tcc-bg, #f1f5f9);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 8px;
    }

    @media (max-width: 640px) {
      .tcc-modal-grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class BuscarProfissionais implements OnInit {
  private service = inject(HomeClienteService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  
  profissionais: ProfissionalParsed[] = [];
  filteredProfissionais: ProfissionalParsed[] = [];
  favoritosIds: Set<string | number> = new Set();
  
  searchTerm: string = '';
  categoriaSelecionada: string = 'Todos';
  categoriasFiltro: string[] = ['Todos', 'Hardware', 'Redes', 'Software', 'Segurança', 'Impressoras', 'Suporte Técnico'];

  loading: boolean = true;
  perfilModal: ProfissionalParsed | null = null;

  first: number = 0;
  rows: number = 9;

  get paginatedProfissionais(): ProfissionalParsed[] {
    if (!this.filteredProfissionais) return [];
    if (this.first >= this.filteredProfissionais.length && this.filteredProfissionais.length > 0) {
      this.first = 0;
    }
    return this.filteredProfissionais.slice(this.first, this.first + this.rows);
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
      }
      if (params['cat']) {
        const found = this.categoriasFiltro.find(c => c.toLowerCase() === params['cat'].toLowerCase()) || params['cat'];
        this.categoriaSelecionada = found;
      }
    });
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getProfissionais().subscribe({
      next: (profs) => {
        this.profissionais = (profs || []).map(p => this.parseProfissional(p));
        this.aplicarFiltros();
        this.loadFavoritos();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Falha ao carregar profissionais.'});
      }
    });
  }

  loadFavoritos() {
    this.service.getFavoritos().subscribe({
      next: (favs) => {
        this.favoritosIds = new Set((favs || []).map(f => f.id));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  parseProfissional(p: any): ProfissionalParsed {
    const rawDesc = p.descricao_servicos || '';
    
    let especialidade = 'Suporte Técnico';
    let local = 'Atendimento Geral';
    let tempoResposta = 'Em até 2 horas';
    let bio = '';

    if (rawDesc.includes('|')) {
      const parts = rawDesc.split('|');
      parts.forEach((part: string) => {
        const trimmed = part.trim();
        if (trimmed.toLowerCase().startsWith('especialidade:')) {
          especialidade = trimmed.substring('especialidade:'.length).trim() || especialidade;
        } else if (trimmed.toLowerCase().startsWith('local:')) {
          local = trimmed.substring('local:'.length).trim() || local;
        } else if (trimmed.toLowerCase().startsWith('tempo de resposta:')) {
          tempoResposta = trimmed.substring('tempo de resposta:'.length).trim() || tempoResposta;
        } else {
          bio += (bio ? ' ' : '') + trimmed;
        }
      });
    } else {
      bio = rawDesc;
    }

    if (p.especialidade) especialidade = p.especialidade;

    const especialidadeMap: Record<string, string> = {
      'Suporte Técnico': 'Suporte Técnico & Help Desk',
      'Redes': 'Redes e Infraestrutura',
      'Segurança': 'Segurança da Informação',
      'Software': 'Desenvolvimento e Sistemas',
      'Hardware': 'Manutenção de Hardware e Servidores',
      'Outros': 'Outros Serviços Especializados'
    };
    especialidade = especialidadeMap[especialidade] || especialidade;
    if (p.cidade || p.estado) local = `${p.cidade || ''} ${p.estado ? '- ' + p.estado : ''}`.trim() || local;

    return {
      id: p.id,
      nome_fantasia: p.nome_fantasia,
      email: p.email,
      fotoUrl: p.fotoUrl || p.foto_url,
      descricao_servicos: rawDesc,
      especialidade,
      local,
      tempoResposta,
      bio: bio.trim() || 'Sem descrição.',
      aprovado: p.aprovado_pelo_admin,
      avaliacao_media: p.avaliacao_media,
      total_avaliacoes: p.total_avaliacoes || 0,
      distanciaKm: p.distancia_km
    };
  }

  setCategoria(cat: string): void {
    this.categoriaSelecionada = cat;
    this.first = 0;
    this.aplicarFiltros();
  }

  resetFiltros(): void {
    this.searchTerm = '';
    this.categoriaSelecionada = 'Todos';
    this.first = 0;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let result = [...this.profissionais];

    // Category filter
    if (this.categoriaSelecionada !== 'Todos') {
      const catLower = this.categoriaSelecionada.toLowerCase();
      result = result.filter(p =>
        p.especialidade.toLowerCase().includes(catLower) ||
        p.bio.toLowerCase().includes(catLower) ||
        (p.descricao_servicos && p.descricao_servicos.toLowerCase().includes(catLower))
      );
    }

    // Search filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(p =>
        (p.nome_fantasia && p.nome_fantasia.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        p.especialidade.toLowerCase().includes(term) ||
        p.local.toLowerCase().includes(term) ||
        p.bio.toLowerCase().includes(term)
      );
    }

    this.filteredProfissionais = result;
  }

  isFavorito(id: number | string): boolean {
    return this.favoritosIds.has(id);
  }

  toggleFavorito(prof: ProfissionalParsed) {
    if (this.isFavorito(prof.id)) {
      this.service.desfavoritarProfissional(prof.id).subscribe({
        next: () => {
          this.favoritosIds.delete(prof.id);
          this.messageService.add({severity: 'info', summary: 'Favoritos', detail: 'Profissional removido dos favoritos'});
        },
        error: () => this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Falha ao remover favorito'})
      });
    } else {
      this.service.favoritarProfissional(prof.id).subscribe({
        next: () => {
          this.favoritosIds.add(prof.id);
          this.messageService.add({severity: 'success', summary: 'Favoritos', detail: 'Profissional adicionado aos favoritos!'});
        },
        error: () => this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar favorito'})
      });
    }
  }

  abrirPerfil(prof: ProfissionalParsed): void {
    this.perfilModal = prof;
  }

  fecharPerfil(): void {
    this.perfilModal = null;
  }
}