import { Injectable, computed, inject } from '@angular/core';
import { AllCardStore } from './all-card-store.service';
import { OwnedCardStore } from './owned-card-store.service';
import { ReferenceDataService } from './reference-data.service';
import { EnrichedCard } from '../models/card.models';

/** One row in the owned-cards table: an enriched card plus how many of it you own. */
export interface OwnedCardRow {
  card: EnrichedCard;
  quantity: number;
}

/** One row in a "By rarity" / "By colour" / "Sets" progress-bar breakdown. */
export interface CategoryBreakdown {
  name: string;
  owned: number;
  total: number;
}

/**
 * Pure aggregate stats over the owned collection — built once here so Collection Explorer
 * and Price Trends don't each duplicate the same join/aggregation logic. Every property below
 * is a `computed()`, meaning none of this actually runs until something reads it (e.g. a
 * template does `{{ stats.totalValue() }}`), and after that it's cached until one of the
 * signals it depends on (ownedCards, cards, cardRarities, ...) actually changes.
 */
@Injectable({ providedIn: 'root' })
export class CollectionStatsService {
  private readonly allCardStore = inject(AllCardStore);
  private readonly ownedCardStore = inject(OwnedCardStore);
  private readonly refData = inject(ReferenceDataService);

  /**
   * The foundational join everything else here is built on: OwnedCard (just an id + quantity)
   * joined against the full card list and enriched with readable names. Every other computed
   * below reads `this.ownedRows()` rather than re-deriving this same join itself.
   */
  readonly ownedRows = computed<OwnedCardRow[]>(() => {
    const cardsById = new Map(this.allCardStore.cards().map((c) => [c.id, c]));
    return this.ownedCardStore
      .ownedCards()
      .map((owned) => {
        const card = cardsById.get(owned.allCardId);
        if (!card) {
          // Card list hasn't loaded yet, or the DB is in an inconsistent state — skip it
          // rather than crash on `undefined.cardPrice` a few lines down.
          return null;
        }
        // `satisfies OwnedCardRow` checks this object matches the interface WITHOUT widening
        // its type to OwnedCardRow (unlike a type annotation would) — mostly relevant so the
        // .filter() below can still narrow `row` from "OwnedCardRow | null" correctly.
        return { card: this.refData.enrich(card), quantity: owned.quantity } satisfies OwnedCardRow;
      })
      .filter((row): row is OwnedCardRow => row !== null); // drops the nulls, and tells TypeScript they're gone
  });

  readonly totalUniqueOwned = computed(() => this.ownedRows().length);
  readonly totalCopiesOwned = computed(() => this.ownedRows().reduce((sum, r) => sum + r.quantity, 0));
  readonly totalValue = computed(() =>
    this.ownedRows().reduce((sum, r) => sum + r.card.cardPrice * r.quantity, 0)
  );
  readonly completionPct = computed(() => {
    const total = this.allCardStore.cards().length;
    return total === 0 ? 0 : (this.totalUniqueOwned() / total) * 100;
  });
  readonly averageOwnedValue = computed(() => {
    const copies = this.totalCopiesOwned();
    return copies === 0 ? 0 : this.totalValue() / copies;
  });

  readonly mostValuableOwned = computed<EnrichedCard | null>(() => {
    const rows = this.ownedRows();
    if (rows.length === 0) {
      return null;
    }
    // reduce() here is a manual "find the max" — seeded with the first row so there's always
    // a starting "best" to compare against.
    return rows.reduce((best, r) => (r.card.cardPrice > best.card.cardPrice ? r : best), rows[0]).card;
  });

  readonly byRarity = computed<CategoryBreakdown[]>(() => {
    const rows = this.ownedRows();
    return this.refData
      .cardRarities()
      .map((rarity) => ({
        name: rarity.rarity,
        owned: rows
          .filter((r) => r.card.cardRarity === rarity.id)
          .reduce((sum, r) => sum + r.quantity, 0),
        total: this.allCardStore.cards().filter((c) => c.cardRarity === rarity.id).length,
      }))
      .filter((b) => b.total > 0); // hide rarities that don't exist in the DB at all
  });

  /** Colour rows like "Fury-Chaos" are decomposed so an owned dual-colour card counts toward both. */
  readonly byColour = computed<CategoryBreakdown[]>(() => {
    const rows = this.ownedRows();
    const baseColours = this.refData.cardColours().filter((c) => !c.colour.includes('-'));

    return baseColours
      .map((base) => ({
        name: base.colour,
        owned: rows
          // "Fury-Chaos".split('-') -> ["Fury", "Chaos"] — checking .includes(base.colour)
          // means a card coloured "Fury-Chaos" counts toward BOTH the Fury and Chaos totals.
          .filter((r) => r.card.colourName.split('-').includes(base.colour))
          .reduce((sum, r) => sum + r.quantity, 0),
        total: this.allCardStore
          .cards()
          .filter((c) => {
            const colourName = this.refData.colourNameById().get(c.cardColour);
            return colourName ? colourName.split('-').includes(base.colour) : false;
          }).length,
      }))
      .filter((b) => b.total > 0);
  });

  readonly bySet = computed<CategoryBreakdown[]>(() => {
    const rows = this.ownedRows();
    return this.refData.cardSets().map((set) => ({
      name: set.setName,
      owned: rows.filter((r) => r.card.cardSet === set.id).length,
      total: set.totalCollectorNum, // the set's real total card count, not "cards loaded so far"
    }));
  });
}
