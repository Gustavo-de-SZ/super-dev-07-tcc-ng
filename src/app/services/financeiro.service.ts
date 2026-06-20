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
}