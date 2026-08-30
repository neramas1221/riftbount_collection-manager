import { Component, ElementRef, computed, inject, OnInit, signal, viewChild, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, of, switchMap } from 'rxjs';
import { AllCardService } from '../../core/services/all-card.service';
import { AllCardStore } from '../../core/services/all-card-store.service';
import { OwnedCardStore } from '../../core/services/owned-card-store.service';
import { ReferenceDataService } from '../../core/services/reference-data.service';
import { CardDetailModalService } from '../../core/services/card-detail-modal.service';
import { PendingCardFilterService } from '../../core/services/pending-card-filter.service';
import { CardImageComponent } from '../../shared/components/card-image.component';
import { DropdownOption, MultiSelectDropdownComponent } from '../../shared/components/multi-select-dropdown.component';
import { AllCard, EnrichedCard, UserCardFilterRequest } from '../../core/models/card.models';

type TriState = 'any' | 'yes' | 'no';

interface NumericRange {
  min: number | null;
  max: number | null;
}

const SPELL_TYPE = 'spell';
const BATTLEFIELD_TYPE = 'battlefield';
const MAX_COLOURS = 2;
const SEARCH_DEBOUNCE_MS = 250;
// A dedicated array instance (not just `[]` inline below) so `searchResults() === NO_RESULTS_YET`
// can tell "no response has come back yet" apart from "the server genuinely returned zero
// cards" — see `loading` further down for why that distinction matters.
const NO_RESULTS_YET: AllCard[] = [];

/** 'any' -> no opinion (field omitted from the request); 'yes'/'no' -> an actual true/false. */
function triStateToBool(state: TriState): boolean | undefined {
  return state === 'any' ? undefined : state === 'yes';
}

/**
 * Route: /database — the full card search/filter page. This is the most involved component in
 * the app: every filter control writes to its own signal, all of them feed into one computed
 * request object, and that request is sent to the backend automatically (debounced) whenever
 * anything in it changes — there's no explicit "Search" button anywhere.
 */
@Component({
  selector: 'app-card-database',
  imports: [FormsModule, CardImageComponent, MultiSelectDropdownComponent],
  templateUrl: './card-database.component.html',
  // See collection-explorer.component.ts for why this is needed.
  host: { class: 'contents' },
})
export class CardDatabaseComponent implements OnInit {
  private readonly allCardService = inject(AllCardService);
  protected readonly allCardStore = inject(AllCardStore);
  protected readonly ownedCardStore = inject(OwnedCardStore);
  protected readonly refData = inject(ReferenceDataService);
  protected readonly modal = inject(CardDetailModalService);
  private readonly pendingFilter = inject(PendingCardFilterService);

  protected readonly loadError = signal<string | null>(null);
  /** Card-name search — applied client-side (see filteredCards), the search endpoint has no name param. */
  protected readonly nameFilter = signal('');
  protected readonly moreFiltersOpen = signal(false);
  private readonly gridEl = viewChild<ElementRef<HTMLElement>>('cardGrid');

  protected readonly selectedSets = signal(new Set<string>());
  protected readonly selectedTypes = signal(new Set<string>());
  /** Base colour names only (e.g. "Fury"), never the "Fury-Chaos" combo rows — see baseColourOptions. */
  protected readonly selectedBaseColours = signal(new Set<string>());
  protected readonly filterRarityName = signal<string | null>(null);
  /** Set only by clicking a subtype tag in the card detail modal — no dedicated UI control. */
  protected readonly filterSubtype = signal<string | null>(null);

  protected readonly energyRange = signal<NumericRange>({ min: null, max: null });
  protected readonly mightRange = signal<NumericRange>({ min: null, max: null });
  protected readonly powerRange = signal<NumericRange>({ min: null, max: null });

  protected readonly overNumberedFilter = signal<TriState>('any');
  protected readonly alternativeFilter = signal<TriState>('any');
  protected readonly signatureFilter = signal<TriState>('any');
  protected readonly tokenFilter = signal<TriState>('any');

  /** Battlefield selected hides colour/might/energy/power per the Riftbound domain rules. */
  protected readonly battlefieldSelected = computed(() =>
    [...this.selectedTypes()].some((t) => t.toLowerCase() === BATTLEFIELD_TYPE)
  );

  /** Spell selected hides Might specifically. */
  protected readonly spellSelected = computed(() =>
    [...this.selectedTypes()].some((t) => t.toLowerCase() === SPELL_TYPE)
  );

  protected readonly showColourFilter = computed(() => !this.battlefieldSelected());
  protected readonly showMightFilter = computed(() => !this.battlefieldSelected() && !this.spellSelected());
  protected readonly showEnergyFilter = computed(() => !this.battlefieldSelected());
  protected readonly showPowerFilter = computed(() => !this.battlefieldSelected());

