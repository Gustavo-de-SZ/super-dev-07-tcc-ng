import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { RouterModule, Router } from '@angular/router';
import { Servico } from '../../../models/servico';
import { Cliente } from '../../../models/cliente';
import { Equipamento } from '../../../models/equipamento';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { MenuItem, MessageService } from 'primeng/api';
import { ServicoService } from '../../../services/servico.service';
import { ClienteService } from '../../../services/cliente.service';
import { EquipamentoService } from '../../../services/equipamento.service';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-servicos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule, PaginatorModule, EmptyStateComponent],
  template: `
    <div class="tcc-services-list">
      @for (servico of paginatedServicos; track (servico.id || servico.titulo || $index)) {
        <div class="tcc-service-card">

          <div class="tcc-service-icon-box">
            <i class="pi" [ngClass]="servico.icone || 'pi-cog'"></i>
          </div>

          <div class="tcc-service-content">
            <div class="tcc-service-header">
              <h3>{{ servico.titulo }}</h3>
              
              <span class="tcc-status-badge" [ngClass]="getBadgeClass(servico.status)">
                <i class="pi" [ngClass]="getBadgeIcon(servico.status)"></i>
                {{ servico.status }}
              </span>

              @if (servico.tipo_atendimento) {
                <span class="tcc-modalidade-badge" [ngClass]="servico.tipo_atendimento === 'Remoto' ? 'modalidade-remoto' : 'modalidade-presencial'">
                  <i class="pi" [ngClass]="servico.tipo_atendimento === 'Remoto' ? 'pi-globe' : 'pi-building'"></i>
                  {{ servico.tipo_atendimento }}
                </span>
              }
            </div>

            <div class="tcc-service-details">
              <span><i class="pi pi-user"></i> {{ servico.cliente }}</span>
              <span><i class="pi pi-calendar"></i> {{ formatarData(servico.data) }}</span>
              <span><i class="pi pi-clock"></i> {{ servico.duracao || '1h' }}</span>
              @if (servico.garantia) {
                <span><i class="pi pi-shield"></i> {{ servico.garantia }}</span>
              }
              <span class="price">{{ formatarValor(servico.valor) }}</span>
            </div>
          </div>

          <div class="tcc-service-actions">
            <button
              type="button"
              class="tcc-btn-outline small"
              (click)="abrirMenu($event, menu, servico)"
            >
              Ações <i class="pi pi-chevron-down"></i>
            </button>
          </div>

        </div>
      } @empty {
        <app-empty-state message="Nenhum serviço encontrado."></app-empty-state>
      }
    </div>

    @if (servicos.length > rows) {
      <div class="tcc-paginator-container">
        <p-paginator
          (onPageChange)="onPageChange($event)"
          [first]="first"
          [rows]="rows"
          [totalRecords]="servicos.length"
          [rowsPerPageOptions]="[8, 16, 24, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} serviços"
        ></p-paginator>
      </div>
    }


    <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>


    @if (servicoDetalhes) {
      <div class="tcc-modal-backdrop" (click)="fecharDetalhes()">
        <div class="tcc-modal-content tcc-fade-in" (click)="$event.stopPropagation()">
          <div class="tcc-modal-header">
            <div class="tcc-modal-title-box">
              <div class="tcc-modal-icon-box">
                <i class="pi" [ngClass]="servicoDetalhes.icone || 'pi-cog'"></i>
              </div>
              <div>
                <h2 class="tcc-modal-title">{{ servicoDetalhes.titulo }}</h2>
                <span class="tcc-modal-subtitle">Cliente: {{ servicoDetalhes.cliente }}</span>
              </div>
            </div>
            <button class="tcc-modal-close" (click)="fecharDetalhes()" title="Fechar">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="tcc-modal-body">
            <div class="tcc-modal-highlight">
              <div class="highlight-item">
                <label>Status Atual</label>
                <span class="tcc-status-badge" [ngClass]="getBadgeClass(servicoDetalhes.status)">
                  <i class="pi" [ngClass]="getBadgeIcon(servicoDetalhes.status)"></i>
                  {{ servicoDetalhes.status }}
                </span>
              </div>
              <div class="highlight-item">
                <label>Modalidade</label>
                <span class="tcc-modalidade-badge" [ngClass]="servicoDetalhes.tipo_atendimento === 'Remoto' ? 'modalidade-remoto' : 'modalidade-presencial'">
                  <i class="pi" [ngClass]="servicoDetalhes.tipo_atendimento === 'Remoto' ? 'pi-globe' : 'pi-building'"></i>
                  {{ servicoDetalhes.tipo_atendimento || 'Presencial' }}
                </span>
              </div>
              <div class="highlight-item right">
                <label>Valor do Serviço</label>
                <span class="highlight-price">{{ formatarValor(servicoDetalhes.valor) }}</span>
              </div>
            </div>

            <div class="tcc-modal-info-list">
              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-user"></i></div>
                <div class="info-content">
                  <label>Cliente Vinculado</label>
                  <span>{{ servicoDetalhes.cliente || 'Não informado' }}</span>
                </div>
              </div>

              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-calendar"></i></div>
                <div class="info-content">
                  <label>Data Prevista / Realização</label>
                  <span>{{ formatarData(servicoDetalhes.data) }}</span>
                </div>
              </div>

              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-clock"></i></div>
                <div class="info-content">
                  <label>Duração Estimada</label>
                  <span>{{ servicoDetalhes.duracao || '1h' }}</span>
                </div>
              </div>

              <div class="tcc-modal-info-item">
                <div class="info-icon"><i class="pi pi-shield"></i></div>
                <div class="info-content">
                  <label>Garantia Técnica</label>
                  <span>{{ servicoDetalhes.garantia || '90 dias' }}</span>
                </div>
              </div>

              @if (servicoDetalhes.equipamento_id || servicoDetalhes.equipamentoId) {
                <div class="tcc-modal-info-item full-width">
                  <div class="info-icon"><i class="pi pi-desktop"></i></div>
                  <div class="info-content">
                    <label>Equipamento Vinculado</label>
                    @if (equipamentoDetalhado) {
                      <span>{{ equipamentoDetalhado.tipo }} - {{ equipamentoDetalhado.marca }} {{ equipamentoDetalhado.modelo }} (S/N: {{ equipamentoDetalhado.numeroSerie || '—' }})</span>
                    } @else {
                      <span>Identificador do Ativo #{{ servicoDetalhes.equipamento_id || servicoDetalhes.equipamentoId }}</span>
                    }
                  </div>
                </div>
              }
            </div>

            @if (servicoDetalhes.descricao) {
              <div class="tcc-modal-desc-box">
                <label>Descrição da Solicitação</label>
                <p>{{ servicoDetalhes.descricao }}</p>
              </div>
            }

            @if (servicoDetalhes.laudo_tecnico) {
              <div class="tcc-modal-desc-box laudo-box">
                <label>Laudo Técnico & Procedimentos</label>
                <p>{{ servicoDetalhes.laudo_tecnico }}</p>
              </div>
            }

            @if (servicoDetalhes.observacoes) {
              <div class="tcc-modal-desc-box">
                <label>Observações Adicionais</label>
                <p>{{ servicoDetalhes.observacoes }}</p>
              </div>
            }
          </div>

          <div class="tcc-modal-footer">
            <button class="tcc-btn-outline" (click)="fecharDetalhes()">Fechar</button>
            <button class="tcc-btn-outline" (click)="abrirPreviewOS(servicoDetalhes)">
              <i class="pi pi-print" style="margin-right: 6px;"></i> Visualizar / Imprimir OS
            </button>
            <button class="tcc-btn-main" (click)="editarServico(servicoDetalhes)">
              <i class="pi pi-pencil" style="margin-right: 6px;"></i> Editar Serviço
            </button>
          </div>
        </div>
      </div>
    }

  
    @if (osPreviewModal && selectedItem) {
      <div class="tcc-modal-backdrop os-preview-backdrop" (click)="fecharPreviewOS()">
        <div class="os-preview-modal-box tcc-fade-in" (click)="$event.stopPropagation()">
          
        
          <div class="os-preview-modal-header no-print">
            <div class="os-preview-header-title">
              <i class="pi pi-file-pdf"></i>
              <div>
                <h3>Pré-visualização da Ordem de Serviço</h3>
                <span>Documento Oficial • {{ getNumeroOS(selectedItem) }}</span>
              </div>
            </div>
            <div class="os-preview-header-actions">
              <button type="button" class="tcc-btn-outline" (click)="fecharPreviewOS()">
                <i class="pi pi-times" style="margin-right: 6px;"></i> Fechar
              </button>
              <button type="button" class="tcc-btn-main" (click)="imprimirOS()">
                <i class="pi pi-print" style="margin-right: 6px;"></i> Imprimir / Salvar PDF
              </button>
            </div>
          </div>

  
          <div class="os-preview-modal-body">
            <div class="tcc-os-print-document">
              <div class="os-doc-page">
                
          
                <div class="os-doc-topbar"></div>

        
                <header class="os-doc-header">
                  <div class="os-brand">
                    <div class="os-logo-badge">
                      <i class="pi pi-wrench"></i>
                    </div>
                    <div class="os-brand-info">
                      <h1 class="os-company-name">TechCare</h1>
                      <p class="os-company-sub">Gestão & Assistência Técnica Especializada</p>
                      <div class="os-company-meta">
                        <span>Registro Técnico / CNPJ: 42.108.923/0001-55</span>
                        <span class="dot">•</span>
                        <span>Blumenau - SC</span>
                      </div>
                    </div>
                  </div>

                  <div class="os-doc-badge-box">
                    <div class="os-doc-type-label">ORDEM DE SERVIÇO</div>
                    <div class="os-doc-number">{{ getNumeroOS(selectedItem) }}</div>
                    
                    <div class="os-header-badges-row">
                      <div class="os-status-pill" [ngClass]="getStatusPillClass(selectedItem.status)">
                        <i class="pi" [ngClass]="getBadgeIcon(selectedItem.status)"></i>
                        {{ selectedItem.status | uppercase }}
                      </div>
                      <div class="os-modalidade-pill" [ngClass]="selectedItem.tipo_atendimento === 'Remoto' ? 'pill-remoto' : 'pill-presencial'">
                        <i class="pi" [ngClass]="selectedItem.tipo_atendimento === 'Remoto' ? 'pi-globe' : 'pi-building'"></i>
                        {{ selectedItem.tipo_atendimento || 'Presencial' }}
                      </div>
                    </div>

                    <div class="os-doc-date-meta">
                      Emissão: <strong>{{ dataEmissaoAtual }}</strong>
                    </div>
                  </div>
                </header>

                <div class="os-divider"></div>

            
                <div class="os-parties-grid">
          
                  <div class="os-party-card">
                    <div class="os-party-header">
                      <i class="pi pi-id-card"></i>
                      <span>Prestador de Serviços / Técnico</span>
                    </div>
                    <div class="os-party-body">
                      <div class="os-party-row">
                        <span class="lbl">Responsável:</span>
                        <span class="val bold">{{ nomeTecnicoFormatado }}</span>
                      </div>
                      <div class="os-party-row">
                        <span class="lbl">Especialidade:</span>
                        <span class="val">{{ selectedItem.categoria || 'Suporte Técnico em TI' }}</span>
                      </div>
                      <div class="os-party-row">
                        <span class="lbl">Qualificação:</span>
                        <span class="val">Profissional Verificado TechCare</span>
                      </div>
                      <div class="os-party-row">
                        <span class="lbl">Modalidade:</span>
                        <span class="val bold">{{ selectedItem.tipo_atendimento || 'Presencial' }}</span>
                      </div>
                    </div>
                  </div>

              
                  <div class="os-party-card">
                    <div class="os-party-header">
                      <i class="pi pi-user"></i>
                      <span>Cliente / Solicitante</span>
                    </div>
                    <div class="os-party-body">
                      <div class="os-party-row">
                        <span class="lbl">Cliente:</span>
                        <span class="val bold">{{ selectedItem.cliente || 'Consumidor Final' }}</span>
                      </div>
                      @if (clienteDetalhado; as cli) {
                        @if (cli.email || cli.telefone) {
                          <div class="os-party-row">
                            <span class="lbl">Contato:</span>
                            <span class="val">{{ cli.telefone || cli.email }}</span>
                          </div>
                        }
                        @if (cli.endereco || cli.local) {
                          <div class="os-party-row">
                            <span class="lbl">Localidade:</span>
                            <span class="val">{{ cli.endereco ? cli.endereco + ' - ' : '' }}{{ cli.local || 'Blumenau - SC' }}</span>
                          </div>
                        }
                      }
                      <div class="os-party-row">
                        <span class="lbl">Data Atendimento:</span>
                        <span class="val">{{ formatarData(selectedItem.data) }}</span>
                      </div>
                      <div class="os-party-row">
                        <span class="lbl">Duração Prevista:</span>
                        <span class="val">{{ selectedItem.duracao || '1h' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

             
                @if (selectedItem.equipamento_id || selectedItem.equipamentoId || equipamentoDetalhado) {
                  <div class="os-equip-box">
                    <div class="os-equip-header">
                      <i class="pi pi-desktop"></i>
                      <span>Equipamento / Ativo Vinculado</span>
                    </div>
                    <div class="os-equip-details">
                      @if (equipamentoDetalhado) {
                        <div class="os-equip-item">
                          <span class="lbl">Tipo / Categoria:</span>
                          <span class="val bold">{{ equipamentoDetalhado.tipo }}</span>
                        </div>
                        <div class="os-equip-item">
                          <span class="lbl">Marca & Modelo:</span>
                          <span class="val bold">{{ equipamentoDetalhado.marca }} {{ equipamentoDetalhado.modelo }}</span>
                        </div>
                        <div class="os-equip-item">
                          <span class="lbl">Nº de Série / Tag:</span>
                          <span class="val">{{ equipamentoDetalhado.numeroSerie || 'Não informado' }}</span>
                        </div>
                        @if (equipamentoDetalhado.observacoes) {
                          <div class="os-equip-item full">
                            <span class="lbl">Observações Técnicas:</span>
                            <span class="val">{{ equipamentoDetalhado.observacoes }}</span>
                          </div>
                        }
                      } @else {
                        <div class="os-equip-item">
                          <span class="lbl">Identificador do Ativo:</span>
                          <span class="val bold">Equipamento #{{ selectedItem.equipamento_id || selectedItem.equipamentoId }}</span>
                        </div>
                        <div class="os-equip-item">
                          <span class="lbl">Categoria do Ativo:</span>
                          <span class="val">{{ selectedItem.categoria }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

            
                <section class="os-section">
                  <div class="os-section-header">
                    <i class="pi pi-file-edit"></i>
                    <span>Descrição dos Serviços & Diagnóstico Técnico</span>
                  </div>
                  
                  <div class="os-service-details-box">
                    <div class="os-service-title-row">
                      <span class="os-service-title">{{ selectedItem.titulo }}</span>
                      <span class="os-category-tag">{{ selectedItem.categoria || 'Geral' }}</span>
                    </div>
                    
                    <div class="os-desc-content">
                      <strong>Solicitação Inicial / Problema Relatado:</strong>
                      <p>{{ selectedItem.descricao || 'Atendimento técnico preventivo e corretivo realizado conforme solicitação e padrões de qualidade TechCare.' }}</p>
                    </div>

                    @if (selectedItem.laudo_tecnico) {
                      <div class="os-desc-content os-laudo-content">
                        <strong>Diagnóstico & Procedimentos Executados:</strong>
                        <p>{{ selectedItem.laudo_tecnico }}</p>
                      </div>
                    }

                    @if (selectedItem.observacoes) {
                      <div class="os-desc-content os-obs-content">
                        <strong>Observações & Recomendações:</strong>
                        <p>{{ selectedItem.observacoes }}</p>
                      </div>
                    }
                  </div>
                </section>

          
                <section class="os-section">
                  <div class="os-section-header">
                    <i class="pi pi-calculator"></i>
                    <span>Detalhamento dos Valores / Fechamento Financeiro</span>
                  </div>
                  
                  <table class="os-pricing-table">
                    <thead>
                      <tr>
                        <th class="col-desc">Item / Descrição do Serviço</th>
                        <th class="col-cat">Categoria</th>
                        <th class="col-mod">Modalidade</th>
                        <th class="col-gar">Garantia</th>
                        <th class="col-qty">Qtd/Tempo</th>
                        <th class="col-unit">Valor Unitário</th>
                        <th class="col-total">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="col-desc">
                          <strong>{{ selectedItem.titulo }}</strong>
                          <small class="d-block">Execução Técnica Especializada e Diagnóstico</small>
                        </td>
                        <td class="col-cat">{{ selectedItem.categoria || 'Geral' }}</td>
                        <td class="col-mod">{{ selectedItem.tipo_atendimento || 'Presencial' }}</td>
                        <td class="col-gar">{{ selectedItem.garantia || '90 dias' }}</td>
                        <td class="col-qty">{{ selectedItem.duracao || '1h' }}</td>
                        <td class="col-unit">{{ formatarValor(selectedItem.valor) }}</td>
                        <td class="col-total"><strong>{{ formatarValor(selectedItem.valor) }}</strong></td>
                      </tr>
                    </tbody>
                  </table>

               
                  <div class="os-financial-summary">
                    <div class="os-summary-left">
                      <span class="os-payment-status">
                        <i class="pi pi-check-circle"></i> Condição de Pagamento: À vista / Conforme acordado
                      </span>
                    </div>
                    <div class="os-summary-right">
                      <div class="os-subtotal-row">
                        <span>Subtotal:</span>
                        <span>{{ formatarValor(selectedItem.valor) }}</span>
                      </div>
                      <div class="os-total-row">
                        <span class="total-label">VALOR TOTAL:</span>
                        <span class="total-amount">{{ formatarValor(selectedItem.valor) }}</span>
                      </div>
                    </div>
                  </div>
                </section>

           
                <section class="os-warranty-section">
                  <div class="os-warranty-header">
                    <i class="pi pi-shield"></i>
                    <span>Termo de Garantia e Condições de Atendimento</span>
                  </div>
                  <p class="os-warranty-text">
                    Fica assegurada a <strong>garantia de {{ selectedItem.garantia || '90 (noventa) dias' }}</strong> sobre os serviços técnicos executados e componentes aplicados a contar da data de entrega, conforme disposto no Artigo 26 da Lei Federal nº 8.078/1990 (Código de Defesa do Consumidor). A garantia perde a validade em casos de mau uso comprovado, derramamento de líquidos, oscilações severas de energia elétrica, descargas atmosféricas ou intervenção de terceiros não autorizados.
                  </p>
                </section>

         
                <footer class="os-signatures-container">
                  <div class="os-signature-block">
                    <div class="os-sign-line"></div>
                    <div class="os-sign-person">{{ nomeTecnicoFormatado }}</div>
                    <div class="os-sign-sub">Técnico Responsável / Executante</div>
                    <div class="os-sign-date">Data: _____/_____/_________</div>
                  </div>

                  <div class="os-signature-block">
                    <div class="os-sign-line"></div>
                    <div class="os-sign-person">{{ selectedItem.cliente || 'Cliente / Responsável' }}</div>
                    <div class="os-sign-sub">Aceite e Recebimento do Serviço</div>
                    <div class="os-sign-date">Data: _____/_____/_________</div>
                  </div>
                </footer>

         
                <div class="os-document-footer">
                  <div class="os-footer-content">
                    <span>TechCare Solutions • Sistema de Gestão Técnica • Impresso em {{ dataHoraImpressao }}</span>
                    <span>Documento autêntico • Página 1 de 1</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .tcc-services-list { display: flex; flex-direction: column; gap: 12px; }

    .tcc-service-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 24px;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .tcc-service-card:hover {
      border-color: var(--tcc-primary, #3b82f6);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
    }

    .tcc-service-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 10px;
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--tcc-primary, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .tcc-service-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tcc-service-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .tcc-service-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid;
    }
    .tcc-status-badge i { font-size: 10px; }

    .status-concluido { color: #10b981; border-color: rgba(16, 185, 129, 0.3); background-color: rgba(16, 185, 129, 0.12); }
    .status-andamento { color: #3b82f6; border-color: rgba(59, 130, 246, 0.3); background-color: rgba(59, 130, 246, 0.12); }
    .status-pendente { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); background-color: rgba(245, 158, 11, 0.12); }
    .status-cancelado { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background-color: rgba(239, 68, 68, 0.12); }

    .tcc-modalidade-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
    }
    .modalidade-presencial { background: var(--tcc-bg, #f1f5f9); color: var(--tcc-text-muted, #475569); border: 1px solid var(--tcc-border, #cbd5e1); }
    .modalidade-remoto { background: rgba(59, 130, 246, 0.12); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }

    .tcc-service-details {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }
    .tcc-service-details span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .tcc-service-details i { font-size: 13px; opacity: 0.7; }
    .price { color: var(--tcc-primary, #3b82f6); font-weight: 600; }

    .tcc-service-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tcc-btn-outline.small {
      background-color: transparent;
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-main, #475569);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }
    .tcc-btn-outline.small:hover { background-color: var(--tcc-surface-hover, #f8fafc); }

    /* Modal Styles */
    .tcc-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 16px;
    }

    .tcc-modal-content {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      width: 100%;
      max-width: 580px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .tcc-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-modal-title-box { display: flex; align-items: center; gap: 14px; }

    .tcc-modal-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--tcc-primary, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .tcc-modal-title { margin: 0; font-size: 17px; font-weight: 600; color: var(--tcc-text-main, #0f172a); }
    .tcc-modal-subtitle { font-size: 13px; color: var(--tcc-text-muted, #64748b); }

    .tcc-modal-close {
      background: transparent;
      border: none;
      color: var(--tcc-text-muted, #94a3b8);
      font-size: 16px;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .tcc-modal-close:hover { background-color: var(--tcc-surface-hover, #f8fafc); color: var(--tcc-text-main, #0f172a); }

    .tcc-modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    }

    .tcc-modal-highlight {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
    }

    .highlight-item { display: flex; flex-direction: column; gap: 4px; }
    .highlight-item.right { align-items: flex-end; }
    .highlight-item label {
      font-size: 11px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .highlight-price { font-size: 18px; font-weight: 700; color: var(--tcc-primary, #3b82f6); }

    .tcc-modal-info-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .tcc-modal-info-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .tcc-modal-info-item.full-width { grid-column: span 2; }

    .info-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background-color: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .info-content { display: flex; flex-direction: column; gap: 2px; }
    .info-content label { font-size: 11px; color: var(--tcc-text-muted, #64748b); font-weight: 500; }
    .info-content span { font-size: 13px; color: var(--tcc-text-main, #0f172a); font-weight: 600; }

    .tcc-modal-desc-box {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 14px;
      background-color: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
    }
    .tcc-modal-desc-box.laudo-box {
      border-left: 3px solid #3b82f6;
      background: rgba(59, 130, 246, 0.06);
    }
    .tcc-modal-desc-box label {
      font-size: 11px;
      font-weight: 600;
      color: var(--tcc-text-muted, #64748b);
      text-transform: uppercase;
    }
    .tcc-modal-desc-box p { margin: 0; font-size: 13px; color: var(--tcc-text-main, #334155); line-height: 1.5; }

    .tcc-modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 24px;
      border-top: 1px solid var(--tcc-border, #e2e8f0);
      background-color: var(--tcc-bg, #f8fafc);
    }

    .tcc-btn-outline {
      background: transparent;
      border: 1px solid var(--tcc-border, #cbd5e1);
      color: var(--tcc-text-main, #334155);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
    }
    .tcc-btn-outline:hover { background-color: var(--tcc-surface-hover, #f1f5f9); }

    .tcc-btn-main {
      background-color: var(--tcc-primary, #3b82f6);
      border: 1px solid var(--tcc-primary, #3b82f6);
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
    }
    .tcc-btn-main:hover { opacity: 0.9; }

    .tcc-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.97); }
      to { opacity: 1; transform: scale(1); }
    }

    .tcc-paginator-container {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 6px 12px;
      box-shadow: var(--tcc-shadow, 0 1px 2px rgba(0, 0, 0, 0.02));
    }

    /* ==========================================================================
       OS PREVIEW & PRINT STYLES
       ========================================================================== */
    .os-preview-backdrop {
      background-color: rgba(15, 23, 42, 0.75);
      z-index: 10000;
      padding: 24px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .os-preview-modal-box {
      background: var(--tcc-bg, #0f172a);
      border: 1px solid var(--tcc-border, #334155);
      border-radius: 14px;
      width: 100%;
      max-width: 860px;
      height: 92vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    }

    .os-preview-modal-header {
      background: var(--tcc-surface, #ffffff);
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      flex-shrink: 0;
    }

    .os-preview-header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .os-preview-header-title i {
      font-size: 24px;
      color: var(--tcc-primary, #3b82f6);
    }
    .os-preview-header-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
    }
    .os-preview-header-title span {
      font-size: 12px;
      color: var(--tcc-text-muted, #64748b);
    }

    .os-preview-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .os-preview-modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px 16px;
      display: flex;
      justify-content: center;
      background: #475569;
    }

    .tcc-os-print-document {
      width: 100%;
      max-width: 780px;
      background: #ffffff;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      border-radius: 6px;
    }

    .os-doc-page {
      padding: 36px 40px;
      color: #1e293b;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      position: relative;
    }

    .os-doc-topbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    .os-doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 20px;
    }

    .os-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .os-logo-badge {
      width: 48px;
      height: 48px;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .os-company-name {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .os-company-sub {
      margin: 2px 0 4px 0;
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
    }

    .os-company-meta {
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .os-company-meta .dot { font-weight: bold; }

    .os-doc-badge-box {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .os-doc-type-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #64748b;
    }

    .os-doc-number {
      font-size: 18px;
      font-weight: 800;
      color: #1e293b;
      font-family: monospace;
    }

    .os-header-badges-row {
      display: flex;
      gap: 6px;
      align-items: center;
      margin: 2px 0;
    }

    .os-status-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .os-status-concluido { background: #dcfce7; color: #15803d; }
    .os-status-andamento { background: #dbeafe; color: #1d4ed8; }
    .os-status-pendente { background: #fef3c7; color: #b45309; }
    .os-status-cancelado { background: #fee2e2; color: #b91c1c; }

    .os-modalidade-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .pill-presencial { background: #f1f5f9; color: #334155; }
    .pill-remoto { background: #eff6ff; color: #2563eb; }

    .os-doc-date-meta {
      font-size: 11px;
      color: #64748b;
    }

    .os-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 16px 0 20px 0;
    }

    .os-parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .os-party-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      overflow: hidden;
    }

    .os-party-header {
      background: #f1f5f9;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .os-party-header i { color: #3b82f6; font-size: 13px; }

    .os-party-body {
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .os-party-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
    .os-party-row .lbl { color: #64748b; }
    .os-party-row .val { color: #0f172a; text-align: right; }
    .os-party-row .bold { font-weight: 600; }

    .os-equip-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .os-equip-header {
      background: #f1f5f9;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .os-equip-header i { color: #3b82f6; }

    .os-equip-details {
      padding: 10px 12px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .os-equip-item { display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
    .os-equip-item.full { grid-column: span 3; }
    .os-equip-item .lbl { font-size: 11px; color: #64748b; }
    .os-equip-item .val { color: #0f172a; font-weight: 500; }
    .os-equip-item .bold { font-weight: 600; }

    .os-section {
      margin-bottom: 20px;
    }

    .os-section-header {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .os-section-header i { color: #3b82f6; }

    .os-service-details-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .os-service-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
    }
    .os-service-title { font-size: 14px; font-weight: 700; color: #0f172a; }
    .os-category-tag {
      font-size: 11px;
      background: #eff6ff;
      color: #2563eb;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .os-desc-content {
      font-size: 12px;
      color: #334155;
      line-height: 1.5;
    }
    .os-desc-content strong { display: block; font-size: 11px; color: #64748b; margin-bottom: 2px; }
    .os-desc-content p { margin: 0; }

    .os-laudo-content {
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      padding: 8px 10px;
      border-radius: 4px;
    }

    .os-obs-content {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 8px 10px;
      border-radius: 4px;
    }

    .os-pricing-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .os-pricing-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .os-pricing-table td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .os-pricing-table .col-unit, .os-pricing-table .col-total { text-align: right; }
    .os-pricing-table .col-qty { text-align: center; }

    .os-financial-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 8px 8px;
      font-size: 12px;
    }
    .os-payment-status { color: #15803d; font-weight: 500; display: flex; align-items: center; gap: 6px; }

    .os-financial-summary .os-summary-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .os-subtotal-row { display: flex; gap: 16px; color: #64748b; font-size: 12px; }
    .os-total-row { display: flex; gap: 16px; font-size: 14px; font-weight: 800; color: #0f172a; }
    .os-total-row .total-amount { color: #2563eb; }

    .os-warranty-section {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      background: #fafafa;
      margin-bottom: 24px;
    }
    .os-warranty-header {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .os-warranty-text {
      margin: 0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }

    .os-signatures-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 36px;
      margin-bottom: 20px;
    }

    .os-signature-block {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .os-sign-line {
      width: 80%;
      height: 1px;
      background: #94a3b8;
      margin-bottom: 6px;
    }
    .os-sign-person { font-size: 12px; font-weight: 700; color: #0f172a; }
    .os-sign-sub { font-size: 11px; color: #64748b; }
    .os-sign-date { font-size: 10px; color: #94a3b8; margin-top: 4px; }

    .os-document-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      margin-top: 16px;
    }
    .os-footer-content {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }

    /* ==========================================================================
       PRINT MEDIA QUERY (PRINT ONLY THE A4 DOCUMENT)
       ========================================================================== */
    @media print {
      body * {
        visibility: hidden !important;
      }

      .no-print {
        display: none !important;
      }

      .os-preview-backdrop,
      .tcc-os-print-document,
      .tcc-os-print-document * {
        visibility: visible !important;
      }

      .os-preview-backdrop {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: auto !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .os-preview-modal-box {
        background: transparent !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        max-width: 100% !important;
        height: auto !important;
      }

      .os-preview-modal-body {
        background: transparent !important;
        padding: 0 !important;
      }

      .tcc-os-print-document {
        box-shadow: none !important;
        max-width: 100% !important;
        border: none !important;
        border-radius: 0 !important;
      }

      .os-doc-page {
        padding: 0 !important;
        color: #000000 !important;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }

    @media (max-width: 768px) {
      .tcc-service-card { flex-direction: column; align-items: flex-start; }
      .tcc-service-actions { width: 100%; justify-content: flex-end; }
      .tcc-modal-info-list { grid-template-columns: 1fr; }
      .tcc-modal-info-item.full-width { grid-column: span 1; }
      .os-parties-grid { grid-template-columns: 1fr; }
      .os-equip-details { grid-template-columns: 1fr; }
      .os-signatures-container { grid-template-columns: 1fr; gap: 24px; }
    }
  `]
})
export class ServicosListComponent implements OnInit {
  @Input() servicos: Servico[] = [];
  
