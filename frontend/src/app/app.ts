import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-column bg-slate-100">
      <app-navbar class="no-print"></app-navbar>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      <footer class="py-3 text-center border-top-1 border-slate-200 text-xs text-slate-500 no-print bg-white">
        Cahier de Vente Digitalise &bull; Magasin &copy; 2026
      </footer>
    </div>
  `
})
export class App {}