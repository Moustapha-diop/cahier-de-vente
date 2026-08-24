import { Component, OnInit, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenteService } from '../../services/vente.service';
import { DepenseService } from '../../services/depense.service';
import { JourneeSummary, LigneVente, LigneVenteRequest, Depense, DepenseRequest } from '../../models/vente.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
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
    DialogModule,
    ToastModule,
    TagModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './daily-book.component.html',
  styleUrls: ['./daily-book.component.scss']
})
export class DailyBookComponent implements OnInit {
  private venteService = inject(VenteService);
  private depenseService = inject(DepenseService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  currentDate: string = this.formatDate(new Date());
  summary: JourneeSummary | null = null;
  loading: boolean = false;

  // Active sub-tab in daily book: 'ventes' | 'depenses'
  activeTab: 'ventes' | 'depenses' = 'ventes';

  // Fast Sales Entry Fields
  newQuantite: number = 1;
  newNomProduit: string = '';
  newMontantVendu: number | null = null;
  newBenefice: number | null = null;

  // Fast Expense Entry Fields
  newDepenseMotif: string = '';
  newDepenseMontant: number | null = null;
  newDepenseCategorie: string = 'AUTRE';
  categoriesDepense: string[] = ['REPAS', 'TRANSPORT', 'FACTURE', 'RETRAIT_PERSO', 'FOURNITURE', 'AUTRE'];

  // Pagination for Sales Table
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  // Modals for Editing & Deleting Sales
  editDialogVisible: boolean = false;
  editingLigneId: number | null = null;
  editQuantite: number = 1;
  editNomProduit: string = '';
  editMontantUnitaire: number = 0;
  editBeneficeUnitaire: number = 0;
  editNote: string = '';

  deleteDialogVisible: boolean = false;
  ligneToDelete: LigneVente | null = null;

  // Modals for Editing & Deleting Expenses
  editDepenseDialogVisible: boolean = false;
  editingDepenseId: number | null = null;
  editDepenseMotif: string = '';
  editDepenseMontant: number = 0;
  editDepenseCategorie: string = 'AUTRE';

  deleteDepenseDialogVisible: boolean = false;
  depenseToDelete: Depense | null = null;

  // Modal Closure
  clotureDialogVisible: boolean = false;
  isForcingReouverture: boolean = false;

  @ViewChild('produitInput') produitInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('depenseInput') depenseInputRef!: ElementRef<HTMLInputElement>;

  get totalItems(): number {
    return this.summary?.lignes?.length || 0;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get paginatedLignes(): LigneVente[] {
    if (!this.summary?.lignes) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.summary.lignes.slice(start, start + this.pageSize);
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

  get previewTotalMontant(): number {
    const qte = this.newQuantite > 0 ? this.newQuantite : 1;
    return (this.newMontantVendu || 0) * qte;
  }

  get previewTotalBenefice(): number {
    const qte = this.newQuantite > 0 ? this.newQuantite : 1;
    return (this.newBenefice || 0) * qte;
  }

  get editPreviewTotalMontant(): number {
    const qte = this.editQuantite > 0 ? this.editQuantite : 1;
    return (this.editMontantUnitaire || 0) * qte;
  }

  get editPreviewTotalBenefice(): number {
    const qte = this.editQuantite > 0 ? this.editQuantite : 1;
    return (this.editBeneficeUnitaire || 0) * qte;
  }

  ngOnInit() {
    this.chargerJournee();
  }

  formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  changerJour(delta: number) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + delta);
    this.currentDate = this.formatDate(d);
    this.currentPage = 1;
    this.chargerJournee();
  }

  setToday() {
    this.currentDate = this.formatDate(new Date());
    this.currentPage = 1;
    this.chargerJournee();
  }

  onDateChange() {
    this.currentPage = 1;
    this.chargerJournee();
  }

  chargerJournee() {
    this.loading = true;
    this.cdr.detectChanges();
    this.venteService.getJournee(this.currentDate).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de contacter le serveur backend.' });
      }
    });
  }

  ajouterLigne() {
    if (!this.newNomProduit.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez saisir le nom du produit.' });
      return;
    }
    if (this.newMontantVendu === null || this.newMontantVendu < 0) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez saisir un montant vendu valide.' });
      return;
    }

    const qte = (this.newQuantite && this.newQuantite > 0) ? this.newQuantite : 1;
    const totalMontant = this.newMontantVendu * qte;
    const totalBenefice = (this.newBenefice || 0) * qte;

    const request: LigneVenteRequest = {
      dateVente: this.currentDate,
      quantite: qte,
      nomProduit: this.newNomProduit.trim().toUpperCase(),
      montantVendu: totalMontant,
      benefice: totalBenefice
    };

    this.venteService.ajouterLigne(request).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Vente ajoutÃ©e', detail: `${qte}x ${request.nomProduit} enregistrÃ© avec succÃ¨s.` });
        this.newNomProduit = '';
        this.newMontantVendu = null;
        this.newBenefice = null;
        this.newQuantite = 1;
        this.chargerJournee();
        setTimeout(() => this.produitInputRef?.nativeElement?.focus(), 100);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'ajouter cette vente.' });
      }
    });
  }

  ajouterDepense() {
    if (!this.newDepenseMotif.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez saisir le motif de la dÃ©pense/retrait.' });
      return;
    }
    if (this.newDepenseMontant === null || this.newDepenseMontant <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez saisir un montant positif.' });
      return;
    }

    const request: DepenseRequest = {
      dateDepense: this.currentDate,
      motif: this.newDepenseMotif.trim(),
      montant: this.newDepenseMontant,
      categorie: this.newDepenseCategorie
    };

    this.depenseService.ajouterDepense(request).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'DÃ©pense enregistrÃ©e', detail: `${request.motif} (${request.montant} FCFA) dÃ©duit du bÃ©nÃ©fice.` });
        this.newDepenseMotif = '';
        this.newDepenseMontant = null;
        this.chargerJournee();
        setTimeout(() => this.depenseInputRef?.nativeElement?.focus(), 100);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'enregistrer la dÃ©pense.' });
      }
    });
  }

  ouvrirEdition(ligne: LigneVente) {
    this.editingLigneId = ligne.id || null;
    this.editQuantite = ligne.quantite || 1;
    this.editNomProduit = ligne.nomProduit;
    this.editMontantUnitaire = (ligne.montantVendu || 0) / this.editQuantite;
    this.editBeneficeUnitaire = (ligne.benefice || 0) / this.editQuantite;
    this.editNote = ligne.note || '';
    this.editDialogVisible = true;
  }

  enregistrerEdition() {
    if (!this.editingLigneId || !this.editNomProduit.trim()) return;

    const qte = this.editQuantite > 0 ? this.editQuantite : 1;
    const req: LigneVenteRequest = {
      dateVente: this.currentDate,
      quantite: qte,
      nomProduit: this.editNomProduit.trim().toUpperCase(),
      montantVendu: this.editMontantUnitaire * qte,
      benefice: this.editBeneficeUnitaire * qte,
      note: this.editNote
    };

    this.venteService.modifierLigne(this.editingLigneId, req).subscribe({
      next: () => {
        this.editDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'ModifiÃ©', detail: 'Ligne mise Ã  jour.' });
        this.chargerJournee();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la modification.' });
      }
    });
  }

  demanderSuppression(ligne: LigneVente) {
    this.ligneToDelete = ligne;
    this.deleteDialogVisible = true;
  }

  confirmerSuppressionDirect() {
    if (!this.ligneToDelete?.id) return;
    this.venteService.supprimerLigne(this.ligneToDelete.id).subscribe({
      next: () => {
        this.deleteDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'SupprimÃ©', detail: 'Ligne supprimÃ©e.' });
        this.ligneToDelete = null;
        this.chargerJournee();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer cette ligne.' });
      }
    });
  }

  ouvrirEditionDepense(depense: Depense) {
    this.editingDepenseId = depense.id || null;
    this.editDepenseMotif = depense.motif;
    this.editDepenseMontant = depense.montant;
    this.editDepenseCategorie = depense.categorie || 'AUTRE';
    this.editDepenseDialogVisible = true;
  }

  enregistrerEditionDepense() {
    if (!this.editingDepenseId || !this.editDepenseMotif.trim()) return;
    const req: DepenseRequest = {
      dateDepense: this.currentDate,
      motif: this.editDepenseMotif.trim(),
      montant: this.editDepenseMontant,
      categorie: this.editDepenseCategorie
    };

    this.depenseService.modifierDepense(this.editingDepenseId, req).subscribe({
      next: () => {
        this.editDepenseDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'ModifiÃ©', detail: 'DÃ©pense mise Ã  jour.' });
        this.chargerJournee();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la modification.' });
      }
    });
  }

  demanderSuppressionDepense(depense: Depense) {
    this.depenseToDelete = depense;
    this.deleteDepenseDialogVisible = true;
  }

  confirmerSuppressionDepenseDirect() {
    if (!this.depenseToDelete?.id) return;
    this.depenseService.supprimerDepense(this.depenseToDelete.id).subscribe({
      next: () => {
        this.deleteDepenseDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'SupprimÃ©', detail: 'DÃ©pense supprimÃ©e.' });
        this.depenseToDelete = null;
        this.chargerJournee();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer cette dÃ©pense.' });
      }
    });
  }

  demanderCloture(forcerReouverture: boolean = false) {
    this.isForcingReouverture = forcerReouverture;
    this.clotureDialogVisible = true;
  }

  confirmerClotureDirect() {
    this.venteService.cloturerJournee(this.currentDate, this.isForcingReouverture).subscribe({
      next: () => {
        this.clotureDialogVisible = false;
        const msg = this.isForcingReouverture ? 'JournÃ©e rÃ©ouverte !' : 'JournÃ©e clÃ´turÃ©e avec succÃ¨s !';
        this.messageService.add({ severity: 'success', summary: 'Statut mis Ã  jour', detail: msg });
        this.chargerJournee();
      },
      error: () => {
        this.clotureDialogVisible = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la clÃ´ture.' });
      }
    });
  }

  imprimerJournee() {
    window.print();
  }
}