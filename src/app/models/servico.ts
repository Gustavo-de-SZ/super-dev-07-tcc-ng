export interface Servico {
  icone: string;
  titulo: string;
  status: 'Concluído' | 'Em Andamento' | 'Pendente' | 'Cancelado';
  cliente: string;
  data: string;
  duracao: string;
  valor: number;
}