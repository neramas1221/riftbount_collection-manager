import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { CategoryIconComponent, IconKind } from './category-icon.component';

/** One row in the dropdown's option list. */
export interface DropdownOption {
  value: string;
  label: string;
  iconKind?: IconKind; // shows a small colour/rarity swatch next to the label when set
}

/**
 * A generic "Set: Origins, Vendetta +2 ▾" style multi-select popover, used for the Set and
 * Colour filters on Card Database. Deliberately knows nothing about cards/sets/colours —
 * it's handed a plain list of {value, label} options and a Set of currently-selected values,
 * and only ever reports back "this value was toggled"; the caller owns the actual filter state
 * and decides what selecting something means.
 */
@Component({
  selector: 'app-multi-select-dropdown',
  imports: [CategoryIconComponent],
  templateUrl: './multi-select-dropdown.component.html',
})
export class MultiSelectDropdownComponent {
  // ElementRef gives raw access to this component's own root DOM node — needed here purely to
  // implement "click outside this dropdown closes it" (see onDocumentClick below). Reaching
  // into the DOM directly like this is the exception, not the norm, in Angular; almost
  // everything else in this app is done through bindings/signals instead.
  private readonly elementRef = inject(ElementRef);

  readonly label = input.required<string>();
  readonly options = input.required<DropdownOption[]>();
  /** Owned by the PARENT, not this component — selecting an option doesn't mutate this directly, it just emits toggleOption and waits for the parent to pass a new Set back in. */
  readonly selected = input.required<Set<string>>();
  /** Optional cap on how many can be selected at once (used for the 2-colour rule) — null means unlimited. */
  readonly max = input<number | null>(null);

  readonly toggleOption = output<string>();

  /** Whether the option panel is currently expanded — local UI state, not something the parent needs to know about. */
  protected readonly open = signal(false);

  /** The text shown on the closed button: "Any", one/two names, or "X, Y +N" once there are more than two. */
  protected readonly summary = computed(() => {
    const values = [...this.selected()];
    if (values.length === 0) return 'Any';
    if (values.length <= 2) return values.join(', ');
    return `${values.slice(0, 2).join(', ')} +${values.length - 2}`;
  });

  protected toggleOpen(): void {
    this.open.update((v) => !v);
  }

  /** True once `max` selections are already made and this particular option isn't one of them — greys it out rather than letting a 3rd colour be picked. */
  protected isDisabled(value: string): boolean {
    const max = this.max();
    return max !== null && !this.selected().has(value) && this.selected().size >= max;
  }

  /**
   * `@HostListener` attaches an event listener to this component's host element (or, with
   * 'document:' as here, to the whole document) for as long as this component exists, and
   * removes it automatically when the component is destroyed — no manual addEventListener/
   * removeEventListener bookkeeping needed. This one listens for ANY click anywhere on the
   * page, and if the dropdown is open and the click landed outside this component's own DOM
   * node, closes it — the standard way to implement "click outside to dismiss".
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }
}
