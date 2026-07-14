# Plano de Implementação: Criação de Perfis Pós-Cadastro com Auth0

## Objetivo
Implementar mecanismo para criar automaticamente perfis de cliente ou técnico no backend imediatamente após o cadastro/authentication via Auth0, com base no papel (role) atribuído ao usuário.

## Flogo de Trabalho Proposto

### 1. Fluxo de Autenticação e Criação de Perfil
```
[Usuário se cadastra via Auth0 Lock/Universal Login]
        ↓
[Auth0 executa Action/Rule que define app_metadata.roles = ['cliente'] ou ['tecnico']]
        ↓
[Usuário é redirecionado para o SPA após login]
        ↓
[SPA verifica se perfil já existe no backend]
        ↓
[Se não existir, cria perfil apropriado (cliente/tecnico) baseado no role]
        ↓
[Usuário é redirecionado para dashboard adequado]
```

### 2. Implementação no Frontend

#### Arquivos a serem modificados/criados:
1. `src/app/services/profile.service.ts` - Novo serviço para gerenciamento de perfis
2. `src/app/app.component.ts` - Verificação de perfil na inicialização do app
3. `src/app/services/auth.service.ts` - Extensão do método `getToken` para incluir verificação de perfil

#### Passo a passo da implementação:

**Passo 1: Criar ProfileService**
```typescript
// src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
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
      const payloadBase64 = token.split('.')[1];
      const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64Padding);
      const payload = JSON.parse(payloadJson);
      console.log('Profile Service Token payload:', payload);
    } catch (e) {
      console.error('Failed to decode token payload', e);
    }
  }

  verificarPerfilExistente(): Observable<ProfileResponse> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
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
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
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
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
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
```

**Passo 2: Modificar AppComponent para verificação na inicialização**
```typescript
// src/app/app.component.ts
import { Component } from '@angular/core';
import { ProfileService } from './services/profile.service';
import { AuthService } from './services/auth.service';
import { filter, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  constructor(
    private profileService: ProfileService,
    private auth: AuthService
  ) {
    this.verificarECriarPerfilSeNecessario();
  }

  private verificarECriarPerfilSeNecessario(): void {
    // Aguarda autenticação confirmada
    this.auth.isAuthenticated$.pipe(
      filter(authenticated => authenticated),
      take(1),
      switchMap(() => this.auth.user$.pipe(take(1)))
    ).subscribe(user => {
      if (user) {
        this.profileService.verificarPerfilExistente().subscribe({
          next: (response) => {
            if (!response.exists) {
              // Perfil não existe, criar baseado no role
              const roles = user['https://tcc-ng.com/roles'] || [];
              const userRole = roles.length > 0 ? roles[0] : 'tecnico'; // padrão para tecnico
              
              let perfilData: any = {
                email: user.email,
                nome: user.name || user.given_name || 'Usuário'
              };

              if (userRole.toLowerCase() === 'cliente') {
                this.profileService.criarPerfilCliente(perfilData).subscribe({
                  next: (cliente) => {
                    console.log('Perfil de cliente criado:', cliente);
                    // Opcional: marcar no app_metadata que perfil foi criado
                  },
                  error: (err) => console.error('Erro ao criar perfil de cliente:', err)
                });
              } else {
                // Assumindo tecnico como padrão
                this.profileService.criarPerfilTecnico(perfilData).subscribe({
                  next: (tecnico) => {
                    console.log('Perfil de técnico criado:', tecnico);
                  },
                  error: (err) => console.error('Erro ao criar perfil de técnico:', err)
                });
              }
            }
          },
          error: (err) => console.error('Erro ao verificar perfil:', err)
        });
      }
    });
  }
}
```

**Passo 3: Melhorar AuthService (opcional)**
```typescript
// src/app/services/auth.service.ts - Adicionar método para forçar renovação de token após criação de perfil
import { Injectable, inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ... código existente ...

  /**
   * Força renovação de token útil após criação de perfil
   * para garantir que o usuário tenha as claims mais recentes
   */
  getTokenFresh(): Promise<string> {
    return this.auth0.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      },
      // Força busca do token ignora cache
      ignoreCache: true
    }).toPromise();
  }
}
```

### 3. Implementação no Backend (Assumindo Node.js/Express)

