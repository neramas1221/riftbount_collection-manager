import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
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

  /**
   * How many setQuantity() calls have been made for each card, ever — used purely as a
   * "which request is the newest" marker, see setQuantity()'s comment for why this exists.
   */
  private readonly requestGeneration = new Map<number, number>();

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
   * Add a card to the collection, or change how many you own. Passing quantity <= 0 removes it
   * — the backend's upsert endpoint deletes the row itself in that case and returns a null
   * body, rather than erroring.
   *
   * Two things make this safe to call rapidly (e.g. mashing the +/- buttons), each solving a
   * different failure mode:
   *
   * 1. OPTIMISTIC UPDATE — `ownedCards` is updated immediately, before the network request
   *    even resolves, whenever we already know this card's real backend id. Without this, the
   *    +/- buttons (which compute "current quantity + 1" by reading this store) would read the
   *    same PRE-click quantity for every click made within one round-trip, and send the same
   *    target value repeatedly — the second click would look like it did nothing.
   *
   * 2. GENERATION COUNTER — with #1 alone, two overlapping requests for the same card can still
   *    resolve OUT OF ORDER (the network doesn't guarantee responses arrive in the order the
   *    requests were sent, and this gets more likely the higher/jitterier the latency — e.g.
   *    over a Tailscale connection to a Pi rather than on localhost). Without a way to tell
   *    "was this response superseded by a newer request", a slow response for an OLD click
   *    could land after a newer click's response and silently overwrite it — the quantity would
   *    visibly tick up, then revert on its own a moment later. `requestGeneration` tags every
   *    request with an increasing per-card counter; a response only gets applied if no NEWER
   *    request for that same card has been issued since.
   *
   * A brand-new add (no existing entry, so no real id yet) still waits for the real response
   * rather than inventing a fake id — seeing "+/-" appear after a brief delay when adding a
   * NEW card is a much smaller issue than a wrong id being used for a later remove.
   */
  setQuantity(allCardId: number, quantity: number): Observable<OwnedCard | null> {
    const previous = this.ownedCards();
    const existing = previous.find((o) => o.allCardId === allCardId);

    if (existing) {
      this.ownedCards.set(
        quantity <= 0
          ? previous.filter((o) => o.allCardId !== allCardId)
          : previous.map((o) => (o.allCardId === allCardId ? { ...o, quantity } : o))
      );
    }

    const generation = (this.requestGeneration.get(allCardId) ?? 0) + 1;
    this.requestGeneration.set(allCardId, generation);
    const isStillLatest = () => this.requestGeneration.get(allCardId) === generation;

    return this.ownedCardService.upsert({ allCardId, quantity }).pipe(
      tap({
        next: (owned) => {
          if (!isStillLatest()) {
            return; // a newer click for this same card has already fired — don't clobber it
          }
          // Reconcile with the server's real response — replaces the optimistic guess with the
          // real row (real id, in case this was a new add), or removes it if the backend
          // deleted the row (owned is null when quantity was <= 0).
          this.ownedCards.update((list) => {
            const withoutThisCard = list.filter((o) => o.allCardId !== allCardId);
            return owned ? [...withoutThisCard, owned] : withoutThisCard;
          });
        },
        error: () => {
          if (existing && isStillLatest()) {
            this.ownedCards.set(previous); // the optimistic update guessed wrong — put it back
          }
        },
      })
    );
  }

  /**
   * Remove a card from the collection entirely, by its own (real, already-known) id — used by
   * the explicit "Remove all" button. The +/- "-" button does NOT use this; it goes through
   * setQuantity(id, 0) instead, since that's keyed by allCardId and doesn't need a real id to
   * already be known.
   */
  remove(ownedCardId: number): Observable<void> {
    const previous = this.ownedCards();
    this.ownedCards.set(previous.filter((o) => o.id !== ownedCardId)); // optimistic, same reasoning as setQuantity

    return this.ownedCardService.delete(ownedCardId).pipe(
      tap({
        error: () => this.ownedCards.set(previous),
      })
    );
  }
}
