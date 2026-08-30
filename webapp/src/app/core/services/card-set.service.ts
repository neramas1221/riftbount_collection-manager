import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardSet } from '../models/card.models';

/**
 * Thin wrapper around one backend endpoint — this class does nothing but call HTTP and return
 * the result. There are several of these (card-colour, card-type, super-type, card-rarity
 * services all look almost identical); they exist as separate small services rather than one
 * big "ApiService" so each can be injected independently and so this stays a 1:1 mapping to a
 * backend controller.
 *
 * `@Injectable({ providedIn: 'root' })` registers this with Angular's dependency injector as a
 * singleton for the whole app — any component or service that does `inject(CardSetService)`
 * gets the exact same instance, not a new one each time.
 */
@Injectable({ providedIn: 'root' })
export class CardSetService {
  // inject() is the modern way to get dependencies (constructor parameters were the old way) —
  // it can only be called during class field initialization or inside another injection
  // context, which is why it's used here as a field, not inside a method body.
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/card-sets';

  /** GET /api/card-sets — every set (e.g. "Origins", "Vendetta") in the DB. */
  getAll(): Observable<CardSet[]> {
    // HttpClient methods return an Observable, not a Promise — nothing actually happens until
    // something calls .subscribe() on it (see ReferenceDataService.ensureLoaded() for the
    // caller). <CardSet[]> here is a type assertion telling TypeScript what shape to expect;
    // Angular does NOT validate that the real JSON actually matches it at runtime.
    return this.http.get<CardSet[]>(this.baseUrl);
  }
}
