import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JourneeSummary, LigneVente, LigneVenteRequest, RapportResponse } from '../models/vente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VenteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api/ventes';

  getJournee(date?: string): Observable<JourneeSummary> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<JourneeSummary>(`${this.apiUrl}/jour`, { params });
  }

  ajouterLigne(req: LigneVenteRequest): Observable<LigneVente> {
    return this.http.post<LigneVente>(this.apiUrl, req);
  }

  modifierLigne(id: number, req: LigneVenteRequest): Observable<LigneVente> {
    return this.http.put<LigneVente>(`${this.apiUrl}/${id}`, req);
  }

  supprimerLigne(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cloturerJournee(date?: string, forcerReouverture: boolean = false): Observable<JourneeSummary> {
    let params = new HttpParams().set('forcerReouverture', forcerReouverture.toString());
    if (date) {
      params = params.set('date', date);
    }
    return this.http.post<JourneeSummary>(`${this.apiUrl}/cloturer`, null, { params });
  }

  getRapport(type: string, dateRef?: string, dateDebut?: string, dateFin?: string): Observable<RapportResponse> {
    let params = new HttpParams().set('type', type);
    if (dateRef) params = params.set('dateRef', dateRef);
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get<RapportResponse>(`${this.apiUrl}/rapport`, { params });
  }

  getHistoriqueDates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dates`);
  }
}