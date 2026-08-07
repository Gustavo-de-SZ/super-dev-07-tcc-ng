import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

export interface AdminEstatisticas {
  total_tecnicos: number;
  tecnicos_pendentes: number;
  tecnicos_aprovados: number;
  total_clientes: number;
  total_chamados: number;
  total_servicos: number;
}

export interface TecnicoAdmin {
  id: number;
  usuario_id: number;
  nome_fantasia: string;
  cnpj: string;
  telefone: string;
  descricao_servicos?: string;
  aprovado_pelo_admin: boolean;
  criado_em: string;
  email?: string;
  ativo?: boolean;
  total_chamados?: number;
  total_servicos?: number;
}

export interface ClienteAdmin {
  id: number;
  usuario_id: number;
  nome_completo: string;
  telefone?: string;
  email?: string;
  empresa?: string;
  criado_em?: string;
  total_chamados?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private auth: AuthService
  ) {}

  private getHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  getEstatisticas(): Observable<AdminEstatisticas> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.get<AdminEstatisticas>(`${this.config.getApiUrl()}/admin/estatisticas`, {
          headers: this.getHeaders(token)
        })
      )
    );
  }

  getTecnicos(statusFilter: 'todos' | 'pendente' | 'aprovado' = 'todos', q?: string): Observable<TecnicoAdmin[]> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        let params = new HttpParams().set('status_filter', statusFilter);
        if (q && q.trim()) {
          params = params.set('q', q.trim());
        }
        return this.http.get<TecnicoAdmin[]>(`${this.config.getApiUrl()}/admin/tecnicos`, {
          headers: this.getHeaders(token),
          params
        });
      })
    );
  }

  getTecnicoPorId(id: number): Observable<TecnicoAdmin> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.get<TecnicoAdmin>(`${this.config.getApiUrl()}/admin/tecnicos/${id}`, {
          headers: this.getHeaders(token)
        })
      )
    );
  }

  aprovarTecnico(id: number): Observable<any> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.patch<any>(`${this.config.getApiUrl()}/admin/tecnicos/${id}/aprovar`, {}, {
          headers: this.getHeaders(token)
        })
      )
    );
  }

  rejeitarTecnico(id: number): Observable<any> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.patch<any>(`${this.config.getApiUrl()}/admin/tecnicos/${id}/rejeitar`, {}, {
          headers: this.getHeaders(token)
        })
      )
    );
  }

  getClientes(q?: string): Observable<ClienteAdmin[]> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        let params = new HttpParams();
        if (q && q.trim()) {
          params = params.set('q', q.trim());
        }
        return this.http.get<ClienteAdmin[]>(`${this.config.getApiUrl()}/admin/clientes`, {
          headers: this.getHeaders(token),
          params
        });
      })
    );
  }

  // Compatibilidade com código legado
  getTodosTecnicos(): Observable<TecnicoAdmin[]> {
    return this.getTecnicos('todos');
  }

  getTecnicosPendentes(): Observable<TecnicoAdmin[]> {
    return this.getTecnicos('pendente');
  }

  getEstatisticasDashboard(): Observable<{ pendentes: number; totalTecnicos: number; totalClientes: number }> {
    return this.getEstatisticas().pipe(
      switchMap((stats: AdminEstatisticas) => [
        {
          pendentes: stats.tecnicos_pendentes,
          totalTecnicos: stats.total_tecnicos,
          totalClientes: stats.total_clientes
        }
      ])
    );
  }
}
