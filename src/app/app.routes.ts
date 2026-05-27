import { Routes } from '@angular/router';

export const routes: Routes = [
{path: '', loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage)},
{path: 'painel',loadComponent: () => import('./core/painel-layout/painel-layout').then(m => m.PainelLayout),
    children: [
      {path: 'dashboard', loadComponent: () => import('./pages/dashboard-tecnico/dashboard-tecnico').then(m => m.DashboardTecnico)}
     
    ]},

  { path: '**', redirectTo: '' }
];