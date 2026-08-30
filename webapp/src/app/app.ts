import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CardDetailModalComponent } from './shared/components/card-detail-modal.component';

/** One entry in the left sidebar nav — see app.html for how these render. */
interface NavItem {
  label: string;
  path: string;
  icon: string; // raw SVG <path> "d" attribute, drawn inline in app.html rather than as an <img>
  description: string;
}

/**
 * The root component — this is the one thing that's actually mounted onto <app-root> in
 * index.html (see main.ts). Everything else is either a routed page rendered inside
 * <router-outlet> (see app.routes.ts) or a component nested somewhere under one of those pages.
 *
 * `standalone` components (the only kind Angular has now — there's no NgModule anywhere in this
 * app) declare exactly what they use via `imports: [...]` right here in the decorator, instead
 * of relying on a shared module to have already imported it.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CardDetailModalComponent],
  templateUrl: './app.html',
})
export class App {
  // `protected` (rather than `public`) is the convention used everywhere in this codebase for
  // anything only the component's own template needs to read — it can't be accessed from
  // outside the component (e.g. by a parent), which isn't needed here anyway.
  protected readonly navItems: NavItem[] = [
    {
      label: 'Collection Explorer',
      path: '/collection',
      icon: 'M4 4h16v4H4V4zm0 6h16v10H4V10z',
      description: 'Cards you own',
    },
    {
      label: 'Set Browser',
      path: '/sets',
      icon: 'M4 6h16M4 12h16M4 18h16',
      description: 'Browse by set',
    },
    {
      label: 'Card Database',
      path: '/database',
      icon: 'M11 4a7 7 0 104.9 12.1l4 4 1.4-1.4-4-4A7 7 0 0011 4z',
      description: 'Search & filter',
    },
    {
      label: 'Price Trends',
      path: '/price-trends',
      icon: 'M4 19h16M6 16l4-5 3 3 5-7',
      description: 'Value over time',
    },
  ];
}
