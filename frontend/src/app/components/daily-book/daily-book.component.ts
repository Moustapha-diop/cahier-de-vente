import { Component, OnInit, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VenteService } from '../../services/vente.service';
import { JourneeSummary, LigneVente, LigneVenteRequest } from '../../models/vente.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-daily-book',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './daily-book.component.html',
  styleUrls: ['./daily-book.component.scss']
})
export class DailyBookComponent implements OnInit {
  private venteService = inject(VenteService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('produitInput') produitInputRef!: ElementRef;

  currentDate: string = this.formatDate(new Date());
  summary: JourneeSummary | null = null;
  loading: boolean = false;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  get totalItems(): number {
    return this.summary?.lignes?.length || 0;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get paginatedLignes(): LigneVente[] {
    if (!this.summary?.lignes) return [];
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.summary.lignes.slice(startIndex, startIndex + this.pageSize);
  }

  get startRecordIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecordIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
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

  onPageSizeChange(newSize: number) {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  // Formulaire de saisie rapide
  newQuantite: number = 1;
  newNomProduit: string = '';
  newMontantVendu: number | null = null;
  newBenefice: number | null = null;
  newNote: string = '';

  get previewTotalMontant(): number {
    const qte = this.newQuantite && this.newQuantite > 0 ? this.newQuantite : 1;
    return (this.newMontantVendu || 0) * qte;
  }

  get previewTotalBenefice(): number {
    const qte = this.newQuantite && this.newQuantite > 0 ? this.newQuantite : 1;
    return (this.newBenefice || 0) * qte;
  }

  // Modal d'edition
  editDialogVisible: boolean = false;
  selectedLigne: LigneVente | null = null;
  editQuantite: number = 1;
  editNomProduit: string = '';
  editMontantUnitaire: number = 0;
  editBeneficeUnitaire: number = 0;
  editNote: string = '';

  get editPreviewTotalMontant(): number {
    const qte = this.editQuantite && this.editQuantite > 0 ? this.editQuantite : 1;
    return (this.editMontantUnitaire || 0) * qte;
  }

  get editPreviewTotalBenefice(): number {
    const qte = this.editQuantite && this.editQuantite > 0 ? this.editQuantite : 1;
    return (this.editBeneficeUnitaire || 0) * qte;
  }

  // Modal de confirmation suppression
  deleteDialogVisible: boolean = false;
  ligneToDelete: LigneVente | null = null;

  // Modal de confirmation cloture
  clotureDialogVisible: boolean = false;
  isForcingReouverture: boolean = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.currentDate = params['date'];
      }
      this.chargerJournee();
    });
  }

  formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateChange() {
    if (this.currentDate) {
      this.currentPage = 1;
      this.chargerJournee();
    }
  }

  setToday() {
    this.currentDate = this.formatDate(new Date());
    this.currentPage = 1;
    this.chargerJournee();
  }

  changerJour(delta: number) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + delta);
    this.currentDate = this.formatDate(d);
    this.currentPage = 1;
    this.chargerJournee();
  }

  chargerJournee() {
    this.loading = true;
    this.cdr.detectChanges();
    this.venteService.getJournee(this.currentDate).subscribe({
      next: (data) => {
        this.summary = data;
        if (this.currentPage > this.totalPages) {
          this.currentPage = Math.max(1, this.totalPages);
        }
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.focusProduitInput(), 100);
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de contacter le serveur backend.'
        });
      }
    });
  }

  focusProduitInput() {
    if (this.produitInputRef && !this.summary?.cloturee) {
      this.produitInputRef.nativeElement.focus();
    }
  }

  ajouterLigne() {
    if (!this.newNomProduit || this.newNomProduit.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Saisissez le nom du produit.' });
      return;
    }
    if (this.newMontantVendu === null || this.newMontantVendu < 0) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Saisissez le montant.' });
      return;
    }
    if (this.newBenefice === null) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Saisissez le benefice.' });
      return;
    }

    const qte = (this.newQuantite && this.newQuantite > 0) ? Number(this.newQuantite) : 1;
    const montantUnitaire = Number(this.newMontantVendu);
    const beneficeUnitaire = Number(this.newBenefice);

    const totalMontant = montantUnitaire * qte;
    const totalBenefice = beneficeUnitaire * qte;

    const req: LigneVenteRequest = {
      dateVente: this.currentDate,
      quantite: qte,
      nomProduit: this.newNomProduit.trim(),
      montantVendu: totalMontant,
      benefice: totalBenefice,
      note: this.newNote ? this.newNote.trim() : undefined
    };

    this.venteService.ajouterLigne(req).subscribe({
      next: (created) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Enregistre',
          detail: `+ ${created.quantite}x ${created.nomProduit} (Total: ${created.montantVendu} FCFA | Gain: ${created.benefice} FCFA)`,
          life: 2500
        });
        this.newQuantite = 1;
        this.newNomProduit = '';
        this.newMontantVendu = null;
        this.newBenefice = null;
        this.newNote = '';
        this.chargerJournee();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Erreur lors de l\'enregistrement.'
        });
      }
    });
  }

  ouvrirEdition(ligne: LigneVente) {
    if (this.summary?.cloturee) return;
    this.selectedLigne = ligne;
    const qte = ligne.quantite && ligne.quantite > 0 ? ligne.quantite : 1;
    this.editQuantite = qte;
    this.editNomProduit = ligne.nomProduit;
    this.editMontantUnitaire = Math.round(ligne.montantVendu / qte);
    this.editBeneficeUnitaire = Math.round(ligne.benefice / qte);
    this.editNote = ligne.note || '';
    this.editDialogVisible = true;
    this.cdr.detectChanges();
  }

  enregistrerEdition() {
    if (!this.selectedLigne?.id) return;
    const qte = this.editQuantite > 0 ? Number(this.editQuantite) : 1;
    const montantUnitaire = Number(this.editMontantUnitaire);
    const beneficeUnitaire = Number(this.editBeneficeUnitaire);

    const totalMontant = montantUnitaire * qte;
    const totalBenefice = beneficeUnitaire * qte;

    const req: LigneVenteRequest = {
      quantite: qte,
      nomProduit: this.editNomProduit,
      montantVendu: totalMontant,
      benefice: totalBenefice,
      note: this.editNote
    };

    this.venteService.modifierLigne(this.selectedLigne.id, req).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Mis a jour', detail: 'Ligne modifiee avec succes.' });
        this.editDialogVisible = false;
        this.chargerJournee();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de la modification.' });
      }
    });
  }

  demanderSuppression(ligne: LigneVente) {
    this.ligneToDelete = ligne;
    this.deleteDialogVisible = true;
    this.cdr.detectChanges();
  }

  confirmerSuppressionDirect() {
    if (!this.ligneToDelete?.id) return;
    this.venteService.supprimerLigne(this.ligneToDelete.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Supprime', detail: 'Ligne supprimee avec succes.' });
        this.deleteDialogVisible = false;
        this.ligneToDelete = null;
        this.chargerJournee();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer cette ligne.' });
      }
    });
  }

  demanderCloture(reouvrir = false) {
    this.isForcingReouverture = reouvrir;
    this.clotureDialogVisible = true;
    this.cdr.detectChanges();
  }

  confirmerClotureDirect() {
    this.venteService.cloturerJournee(this.currentDate, this.isForcingReouverture).subscribe({
      next: (updated) => {
        this.summary = updated;
        this.clotureDialogVisible = false;
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'success',
          summary: this.isForcingReouverture ? 'Journee Reouverte' : 'Journee Cloturee !',
          detail: this.isForcingReouverture ? 'Vous pouvez de nouveau enregistrer des ventes.' : 'Total benefice et ventes verrouilles.'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Erreur lors de l\'operation.'
        });
      }
    });
  }

  imprimerJournee() {
    window.print();
  }
}