  first: number = 0;
  rows: number = 8;

  get paginatedServicos(): Servico[] {
    if (!this.servicos) return [];
    if (this.first >= this.servicos.length && this.servicos.length > 0) {
      this.first = 0;
    }
    return this.servicos.slice(this.first, this.first + this.rows);
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  menuItems: MenuItem[] = [];
  selectedItem: Servico | null = null;
  servicoDetalhes: Servico | null = null;
  osPreviewModal: boolean = false;

  clienteDetalhado: Cliente | null = null;
  equipamentoDetalhado: Equipamento | null = null;

  nomeTecnico = 'Gustavo de Souza';
  dataEmissaoAtual = '';
  dataHoraImpressao = '';

  get nomeTecnicoFormatado(): string {
    if (!this.nomeTecnico) return 'Técnico Responsável';
    if (this.nomeTecnico.includes('@')) {
      const prefix = this.nomeTecnico.split('@')[0];
      if (prefix.toLowerCase().includes('gudesouza')) {
        return 'Gustavo de Souza';
      }
      return prefix
        .replace(/[._-]/g, ' ')
        .split(' ')
        .filter(w => w.length > 0)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return this.nomeTecnico;
  }

  private authService = inject(AuthService, { optional: true });
  private clienteService = inject(ClienteService);
  private equipamentoService = inject(EquipamentoService);
  private servicoService = inject(ServicoService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  ngOnInit(): void {
    this.atualizarDatas();
    if (this.authService) {
      this.authService.user$.subscribe((user: any) => {
        if (user && (user.name || user.given_name || user.nickname)) {
          this.nomeTecnico = user.name || user.given_name || user.nickname;
        }
      });
    }
  }

  atualizarDatas(): void {
    const agora = new Date();
    const dia = agora.getDate().toString().padStart(2, '0');
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    
    this.dataEmissaoAtual = `${dia}/${mes}/${ano}`;
    this.dataHoraImpressao = `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  }

  getNumeroOS(servico: Servico | null): string {
    if (!servico) return 'OS-202608-0001';
    const idNum = servico.id ? String(servico.id).replace(/\D/g, '') : '';
    const padded = idNum ? idNum.padStart(4, '0') : '1001';
    return `OS-202608-${padded}`;
  }

  getStatusPillClass(status?: string): string {
    switch (status) {
      case 'Concluído': return 'os-status-concluido';
      case 'Em Andamento': return 'os-status-andamento';
      case 'Pendente': return 'os-status-pendente';
      case 'Cancelado': return 'os-status-cancelado';
      default: return 'os-status-pendente';
    }
  }

  getBadgeIcon(status?: string): string {
    switch (status) {
      case 'Concluído': return 'pi-check-circle';
      case 'Em Andamento': return 'pi-spin pi-spinner';
      case 'Pendente': return 'pi-clock';
      case 'Cancelado': return 'pi-times-circle';
      default: return 'pi-info-circle';
    }
  }

  abrirMenu(event: Event, menu: any, servico: Servico): void {
    event.stopPropagation();
    this.selectedItem = servico;
    this.menuItems = [
      {
        label: 'Ver Detalhes',
        icon: 'pi pi-eye',
        command: () => this.abrirDetalhes(servico)
      },
      {
        label: 'Visualizar / Imprimir OS',
        icon: 'pi pi-print',
        command: () => this.abrirPreviewOS(servico)
      },
      {
        label: 'Editar Serviço',
        icon: 'pi pi-pencil',
        command: () => this.editarServico(servico)
      },
      {
        separator: true
      },
      {
        label: 'Marcar como Concluído',
        icon: 'pi pi-check',
        disabled: servico.status === 'Concluído',
        command: () => this.updateStatus(servico, 'Concluído')
      },
      {
        label: 'Cancelar Serviço',
        icon: 'pi pi-times',
        disabled: servico.status === 'Cancelado',
        command: () => this.updateStatus(servico, 'Cancelado')
      }
    ];
    menu.toggle(event);
  }

  abrirDetalhes(servico: Servico): void {
    this.servicoDetalhes = servico;
    this.carregarDetalhesExtras(servico);
  }

  fecharDetalhes(): void {
    this.servicoDetalhes = null;
  }

  editarServico(servico: Servico): void {
    this.fecharDetalhes();
    const identifier = servico.id ? String(servico.id) : servico.titulo;
    this.router.navigate(['/painel/servicos', identifier, 'edit']);
  }

  abrirPreviewOS(servico: Servico): void {
    this.selectedItem = servico;
    this.atualizarDatas();
    this.carregarDetalhesExtras(servico);
    this.osPreviewModal = true;
  }

  fecharPreviewOS(): void {
    this.osPreviewModal = false;
  }

  imprimirOS(): void {
    window.print();
  }

  private carregarDetalhesExtras(servico: Servico): void {
    this.clienteDetalhado = null;
    this.equipamentoDetalhado = null;

    if (!servico) return;

    // Buscar dados completos do cliente
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        const clienteEncontrado = clientes.find(c =>
          c.nome?.toLowerCase() === servico.cliente?.toLowerCase() ||
          (c as any).nome_completo?.toLowerCase() === servico.cliente?.toLowerCase()
        );
        if (clienteEncontrado) {
          this.clienteDetalhado = clienteEncontrado;
          
          // Se temos cliente e equipamentoId, busca detalhes do equipamento
          const eqId = servico.equipamento_id || (servico as any).equipamentoId;
          if (eqId && clienteEncontrado.id) {
            this.equipamentoService.getEquipamentosPorCliente(String(clienteEncontrado.id)).subscribe({
              next: (equipamentos) => {
                const eq = equipamentos.find(e => String(e.id) === String(eqId));
                if (eq) {
                  this.equipamentoDetalhado = eq;
                }
              }
            });
          }
        }
      }
    });
  }

  updateStatus(servico: Servico, newStatus: 'Concluído' | 'Em Andamento' | 'Pendente' | 'Cancelado') {
    const updatedServico: Servico = { ...servico, status: newStatus };
    const idKey = servico.id ? String(servico.id) : servico.titulo;
    this.servicoService.updateServico(updatedServico, idKey).subscribe({
      next: (updated) => {
        const index = this.servicos.findIndex(s => (s.id && s.id === servico.id) || s.titulo === servico.titulo);
        if (index !== -1) {
          this.servicos[index] = { ...this.servicos[index], ...updated, status: newStatus };
        }
        if (this.servicoDetalhes && ((this.servicoDetalhes.id && this.servicoDetalhes.id === servico.id) || this.servicoDetalhes.titulo === servico.titulo)) {
          this.servicoDetalhes.status = newStatus;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Status Atualizado',
          detail: `Status alterado para "${newStatus}"`
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível atualizar o status. Tente novamente.'
        });
      }
    });
  }

  formatarData(data: any): string {
    if (!data) return '—';
    if (data instanceof Date) {
      const d = data.getDate().toString().padStart(2, '0');
      const m = (data.getMonth() + 1).toString().padStart(2, '0');
      const y = data.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const str = String(data);
    if (str.includes('/')) {
      return str;
    }
    if (str.includes('-')) {
      const partes = str.split('T')[0].split('-');
      if (partes.length === 3) {
        if (partes[0].length === 4) {
          return `${partes[2]}/${partes[1]}/${partes[0]}`;
        } else {
          return `${partes[0]}/${partes[1]}/${partes[2]}`;
        }
      }
    }
    return str;
  }

  formatarValor(valor: any): string {
    if (valor === undefined || valor === null) return '—';
    const str = String(valor).trim();
    if (str.startsWith('R$')) {
      return str;
    }
    const num = parseFloat(str.replace(/[^\d.,-]/g, '').replace(',', '.'));
    if (isNaN(num)) {
      return str;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Concluído': return 'status-concluido';
      case 'Em Andamento': return 'status-andamento';
      case 'Pendente': return 'status-pendente';
      case 'Cancelado': return 'status-cancelado';
      default: return '';
    }
  }
}