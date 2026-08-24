import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Depense, DepenseRequest } from '../models/vente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepenseService {
  private http = inject(HttpClient);
  private apiUrl = (environment.apiUrl ? environment.apiUrl.replace('/ventes', '/depenses') : 'https://cahier-de-vente-backend.onrender.com/api/depenses');

  ajouterDepense(req: DepenseRequest): Observable<Depense> {
    return this.http.post<Depense>(this.apiUrl, req);
  }

  modifierDepense(id: number, req: DepenseRequest): Observable<Depense> {
    return this.http.put<Depense>(`${this.apiUrl}/${id}`, req);
  }

  supprimerDepense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDepensesDuJour(date?: string): Observable<Depense[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<Depense[]>(`${this.apiUrl}/jour`, { params });
  }
}