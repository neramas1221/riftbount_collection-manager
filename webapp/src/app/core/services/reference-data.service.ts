import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CardColourService } from './card-colour.service';
import { CardRarityService } from './card-rarity.service';
import { CardSetService } from './card-set.service';
import { CardTypeService } from './card-type.service';
import { SuperTypeService } from './super-type.service';
import {
  AllCard,
  CardColour,
  CardRarity,
  CardSet,
  CardType,
  EnrichedCard,
  SuperType,
} from '../models/card.models';

/**
 * Loads all five "lookup tables" (sets, types, colours, super-types, rarities) once, and
 * provides `enrich()` — the one function every page uses to turn a raw AllCard (which only has
 * numeric foreign keys like `cardSet: 6`) into an EnrichedCard with actual names ("Origins")
 * ready to display.
 */
@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  private readonly cardSetService = inject(CardSetService);
  private readonly cardTypeService = inject(CardTypeService);
  private readonly cardColourService = inject(CardColourService);
  private readonly superTypeService = inject(SuperTypeService);
  private readonly cardRarityService = inject(CardRarityService);

  readonly cardSets = signal<CardSet[]>([]);
  readonly cardTypes = signal<CardType[]>([]);
  readonly cardColours = signal<CardColour[]>([]);
  readonly superTypes = signal<SuperType[]>([]);
  readonly cardRarities = signal<CardRarity[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal<string | null>(null);

  // One id -> name Map per lookup table, each recomputed automatically whenever its source
  // signal changes. Doing this once here (rather than searching the array with .find() every
  // time a name is needed) is what makes enrich() cheap to call for every card in a big list.
  readonly setNameById = computed(() => new Map(this.cardSets().map((s) => [s.id, s.setName])));
  readonly typeNameById = computed(() => new Map(this.cardTypes().map((t) => [t.id, t.type])));
  readonly colourNameById = computed(() => new Map(this.cardColours().map((c) => [c.id, c.colour])));
  readonly superTypeNameById = computed(() => new Map(this.superTypes().map((s) => [s.id, s.superType])));
  readonly rarityNameById = computed(() => new Map(this.cardRarities().map((r) => [r.id, r.rarity])));

  private loadTriggered = false;

  ensureLoaded(): void {
    if (this.loadTriggered) {
      return;
    }
    this.loadTriggered = true;

    // forkJoin fires all five requests in parallel and waits for every one of them to
    // complete before emitting a single combined result — much faster than awaiting them one
    // at a time, and simpler than five separate .subscribe() calls each setting one signal.
    forkJoin({
      cardSets: this.cardSetService.getAll(),
      cardTypes: this.cardTypeService.getAll(),
      cardColours: this.cardColourService.getAll(),
      superTypes: this.superTypeService.getAll(),
      cardRarities: this.cardRarityService.getAll(),
    }).subscribe({
      next: ({ cardSets, cardTypes, cardColours, superTypes, cardRarities }) => {
        this.cardSets.set(cardSets);
        this.cardTypes.set(cardTypes);
        this.cardColours.set(cardColours);
        this.superTypes.set(superTypes);
        this.cardRarities.set(cardRarities);
        this.loaded.set(true);
      },
      error: (err) => {
        this.loadError.set('Could not reach the Spring Boot API on :8080. Is it running?');
        console.error('Failed to load reference data', err);
      },
    });
  }

  /**
   * Resolves a raw AllCard's foreign-key ids into an EnrichedCard with real names. Falls back
   * to placeholder text (rather than throwing) if a lookup table hasn't loaded yet or the id
   * genuinely isn't found, so a render never crashes mid-load. superType/cardRarity are
   * optional on a card (can be `null`), so those two skip the lookup entirely rather than
   * looking up "null" and getting a wrong/undefined result.
   */
  enrich(card: AllCard): EnrichedCard {
    return {
      ...card, // spread copies every existing AllCard field across before adding the new ones
      setName: this.setNameById().get(card.cardSet) ?? 'Unknown set',
      typeName: this.typeNameById().get(card.cardType) ?? 'Unknown type',
      colourName: this.colourNameById().get(card.cardColour) ?? 'Unknown colour',
      superTypeName: card.superType !== null ? (this.superTypeNameById().get(card.superType) ?? null) : null,
      rarityName: card.cardRarity !== null ? (this.rarityNameById().get(card.cardRarity) ?? null) : null,
    };
  }
}
