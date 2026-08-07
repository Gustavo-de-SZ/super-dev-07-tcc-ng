import { Agendamento } from '../../models/agendamento';

const MESES_MAP: { [key: string]: number } = {
  'janeiro': 0, 'jan': 0, '1': 0, '01': 0,
  'fevereiro': 1, 'fev': 1, '2': 1, '02': 1,
  'março': 2, 'marco': 2, 'mar': 2, '3': 2, '03': 2,
  'abril': 3, 'abr': 3, '4': 3, '04': 3,
  'maio': 4, 'mai': 4, '5': 4, '05': 4,
  'junho': 5, 'jun': 5, '6': 5, '06': 5,
  'julho': 6, 'jul': 6, '7': 6, '07': 6,
  'agosto': 7, 'ago': 7, '8': 7, '08': 7,
  'setembro': 8, 'set': 8, '9': 8, '09': 8,
  'outubro': 9, 'out': 9, '10': 9,
  'novembro': 10, 'nov': 10, '11': 10,
  'dezembro': 11, 'dez': 11, '12': 11
};

/**
 * Converte os campos (dia, mes, hora) de um agendamento para um objeto Date.
 */
export function parseAgendamentoDate(item: Partial<Agendamento> | null | undefined): Date | null {
  if (!item || !item.dia) return null;
  const diaStr = String(item.dia).trim();
  const horaStr = item.hora ? String(item.hora).trim() : '12:00';

  let hour = 12;
  let minute = 0;
  if (horaStr.includes(':')) {
    const [h, m] = horaStr.split(':').map(n => parseInt(n, 10) || 0);
    hour = h;
    minute = m;
  }

  // 1. Formato ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(diaStr)) {
    const parts = diaStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), hour, minute);
  }

  // 2. Formato DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(diaStr)) {
    const parts = diaStr.split('/');
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), hour, minute);
  }

  // 3. Formato DD/MM
  if (/^\d{1,2}\/\d{1,2}$/.test(diaStr)) {
    const parts = diaStr.split('/');
    const year = new Date().getFullYear();
    return new Date(year, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), hour, minute);
  }

  // 4. Formato número do dia ("15", "31") com campo mes ("Julho", "Agosto", etc.)
  const dayNum = parseInt(diaStr, 10);
  if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
    const mesStr = (item.mes || '').toLowerCase().trim();
    let monthNum = new Date().getMonth(); // padrão para mês atual

    if (MESES_MAP[mesStr] !== undefined) {
      monthNum = MESES_MAP[mesStr];
    }

    const currentYear = new Date().getFullYear();
    return new Date(currentYear, monthNum, dayNum, hour, minute);
  }

  return null;
}

/**
 * Retorna true se o agendamento está atrasado:
 * - Não foi 'Concluído' nem 'Cancelado'
 * - E a data é anterior ao dia de hoje (00:00)
 */
export function isAgendamentoAtrasado(item: Partial<Agendamento> | null | undefined): boolean {
  if (!item) return false;
  const status = item.status;
  if (status === 'Concluído' || status === 'Cancelado') {
    return false;
  }

  const date = parseAgendamentoDate(item);
  if (!date) return false;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

  // Se a data é anterior ao início de hoje, está atrasado
  return date.getTime() < startOfToday.getTime();
}

/**
 * Retorna true se o agendamento é para hoje ou futuro (não cancelado/concluído)
 */
export function isAgendamentoProximo(item: Partial<Agendamento> | null | undefined): boolean {
  if (!item) return false;
  const status = item.status;
  if (status === 'Cancelado' || status === 'Concluído') {
    return false;
  }

  const date = parseAgendamentoDate(item);
  if (!date) return true; // Se não conseguir parsear, mantém visível por segurança

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

  return date.getTime() >= startOfToday.getTime();
}
