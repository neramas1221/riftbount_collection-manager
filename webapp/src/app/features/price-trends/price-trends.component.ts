import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllCardStore } from '../../core/services/all-card-store.service';
import { OwnedCardStore } from '../../core/services/owned-card-store.service';
import { CollectionStatsService } from '../../core/services/collection-stats.service';
import { PriceHistoryService } from '../../core/services/price-history.service';
import { ReferenceDataService } from '../../core/services/reference-data.service';
import { CardDetailModalService } from '../../core/services/card-detail-modal.service';
import { EnrichedCard, PricePoint } from '../../core/models/card.models';

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;

/**
 * Route: /price-trends — collection-value stats up top (from CollectionStatsService), then a
 * search box and a hand-drawn SVG line chart for one chosen card's (simulated, see
 * price-history.service.ts) price history.
 */
@Component({
  selector: 'app-price-trends',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './price-trends.component.html',
  // See collection-explorer.component.ts for why this is needed.
  host: { class: 'contents' },
})
export class PriceTrendsComponent implements OnInit {
  private readonly priceHistoryService = inject(PriceHistoryService);
  protected readonly allCardStore = inject(AllCardStore);
  protected readonly ownedCardStore = inject(OwnedCardStore);
  protected readonly refData = inject(ReferenceDataService);
  protected readonly stats = inject(CollectionStatsService);
  protected readonly modal = inject(CardDetailModalService);

  protected readonly loading = computed(() => !this.allCardStore.loaded() || !this.ownedCardStore.loaded());
  protected readonly searchTerm = signal('');
  protected readonly selectedCardId = signal<number | null>(null);
  /** Not a computed() like almost everything else here — it's populated by an async HTTP call in selectCard(), so it has to be a plain writable signal something else sets later. */
  protected readonly history = signal<PricePoint[]>([]);

  protected readonly enrichedCards = computed<EnrichedCard[]>(() =>
    this.allCardStore.cards().map((c) => this.refData.enrich(c))
  );

  protected readonly searchResults = computed<EnrichedCard[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return [];
    }
    return this.enrichedCards()
      .filter((c) => c.cardName.toLowerCase().includes(term))
      .slice(0, 20);
  });

  protected readonly selectedCard = computed<EnrichedCard | null>(() => {
    const id = this.selectedCardId();
    return id === null ? null : (this.enrichedCards().find((c) => c.id === id) ?? null);
  });

  protected readonly chartWidth = CHART_WIDTH;
  protected readonly chartHeight = CHART_HEIGHT;

  /** The lowest/highest price in the currently-shown history — used to scale the chart so it always fills the available height regardless of the actual price range. */
  protected readonly priceRange = computed(() => {
    const points = this.history();
    if (points.length === 0) {
      return { min: 0, max: 1 };
    }
    const prices = points.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  });

  /**
   * Builds an SVG `<path>` "d" attribute by hand — this app has no charting library, the line
   * chart is just a manually-drawn path string. Each point becomes an "M x,y" (move-to, for the
   * very first point) or "L x,y" (line-to, for every point after) command; `x` maps a point's
   * INDEX evenly across the chart's width, and `y` maps its PRICE (inverted, since SVG's y-axis
   * grows downward) across the chart's height using priceRange() to normalize it into 0..1 first.
   */
  protected readonly chartPath = computed(() => {
    const points = this.history();
    if (points.length < 2) {
      return '';
    }
    const { min, max } = this.priceRange();
    const span = max - min || 1; // avoid dividing by zero if every point happens to be the same price

    return points
      .map((point, i) => {
        const x = (i / (points.length - 1)) * CHART_WIDTH;
        const y = CHART_HEIGHT - ((point.price - min) / span) * (CHART_HEIGHT - 20) - 10;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  /** First-point-to-last-point change over the visible history, shown as both a raw amount and a percentage. */
  protected readonly priceChange = computed(() => {
    const points = this.history();
    if (points.length < 2) {
      return { absolute: 0, percent: 0 };
    }
    const first = points[0].price;
    const last = points[points.length - 1].price;
    return { absolute: last - first, percent: first === 0 ? 0 : ((last - first) / first) * 100 };
  });

  ngOnInit(): void {
    this.refData.ensureLoaded();
    this.allCardStore.ensureLoaded();
    this.ownedCardStore.ensureLoaded();
  }

  protected selectCard(card: EnrichedCard): void {
    this.selectedCardId.set(card.id);
    this.searchTerm.set('');
    // Unlike almost every other data fetch in this app, this ISN'T routed through a store —
    // there's no shared "price history" state anything else needs, so it's fetched directly
    // here and written straight into the `history` signal.
    this.priceHistoryService.getHistory(card.id).subscribe((points) => this.history.set(points));
  }

  /** No filtered-list context to scope prev/next to here (unlike the card grids) — just this one card. */
  protected openCard(cardId: number): void {
    this.modal.open(cardId, [cardId]);
  }
}
