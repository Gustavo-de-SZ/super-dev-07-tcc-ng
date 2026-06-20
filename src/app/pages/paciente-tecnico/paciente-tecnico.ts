import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { RegistroStatusTag } from '../../../core/components/registro-status-tag/registro-status-tag';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoFocus } from 'primeng/autofocus';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PacienteResponseModel, PacienteCriarRequestModel, PacienteEditarRequestModel } from '../../../models/paciente.model';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FluidModule } from 'primeng/fluid';
import { PacienteService } from '../../../services/paciente.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-paciente-tecnico',
  standalone: true,
  imports: [
    ButtonModule, SelectModule, TableModule, RegistroStatusTag, FormsModule, AutoFocus, DialogModule, InputTextModule,
    InputMaskModule, DatePickerModule, TextareaModule, FluidModule, ReactiveFormsModule
  ],
  template: `
    <div class="space-y-6">

        <div class="flex justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Pacientes</h1>
                <p class="text-gray-600">Gerenciamento de pacientes</p>
            </div>

            <p-button label="Novo Paciente" icon="fa fa-plus" (onClick)="showDialog()"></p-button>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="flex flex-row gap-4">
                <input pInputText placeholder="Busca por nome, cpf, telefone" fluid [(ngModel)]="pesquisa"
                    [pAutoFocus]="true">

                <p-select [options]="filtros" [(ngModel)]="filtroSelecionado"></p-select>
            </div>
        </div>

        <p-table [value]="pacientes" [tableStyle]="{ 'min-width': '50rem' }" [paginator]="true" [rows]="10"
            [rowsPerPageOptions]="[10, 20, 30]">
            <ng-template #header>
                <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>
                        <div class="text-right">Ações</div>
                    </th>
                </tr>
            </ng-template>
            <ng-template #body let-paciente>
                <tr>
                    <td>{{ paciente.nome }}</td>
                    <td>{{ paciente.cpf }}</td>
                    <td>{{ paciente.telefone }}</td>
                    <td>
                        <app-registro-status-tag [status]="paciente.status ? 'ATIVO' : 'INATIVO'" />
                    </td>
                    <td>
                        <div class="flex gap-1 justify-end">
                            <p-button icon="fa-regular fa-pen-to-square" variant="text" severity="info" (click)="abrirModalEditar(paciente)" />

                            @if(paciente.status){
                                <p-button icon="fa-solid fa-person-circle-xmark" variant="text" severity="danger" (click)="confirmarInativar(paciente)" />
                            } @else {
                                <p-button icon="fa-solid fa-user-check" variant="text" severity="success" (click)="confirmarAtivacao(paciente)" />
                            }
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>

    <p-dialog header="Cadastro de Paciente" [modal]="true" [(visible)]="visible" [style]="{ width: '50rem' }">
        <form [formGroup]="pacienteForm">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div class="md:col-span-2">
                    <label for="nome" class="font-semibold w-24">Nome <span class="font-bold text-red-700">*</span></label>
                    <input pInputText id="nome" class="flex-auto" autocomplete="off" fluid formControlName="nome" />
                    @if(pacienteForm.get("nome")?.touched && pacienteForm.get("nome")?.hasError("required")){
                    <small class="text-red-600">
                        Nome é obrigatório
                    </small>
                    } @else if(pacienteForm.get("nome")?.touched && pacienteForm.get("nome")?.hasError("minlength")){
                    <small class="text-red-600">
                        Nome deve ter no mínimo 3 caracteres.
                    </small>
                    } @else if(pacienteForm.get("nome")?.touched && pacienteForm.get("nome")?.hasError("maxlength")){
                    <small class="text-red-600">
                        Nome deve ter no máximo 255 caracteres.
                    </small>
                    }
                </div>

                <div>
                    <label for="cpf" class="font-semibold w-24">CPF <span class="font-bold text-red-700">*</span></label>
                    <p-inputmask mask="999.999.999-99" placeholder="999.999.999-99" fluid id="cpf" formControlName="cpf" />
                    @if(pacienteForm.get("cpf")?.touched && pacienteForm.get("cpf")?.hasError("required")){
                    <small class="text-red-600">CPF é obrigatório</small>
                    } @else if(pacienteForm.get("cpf")?.touched && pacienteForm.get("cpf")?.hasError("maxlength")){
                    <small class="text-red-600">CPF deve ter no máximo 14 caracteres.</small>
                    }
                </div>
                <div>
                    <label for="dataNascimento" class="font-semibold w-24">Data de Nascimento <span
                            class="font-bold text-red-700">*</span></label>
                    <p-date-picker fluid id="dataNascimento" formControlName="dataNascimento" />
                    @if(pacienteForm.get("dataNascimento")?.touched && pacienteForm.get("dataNascimento")?.hasError("required")){
                    <small class="text-red-600">Data de nascimento é obrigatório</small>
                    }
                </div>
                <div>
                    <label for="telefone" class="font-semibold w-24">Telefone <span
                            class="font-bold text-red-700">*</span></label>
                    <p-inputmask mask="(99) 99999-9999" placeholder="(99) 99999-9999" fluid id="telefone"
                        formControlName="telefone" />
                    @if(pacienteForm.get("telefone")?.touched && pacienteForm.get("telefone")?.hasError("maxlength")){
                    <small class="text-red-600">Telefone deve ter no máximo 15 caracteres.</small>
                    }
                </div>

                <div>
                    <label for="email" class="font-semibold w-24">E-mail</label>
                    <input pInputText id="email" type="email" class="flex-auto" autocomplete="off" fluid
                        formControlName="email" />
                    @if(pacienteForm.get("email")?.touched && pacienteForm.get("email")?.hasError("maxlength")){
                    <small class="text-red-600">E-mail deve ter no máximo 255 caracteres.</small>
                    } @else if(pacienteForm.get("email")?.touched && pacienteForm.get("email")?.hasError("email")){
                    <small class="text-red-600">E-mail inválido.</small>
                    }
                </div>

                <div class="md:col-span-2">
                    <label for="endereco" class="font-semibold w-24">Endereço</label>
                    <input pInputText id="endereco" class="flex-auto" autocomplete="off" fluid formControlName="endereco" />
                    @if(pacienteForm.get("endereco")?.touched && pacienteForm.get("endereco")?.hasError("maxlength")){
                    <small class="text-red-600">Endereço deve ter no máximo 255 caracteres.</small>
                    }
                </div>

                <div class="md:col-span-2">
                    <label for="observacoes" class="font-semibold w-24">Observações</label>
                    <textarea rows="5" cols="30" pTextarea fluid formControlName="observacoes" id="observacoes"></textarea>
                </div>
            </div>

            <div class="flex justify-end gap-2">
                <p-button label="Cancelar" severity="secondary" (click)="cancelar()" />
                <p-button label="Salvar" icon="fa fa-save" (click)="salvar()" [disabled]="pacienteForm.invalid" />
            </div>
        </form>
    </p-dialog>
  `,
})
export class PacienteTecnico {
  private readonly formBuilder = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  idEditar: string | undefined = undefined;
  filtros = ["Todos", "Ativos", "Inativos"];
  filtroSelecionado: string = "Todos";
  pesquisa: string = "";
  visible: boolean = false;
  pacientes: PacienteResponseModel[] = [];

  pacienteForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    telefone: ['', [Validators.required, Validators.maxLength(15)]],
    cpf: ['', [Validators.required, Validators.maxLength(14)]],
    dataNascimento: ['', [Validators.required]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    endereco: ['', [Validators.maxLength(255)]],
    observacoes: [''],
  });

  constructor() {
    this.carregarPacientes();
  }

  carregarPacientes() {
    this.pacienteService.getAll().subscribe({
      next: (pacientes: PacienteResponseModel[]) => {
        this.pacientes = pacientes;
      },
      error: (erro: Error) => {
        console.log(`Erro ao carregar pacientes ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao carregar os pacientes"
        });
      }
    });
  }

  showDialog(): void {
    this.idEditar = undefined;
    this.pacienteForm.reset();
    this.pacienteForm.get('cpf')?.enable();
    this.pacienteForm.get('dataNascimento')?.enable();
    this.visible = true;
  }

  cancelar() {
    this.visible = false;
    this.pacienteForm.reset();
    this.idEditar = undefined;
  }

  salvar() {
    if (this.idEditar === undefined) {
      const form: PacienteCriarRequestModel = {
        nome: this.pacienteForm.getRawValue().nome!,
        cpf: this.pacienteForm.getRawValue().cpf!,
        telefone: this.pacienteForm.getRawValue().telefone!,
        endereco: this.pacienteForm.getRawValue().endereco || '',
        email: this.pacienteForm.getRawValue().email || '',
        data_nascimento: this.formatarData(this.pacienteForm.getRawValue().dataNascimento),
        observacoes: this.pacienteForm.getRawValue().observacoes || '',
      };
      this.cadastrar(form);
    } else {
      const form: PacienteEditarRequestModel = {
        nome: this.pacienteForm.getRawValue().nome!,
        telefone: this.pacienteForm.getRawValue().telefone!,
        endereco: this.pacienteForm.getRawValue().endereco || '',
        email: this.pacienteForm.getRawValue().email || '',
        observacoes: this.pacienteForm.getRawValue().observacoes || '',
      };
      this.editar(form);
    }
  }

  private formatarData(data: any): string {
    if (!data) return '';
    if (data instanceof Date) {
      return data.toISOString().split('T')[0];
    }
    return String(data);
  }

  cadastrar(form: PacienteCriarRequestModel) {
    this.pacienteService.create(form).subscribe({
      next: () => {
        this.visible = false;
        this.pacienteForm.reset();
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Paciente cadastrado com sucesso"
        });
        this.carregarPacientes();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar cadastrar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao cadastrar paciente"
        });
      }
    });
  }

  editar(form: PacienteEditarRequestModel) {
    this.pacienteService.update(this.idEditar!, form).subscribe({
      next: () => {
        this.visible = false;
        this.pacienteForm.reset();
        this.idEditar = undefined;
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Paciente alterado com sucesso"
        });
        this.carregarPacientes();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar alterar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao alterar paciente"
        });
      }
    });
  }

  abrirModalEditar(paciente: PacienteResponseModel) {
    this.idEditar = paciente.id;
    this.pacienteService.getById(paciente.id).subscribe({
      next: (dados) => {
        this.pacienteForm.patchValue({
          nome: dados.nome,
          cpf: dados.cpf,
          telefone: dados.telefone,
          endereco: dados.endereco,
          email: dados.email,
          dataNascimento: dados.data_nascimento,
          observacoes: dados.observacoes,
        });
        this.pacienteForm.get('cpf')?.disable();
        this.pacienteForm.get('dataNascimento')?.disable();
        this.visible = true;
      },
      error: (erro: Error) => {
        console.log(`Erro ao buscar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao buscar dados do paciente"
        });
      }
    });
  }

  confirmarAtivacao(paciente: PacienteResponseModel) {
    this.confirmationService.confirm({
      message: `Deseja ativar o paciente '${paciente.nome}'?`,
      header: 'Cuidado',
      icon: 'fa fa-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Ativar',
        severity: 'success'
      },
      accept: () => {
        this.ativar(paciente);
      }
    });
  }

  confirmarInativar(paciente: PacienteResponseModel) {
    this.confirmationService.confirm({
      message: `Deseja inativar o paciente '${paciente.nome}'?`,
      header: 'Cuidado',
      icon: 'fa fa-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Inativar',
        severity: 'danger'
      },
      accept: () => {
        this.inativar(paciente);
      }
    });
  }

  ativar(paciente: PacienteResponseModel) {
    this.pacienteService.ativar(paciente.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Paciente ativado com sucesso"
        });
        this.carregarPacientes();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar ativar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao ativar paciente"
        });
      }
    });
  }

  inativar(paciente: PacienteResponseModel) {
    this.pacienteService.inativar(paciente.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Paciente inativado com sucesso"
        });
        this.carregarPacientes();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar inativar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao inativar paciente"
        });
      }
    });
  }
}