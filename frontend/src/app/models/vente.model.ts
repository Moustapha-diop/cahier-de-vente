export interface LigneVente {
  id?: number;
  dateVente?: string;
  quantite?: number;
  nomProduit: string;
  montantVendu: number;
  benefice: number;
  cloturee?: boolean;
  dateCloture?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LigneVenteRequest {
  dateVente?: string;
  quantite?: number;
  nomProduit: string;
  montantVendu: number;
  benefice: number;
  note?: string;
}

export interface Depense {
  id?: number;
  dateDepense?: string;
  motif: string;
  montant: number;
  categorie?: string;
  note?: string;
  cloturee?: boolean;
  dateCloture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepenseRequest {
  dateDepense?: string;
  motif: string;
  montant: number;
  categorie?: string;
  note?: string;
}

export interface JourneeSummary {
  date: string;
  cloturee: boolean;
  nombreArticles: number;
  totalVentes: number;
  totalBenefice: number;
  totalDepenses: number;
  beneficeNetApresDepenses: number;
  tauxMarge: number;
  lignes: LigneVente[];
  depenses: Depense[];
}

export interface PeriodeStat {
  label: string;
  dateRef: string;
  nombreVentes: number;
  totalVentes: number;
  totalBenefice: number;
  totalDepenses: number;
  beneficeNetApresDepenses: number;
}

export interface RapportResponse {
  type: string;
  titrePeriode: string;
  dateDebut: string;
  dateFin: string;
  nombreArticlesTotal: number;
  totalVentes: number;
  totalBenefice: number;
  totalDepenses: number;
  beneficeNetApresDepenses: number;
  margeMoyennePourcentage: number;
  breakdown: PeriodeStat[];
  lignes: LigneVente[];
  depenses: Depense[];
}