import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servico } from '../models/servico';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getServicos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.configService.getApiUrl()}/servicos`);
  }

  getServicoByTitle(titulo: string): Observable<Servico> {
    return this.http.get<Servico>(`${this.configService.getApiUrl()}/servicos/${titulo}`);
  }

  addServico(servico: Servico): Observable<Servico> {
    return this.http.post<Servico>(`${this.configService.getApiUrl()}/servicos`, servico);
  }

  updateServico(servico: Servico): Observable<Servico> {
    return this.http.put<Servico>(`${this.configService.getApiUrl()}/servicos/${servico.titulo}`, servico);
  }

  deleteServico(titulo: string): Observable<void> {
    return this.http.delete<void>(`${this.configService.getApiUrl()}/servicos/${titulo}`);
  }
}