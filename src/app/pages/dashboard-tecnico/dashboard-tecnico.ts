import { Component } from '@angular/core';
import { TopbarTecnico } from '../../shared/components/topbar/topbar';

@Component({
  selector: 'app-dashboard-tecnico',
  imports: [TopbarTecnico],
  template: ` <app-topbar-tecnico></app-topbar-tecnico> <p>dashboard-tecnico works!</p> `,
  styles: ``,
})
export class DashboardTecnico {}
