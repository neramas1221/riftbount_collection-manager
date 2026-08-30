import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AllCardService } from './all-card.service';
import { PricePoint } from '../models/card.models';

/**
 * GET /api/all-card/{id}/price-history now exists, but it returns a single Float — the
 * card's current price — not an actual time series. There's still no real historical price
 * tracking on the backend (see required_endpoints.txt #3), so the trend line below is a
 * deterministic random walk seeded off the card id, anchored to that real current price.
 */
@Injectable({ providedIn: 'root' })
export class PriceHistoryService {
  private readonly allCardService = inject(AllCardService);

  /** Fetches the real current price, then generates a fake-but-consistent history ending at it. */
  getHistory(cardId: number, days = 90): Observable<PricePoint[]> {
    // .pipe(map(...)) transforms the Observable's eventual value without subscribing to it
    // here — the actual HTTP call only happens once something downstream subscribes (in
    // price-trends.component.ts), same as every other Observable in this app.
    return this.allCardService
      .getCurrentPrice(cardId)
      .pipe(map((currentPrice) => this.generateMockHistory(cardId, currentPrice, days)));
  }

  /**
   * Builds `days` fake daily prices that always end exactly at `currentPrice` (so the chart's
   * "today" point matches the card's real listed price) and wobble randomly day-to-day before
   * that. Seeding the random generator off `cardId` (rather than using Math.random()) means the
   * SAME card always produces the SAME fake history — reopening the modal doesn't reshuffle
   * the chart, which would look broken/inconsistent to a user.
   */
  private generateMockHistory(cardId: number, currentPrice: number, days: number): PricePoint[] {
    // A tiny hand-rolled linear congruential generator (LCG) — deterministic "randomness" from
    // a seed, unlike Math.random() which can't be seeded at all in JavaScript. Given the same
    // starting `seed`, this produces the exact same sequence of numbers every time.
    let seed = cardId * 9973 + 17;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff; // scales the result down to a 0..1 range, like Math.random()
    };

    const basePrice = Math.max(0.5, currentPrice || 5); // guard against a real price of exactly 0
    const points: PricePoint[] = [];
    let price = basePrice * (0.75 + rand() * 0.5); // start somewhere within ±25% of today's price

    const today = new Date();
    // Counts DOWN from `days` to 0 so `i` doubles as "days ago" — i=0 is today, i=days is the
    // oldest point on the chart, and the array ends up in chronological order without needing
    // a separate .reverse() afterwards.
    for (let i = days; i >= 0; i--) {
      const drift = (rand() - 0.48) * basePrice * 0.04; // small random up/down nudge each day
      price = Math.max(0.25, price + drift); // never let the walk go to (or below) zero
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      if (i === 0) {
        // Force the very last point to be the real price exactly, overriding the random walk —
        // otherwise "today" on the chart could drift slightly off from the actual listed price.
        price = basePrice;
      }

      points.push({
        date: date.toISOString().slice(0, 10), // "2026-05-01" — trims the time part off an ISO datetime string
        price: Math.round(price * 100) / 100, // round to 2 decimal places (cents)
      });
    }

    return points;
  }
}
