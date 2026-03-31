import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '../../shared/components/navbar.components';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ButtonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="tcc-wrapper tcc-intro-section">
      <div class="tcc-highlight-tag">Plataforma de Suporte de TI</div>

      <h1 class="tcc-main-title">
        Conectamos <span style="color: var(--tcc-primary)">empresas</span> e <br>
        <span style="color: var(--tcc-primary)">profissionais</span> de TI
      </h1>

      <p class="tcc-main-subtitle">
        A plataforma completa que une empresas que precisam de suporte <br>
        técnico com profissionais qualificados prontos para atender. Simples, <br>
        rápido e eficiente.
      </p>

      <div class="tcc-action-group">
        <p-button label="Buscar Suporte" icon="pi pi-arrow-right" iconPos="right" styleClass="tcc-btn-main px-4 py-3" [style]="{ padding: '12px 20px', gap: '10px' }"></p-button>
        <p-button label="Sou Profissional" icon="pi pi-briefcase" styleClass="tcc-btn-outline px-4 py-3" [style]="{ padding: '12px 20px', gap: '10px' }"></p-button>
      </div>

      <div class="tcc-features-layout">
        <div *ngFor="let f of infoItems" class="tcc-info-card">
          <div class="tcc-icon-container">
            <i class="pi" [ngClass]="f.icon"></i>
          </div>
          <h3 style="font-weight: 700; margin-bottom: 0.5rem; color: var(--tcc-text-main);">{{ f.title }}</h3>
          <p style="font-size: 0.95rem; margin: 0; color: var(--tcc-text-muted)">{{ f.description }}</p>
        </div>
      </div>
    </main>
  `
})
export class LandingPage {
  infoItems = [
    { icon: 'pi-users', title: '2.500+ Profissionais', description: 'Rede qualificada e verificada para atender sua demanda.' },
    { icon: 'pi-shield', title: '100% Seguro', description: 'Pagamentos protegidos e garantia de entrega do serviço.' },
    { icon: 'pi-bolt', title: 'Resposta Rápida', description: 'Atendimento técnico especializado em até 2 horas.' }
  ];
}