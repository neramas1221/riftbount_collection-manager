import { Component, computed, input } from '@angular/core';
import { EnrichedCard } from '../../core/models/card.models';

const BATTLEFIELD_TYPE = 'battlefield';

/**
 * The one component every card image renders through — Set Browser, Card Database, Collection
 * Explorer's table thumbnails, and the card detail modal all use this instead of a plain
 * `<img>`, so the owned/unowned dimming and the battlefield-rotation trick only have to be
 * written once and automatically apply everywhere.
 *
 * Important: the `group-hover:` classes used in the template only work because every place
 * that uses this component wraps it in an element with `class="group"` (a plain Tailwind
 * convention, nothing Angular-specific) — hovering over THAT ancestor is what triggers the
 * "reveal true colours" effect on an otherwise-faded unowned card.
 */
@Component({
  selector: 'app-card-image',
  templateUrl: './card-image.component.html',
})
export class CardImageComponent {
  readonly card = input.required<EnrichedCard>();
  readonly owned = input(false);

  /** Fallback shown instead of an <img> when a card has no cardImageUrl — e.g. "Blazing Scorcher" -> "BS". */
  protected readonly initials = computed(() =>
    this.card()
      .cardName.split(/\s+/) // split on any run of whitespace
      .map((word) => word[0]) // first letter of each word
      .slice(0, 3) // cap at 3 letters so long names don't overflow the little badge
      .join('')
      .toUpperCase()
  );

  /** Battlefield art is shot landscape even though the printed card (and our grid slot) is portrait. */
  protected readonly isBattlefield = computed(() => this.card().typeName.toLowerCase() === BATTLEFIELD_TYPE);

  /**
   * Rotating a landscape image 90deg to fill a 5:7 portrait box means sizing it as if it were
   * landscape *before* the rotation (width/height swapped relative to the box, plus a small
   * buffer), then rotating the whole thing in place so it lands back over the box with room to
   * spare. Real battlefield art is ~1038x744 (aspect ~1.395, checked against the actual CDN
   * URLs) which is already almost an exact match for a 5:7 box rotated 90° (~1.4), so the buffer
   * is just for rounding safety — object-cover then crops that sliver instead of leaving gaps
   * (object-contain would letterbox on any mismatch, however small, making these look smaller
   * than every other card in the grid).
   */
  protected readonly imageSizingClass = computed(() =>
    this.isBattlefield()
      ? 'absolute left-1/2 top-1/2 h-[75%] w-[145%] -translate-x-1/2 -translate-y-1/2 rotate-90 object-cover'
      : 'h-full w-full object-cover'
  );

  /** Unowned cards render slightly faded + desaturated; hovering the ancestor `.group` reveals the real artwork. */
  protected readonly dimmingClass = computed(() =>
    this.owned() ? '' : 'opacity-80 grayscale group-hover:opacity-100 group-hover:grayscale-0'
  );
}
