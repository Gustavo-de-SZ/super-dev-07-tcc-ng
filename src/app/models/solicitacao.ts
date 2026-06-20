export interface Solicitacao {
  id?: number;
  equipamento: string;
  urgencia: string;
  descricao: string;
  preferencia: string;
  dataCriacao?: string;
  status?: string;
}