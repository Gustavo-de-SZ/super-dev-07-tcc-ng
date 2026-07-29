import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-pendente-aprovacao',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden text-center p-8">
        <div class="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
           <i class="pi pi-clock text-4xl"></i>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">Conta em Análise</h1>

        <p class="text-gray-600 mb-8">
          Seu cadastro como técnico foi recebido com sucesso. Nossa equipe está analisando suas informações.
          Você receberá um e-mail assim que sua conta for aprovada para começar a usar a plataforma.
        </p>

        <button (click)="logout()" class="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Sair
        </button>
      </div>
    </div>
  `
})
export class PendenteComponent {
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}