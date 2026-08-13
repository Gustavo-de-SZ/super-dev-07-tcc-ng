import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Equipamento } from '../models/equipamento';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EquipamentoService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private auth = inject(AuthService);

  getEquipamentosPorCliente(clienteId: string): Observable<Equipamento[]> {
    return this.auth.getToken().pipe(
      switchMap(token => this.http.get<Equipamento[]>(
        `${this.configService.getApiUrl()}/clientes/${clienteId}/equipamentos`,
        { headers: { Authorization: `Bearer ${token}` } }
      ))
    );
  }

  addEquipamento(equipamento: Equipamento, clienteId: string): Observable<Equipamento> {
    return this.auth.getToken().pipe(
      switchMap(token => this.http.post<Equipamento>(
        `${this.configService.getApiUrl()}/clientes/${clienteId}/equipamentos`,
        equipamento,
        { headers: { Authorization: `Bearer ${token}` } }
      ))
    );
  }

  updateEquipamento(equipamento: Equipamento, clienteId: string, equipamentoId: string): Observable<Equipamento> {
    return this.auth.getToken().pipe(
      switchMap(token => this.http.put<Equipamento>(
        `${this.configService.getApiUrl()}/clientes/${clienteId}/equipamentos/${equipamentoId}`,
        equipamento,
        { headers: { Authorization: `Bearer ${token}` } }
      ))
    );
  }

  deleteEquipamento(clienteId: string, equipamentoId: string): Observable<void> {
    return this.auth.getToken().pipe(
      switchMap(token => this.http.delete<void>(
        `${this.configService.getApiUrl()}/clientes/${clienteId}/equipamentos/${equipamentoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ))
    );
  }
}