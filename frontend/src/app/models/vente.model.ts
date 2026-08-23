export interface LigneVente {
  id?: number;
  dateVente: string;
  quantite: number;
  nomProduit: string;
  montantVendu: number;
  benefice: number;
  cloturee?: boolean;
  dateCloture?: string;
  note?: string;
  createdAt?: string;
}

export interface LigneVenteRequest {
  dateVente?: string;
  quantite?: number;
  nomProduit: string;
  montantVendu: number;
  benefice: number;
  note?: string;
}

export interface JourneeSummary {
  date: string;
  cloturee: boolean;
  nombreArticles: number;
  totalVentes: number;
  totalBenefice: number;
  tauxMarge: number;
  lignes: LigneVente[];
}

export interface PeriodeStat {
  label: string;
  dateRef: string;
  nombreVentes: number;
  totalVentes: number;
  totalBenefice: number;
}

export interface RapportResponse {
  type: string;
  titrePeriode: string;
  dateDebut: string;
  dateFin: string;
  nombreArticlesTotal: number;
  totalVentes: number;
  totalBenefice: number;
  margeMoyennePourcentage: number;
  breakdown: PeriodeStat[];
  lignes: LigneVente[];
}