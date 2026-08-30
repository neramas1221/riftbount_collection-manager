import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { OwnedCardService } from './owned-card.service';
import { OwnedCard } from '../models/card.models';

/**
 * Same "load once, share everywhere" idea as AllCardStore, but this one also owns the WRITE
 * side (setQuantity/remove) — every page that lets you add/remove/adjust a card goes through
 * here instead of calling OwnedCardService directly, so that e.g. adding a card from the Card
 * Detail modal instantly shows up on Collection Explorer too, without either page refetching.
 */
@Injectable({ providedIn: 'root' })
export class OwnedCardStore {
  private readonly ownedCardService = inject(OwnedCardService);

  readonly ownedCards = signal<OwnedCard[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal<string | null>(null);

  /**
   * `computed()` derives a new value from other signals — it recalculates automatically
   * whenever `ownedCards` changes, and (unlike a plain method) caches the result until the
   * next actual change, so calling `ownedByCardId()` many times in one render doesn't
   * recompute the Map each time. This turns the flat array into "quantity owned, by card id"
   * for O(1) lookups — see ownedQuantity() in the feature components for how it's used.
   */
  readonly ownedByCardId = computed(() => new Map(this.ownedCards().map((o) => [o.allCardId, o])));

  private loadTriggered = false;

  ensureLoaded(): void {
    if (this.loadTriggered) {
      return;
    }
    this.loadTriggered = true;

    this.ownedCardService.getAll().subscribe({
      next: (owned) => {
        this.ownedCards.set(owned);
        this.loaded.set(true);
      },
      error: (err) => {
        this.loadError.set('Could not reach the Spring Boot API on :8080. Is it running?');
        this.loaded.set(true);
        console.error('Failed to load owned cards', err);
      },
    });
  }

  /**
   * Add a card to the collection, or change how many you own. Fires the real HTTP request
   * immediately, and — once it succeeds — updates the local `ownedCards` signal so every page
   * reading it (via ownedByCardId) sees the change without needing to reload.
   */
  setQuantity(allCardId: number, quantity: number): Observable<OwnedCard> {
    const request$ = this.ownedCardService.upsert({ allCardId, quantity });
    request$.subscribe((owned) => {
      // Replace the old entry for this card (if any) with the fresh one from the server.
      this.ownedCards.update((list) => [...list.filter((o) => o.allCardId !== allCardId), owned]);
    });
    // Returning the Observable lets the CALLER also subscribe (e.g. to clear a search box only
    // after the request succeeds) — the .subscribe() call above already made the request fire,
    // this doesn't trigger it a second time.
    return request$;
  }

  /** Remove a card from the collection entirely (not just set its quantity to 0). */
  remove(ownedCardId: number): Observable<void> {
    const request$ = this.ownedCardService.delete(ownedCardId);
    request$.subscribe(() => {
      this.ownedCards.update((list) => list.filter((o) => o.id !== ownedCardId));
    });
    return request$;
  }
}
