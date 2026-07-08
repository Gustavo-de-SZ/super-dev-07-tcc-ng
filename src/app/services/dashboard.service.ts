import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatCard } from '../models/stat-card';
import { Agendamento } from '../models/agendamento';
import { ConfigService } from './config.service';

interface DashboardData {
  stats: StatCard[];
  agendamentos: Agendamento[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.configService.getApiUrl()}/dashboard`);
  }

  // Alternative: separate endpoints
  getStats(): Observable<StatCard[]> {
    return this.http.get<StatCard[]>(`${this.configService.getApiUrl()}/clientes/stats`);
  }

  getAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.configService.getApiUrl()}/agendamentos`);
  }
}