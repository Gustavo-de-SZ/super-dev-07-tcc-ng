import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class HomeClienteService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getFavoritos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.configService.getApiUrl()}/profissionais/favoritos`);
  }

  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.configService.getApiUrl()}/categorias`);
  }
}