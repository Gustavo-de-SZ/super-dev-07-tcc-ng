import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { SidebarAdmin } from '../../../shared/components/sidebar-admin/sidebar-admin';
import { TopbarAdmin } from '../../../shared/components/topbar/topbar-admin';

@Component({
  selector: 'app-painel-admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    SidebarAdmin, 
    TopbarAdmin
  ],
  template: `
    <div class="tcc-layout-container">
      <app-sidebar-admin></app-sidebar-admin>

      <div class="tcc-main-wrapper">
        <div class="tcc-topbar-container">
          <app-topbar-admin></app-topbar-admin>
        </div>
        <main class="tcc-content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .tcc-layout-container {
      display: flex;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: var(--tcc-bg, #f8fafc); 
    }

    .tcc-main-wrapper {
      flex: 1; 
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .tcc-topbar-container {
      padding: 0 32px;
      background-color: var(--tcc-surface, #ffffff); 
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-content-area {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      
      &::-webkit-scrollbar {
        width: 8px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background-color: var(--tcc-border, #e2e8f0);
        border-radius: 4px;
      }
    }
  `]
})
export class PainelAdminLayout {}
