import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';
import { ConfigService } from './config.service';

export interface ClientesStats {
  total: number;
  ativosEsteMes: number;
  novosEsteMes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.configService.getApiUrl()}/clientes`);
  }

  getClienteByEmail(email: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.configService.getApiUrl()}/clientes/${email}`);
  }

  getClientesStats(): Observable<ClientesStats> {
    return this.http.get<ClientesStats>(`${this.configService.getApiUrl()}/clientes/stats`);
  }

  addCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.configService.getApiUrl()}/clientes`, cliente);
  }
 
  addClienteTecnico(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.configService.getApiUrl()}/clientes/tecnico`, cliente);
  }



  updateCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.configService.getApiUrl()}/clientes/${cliente.email}`, cliente);
  }

  deleteCliente(email: string): Observable<void> {
    return this.http.delete<void>(`${this.configService.getApiUrl()}/clientes/${email}`);
  }
}