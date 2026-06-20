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
}