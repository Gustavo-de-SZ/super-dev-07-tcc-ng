import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';

export const routes: Routes = [
{path: '', loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage)},
{path: 'painel',
canActivate: [authGuardFn],
  loadComponent: () => import('./core/painel-layout/painel-layout').then(m => m.PainelLayout),
    children: [
      {path: 'dashboard', loadComponent: () => import('./pages/dashboard-tecnico/dashboard-tecnico').then(m => m.DashboardTecnico)},
      {path: 'agenda', loadComponent: () => import('./pages/agenda-tecnico/agenda-tecnico').then(m => m.AgendaTecnico)},
      {path: 'servicos', loadComponent: () => import('./pages/servicos-tecnico/servicos-tecnico').then(m => m.ServicosTecnico)},
      {path: 'financeiro', loadComponent: () => import('./pages/financeiro-tecnico/financeiro-tecnico').then(m => m.FinanceiroTecnico)},
      {path: 'clientes', loadComponent: () => import('./pages/clientes-tecnico/clientes-tecnico').then(m => m.ClientesTecnico)},
      {path: 'agenda/novo', loadComponent: () => import('./pages/agenda-tecnico/components/agenda-create').then(m => m.NovoAgendamento)},
      {path: 'agenda/:id/edit', loadComponent: () => import('./pages/agenda-tecnico/components/agenda-edit').then(m => m.EditarAgendamento)},
      {path: 'servicos/novo', loadComponent: () => import('./pages/servicos-tecnico/components/servicos-create').then(m => m.NovoServico)},
      {path: 'servicos/:id/edit', loadComponent: () => import('./pages/servicos-tecnico/components/servicos-edit').then(m => m.EditarServico)},
      {path: 'clientes/novo', loadComponent: () => import('./pages/clientes-tecnico/components/cliente-tecnico-create').then(m => m.NovoCliente)},
      {path: 'clientes/:email/edit', loadComponent: () => import('./pages/clientes-tecnico/components/cliente-edit').then(m => m.EditarCliente)}

    ]},

{
    path: 'cliente',
    canActivate: [authGuardFn],
    loadComponent: () => import('./core/painel-layout/layout-cliente/layout-cliente').then(m => m.PainelClienteLayout),
    children: [
      { path: 'inicio', loadComponent: () => import('./pages/home-cliente/home-cliente').then(m => m.ClienteInicioComponent) },
      { path: 'solicitacao', loadComponent: () => import('./pages/nova-solicitacao/nova-solicitacao-create').then(m => m.NovaSolicitacao) },
      { path: 'meus-chamados', loadComponent: () => import('./pages/meus-chamados/meus-chamados').then(m => m.MeusChamados) }
    ]},
  { path: '**', redirectTo: '' }
];