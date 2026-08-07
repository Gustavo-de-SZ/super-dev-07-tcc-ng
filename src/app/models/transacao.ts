export interface Transacao {
  id?: number;
  titulo: string;
  cliente: string;
  data: string;
  valor: number;
  status: 'Pago' | 'Pendente';
  usuario_id?: number;
}

export interface TransacaoResumo {
  total_receita: number;
  a_receber: number;
  ticket_medio: number;
  pendentes_count: number;
  total_transacoes: number;
}