  protected readonly setOptions = computed<DropdownOption[]>(() =>
    [...this.refData.cardSets()]
      .sort((a, b) => a.setName.localeCompare(b.setName))
      .map((s) => ({ value: s.setName, label: s.setName }))
  );

  /**
   * card-colour rows are pre-combined ("Fury", "Fury-Chaos", ...) rather than one row per
   * base colour, so the dropdown only offers the base colours (Colorless included) and
   * resolveColourFilterNames() maps a base-colour selection back to every matching row.
   */
  protected readonly colourOptions = computed<DropdownOption[]>(() =>
    this.refData
      .cardColours()
      .filter((c) => !c.colour.includes('-'))
      .sort((a, b) => a.colour.localeCompare(b.colour))
      .map((c) => ({ value: c.colour, label: c.colour, iconKind: 'colour' as const }))
  );

  /** How many filters are hiding inside the collapsed "More filters" panel — shown as a badge on its toggle button. */
  protected readonly moreFiltersCount = computed(() => {
    const ranges = [this.energyRange(), this.mightRange(), this.powerRange()];
    const flags = [this.overNumberedFilter(), this.alternativeFilter(), this.signatureFilter(), this.tokenFilter()];
    return (
      this.selectedTypes().size +
      (this.filterRarityName() ? 1 : 0) +
      ranges.filter((r) => r.min !== null || r.max !== null).length +
      flags.filter((s) => s !== 'any').length
    );
  });

  protected readonly totalFilterCount = computed(
    () =>
      this.selectedSets().size +
      this.selectedBaseColours().size +
      this.moreFiltersCount() +
      (this.filterSubtype() ? 1 : 0)
  );

  /**
   * Built reactively from every filter control; POSTed to /api/all-card/search. Being a
   * computed() means this object is rebuilt from scratch every time ANY filter signal changes
   * — it doesn't matter which one, this always re-derives the whole request, which is what lets
   * `searchResults` below simply react to "this computed value changed" without needing to know
   * about each individual filter itself.
   */
  private readonly filterRequest = computed<UserCardFilterRequest>(() => {
    const isBattlefield = this.battlefieldSelected();
    const isSpell = this.spellSelected();
    const energy = this.energyRange();
    const might = this.mightRange();
    const power = this.powerRange();

    return {
      cardSets: this.setOrUndefined(this.selectedSets()),
      cardTypes: this.setOrUndefined(this.selectedTypes()),
      cardColours: isBattlefield ? undefined : this.resolveColourFilterNames(),
      cardEnergyMin: isBattlefield ? undefined : (energy.min ?? undefined),
      cardEnergyMax: isBattlefield ? undefined : (energy.max ?? undefined),
      cardMightMin: isBattlefield || isSpell ? undefined : (might.min ?? undefined),
      cardMightMax: isBattlefield || isSpell ? undefined : (might.max ?? undefined),
      cardPowerMin: isBattlefield ? undefined : (power.min ?? undefined),
      cardPowerMax: isBattlefield ? undefined : (power.max ?? undefined),
      isOverNumbered: triStateToBool(this.overNumberedFilter()),
      isAlternative: triStateToBool(this.alternativeFilter()),
      isToken: this.tokenFilter() === 'any' ? undefined : this.tokenFilter() === 'yes' ? 1 : 0,
      isSignature: triStateToBool(this.signatureFilter()),
    };
  });

