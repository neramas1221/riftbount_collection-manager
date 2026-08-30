import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CategoryIconComponent, IconKind } from './category-icon.component';

/**
 * A clickable "progress bar" row used for the By Rarity / Elements / Sets breakdown panels on
 * Collection Explorer — one reusable component instead of writing the same bar/label/count
 * markup three times. See collection-explorer.component.html for how it's used.
 */
@Component({
  selector: 'app-stat-bar',
  imports: [CategoryIconComponent, DecimalPipe],
  templateUrl: './stat-bar.component.html',
})
export class StatBarComponent {
  readonly name = input.required<string>();
  /** Optional shorter label for display only — filtering/tracking still keys off name(). */
  readonly displayName = input<string | null>(null);
  readonly owned = input.required<number>();
  readonly total = input.required<number>();
  /** null hides the icon entirely (used for the Sets panel, which has no per-row icon). */
  readonly iconKind = input<IconKind | null>(null);
  /** Highlights this row as the currently-applied filter — set by the parent, not by this component. */
  readonly active = input(false);
  readonly clickable = input(true);

  /**
   * `output<void>()` is the signal-based replacement for `@Output() rowClick = new
   * EventEmitter<void>()`. A parent listens for it the same way either way: `(rowClick)="..."`.
   * This component only ever announces "I was clicked" — it has no idea what clicking it
   * should DO (toggle a colour filter? a rarity filter?); that logic lives entirely in whichever
   * page uses this component, which is what makes it reusable across three different panels.
   */
  readonly rowClick = output<void>();

  protected readonly pct = computed(() => (this.total() === 0 ? 0 : (this.owned() / this.total()) * 100));
  protected readonly label = computed(() => this.displayName() ?? this.name());
}
