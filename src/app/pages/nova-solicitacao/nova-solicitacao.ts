import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { Solicitacao } from '../../models/solicitacao';

@Component({
  selector: 'app-nova-solicitacao',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header tcc-flex-between tcc-gap tcc-flex-wrap">
        <div class="tcc-flex-col">
          <a class="tcc-back-link" [routerLink]="['/cliente/inicio']">
            <i class="pi pi-arrow-left"></i> Voltar
          </a>
          <h1 class="tcc-title-lg">Nova Solicitação</h1>
          <p class="tcc-subtitle">Solicite um serviço de TI</p>
        </div>
      </header>

      <div class="tcc-card-base tcc-p-md">
        <form [formGroup]="solicitacaoForm" (ngSubmit)="onSubmit()">
          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Equipamento</label>
              <select class="tcc-input-base" formControlName="equipamento">
                <option value="" disabled selected>Selecione o equipamento...</option>
                <option>Desktop</option>
                <option>Notebook</option>
                <option>Servidor</option>
                <option>Rede</option>
              </select>
            </div>
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Urgência</label>
              <select class="tcc-input-base" formControlName="urgencia">
                <option value="" disabled selected>Selecione a urgência...</option>
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
              </select>
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group">
              <label class="tcc-form-label">Descrição do Problema</label>
              <textarea class="tcc-input-base" formControlName="descricao" rows="4" placeholder="Descreva o problema encontrado..."></textarea>
            </div>
          </div>

          <div class="tcc-form-row">
            <div class="tcc-form-group flex-2">
              <label class="tcc-form-label">Preferência de Atendimento</label>
              <select class="tcc-input-base" formControlName="preferencia">
                <option value="" disabled selected>Selecione a preferência...</option>
                <option>Remoto</option>
                <option>Presencial</option>
              </select>
            </div>
          </div>

          <div class="tcc-form-actions">
            <button type="button" class="tcc-btn-cancel" [routerLink]="['/cliente/inicio']">Cancelar</button>
            <button type="submit" class="tcc-btn-main">Criar Chamado</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; }
    .tcc-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
    .tcc-back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--tcc-text-muted, #64748b); cursor: pointer; margin-bottom: 8px; transition: color 0.2s; font-weight: 500; }
    .tcc-back-link:hover { color: var(--tcc-primary, #3b82f6); }
    .tcc-back-link i { font-size: 12px; }
    .tcc-title-lg { font-size: 28px; font-weight: 700; color: var(--tcc-text-main, #0f172a); margin: 0 0 6px 0; }
    .tcc-subtitle { color: var(--tcc-text-muted, #64748b); font-size: 16px; margin: 0; }
    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .tcc-form-row { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
    .tcc-form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
    .flex-2 { flex: 2; min-width: 300px; }
    .tcc-form-label { font-size: 14px; font-weight: 600; color: var(--tcc-text-main, #334155); }
    .tcc-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--tcc-border, #e2e8f0); }
  `]
})
export class NovaSolicitacao {
  solicitacaoForm: any; // Could be FormGroup but keeping any for simplicity

  constructor(
    private fb: FormBuilder,
    private solicitacaoService: SolicitacaoService,
    private router: Router
  ) {
    this.solicitacaoForm = this.fb.group({
      equipamento: ['', Validators.required],
      urgencia: ['', Validators.required],
      descricao: ['', Validators.required],
      preferencia: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.solicitacaoForm.valid) {
      this.solicitacaoService.createSolicitacao(this.solicitacaoForm.value).subscribe({
        next: (response) => {
          console.log('Solicitação criada:', response);
          // Optionally show a message or navigate
          this.router.navigate(['/cliente/inicio']);
        },
        error: (err) => {
          console.error('Erro ao criar solicitação', err);
          // Handle error (maybe show message)
        }
      });
    }
  }
}