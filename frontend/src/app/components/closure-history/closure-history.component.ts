import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VenteService } from '../../services/vente.service';
import { JourneeSummary } from '../../models/vente.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-closure-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './closure-history.component.html',
  styles: []
})
export class ClosureHistoryComponent implements OnInit {
  private venteService = inject(VenteService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  dates: string[] = [];
  historiqueList: JourneeSummary[] = [];
  loading: boolean = false;

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  get totalItems(): number {
    return this.historiqueList.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get paginatedList(): JourneeSummary[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.historiqueList.slice(start, start + this.pageSize);
  }

  get startRecordIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecordIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.cdr.detectChanges();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.chargerHistorique();
  }

  chargerHistorique() {
    this.loading = true;
    this.cdr.detectChanges();
    this.venteService.getHistoriqueDates().subscribe({
      next: (dates) => {
        this.dates = dates;
        if (!dates || dates.length === 0) {
          this.historiqueList = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const promises = dates.map(d => this.venteService.getJournee(d).toPromise());
        Promise.all(promises).then((summaries) => {
          this.historiqueList = (summaries.filter(s => !!s) as JourneeSummary[])
            .sort((a, b) => b.date.localeCompare(a.date));
          this.loading = false;
          this.cdr.detectChanges();
        }).catch(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger l\'historique.' });
      }
    });
  }

  consulterJournee(date: string) {
    this.router.navigate(['/cahier'], { queryParams: { date: date } });
  }
}