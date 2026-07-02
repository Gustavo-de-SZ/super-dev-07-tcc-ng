import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transacao } from '../models/transacao';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getTransacoes(): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.configService.getApiUrl()}/transacoes`);
  }

  addTransacao(transacao: Transacao): Observable<Transacao> {
    return this.http.post<Transacao>(`${this.configService.getApiUrl()}/transacoes`, transacao);
  }

  updateTransacao(transacao: Transacao): Observable<Transacao> {
    return this.http.put<Transacao>(`${this.configService.getApiUrl()}/transacoes/${transacao.titulo}`, transacao);
  }

  deleteTransacao(titulo: string): Observable<void> {
    return this.http.delete<void>(`${this.configService.getApiUrl()}/transacoes/${titulo}`);
  }
}