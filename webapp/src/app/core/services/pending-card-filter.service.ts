import { Injectable, signal } from '@angular/core';

export type PendingFilterKind = 'set' | 'type' | 'colour' | 'rarity' | 'subtype';

export interface PendingFilter {
  kind: PendingFilterKind;
  value: string | string[];
}

/**
 * Lets the card detail modal (clicking Set/Type/Colour/Rarity/a subtype tag) hand a filter
 * request over to Card Database's own filter signals without a direct component reference —
 * request() before navigating, consume() once on Card Database's ngOnInit.
 *
 * This is a "mailbox" pattern: consume() both reads AND clears the pending value in one call,
 * so it only ever gets applied once, even if the user navigates back to /database again later
 * without another card-detail click having set a new one.
 */
@Injectable({ providedIn: 'root' })
export class PendingCardFilterService {
  private readonly pending = signal<PendingFilter | null>(null);

  request(kind: PendingFilterKind, value: string | string[]): void {
    this.pending.set({ kind, value });
  }

  consume(): PendingFilter | null {
    const value = this.pending();
    this.pending.set(null);
    return value;
  }
}
