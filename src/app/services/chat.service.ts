import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

export interface UsuarioChatInfo {
  id?: number;
  auth0_id?: string;
  nome: string;
  email?: string;
  telefone?: string;
  tipo: 'CLIENTE' | 'PROFISSIONAL' | 'ADMIN' | string;
}

export interface ChatContexto {
  ticket_id: number;
  titulo: string;
  descricao_problema: string;
  status: string;
  anexo?: string;
  data_criacao: string;
  categoria_nome?: string;
  cliente?: UsuarioChatInfo;
  profissional?: UsuarioChatInfo;
  usuario_atual: UsuarioChatInfo;
  destinatario_nome: string;
  destinatario_tipo: string;
  destinatario_telefone?: string;
}

export interface Mensagem {
  id: number | string;
  ticketId: number | string;
  remetenteId: string;
  remetenteNome: string;
  remetenteTipo?: 'CLIENTE' | 'PROFISSIONAL' | 'ADMIN' | 'OUTRO' | string;
  texto: string;
  dataEnvio: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private auth = inject(AuthService);

  getContexto(ticketId: string): Observable<ChatContexto> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.get<ChatContexto>(`${this.config.getApiUrl()}/chat/${ticketId}/contexto`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      )
    );
  }

  getMensagens(ticketId: string): Observable<Mensagem[]> {
    return this.auth.getToken().pipe(
      switchMap(token => 
        this.http.get<any[]>(`${this.config.getApiUrl()}/chat/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          map(res => res.map(m => ({
            id: m.id,
            ticketId: m.ticket_id,
            remetenteId: m.remetente_id,
            remetenteNome: m.remetente_nome,
            remetenteTipo: m.remetente_tipo,
            texto: m.texto,
            dataEnvio: m.data_envio
          })))
        )
      ),
      catchError(() => of([]))
    );
  }

  enviarMensagem(ticketId: string, texto: string): Observable<Mensagem> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        const payload = { ticket_id: String(ticketId), texto: texto };
        
        return this.http.post<any>(`${this.config.getApiUrl()}/chat/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          map(m => ({
            id: m.id,
            ticketId: m.ticket_id,
            remetenteId: m.remetente_id,
            remetenteNome: m.remetente_nome,
            remetenteTipo: m.remetente_tipo,
            texto: m.texto,
            dataEnvio: m.data_envio
          }))
        );
      })
    );
  }

  enviarMensagemRole(ticketId: string, texto: string, meuUsuarioId: string, meuNome: string): Observable<Mensagem> {
    return this.enviarMensagem(ticketId, texto);
  }
}
