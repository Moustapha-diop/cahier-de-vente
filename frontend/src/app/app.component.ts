import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-column">
      <app-navbar></app-navbar>
      <main class="flex-grow-1">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit {
  ngOnInit() {
    this.removeLicenseWatermark();
  }

  private removeLicenseWatermark() {
    const clean = () => {
      document.querySelectorAll('div').forEach(el => {
        if (el.textContent && el.textContent.includes('Invalid PrimeUI License')) {
          el.remove();
        }
      });
    };
    clean();
    setTimeout(clean, 500);
    setTimeout(clean, 1500);
    setTimeout(clean, 3000);

    const observer = new MutationObserver(clean);
    observer.observe(document.body, { childList: true, subtree: true });
  }
}