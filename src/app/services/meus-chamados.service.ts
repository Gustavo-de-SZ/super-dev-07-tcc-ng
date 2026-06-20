import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chamado } from '../models/chamado';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class MeusChamadosService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getChamados(): Observable<Chamado[]> {
    return this.http.get<Chamado[]>(`${this.configService.getApiUrl()}/chamados`);
  }
}