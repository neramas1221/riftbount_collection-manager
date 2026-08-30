import { Component, HostListener, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AllCardStore } from '../../core/services/all-card-store.service';
import { OwnedCardStore } from '../../core/services/owned-card-store.service';
import { ReferenceDataService } from '../../core/services/reference-data.service';
import { CardDetailModalService } from '../../core/services/card-detail-modal.service';
import { PendingCardFilterService, PendingFilterKind } from '../../core/services/pending-card-filter.service';
import { CardImageComponent } from './card-image.component';
import { EnrichedCard } from '../../core/models/card.models';

const BATTLEFIELD_TYPE = 'battlefield';
const SPELL_TYPE = 'spell';

/**
 * The card detail popup. Deliberately NOT a routed page (there's no /cards/:id in
 * app.routes.ts) — it's mounted once in app.html (`<app-card-detail-modal />`) and shows/hides
 * itself purely based on CardDetailModalService.activeCardId, so it can overlay whichever page
 * you were already on (with prev/next through that page's current results) instead of
 * navigating away from it.
 */
@Component({
  selector: 'app-card-detail-modal',
  imports: [DecimalPipe, CardImageComponent],
  templateUrl: './card-detail-modal.component.html',
})
export class CardDetailModalComponent {
  protected readonly modal = inject(CardDetailModalService);
  protected readonly ownedCardStore = inject(OwnedCardStore);
  private readonly allCardStore = inject(AllCardStore);
  private readonly refData = inject(ReferenceDataService);
  private readonly pendingFilter = inject(PendingCardFilterService);
  private readonly router = inject(Router);

  /**
   * Looks the active card up from AllCardStore's already-loaded list and enriches it — no
   * network call happens here, since the full card list is already sitting in memory by the
   * time any card grid could have been clicked. Recomputes automatically whenever
   * modal.activeCardId() changes (i.e. every time open() or step() is called).
   */
  protected readonly card = computed<EnrichedCard | null>(() => {
    const id = this.modal.activeCardId();
    if (id === null) return null;
    const raw = this.allCardStore.cards().find((c) => c.id === id);
    return raw ? this.refData.enrich(raw) : null;
  });

  protected readonly isBattlefield = computed(() => this.card()?.typeName.toLowerCase() === BATTLEFIELD_TYPE);
  protected readonly isSpell = computed(() => this.card()?.typeName.toLowerCase() === SPELL_TYPE);
  /** null = not in the collection at all (shows "+ Add to collection" instead of a quantity). */
  protected readonly owned = computed(() => {
    const id = this.modal.activeCardId();
    return id === null ? null : (this.ownedCardStore.ownedByCardId().get(id) ?? null);
  });

  /** Keyboard shortcuts: Esc closes, arrow keys step prev/next — only while the modal is actually open. */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.modal.activeCardId() === null) return;
    if (event.key === 'Escape') this.modal.close();
    if (event.key === 'ArrowLeft') this.modal.step(-1);
    if (event.key === 'ArrowRight') this.modal.step(1);
  }

  /** +1/-1 stepper. Dropping to 0 or below removes the card from the collection instead of upserting a 0. */
  protected changeQuantity(delta: number): void {
    const cardId = this.modal.activeCardId();
    if (cardId === null) return;
    const current = this.owned();
    const nextQuantity = (current?.quantity ?? 0) + delta;

    if (nextQuantity <= 0) {
      if (current) this.ownedCardStore.remove(current.id).subscribe();
      return;
    }
    this.ownedCardStore.setQuantity(cardId, nextQuantity).subscribe();
  }

  protected removeFromCollection(): void {
    const current = this.owned();
    if (current) this.ownedCardStore.remove(current.id).subscribe();
  }

  /**
   * Handles clicking Set/Type/Colour/Rarity/a subtype tag inside the modal: hands the chosen
   * filter over to PendingCardFilterService (Card Database reads it on its own ngOnInit),
   * closes the modal, then navigates there. router.navigateByUrl() is Angular's programmatic
   * equivalent of clicking a [routerLink] — used here instead of a template routerLink because
   * this needs to run some other code (closing the modal, stashing the filter) first.
   */
  protected goToFilter(kind: PendingFilterKind, value: string | string[]): void {
    this.pendingFilter.request(kind, value);
    this.modal.close();
    this.router.navigateByUrl('/database');
  }

  /** Colour rows may be a "Fury-Chaos" combo — filter Card Database by both base colours. */
  protected colourFilterValue(): string | string[] {
    const colourName = this.card()?.colourName ?? '';
    return colourName.includes('-') ? colourName.split('-') : colourName;
  }
}
