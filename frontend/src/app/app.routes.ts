import { Routes } from '@angular/router';
import { DailyBookComponent } from './components/daily-book/daily-book.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ClosureHistoryComponent } from './components/closure-history/closure-history.component';

export const routes: Routes = [
  { path: '', redirectTo: 'cahier', pathMatch: 'full' },
  { path: 'cahier', component: DailyBookComponent },
  { path: 'rapports', component: ReportsComponent },
  { path: 'historique', component: ClosureHistoryComponent },
  { path: '**', redirectTo: 'cahier' }
];