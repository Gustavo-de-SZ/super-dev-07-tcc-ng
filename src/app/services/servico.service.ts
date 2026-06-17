import { Injectable } from '@angular/core';
import { Servico } from '../models/servico';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  private servicos: Servico[] = [
    { icone: 'pi-wifi', titulo: 'Configuração de Rede Wi-Fi', status: 'Concluído', cliente: 'Maria Silva', data: '01/06/2026', duracao: '2h', valor: 180 },
    { icone: 'pi-desktop', titulo: 'Formatação e Reinstalação do Windows', status: 'Em Andamento', cliente: 'João Santos', data: '05/06/2026', duracao: '3h', valor: 250 },
    { icone: 'pi-database', titulo: 'Troca de HD por SSD', status: 'Pendente', cliente: 'Ana Costa', data: '07/06/2026', duracao: '1.5h', valor: 320 },
    { icone: 'pi-shield', titulo: 'Instalação de Antivírus Corporativo', status: 'Pendente', cliente: 'Carlos Souza', data: '08/06/2026', duracao: '1h', valor: 200 },
    { icone: 'pi-print', titulo: 'Configuração de Impressora em Rede', status: 'Concluído', cliente: 'Fernanda Lima', data: '28/05/2026', duracao: '1h', valor: 120 },
    { icone: 'pi-laptop', titulo: 'Manutenção Preventiva Notebook', status: 'Cancelado', cliente: 'Ricardo Alves', data: '25/05/2026', duracao: '2h', valor: 150 },
    { icone: 'pi-desktop', titulo: 'Suporte Remoto — Lentidão no sistema', status: 'Em Andamento', cliente: 'Patrícia Rocha', data: '08/06/2026', duracao: '1h', valor: 90 },
    { icone: 'pi-shield', titulo: 'Instalação de Câmeras de Segurança', status: 'Pendente', cliente: 'Bruno Mendes', data: '10/06/2026', duracao: '4h', valor: 480 }
  ];

  getServicos(): Servico[] {
    return this.servicos;
  }

  getServicoByTitle(titulo: string): Servico | undefined {
    return this.servicos.find(servico => servico.titulo === titulo);
  }

  addServico(servico: Servico): void {
    this.servicos.push(servico);
  }

  updateServico(servico: Servico): void {
    const index = this.servicos.findIndex(s => s.titulo === servico.titulo);
    if (index !== -1) {
      this.servicos[index] = servico;
    }
  }

  deleteServico(titulo: string): void {
    this.servicos = this.servicos.filter(servico => servico.titulo !== titulo);
  }
}