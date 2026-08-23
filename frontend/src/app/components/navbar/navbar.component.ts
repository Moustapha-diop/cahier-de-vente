import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule],
  template: `
    <header class="navbar px-4 py-3 bg-white border-bottom-1 border-slate-200 shadow-1">
      <div class="flex align-items-center justify-content-between max-w-7xl mx-auto">
        <!-- Logo & Titre Magasin -->
        <div class="flex align-items-center gap-3">
          <div class="flex align-items-center justify-content-center border-round-xl bg-blue-600 text-white font-bold shadow-2" style="width: 44px; height: 44px; font-size: 1.3rem;">
            <i class="pi pi-book"></i>
          </div>
          <div>
            <div class="flex align-items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900 m-0">Cahier de Vente</h1>
              <span class="text-xs px-2 py-1 border-round-md bg-blue-50 text-blue-700 font-bold border-1 border-blue-200">Magasin</span>
            </div>
            <p class="text-xs text-slate-500 m-0 font-medium">Gestion simplifiee des ventes et benefices</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex align-items-center gap-2">
          <a routerLink="/cahier" routerLinkActive="active-tab" [routerLinkActiveOptions]="{exact: true}"
             class="nav-tab flex align-items-center gap-2 px-3 py-2 border-round-lg text-sm font-semibold text-slate-700 no-underline transition-colors transition-duration-150">
            <i class="pi pi-pencil text-blue-600"></i>
            <span>Cahier du Jour</span>
          </a>

          <a routerLink="/rapports" routerLinkActive="active-tab"
             class="nav-tab flex align-items-center gap-2 px-3 py-2 border-round-lg text-sm font-semibold text-slate-700 no-underline transition-colors transition-duration-150">
            <i class="pi pi-chart-bar text-emerald-600"></i>
            <span>Rapports & Factures</span>
          </a>

          <a routerLink="/historique" routerLinkActive="active-tab"
             class="nav-tab flex align-items-center gap-2 px-3 py-2 border-round-lg text-sm font-semibold text-slate-700 no-underline transition-colors transition-duration-150">
            <i class="pi pi-history text-amber-600"></i>
            <span>Historique</span>
          </a>
        </nav>

        <!-- Right: Date info -->
        <div class="hidden sm:flex align-items-center gap-2 bg-slate-50 px-3 py-2 border-round-xl border-1 border-slate-200">
          <i class="pi pi-calendar text-slate-400"></i>
          <span class="text-sm font-semibold text-slate-700">{{ todayStr }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .nav-tab:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .nav-tab.active-tab {
      background-color: #eff6ff;
      color: #2563eb !important;
      border: 1px solid #bfdbfe;
    }
  `]
})
export class NavbarComponent {
  todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}