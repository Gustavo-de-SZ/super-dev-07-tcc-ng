import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PacienteResponseModel, PacienteCriarRequestModel, PacienteEditarRequestModel } from '../models/paciente.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getAll(): Observable<PacienteResponseModel[]> {
    return this.http.get<PacienteResponseModel[]>(`${this.configService.getApiUrl()}/pacientes`);
  }

  create(data: PacienteCriarRequestModel): Observable<PacienteResponseModel> {
    return this.http.post<PacienteResponseModel>(`${this.configService.getApiUrl()}/pacientes`, data);
  }

  update(id: string, data: PacienteEditarRequestModel): Observable<PacienteResponseModel> {
    return this.http.put<PacienteResponseModel>(`${this.configService.getApiUrl()}/pacientes/${id}`, data);
  }

  getById(id: string): Observable<PacienteResponseModel> {
    return this.http.get<PacienteResponseModel>(`${this.configService.getApiUrl()}/pacientes/${id}`);
  }

  ativar(id: string): Observable<void> {
    return this.http.put<void>(`${this.configService.getApiUrl()}/pacientes/${id}/ativar`, {});
  }

  inativar(id: string): Observable<void> {
    return this.http.put<void>(`${this.configService.getApiUrl()}/pacientes/${id}/inativar`, {});
  }
}