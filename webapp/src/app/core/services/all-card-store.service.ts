import { Injectable, inject, signal } from '@angular/core';
import { AllCardService } from './all-card.service';
import { AllCard } from '../models/card.models';

/**
 * Loads the full card list ONCE, the first time any page asks for it, and shares the result
 * app-wide — without this, every page (Collection Explorer, Set Browser, Card Database, Price
 * Trends) would each independently call GET /api/all-card on their own ngOnInit, quadrupling
 * the network traffic for identical data.
 *
 * A `signal` is Angular's reactive value container: read it by calling it like a function
 * (`this.cards()`), write it with `.set()`/`.update()`. Anything that reads a signal inside a
 * template, `computed()`, or `effect()` automatically re-runs when that signal changes — there's
 * no manual subscribe/unsubscribe needed like with RxJS Observables.
 */
@Injectable({ providedIn: 'root' })
export class AllCardStore {
  private readonly allCardService = inject(AllCardService);

  readonly cards = signal<AllCard[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal<string | null>(null);

  // Plain boolean flag (not a signal) — this only guards ensureLoaded() from firing the HTTP
  // request twice, it's never read by a template so it doesn't need to be reactive.
  private loadTriggered = false;

  /**
   * Call this from every page that needs card data (each page's ngOnInit does). Safe to call
   * many times — only the very first call actually triggers the HTTP request; every call after
   * that is a no-op, and every consumer just reads the same `cards`/`loaded` signals once the
   * original request resolves.
   */
  ensureLoaded(): void {
    if (this.loadTriggered) {
      return;
    }
    this.loadTriggered = true;

    // Observables do nothing until subscribed — this is the one place that actually happens
    // for this particular request.
    this.allCardService.getAll().subscribe({
      next: (cards) => {
        this.cards.set(cards);
        this.loaded.set(true);
      },
      error: (err) => {
        this.loadError.set('Could not reach the Spring Boot API on :8080. Is it running?');
        this.loaded.set(true); // still "loaded" (i.e. done trying) even though it failed, so pages stop showing a spinner
        console.error('Failed to load all cards', err);
      },
    });
  }
}