  /**
   * This is where signals and RxJS meet. `toObservable()` converts the `filterRequest` signal
   * into a stream that emits every time it changes; `.pipe(...)` then chains RxJS operators
   * onto that stream; `toSignal()` converts the final result back into a signal the template
   * can read directly with `searchResults()`.
   *   - `debounceTime(250)` waits for 250ms of no further changes before continuing — so typing
   *     multiple filter tweaks quickly (or dragging a range slider) doesn't fire a request per
   *     keystroke, only once things settle.
   *   - `switchMap` calls the search API and, crucially, cancels any still-in-flight PREVIOUS
   *     request if a newer filter change comes in before it resolves — without this, a slow
   *     earlier response could overwrite a newer one and show stale results.
   *   - `catchError` stops a failed request from killing the whole stream permanently (an
   *     uncaught Observable error stops future emissions too) — it reports the error and
   *     substitutes an empty result instead.
   */
  private readonly searchResults = toSignal(
    toObservable(this.filterRequest).pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      switchMap((filter) =>
        this.allCardService.search(filter).pipe(
          catchError(() => {
            this.loadError.set('Could not reach the Spring Boot API on :8080. Is it running?');
            return of<AllCard[]>([]);
          })
        )
      )
    ),
    { initialValue: NO_RESULTS_YET }
  );

  /** True until the first search response actually lands — compares by reference against the NO_RESULTS_YET sentinel, not by checking .length, so a real "0 cards match" response isn't mistaken for "still loading". */
  protected readonly loading = computed(() => !this.allCardStore.loaded() || this.searchResults() === NO_RESULTS_YET);

  /** Rarity and subtype aren't supported by the search endpoint yet, so they're applied client-side, same as name. */
  protected readonly filteredCards = computed<EnrichedCard[]>(() => {
    const name = this.nameFilter().trim().toLowerCase();
    const rarity = this.filterRarityName();
    const subtype = this.filterSubtype();

    return this.searchResults()
      .map((c) => this.refData.enrich(c))
      .filter((card) => {
        if (name && !card.cardName.toLowerCase().includes(name)) return false;
        if (rarity && card.rarityName !== rarity) return false;
        if (subtype && !card.subType.includes(subtype)) return false;
        return true;
      });
  });

  ngOnInit(): void {
    this.refData.ensureLoaded();
    this.allCardStore.ensureLoaded();
    this.ownedCardStore.ensureLoaded();
    this.applyPendingFilter();
  }

  /** If the card detail modal sent us here with a filter request (clicking a Set/Type/Colour/Rarity/tag), apply it now and clear everything else first. */
  private applyPendingFilter(): void {
    const pending = this.pendingFilter.consume();
    if (!pending) {
      return;
    }
    this.clearFilters();
    switch (pending.kind) {
      case 'set':
        this.selectedSets.set(new Set([pending.value as string]));
        break;
      case 'type':
        this.selectedTypes.set(new Set([pending.value as string]));
        break;
      case 'colour':
        this.selectedBaseColours.set(new Set(Array.isArray(pending.value) ? pending.value : [pending.value]));
        break;
      case 'rarity':
        this.filterRarityName.set(pending.value as string);
        break;
      case 'subtype':
        this.filterSubtype.set(pending.value as string);
        break;
    }
  }

  /** Opens the card detail modal with prev/next scoped to whatever the current filters are showing. */
  protected openCard(cardId: number): void {
    this.modal.open(
      cardId,
      this.filteredCards().map((c) => c.id)
    );
  }

  protected ownedQuantity(cardId: number): number {
    return this.ownedCardStore.ownedByCardId().get(cardId)?.quantity ?? 0;
  }

  protected toggleSet(name: string): void {
    this.toggleInSet(this.selectedSets, name);
  }

  protected toggleType(name: string): void {
    this.toggleInSet(this.selectedTypes, name);
  }

  protected toggleColour(name: string): void {
    const current = this.selectedBaseColours();
    if (current.has(name)) {
      this.toggleInSet(this.selectedBaseColours, name);
      return;
    }
    // Already at the 2-colour cap and trying to add a THIRD — silently ignore the click rather
    // than replacing an existing selection or throwing an error.
    if (current.size >= MAX_COLOURS) {
      return;
    }
    this.toggleInSet(this.selectedBaseColours, name);
  }

  protected toggleRarity(name: string): void {
    this.filterRarityName.update((current) => (current === name ? null : name));
  }

  protected clearFilters(): void {
    this.nameFilter.set('');
    this.selectedSets.set(new Set());
    this.selectedTypes.set(new Set());
    this.selectedBaseColours.set(new Set());
    this.filterRarityName.set(null);
    this.filterSubtype.set(null);
    this.energyRange.set({ min: null, max: null });
    this.mightRange.set({ min: null, max: null });
    this.powerRange.set({ min: null, max: null });
    this.overNumberedFilter.set('any');
    this.alternativeFilter.set('any');
    this.signatureFilter.set('any');
    this.tokenFilter.set('any');
    this.gridEl()?.nativeElement.scrollTo({ top: 0 });
  }

  /**
   * Shared add/remove-from-a-Set-signal helper for toggleSet()/toggleType() (and indirectly
   * toggleColour()) — `WritableSignal<Set<string>>` as a parameter type means this function
   * works on ANY of those signals without needing a separate copy of the same three lines for
   * each one.
   */
  private toggleInSet(target: WritableSignal<Set<string>>, value: string): void {
    target.update((set) => {
      const next = new Set(set);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  /** UserCardFilterRequest fields are meant to be omitted (undefined), not sent as an empty array, when nothing's selected. */
  private setOrUndefined(values: Set<string>): string[] | undefined {
    return values.size ? [...values] : undefined;
  }

  /**
   * One base colour selected -> every row featuring it (mono or in any combo).
   * Two base colours selected -> only the row that's exactly that pair, either order.
   */
  private resolveColourFilterNames(): string[] | undefined {
    const selected = this.selectedBaseColours();
    if (selected.size === 0) {
      return undefined;
    }

    const matches = this.refData.cardColours().filter((c) => {
      const parts = new Set(c.colour.split('-'));
      if (selected.size === 1) {
        return parts.has([...selected][0]);
      }
      return parts.size === selected.size && [...selected].every((s) => parts.has(s));
    });

    // No matching combo row for this pair (e.g. Colorless + another colour) -> force zero results
    // rather than falling back to "no filter" (an empty array is also treated as "no filter").
    return matches.length ? matches.map((c) => c.colour) : ['__no_matching_colour__'];
  }
}
