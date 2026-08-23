import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VenteService } from '../../services/vente.service';
import { JourneeSummary } from '../../models/vente.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-closure-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './closure-history.component.html'
})
export class ClosureHistoryComponent implements OnInit {
  private venteService = inject(VenteService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  historique: JourneeSummary[] = [];
  loading: boolean = false;

  // Pagination for History
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  get totalItems(): number {
    return this.historique.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get paginatedHistorique(): JourneeSummary[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.historique.slice(start, start + this.pageSize);
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
      next: (dates: string[]) => {
        if (!dates || dates.length === 0) {
          this.historique = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const summaries: JourneeSummary[] = [];
        let count = 0;

        dates.forEach((d: string) => {
          this.venteService.getJournee(d).subscribe({
            next: (s: JourneeSummary) => {
              summaries.push(s);
              count++;
              if (count === dates.length) {
                summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                this.historique = summaries;
                this.loading = false;
                this.cdr.detectChanges();
              }
            },
            error: () => {
              count++;
              if (count === dates.length) {
                this.historique = summaries;
                this.loading = false;
                this.cdr.detectChanges();
              }
            }
          });
        });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ouvrirJournee(date: string) {
    this.router.navigate(['/cahier'], { queryParams: { date } });
  }
}