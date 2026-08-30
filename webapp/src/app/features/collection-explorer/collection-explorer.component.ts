import { Component, ElementRef, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllCardStore } from '../../core/services/all-card-store.service';
import { OwnedCardStore } from '../../core/services/owned-card-store.service';
import { CollectionStatsService, OwnedCardRow } from '../../core/services/collection-stats.service';
import { ReferenceDataService } from '../../core/services/reference-data.service';
import { CardDetailModalService } from '../../core/services/card-detail-modal.service';
import { CardImageComponent } from '../../shared/components/card-image.component';
import { StatBarComponent } from '../../shared/components/stat-bar.component';
import { stripRiftboundPrefix } from '../../shared/utils/display-name.util';
import { EnrichedCard } from '../../core/models/card.models';

/**
 * The home page (route: /collection): collection-wide stats (unique/copies/value/completion),
 * three breakdown panels (Sets/Rarity/Elements), a search-to-add box, and the owned-cards table
 * itself with its own set of filters. This is the biggest consumer of CollectionStatsService —
 * almost everything on this page just reads `stats.xyz()` rather than computing anything itself.
 */
@Component({
  selector: 'app-collection-explorer',
  imports: [FormsModule, DecimalPipe, CardImageComponent, StatBarComponent],
  templateUrl: './collection-explorer.component.html',
  // Without this the host element sits in main's flex layout with default flex:0 1 auto,
  // so it never stretches to fill the viewport and the template's own flex-1/overflow never
  // gets a bounded height to work with — `contents` removes it from the box tree so the
  // template's root div becomes main's direct flex child instead.
  host: { class: 'contents' },
})
export class CollectionExplorerComponent implements OnInit {
  protected readonly allCardStore = inject(AllCardStore);
  protected readonly ownedCardStore = inject(OwnedCardStore);
  protected readonly refData = inject(ReferenceDataService);
  protected readonly stats = inject(CollectionStatsService);
  protected readonly modal = inject(CardDetailModalService);
  // viewChild() grabs a reference to the #scrollArea element from the template (see the .html
  // file) — used purely so clearTableFilters() can scroll it back to the top programmatically;
  // it returns a signal, and is `undefined` until the template has actually rendered that element.
  private readonly scrollEl = viewChild<ElementRef<HTMLElement>>('scrollArea');

  /** Search box for adding a NEW card to the collection — separate from tableNameFilter below, which filters the cards you already own. */
  protected readonly searchTerm = signal('');
  protected readonly tableNameFilter = signal('');
  protected readonly filterColours = signal(new Set<string>());
  protected readonly filterRarityName = signal<string | null>(null);
  protected readonly filterSetName = signal<string | null>(null);

  protected readonly loading = computed(() => !this.allCardStore.loaded() || !this.ownedCardStore.loaded());

  /** stats.ownedRows() narrowed down by whatever's currently in the table's own filter controls. */
  protected readonly filteredOwnedRows = computed<OwnedCardRow[]>(() => {
    const name = this.tableNameFilter().trim().toLowerCase();
    const colours = this.filterColours();
    const rarity = this.filterRarityName();
    const setName = this.filterSetName();

    return this.stats
      .ownedRows()
      .filter((row) => {
        if (name && !row.card.cardName.toLowerCase().includes(name)) return false;
        if (colours.size && !row.card.colourName.split('-').some((c) => colours.has(c))) return false;
        if (rarity && row.card.rarityName !== rarity) return false;
        if (setName && row.card.setName !== setName) return false;
        return true;
      })
      .sort((a, b) => a.card.cardName.localeCompare(b.card.cardName));
  });

  /** Up to 20 NOT-yet-owned cards matching the "add to collection" search box. */
  protected readonly searchResults = computed<EnrichedCard[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return [];
    }
    const ownedIds = new Set(this.ownedCardStore.ownedCards().map((o) => o.allCardId));
    return this.allCardStore
      .cards()
      .filter((c) => c.cardName.toLowerCase().includes(term) && !ownedIds.has(c.id))
      .slice(0, 20)
      .map((c) => this.refData.enrich(c));
  });

  ngOnInit(): void {
    // All three are safe to call from every page's ngOnInit — see each store's ensureLoaded()
    // for why calling this many times only actually fetches once.
    this.refData.ensureLoaded();
    this.allCardStore.ensureLoaded();
    this.ownedCardStore.ensureLoaded();
  }

  protected addToCollection(card: EnrichedCard): void {
    // Clear the search box only once the request actually succeeds (inside the subscribe
    // callback) — clearing it immediately would make the dropdown disappear before the user
    // sees any confirmation the click did something.
    this.ownedCardStore.setQuantity(card.id, 1).subscribe(() => this.searchTerm.set(''));
  }

  protected changeQuantity(row: OwnedCardRow, delta: number): void {
    const owned = this.ownedCardStore.ownedByCardId().get(row.card.id);
    if (!owned) return;
    const nextQuantity = owned.quantity + delta;
    if (nextQuantity <= 0) {
      this.ownedCardStore.remove(owned.id).subscribe();
      return;
    }
    this.ownedCardStore.setQuantity(row.card.id, nextQuantity).subscribe();
  }

  protected remove(row: OwnedCardRow): void {
    const owned = this.ownedCardStore.ownedByCardId().get(row.card.id);
    if (owned) {
      this.ownedCardStore.remove(owned.id).subscribe();
    }
  }

  /** Toggling an already-selected colour off is what makes these behave like "select 0 or more", not a strict radio choice. */
  protected toggleColourFilter(colour: string): void {
    this.filterColours.update((set) => {
      // Signals holding a Set/Map/array should always be replaced with a NEW instance (never
      // mutated in place with .add()/.delete() directly) — Angular detects signal changes by
      // reference, so mutating the same Set instance wouldn't trigger anything to re-render.
      const next = new Set(set);
      if (next.has(colour)) {
        next.delete(colour);
      } else {
        next.add(colour);
      }
      return next;
    });
  }

  /** Clicking the already-active rarity clears it (single-select, toggle-off) rather than a separate "clear" control. */
  protected toggleRarityFilter(rarity: string): void {
    this.filterRarityName.update((current) => (current === rarity ? null : rarity));
  }

  protected toggleSetFilter(setName: string): void {
    this.filterSetName.update((current) => (current === setName ? null : setName));
  }

  protected clearTableFilters(): void {
    this.tableNameFilter.set('');
    this.filterColours.set(new Set());
    this.filterRarityName.set(null);
    this.filterSetName.set(null);
    // `?.` guards against scrollEl() being undefined (template not rendered yet) — shouldn't
    // happen in practice since this only runs from a click inside the already-rendered page,
    // but the type system doesn't know that.
    this.scrollEl()?.nativeElement.scrollTo({ top: 0 });
  }

  /** Drops a leading "Riftbound " for display only — filtering still compares against the real set name. */
  protected displaySetName(name: string): string {
    return stripRiftboundPrefix(name);
  }

  /** Opens the card detail modal with prev/next scoped to whatever rows are currently visible in this table. */
  protected openCard(cardId: number): void {
    this.modal.open(
      cardId,
      this.filteredOwnedRows().map((r) => r.card.id)
    );
  }
}
