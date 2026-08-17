export interface Chamado {
  id: number;
  equipamento?: string;
  titulo?: string;
  status: string;
  dataCriacao?: string;
  data_criacao?: string;
  descricao_problema?: string;
  categoria_id?: number;
  categoria_nome?: string;
  cliente_id?: number;
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_email?: string;
  cliente_endereco?: string;
  profissional_id?: number | null;
  profissional_nome?: string | null;
  profissional_endereco?: string | null;
  tipo_atendimento?: string | null;
  anexo?: string | null;
  avaliacao_nota?: number | null;
  avaliacao_comentario?: string | null;
  avaliado_em?: string | null;
}