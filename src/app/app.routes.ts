import { Routes } from '@angular/router';

export const routes: Routes = [
{path: '', loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage)},
{path: 'painel',loadComponent: () => import('./core/painel-layout/painel-layout').then(m => m.PainelLayout),
    children: [
      {path: 'dashboard', loadComponent: () => import('./pages/dashboard-tecnico/dashboard-tecnico').then(m => m.DashboardTecnico)},
      {path: 'agenda', loadComponent: () => import('./pages/agenda-tecnico/agenda-tecnico').then(m => m.AgendaTecnico)},
      {path: 'servicos', loadComponent: () => import('./pages/servicos-tecnico/servicos-tecnico').then(m => m.ServicosTecnico)},
      {path: 'financeiro', loadComponent: () => import('./pages/financeiro-tecnico/financeiro-tecnico').then(m => m.FinanceiroTecnico)},
      {path: 'clientes', loadComponent: () => import('./pages/clientes-tecnico/clientes-tecnico').then(m => m.ClientesTecnico)},
      {path: 'agenda/novo', loadComponent: () => import('./pages/agenda-tecnico/components/agenda-create').then(m => m.NovoAgendamento)},
      {path: 'servicos/novo', loadComponent: () => import('./pages/servicos-tecnico/components/servicos-create').then(m => m.NovoServico)},
      {path: 'clientes/novo', loadComponent: () => import('./pages/clientes-tecnico/components/cliente-tecnico-create').then(m => m.NovoCliente)}

    ]},

{
    path: 'cliente',
    loadComponent: () => import('./core/painel-layout/layout-cliente/layout-cliente').then(m => m.PainelClienteLayout),
    children: [
      { path: 'inicio', loadComponent: () => import('./pages/home-cliente/home-cliente').then(m => m.ClienteInicioComponent) },
      { path: 'solicitacao', loadComponent: () => import('./pages/nova-solicitacao/nova-solicitacao').then(m => m.NovaSolicitacao) },
      { path: 'meus-chamados', loadComponent: () => import('./pages/meus-chamados/meus-chamados').then(m => m.MeusChamados) }
    ]},
  { path: '**', redirectTo: '' }
];