#### Endpoints necessários:
```javascript
// GET /api/usuarios/perfil/verificar
app.get('/usuarios/perfil/verificar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub; // Auth0 user ID
    
    // Verificar se existe cliente
    const clienteExistente = await Cliente.findOne({ where: { email: user.email } });
    if (clienteExistente) {
      return res.json({ exists: true, type: 'cliente' });
    }
    
    // Verificar se existe técnico
    const tecnicoExistente = await Tecnico.findOne({ where: { email: user.email } });
    if (tecnicoExistente) {
      return res.json({ exists: true, type: 'tecnico' });
    }
    
    res.json({ exists: false, type: null });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clientes (já existe no cliente.service)
app.post('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/tecnicos (novo endpoint necessário)
app.post('/api/tecnicos', authenticateToken, async (req, res) => {
  try {
    const tecnico = await Tecnico.create(req.body);
    res.status(201).json(tecnico);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 4. Configuração do Auth0 (Alternativa/Complemento)

Se preferir fazer tudo server-side via Auth0 Actions:

**Criar Action: "Post User Registration"**
```javascript
// Auth0 Action: post-user-registration
exports.onExecutePostUserRegistration = async (event, api) => {
  const { user, secrets } = event;
  
  // Lógica para determinar se é cliente ou tecnico
  // Exemplo: baseado em domínio de email ou durante o fluxo de signup
  const isCliente = determinaSeEhCliente(user); 
  
  // Definir role no app_metadata
  const role = isCliente ? 'cliente' : 'tecnico';
  api.appMetadata.set('roles', [role]);
  
  // OPTIONAL: Chamar nossa API para criar perfil imediatamente
  try {
    await fetch(`${secrets.API_URL}/usuarios/perfil/criar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secrets.M2M_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        type: role
      })
    });
  } catch (error) {
    console.error('Falha ao criar perfil via API:', error);
    // Não interromper o fluxo de login - perfil pode ser criado no frontend
  }
};
```

### 5. Considerações de Segurança e Boas Práticas

1. **Prevenção de Race Conditions**:
   - O endpoint de verificação deve ser idempotente
   - Usar constraints únicas no banco (ex: email único na tabela clientes/tecnicos)
   - Considerar uso de transações ou bloqueios otimistas

2. **Tratamento de Erros**:
   - Se falhar na criação do perfil, permitir que o usuário continue (tentativa nova no próximo login)
   - Log detalhado para debug em ambiente de staging
   - Notificação admin para falhas críticas de criação de perfil

3. **Performance**:
   - Cache do resultado da verificação por breve período (ex: 5 minutos) usando sessionStorage
   - Executar verificação apenas uma vez por sessão de login

4. **Experiência do Usuário**:
   - Mostrar indicador de carregamento durante verificação
   - Redirecionamento suave para dashboard apropriado após criação do perfil
   - Mensagem amigável caso necessite de informações adicionais do perfil

### 6. Integração com Código Existente

- **Navbar Component**: Já lê roles de `user['https://tcc-ng.com/roles']` - nada a alterar
- **Serviços Existentes**: Todos já foram corrigidos para incluir headers de autenticação adequados
- **Rotas**: 
  - `/cliente/inicio` → para usuários com role 'cliente'
  - `/painel/dashboard` → para usuários com role 'tecnico' (padrão)

### 7. Testes Recomendados

1. **Fluxo de Novo Usuário Cliente**:
   - Registrar novo usuário com e-mail indicando cliente
   - Verificar se perfil cliente é criado em `/api/clientes`
   - Confirmar redirecionamento para `/cliente/inicio`

2. **Fluxo de Novo Usuário Técnico**:
   - Registrar novo usuário com e-mail indicando técnico
   - Verificar se perfil técnico é criado em `/api/tecnicos`
   - Confirmar redirecionamento para `/painel/dashboard`

3. **Fluxo de Usuário Existente**:
   - Fazer login com usuário que já tem perfil
   - Verificar que nenhuma tentativa de criação é feita
   - Confirmar redirecionamento direto ao dashboard apropriado

4. **Edge Cases**:
   - Tentativa de criação de perfil duplicado
   - Falha de rede durante verificação/criação
   - Usuário sem role definido (deve padrão para tecnico)

Este plano aproveita a infraestrutura de autenticação já estabelecida, minimiza alterações no código existente e fornece uma solução robusta para a criação automática de perfis pós-cadastro.