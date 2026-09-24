import { Component, OnInit, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

export interface FactureItem {
  quantite: number;
  nomProduit: string;
  prixUnitaire: number;
  beneficeUnitaire: number;
}

export interface FactureData {
  numeroFacture: string;
  date: string;
  heure: string;
  clientNom: string;
  clientTelephone?: string;
  modePaiement: string;
  items: {
    quantite: number;
    nomProduit: string;
    prixUnitaire: number;
    total: number;
  }[];
  totalMontant: number;
}

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private venteService = inject(VenteService);
  private depenseService = inject(DepenseService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  currentDate: string = this.formatDate(new Date());
  summary: JourneeSummary | null = null;
  loading: boolean = false;

  activeTab: 'ventes' | 'depenses' | 'facture' = 'ventes';

  newQuantite: number = 1;
  newNomProduit: string = '';
  newMontantVendu: number | null = null;
  newBenefice: number | null = null;

  factureClientNom: string = 'Client Comptoir';
  factureModePaiement: string = 'EspAces';
  factureItems: FactureItem[] = [
    { quantite: 1, nomProduit: '', prixUnitaire: 0, beneficeUnitaire: 0 }
  ];

  newDepenseMotif: string = '';
  newDepenseMontant: number | null = null;
  newDepenseCategorie: string = 'AUTRE';
  categoriesDepense: string[] = ['REPAS', 'TRANSPORT', 'FACTURE', 'RETRAIT_PERSO', 'FOURNITURE', 'AUTRE'];

  selectedLignes: { [id: number]: boolean } = {};

  invoiceModalVisible: boolean = false;
  currentFacture: FactureData | null = null;

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  editDialogVisible: boolean = false;
  editingLigneId: number | null = null;
  editQuantite: number = 1;
  editNomProduit: string = '';
  editMontantUnitaire: number = 0;
  editBeneficeUnitaire: number = 0;
  editNote: string = '';

  deleteDialogVisible: boolean = false;
  ligneToDelete: LigneVente | null = null;

  editDepenseDialogVisible: boolean = false;
  editingDepenseId: number | null = null;
  editDepenseMotif: string = '';
  editDepenseMontant: number = 0;
  editDepenseCategorie: string = 'AUTRE';

  deleteDepenseDialogVisible: boolean = false;
  depenseToDelete: Depense | null = null;

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

  get factureTotalMontant(): number {
    return this.factureItems.reduce((acc, item) => {
      const q = (item.quantite && item.quantite > 0) ? item.quantite : 1;
      return acc + ((item.prixUnitaire || 0) * q);
    }, 0);
  }

  get hasSelectedLignes(): boolean {
    return Object.values(this.selectedLignes).some(val => val === true);
  }

  get selectedCount(): number {
    return Object.values(this.selectedLignes).filter(val => val === true).length;
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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.currentDate = params['date'];
      } else {
        this.currentDate = this.formatDate(new Date());
      }
      this.currentPage = 1;
      this.selectedLignes = {};
      this.chargerJournee();
    });
  }

  formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(d: Date): string {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  changerJour(delta: number) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + delta);
    this.currentDate = this.formatDate(d);
    this.currentPage = 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: { date: this.currentDate }, queryParamsHandling: 'merge' });
  }

  setToday() {
    this.currentDate = this.formatDate(new Date());
    this.currentPage = 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: { date: this.currentDate }, queryParamsHandling: 'merge' });
  }

  onDateChange() {
    this.currentPage = 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: { date: this.currentDate }, queryParamsHandling: 'merge' });
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
        this.messageService.add({ severity: 'success', summary: 'Vente ajoutAe', detail: `${qte}x ${request.nomProduit} enregistrA avec succAs.` });
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

  ajouterItemFacture() {
    this.factureItems.push({ quantite: 1, nomProduit: '', prixUnitaire: 0, beneficeUnitaire: 0 });
    this.cdr.detectChanges();
  }

  supprimerItemFacture(index: number) {
    if (this.factureItems.length > 1) {
      this.factureItems.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  validerEtImprimerFactureMulti() {
    const validItems = this.factureItems.filter(item => item.nomProduit.trim().length > 0 && item.prixUnitaire > 0);
    if (validItems.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez renseigner au moins un produit avec un prix valide.' });
      return;
    }

    const now = new Date();
    const invoiceNum = 'FAC-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-' + String(Math.floor(100 + Math.random() * 900));

    const savePromises = validItems.map(item => {
      const q = (item.quantite && item.quantite > 0) ? item.quantite : 1;
      const totalMontant = item.prixUnitaire * q;
      const totalBenefice = (item.beneficeUnitaire || 0) * q;
      const req: LigneVenteRequest = {
        dateVente: this.currentDate,
        quantite: q,
        nomProduit: item.nomProduit.trim().toUpperCase(),
        montantVendu: totalMontant,
        benefice: totalBenefice,
        note: `Facture ${invoiceNum}`
      };
      return this.venteService.ajouterLigne(req).toPromise();
    });

    Promise.all(savePromises).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Facture EnregistrAe', detail: `${validItems.length} article(s) enregistrAs et facture gAnArAe.` });

      this.currentFacture = {
        numeroFacture: invoiceNum,
        date: this.currentDate,
        heure: this.formatTime(now),
        clientNom: this.factureClientNom.trim() || 'Client Comptoir',
        modePaiement: this.factureModePaiement,
        items: validItems.map(item => {
          const q = (item.quantite && item.quantite > 0) ? item.quantite : 1;
          return {
            quantite: q,
            nomProduit: item.nomProduit.trim().toUpperCase(),
            prixUnitaire: item.prixUnitaire,
            total: item.prixUnitaire * q
          };
        }),
        totalMontant: this.factureTotalMontant
      };

      this.factureItems = [{ quantite: 1, nomProduit: '', prixUnitaire: 0, beneficeUnitaire: 0 }];
      this.factureClientNom = 'Client Comptoir';
      this.chargerJournee();

      this.invoiceModalVisible = true;
      this.cdr.detectChanges();
    }).catch(() => {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue lors de l\'enregistrement de la facture.' });
    });
  }

  genererFactureLigne(ligne: LigneVente) {
    const now = new Date();
    const qte = (ligne.quantite && ligne.quantite > 0) ? ligne.quantite : 1;
    const pu = (ligne.montantVendu || 0) / qte;
    const invoiceNum = 'FAC-' + (ligne.dateVente ? ligne.dateVente.replace(/-/g, '') : '2026') + '-' + String(ligne.id || 1).padStart(3, '0');

    this.currentFacture = {
      numeroFacture: invoiceNum,
      date: ligne.dateVente || this.currentDate,
      heure: this.formatTime(now),
      clientNom: 'Client Comptoir',
      modePaiement: 'EspAces',
      items: [
        {
          quantite: qte,
          nomProduit: ligne.nomProduit,
          prixUnitaire: pu,
          total: ligne.montantVendu || 0
        }
      ],
      totalMontant: ligne.montantVendu || 0
    };

    this.invoiceModalVisible = true;
    this.cdr.detectChanges();
  }

  genererFactureSelection() {
    if (!this.summary?.lignes) return;
    const selected = this.summary.lignes.filter(l => l.id && this.selectedLignes[l.id]);
    if (selected.length === 0) return;

    const now = new Date();
    const invoiceNum = 'FAC-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-GRP' + String(Math.floor(100 + Math.random() * 900));

    const items = selected.map(ligne => {
      const q = (ligne.quantite && ligne.quantite > 0) ? ligne.quantite : 1;
      const pu = (ligne.montantVendu || 0) / q;
      return {
        quantite: q,
        nomProduit: ligne.nomProduit,
        prixUnitaire: pu,
        total: ligne.montantVendu || 0
      };
    });

    const total = items.reduce((acc, it) => acc + it.total, 0);

    this.currentFacture = {
      numeroFacture: invoiceNum,
      date: this.currentDate,
      heure: this.formatTime(now),
      clientNom: 'Client Comptoir',
      modePaiement: 'EspAces',
      items: items,
      totalMontant: total
    };

    this.invoiceModalVisible = true;
    this.cdr.detectChanges();
  }

  imprimerFactureClientDirect() {
    window.print();
  }

  ajouterDepense() {
    if (!this.newDepenseMotif.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez saisir le motif de la dApense/retrait.' });
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
        this.messageService.add({ severity: 'info', summary: 'DApense enregistrAe', detail: `${request.motif} (${request.montant} FCFA) dAduit du bAnAfice.` });
        this.newDepenseMotif = '';
        this.newDepenseMontant = null;
        this.chargerJournee();
        setTimeout(() => this.depenseInputRef?.nativeElement?.focus(), 100);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'enregistrer la dApense.' });
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
    this.cdr.detectChanges();
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
        this.messageService.add({ severity: 'success', summary: 'ModifiA', detail: 'Ligne mise A jour.' });
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
    this.cdr.detectChanges();
  }

  confirmerSuppressionDirect() {
    if (!this.ligneToDelete?.id) return;
    this.venteService.supprimerLigne(this.ligneToDelete.id).subscribe({
      next: () => {
        this.deleteDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'SupprimA', detail: 'Ligne supprimAe.' });
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
    this.cdr.detectChanges();
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
        this.messageService.add({ severity: 'success', summary: 'ModifiA', detail: 'DApense mise A jour.' });
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
    this.cdr.detectChanges();
  }

  confirmerSuppressionDepenseDirect() {
    if (!this.depenseToDelete?.id) return;
    this.depenseService.supprimerDepense(this.depenseToDelete.id).subscribe({
      next: () => {
        this.deleteDepenseDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'SupprimA', detail: 'DApense supprimAe.' });
        this.depenseToDelete = null;
        this.chargerJournee();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer cette dApense.' });
      }
    });
  }

  demanderCloture(forcerReouverture: boolean = false) {
    this.isForcingReouverture = forcerReouverture;
    this.clotureDialogVisible = true;
    this.cdr.detectChanges();
  }

  confirmerClotureDirect() {
    this.venteService.cloturerJournee(this.currentDate, this.isForcingReouverture).subscribe({
      next: () => {
        this.clotureDialogVisible = false;
        const msg = this.isForcingReouverture ? 'JournAe rAouverte !' : 'JournAe clAturAe avec succAs !';
        this.messageService.add({ severity: 'success', summary: 'Statut mis A jour', detail: msg });
        this.chargerJournee();
      },
      error: () => {
        this.clotureDialogVisible = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la clAture.' });
      }
    });
  }

  imprimerJournee() {
    window.print();
  }
}