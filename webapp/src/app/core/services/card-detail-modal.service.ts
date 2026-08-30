import { Injectable, signal } from '@angular/core';

/**
 * Root-level modal state — CardDetailModalComponent is mounted once in app.html and reads
 * from here, so any card grid can open it by calling open() with the ids currently on screen
 * (for prev/next) without needing its own routed page. There's no HTTP in this service at all
 * — it's purely a shared piece of UI state, which is a perfectly normal use of Angular's DI:
 * a singleton service doesn't have to talk to a backend, it just has to be something multiple
 * unrelated components need to agree on.
 */
@Injectable({ providedIn: 'root' })
export class CardDetailModalService {
  /** null = modal closed. Whichever component called open() sets this to a real card id. */
  readonly activeCardId = signal<number | null>(null);
  /** The full list of ids being browsed (e.g. every card currently shown in a filtered grid) — lets step() know what "next" means. */
  readonly contextIds = signal<number[]>([]);

  open(cardId: number, contextIds: number[]): void {
    this.contextIds.set(contextIds);
    this.activeCardId.set(cardId);
  }

  close(): void {
    this.activeCardId.set(null);
  }

  /** Move to the previous (-1) or next (+1) card within contextIds, wrapping around at both ends. */
  step(delta: number): void {
    const ids = this.contextIds();
    const current = this.activeCardId();
    if (ids.length === 0 || current === null) {
      return;
    }
    const index = ids.indexOf(current);
    if (index === -1) {
      return;
    }
    // The `+ ids.length` before `%` is what makes this wrap correctly at the START of the list
    // too — without it, index 0 with delta -1 would compute -1 % length, which in JS stays
    // negative (-1) instead of wrapping to the last index like a "true" modulo would.
    const nextIndex = (index + delta + ids.length) % ids.length;
    this.activeCardId.set(ids[nextIndex]);
  }
}
