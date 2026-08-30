import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AllCard, UserCardFilterRequest } from '../models/card.models';

/**
 * All three endpoints this app uses on the "every physical card printing" resource. Unlike the
 * simple lookup services (card-set, card-colour, ...), this one has more than one method
 * because the backend controller for AllCard exposes more than a plain GET-all.
 */
@Injectable({ providedIn: 'root' })
export class AllCardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/all-card';

  /** GET /api/all-card — every card in the DB, unfiltered. Used once at app load by AllCardStore. */
  getAll(): Observable<AllCard[]> {
    return this.http.get<AllCard[]>(this.baseUrl);
  }

  /**
   * POST /api/all-card/search — server-side filtering for the Card Database page. Takes a
   * body (UserCardFilterRequest) instead of query params because it has ~13 possible filter
   * fields; this is called via http.post(), a POST purely used to send a big filter object,
   * not to create anything.
   */
  search(filter: UserCardFilterRequest): Observable<AllCard[]> {
    return this.http.post<AllCard[]>(`${this.baseUrl}/search`, filter);
  }

  /**
   * Despite the path, this returns the card's current price as a single float — not a
   * history. There is still no real price-history endpoint; see price-history.service.ts.
   */
  getCurrentPrice(id: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${id}/price-history`);
  }
}
