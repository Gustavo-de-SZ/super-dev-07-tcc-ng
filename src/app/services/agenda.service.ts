import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../models/agendamento';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.configService.getApiUrl()}/agendamentos`);
  }

  addAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(`${this.configService.getApiUrl()}/agendamentos`, agendamento);
  }

  updateAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.configService.getApiUrl()}/agendamentos/${agendamento.id}`, agendamento);
  }

  deleteAgendamento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.configService.getApiUrl()}/agendamentos/${id}`);
  }
}