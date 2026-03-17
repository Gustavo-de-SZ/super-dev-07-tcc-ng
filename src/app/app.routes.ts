import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';

export const routes: Routes = [
    {path: '', loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage)},
];
