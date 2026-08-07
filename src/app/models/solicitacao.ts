export interface Solicitacao {
  id?: number;
  titulo: string;
  descricao_problema: string;
  categoria_id: number;
  anexo?: string;
  dataCriacao: string;
  cliente_nome?: string;
  profissional_nome?: string;
  status?: string;
}

export interface SolicitacaoResumo {
  total: number;
  andamento: number;
  concluidos: number;
  taxa_resolucao: number;
}
