import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { Solicitacao } from '../../models/solicitacao';

interface EquipamentoOption {
  label: string;
  value: string;
}

interface UrgenciaOption {
  label: string;
  value: string;
}

interface PreferenciaOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-nova-solicitacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputMaskModule,
    ButtonModule,
    SelectModule,
    DialogModule,
    TextareaModule,
    RouterModule
  ],
  templateUrl: './nova-solicitacao.html',
  providers: [MessageService]
})
export class NovaSolicitacao {
  // Following the exact pattern from the model for dependency injection
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly solicitacaoService = inject(SolicitacaoService);
  private readonly router = inject(Router);

  // Options for dropdowns
  equipamentoOptions: EquipamentoOption[] = [
    { label: 'Desktop', value: 'Desktop' },
    { label: 'Notebook', value: 'Notebook' },
    { label: 'Servidor', value: 'Servidor' },
    { label: 'Rede', value: 'Rede' }
  ];

  urgenciaOptions: UrgenciaOption[] = [
    { label: 'Baixa', value: 'Baixa' },
    { label: 'Média', value: 'Média' },
    { label: 'Alta', value: 'Alta' }
  ];

  preferenciaOptions: PreferenciaOption[] = [
    { label: 'Remoto', value: 'Remoto' },
    { label: 'Presencial', value: 'Presencial' }
  ];

  // Form following the exact validation patterns from the model
  solicitacaoForm = this.formBuilder.group({
    equipamento: ['', Validators.required],
    urgencia: ['', Validators.required],
    descricao: ['', [Validators.required, Validators.maxLength(255)]],
    preferencia: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.solicitacaoForm.valid) {
      const formData = this.solicitacaoForm.getRawValue();

      this.solicitacaoService.createSolicitacao({
        equipamento: formData.equipamento!,
        urgencia: formData.urgencia!,
        descricao: formData.descricao!,
        preferencia: formData.preferencia!
      }).subscribe({
        next: (response) => {
          console.log('Solicitação criada:', response);
          this.messageService.add({
            severity: "success",
            summary: "Show de bola!",
            detail: "Solicitação criada com sucesso"
          });
          this.router.navigate(['/cliente/inicio']);
          this.limpar();
        },
        error: (err) => {
          console.error('Erro ao criar solicitação', err);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Ocorreu um erro ao criar solicitação"
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.solicitacaoForm.markAllAsTouched();
      this.messageService.add({
        severity: "error",
        summary: "Erro",
        detail: "Por favor, preencha todos os campos obrigatórios corretamente"
      });
    }
  }

  limpar() {
    this.solicitacaoForm.reset();
  }

  cancelar() {
    this.limpar();
    this.router.navigate(['/cliente/inicio']);
  }
}