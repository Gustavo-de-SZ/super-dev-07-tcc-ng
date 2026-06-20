import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitacao } from '../models/solicitacao';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root')
export class SolicitacaoService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  createSolicitacao(data: Solicitacao): Observable<Solicitacao> {
    return this.http.post<Solicitacao>(`${this.configService.getApiUrl()}/solicitacoes`, data);
  }

  // Optional: get all solicitacoes
  getSolicitacoes(): Observable<Solicitacao[]> {
    return this.http.get<Solicitacao[]>(`${this.configService.getApiUrl()}/solicitacoes`);
  }
}