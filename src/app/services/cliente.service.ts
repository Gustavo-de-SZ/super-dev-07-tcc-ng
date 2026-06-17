import { Injectable } from '@angular/core';
import { Cliente } from '../models/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private clientes: Cliente[] = [
    {
      nome: 'Maria Silva',
      empresa: 'Tech Solutions LTDA',
      avaliacao: 5.0,
      email: 'maria@techsolutions.com',
      telefone: '(11) 98765-4321',
      local: 'São Paulo, SP',
      servicosAtivos: 2,
      servicosConcluidos: 15
    },
    {
      nome: 'João Santos',
      empresa: 'Consultoria ABC',
      avaliacao: 4.8,
      email: 'joao@consultoriaabc.com',
      telefone: '(11) 91234-5678',
      local: 'São Paulo, SP',
      servicosAtivos: 1,
      servicosConcluidos: 8
    },
    {
      nome: 'Ana Costa',
      empresa: 'Empresa XYZ',
      avaliacao: 5.0,
      email: 'ana@empresaxyz.com',
      telefone: '(11) 99876-5432',
      local: 'Campinas, SP',
      servicosAtivos: 0,
      servicosConcluidos: 12
    }
  ];

  getClientes(): Cliente[] {
    return this.clientes;
  }

  getClienteByEmail(email: string): Cliente | undefined {
    return this.clientes.find(cliente => cliente.email === email);
  }

  addCliente(cliente: Cliente): void {
    this.clientes.push(cliente);
  }

  updateCliente(cliente: Cliente): void {
    const index = this.clientes.findIndex(c => c.email === cliente.email);
    if (index !== -1) {
      this.clientes[index] = cliente;
    }
  }

  deleteCliente(email: string): void {
    this.clientes = this.clientes.filter(cliente => cliente.email !== email);
  }
}