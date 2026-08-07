import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  ddd?: string;
  provedor?: 'viacep' | 'brasilapi';
}

export interface CnpjData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  telefone: string;
  email: string;
  cnaeFiscalDescricao?: string;
  situacaoCadastral?: string;
  provedor?: 'brasilapi' | 'minhareceita';
}

export interface MunicipioData {
  nome: string;
  uf: string;
  formatado: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultaExternaService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private municipiosCache$: Observable<MunicipioData[]> | null = null;

  private get baseUrl(): string {
    return `${this.configService.getApiUrl()}/externo`;
  }

  /**
   * Consulta dados de endereço a partir do CEP via proxy no backend.
   * Evita bloqueios de CORS, ad-blockers e aplica fallback inteligente.
   */
  consultarCep(cep: string | null | undefined): Observable<CepData | null> {
    if (!cep) return of(null);

    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return of(null);

    return this.http.get<CepData>(`${this.baseUrl}/cep/${clean}`).pipe(
      catchError(err => {
        console.warn('Erro ao consultar CEP via backend:', err);
        return of(null);
      })
    );
  }

  /**
   * Consulta dados cadastrais abertos de pessoa jurídica a partir do CNPJ via proxy no backend.
   */
  consultarCnpj(cnpj: string | null | undefined): Observable<CnpjData | null> {
    if (!cnpj) return of(null);

    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return of(null);

    return this.http.get<CnpjData>(`${this.baseUrl}/cnpj/${clean}`).pipe(
      catchError(err => {
        console.warn('Erro ao consultar CNPJ via backend:', err);
        return of(null);
      })
    );
  }

  /**
   * Consulta lista de municípios brasileiros (IBGE) via backend com cache automático.
   */
  consultarMunicipios(uf?: string, query?: string): Observable<MunicipioData[]> {
    let params = new HttpParams();
    if (uf) params = params.set('uf', uf);
    if (query) params = params.set('query', query);

    // Se for consulta sem filtros, reutiliza o stream com shareReplay
    if (!uf && !query) {
      if (!this.municipiosCache$) {
        this.municipiosCache$ = this.http.get<MunicipioData[]>(`${this.baseUrl}/municipios`).pipe(
          shareReplay(1),
          catchError(err => {
            console.warn('Erro ao carregar municípios:', err);
            return of([]);
          })
        );
      }
      return this.municipiosCache$;
    }

    return this.http.get<MunicipioData[]>(`${this.baseUrl}/municipios`, { params }).pipe(
      catchError(err => {
        console.warn('Erro ao filtrar municípios:', err);
        return of([]);
      })
    );
  }
}
