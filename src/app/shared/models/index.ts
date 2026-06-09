//models e interfaces

export interface Agendamento {
  id?: string;
  mes?: string;
  dia: string;
  hora: string;
  titulo?: string;
  empresa?: string;
  servico?: string;
  cliente?: string;
  status: StatusAgendamento;
  duracao?: string;
  tipo?: TipoAgendamento;
}

export type StatusAgendamento =
  | 'Confirmado'
  | 'Pendente'
  | 'Concluído'
  | 'Cancelado'
  | 'concluido'
  | 'pendente';

export type TipoAgendamento = 'Presencial' | 'Remoto';

export interface Profissional {
  id?: string;
  nome: string;
  especialidade: string;
  nota: number;
  avaliacoes: number;
  tempoResposta: string;
  local: string;
  status: StatusUsuario;
}

export type StatusUsuario = 'online' | 'offline';

export interface StatCard {
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;
  corClasse: string;
}

export interface UsuarioInfo {
  nome: string;
  cargo: string;
  temNotificacao?: boolean;
  email?: string;
  avatar?: string;
}

export interface NavItem {
  label: string;
  icon: string;
  routerLink: string;
}
