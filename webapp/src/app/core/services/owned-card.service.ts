import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OwnedCard, OwnedCardRequest } from '../models/card.models';

/**
 * The plain HTTP layer for owned-card CRUD. This class is deliberately "dumb" — it just calls
 * the backend and hands back whatever it says. No component actually talks to this service
 * directly; OwnedCardStore wraps it and keeps an in-memory copy of the results so every page
 * shares one consistent view of "what do I own" without each page re-fetching separately.
 */
@Injectable({ providedIn: 'root' })
export class OwnedCardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/owned-cards';

  /** GET /api/owned-cards — every card the user owns, with quantities. */
  getAll(): Observable<OwnedCard[]> {
    return this.http.get<OwnedCard[]>(this.baseUrl);
  }

  /** POST /api/owned-cards — create or update the owned quantity for one card ("upsert" = update-or-insert). */
  upsert(request: OwnedCardRequest): Observable<OwnedCard> {
    return this.http.post<OwnedCard>(this.baseUrl, request);
  }

  /** DELETE /api/owned-cards/{id} — remove an owned-card row entirely (id is the OwnedCard's own id, not the card's). */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
