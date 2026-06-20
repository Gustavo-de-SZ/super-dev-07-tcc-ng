import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';
import { ConfigService } from './config.service';

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

  addCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.configService.getApiUrl()}/clientes`, cliente);
  }

  updateCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.configService.getApiUrl()}/clientes/${cliente.email}`, cliente);
  }

  deleteCliente(email: string): Observable<void> {
    return this.http.delete<void>(`${this.configService.getApiUrl()}/clientes/${email}`);
  }
}