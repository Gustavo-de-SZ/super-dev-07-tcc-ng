import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Cliente } from '../models/cliente';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

interface Tecnico {
  nome: string;
  email: string;
  especialidades?: string[];
  // outros campos específicos de técnico
}

interface ProfileResponse {
  exists: boolean;
  type: 'cliente' | 'tecnico' | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private auth: AuthService
  ) {}

  private logTokenPayload(token: string): void {
    try {
      // Decode the JWT payload (second part)
      const payloadBase64 = token.split('.')[1];
      // Replace URL-safe characters
      const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64Padding);
      const payload = JSON.parse(payloadJson);
      console.log('Profile Service Token payload:', payload);
    } catch (e) {
      console.error('Failed to decode token payload', e);
    }
  }

  verificarPerfilExistente(): Observable<ProfileResponse> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.get<ProfileResponse>(`${this.configService.getApiUrl()}/usuarios/perfil/verificar`, {
          headers: {
            Authorization: `Bearer${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  criarPerfilCliente(clienteData: Partial<Cliente>): Observable<Cliente> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.post<Cliente>(`${this.configService.getApiUrl()}/clientes`, clienteData, {
          headers: {
            Authorization: `Bearer${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  criarPerfilTecnico(tecnicoData: Partial<Tecnico>): Observable<Tecnico> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.post<Tecnico>(`${this.configService.getApiUrl()}/tecnicos`, tecnicoData, {
          headers: {
            Authorization: `Bearer${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }
}