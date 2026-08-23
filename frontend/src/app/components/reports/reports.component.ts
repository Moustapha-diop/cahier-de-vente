import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenteService } from '../../services/vente.service';
import { RapportResponse, LigneVente } from '../../models/vente.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ChartModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private venteService = inject(VenteService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  selectedType: string = 'MOIS';
  dateRef: string = this.formatDate(new Date());
  dateDebut: string = this.formatDate(new Date());
  dateFin: string = this.formatDate(new Date());

  rapport: RapportResponse | null = null;
  loading: boolean = false;

  periodeTypes = [
    { label: 'Journee', value: 'JOUR', icon: 'pi pi-calendar' },
    { label: 'Semaine', value: 'SEMAINE', icon: 'pi pi-calendar-plus' },
    { label: 'Mois', value: 'MOIS', icon: 'pi pi-calendar-times' },
    { label: 'Annee', value: 'ANNEE', icon: 'pi pi-calendar' },
    { label: 'Personnalise', value: 'PERSONNALISE', icon: 'pi pi-filter' }
  ];

  // Pagination for Report Table
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  get totalItems(): number {
    return this.rapport?.lignes?.length || 0;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get paginatedLignes(): LigneVente[] {
    if (!this.rapport?.lignes) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rapport.lignes.slice(start, start + this.pageSize);
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

  // Chart configuration
  chartData: any = null;
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1e293b',
          font: { weight: '600', family: 'Inter, sans-serif' }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b' },
        grid: { color: '#f1f5f9' }
      },
      y: {
        ticks: { color: '#64748b' },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  ngOnInit() {
    this.chargerRapport();
  }

  formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectType(type: string) {
    this.selectedType = type;
    this.currentPage = 1;
    this.chargerRapport();
  }

  chargerRapport() {
    this.loading = true;
    this.cdr.detectChanges();
    this.venteService.getRapport(this.selectedType, this.dateRef, this.dateDebut, this.dateFin).subscribe({
      next: (data) => {
        this.rapport = data;
        this.currentPage = 1;
        this.updateChart();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger le rapport.' });
      }
    });
  }

  updateChart() {
    if (!this.rapport?.breakdown) return;
    const labels = this.rapport.breakdown.map(b => b.label);
    const ventes = this.rapport.breakdown.map(b => b.totalVentes);
    const benefices = this.rapport.breakdown.map(b => b.totalBenefice);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Total Ventes (FCFA)',
          data: ventes,
          backgroundColor: '#3b82f6',
          borderRadius: 6
        },
        {
          label: 'Benefice Realise (FCFA)',
          data: benefices,
          backgroundColor: '#10b981',
          borderRadius: 6
        }
      ]
    };
    this.cdr.detectChanges();
  }

  imprimerFacture() {
    window.print();
  }
}