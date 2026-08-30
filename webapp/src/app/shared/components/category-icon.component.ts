import { Component, computed, input } from '@angular/core';

export type IconKind = 'colour' | 'rarity';

// Case-INsensitive lookup keys ("fury" not "Fury") — the real data's casing (`card.colour` is
// "Fury") gets lowercased before indexing into these, see `colour` computed below.
const COLOUR_HEX: Record<string, string> = {
  fury: '#ef4444',
  chaos: '#a855f7',
  body: '#f97316',
  order: '#eab308',
  calm: '#06b6d4',
  mind: '#3b82f6',
  colorless: '#9ca3af',
};

const RARITY_HEX: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  showcase: '#d4af37',
  promo: '#ec4899',
};

/**
 * No real Riftbound icon/brand assets are available from the API (colour and rarity rows are
 * just {id, name}), so this renders a small colour-coded swatch as a stand-in for the
 * per-category icon dot.gg shows next to colour/rarity names.
 *
 * `input.required<T>()` (Angular's signal-based inputs, the modern replacement for
 * `@Input() kind!: IconKind`) means this component literally cannot be used without passing
 * `[kind]` and `[name]` — Angular's template type-checker will error at build time if a caller
 * forgets one. `input(10)` (no `.required`) is the same idea but optional, defaulting to 10.
 *
 * The template here is inline (`template: '...'`) rather than a separate .html file — a
 * reasonable choice for something this small (one element), but every other component in this
 * app uses `templateUrl` instead once the markup is more than a line or two.
 */
@Component({
  selector: 'app-category-icon',
  template: `<span class="inline-block shrink-0 rounded-full" [style.width.px]="size()" [style.height.px]="size()" [style.background]="colour()"></span>`,
})
export class CategoryIconComponent {
  readonly kind = input.required<IconKind>();
  readonly name = input.required<string>();
  readonly size = input(10); // diameter in pixels

  // Re-derives automatically whenever `kind`/`name` change (they're signals too, being inputs).
  protected readonly colour = computed(() => {
    const key = this.name().toLowerCase();
    const map = this.kind() === 'colour' ? COLOUR_HEX : RARITY_HEX;
    return map[key] ?? '#6b7280'; // unrecognized name (e.g. a "Fury-Chaos" combo) -> neutral grey
  });
}
