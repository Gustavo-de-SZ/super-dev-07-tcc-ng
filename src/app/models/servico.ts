export interface Servico {
  id?: string | number;
  icone: string;
  categoria: 'Redes' | 'Hardware' | 'Software' | 'Segurança' | 'Impressoras' | 'Outros' | string;
  titulo: string;
  status: 'Concluído' | 'Em Andamento' | 'Pendente' | 'Cancelado' | string;
  cliente: string;
  data: string;
  duracao: string;
  valor: string | number;
  descricao?: string;
  tipo_atendimento?: 'Presencial' | 'Remoto' | string;
  garantia?: string;
  laudo_tecnico?: string;
  observacoes?: string;
  // ID do equipamento vinculado a este serviço (opcional)
  equipamentoId?: string | number;
  equipamento_id?: string | number;
  origem_agendamento_id?: string | number;
}