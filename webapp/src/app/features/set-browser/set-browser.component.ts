import { Component, ElementRef, computed, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { AllCardStore } from '../../core/services/all-card-store.service';
import { OwnedCardStore } from '../../core/services/owned-card-store.service';
import { ReferenceDataService } from '../../core/services/reference-data.service';
import { CardDetailModalService } from '../../core/services/card-detail-modal.service';
import { CardImageComponent } from '../../shared/components/card-image.component';
import { CardSet, EnrichedCard } from '../../core/models/card.models';

const DEFAULT_SET_NAME = 'origins';

/** Route: /sets — a two-pane layout, set list on the left, that set's cards as an image grid on the right. */
@Component({
  selector: 'app-set-browser',
  imports: [CardImageComponent],
  templateUrl: './set-browser.component.html',
  // See collection-explorer.component.ts for why this is needed.
  host: { class: 'contents' },
})
export class SetBrowserComponent implements OnInit {
  protected readonly allCardStore = inject(AllCardStore);
  protected readonly ownedCardStore = inject(OwnedCardStore);
  protected readonly refData = inject(ReferenceDataService);
  protected readonly modal = inject(CardDetailModalService);

  protected readonly selectedSetId = signal<number | null>(null);
  /** Reference to the right-hand card grid, used only to reset its scroll position when the set changes — see selectSet() below. */
  private readonly gridEl = viewChild<ElementRef<HTMLElement>>('cardGrid');

  protected readonly loading = computed(() => !this.allCardStore.loaded() || !this.refData.loaded());

  /** Every set, alongside how many of its cards are actually loaded (may be less than the set's real totalCollectorNum if the DB import isn't complete). */
  protected readonly setSummaries = computed(() => {
    const counts = new Map<number, number>();
    for (const card of this.allCardStore.cards()) {
      counts.set(card.cardSet, (counts.get(card.cardSet) ?? 0) + 1);
    }
    return this.refData
      .cardSets()
      .map((set: CardSet) => ({
        set,
        cardCount: counts.get(set.id) ?? 0,
      }))
      .sort((a, b) => a.set.setName.localeCompare(b.set.setName));
  });

  protected readonly selectedSet = computed(() =>
    this.refData.cardSets().find((s) => s.id === this.selectedSetId()) ?? null
  );

  protected readonly cardsInSelectedSet = computed<EnrichedCard[]>(() => {
    const setId = this.selectedSetId();
    if (setId === null) {
      return [];
    }
    return this.allCardStore
      .cards()
      .filter((c) => c.cardSet === setId)
      .map((c) => this.refData.enrich(c))
      // `{ numeric: true }` makes localeCompare sort "10" after "9" instead of before it (a
      // plain string sort would put "10" before "2" — this treats embedded digits as numbers).
      .sort((a, b) => a.collectorNumber.localeCompare(b.collectorNumber, undefined, { numeric: true }));
  });

  constructor() {
    // `effect()` re-runs its callback whenever any signal it reads changes — unlike computed(),
    // it doesn't return a value; it's for side effects (here: writing to ANOTHER signal,
    // selectedSetId) rather than deriving one. This has to live in the constructor because
    // effect() needs to run within Angular's "injection context", which field initializers and
    // constructors are, but arbitrary methods aren't.
    effect(() => {
      const sets = this.refData.cardSets();
      // Only auto-select once sets have actually loaded, and only if nothing's selected yet —
      // otherwise this would fight with the user manually clicking a different set, re-running
      // every time `sets` happens to change reference for unrelated reasons.
      if (sets.length === 0 || this.selectedSetId() !== null) {
        return;
      }
      const origins = sets.find((s) => s.setName.toLowerCase() === DEFAULT_SET_NAME);
      const fallback = [...sets].sort((a, b) => a.setName.localeCompare(b.setName))[0];
      this.selectedSetId.set((origins ?? fallback).id);
    });
  }

  ngOnInit(): void {
    this.refData.ensureLoaded();
    this.allCardStore.ensureLoaded();
    this.ownedCardStore.ensureLoaded();
  }

  protected selectSet(setId: number): void {
    this.selectedSetId.set(setId);
    // Without this, switching from a long set to a short one (or just scrolled halfway down a
    // long one) would leave the grid showing whatever scroll position the PREVIOUS set was at.
    this.gridEl()?.nativeElement.scrollTo({ top: 0 });
  }

  protected ownedQuantity(cardId: number): number {
    return this.ownedCardStore.ownedByCardId().get(cardId)?.quantity ?? 0;
  }

  /** Opens the card detail modal with prev/next scoped to every card currently shown in this set. */
  protected openCard(cardId: number): void {
    this.modal.open(
      cardId,
      this.cardsInSelectedSet().map((c) => c.id)
    );
  }
}
