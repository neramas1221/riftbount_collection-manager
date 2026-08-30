import { Routes } from '@angular/router';

/**
 * The app's URL -> page mapping. Every entry uses `loadComponent` (lazy loading) instead of a
 * static `component:` import — Angular only downloads a page's JS chunk the first time you
 * navigate to it, so visiting just "Collection Explorer" never pulls in the other three pages'
 * code. The card detail view is NOT a route — it's a modal mounted once in app.html and opened
 * via CardDetailModalService from any page, see shared/components/card-detail-modal.component.ts.
 */
export const routes: Routes = [
  {
    // Visiting "/" with nothing after it sends you to /collection. `pathMatch: 'full'` means
    // this only matches the truly-empty path, not every route that happens to start with it.
    path: '',
    pathMatch: 'full',
    redirectTo: 'collection',
  },
  {
    path: 'collection',
    loadComponent: () =>
      import('./features/collection-explorer/collection-explorer.component').then(
        (m) => m.CollectionExplorerComponent
      ),
    title: 'Collection Explorer', // sets the browser tab title on navigation
  },
  {
    path: 'sets',
    loadComponent: () =>
      import('./features/set-browser/set-browser.component').then((m) => m.SetBrowserComponent),
    title: 'Set Browser',
  },
  {
    path: 'database',
    loadComponent: () =>
      import('./features/card-database/card-database.component').then(
        (m) => m.CardDatabaseComponent
      ),
    title: 'Card Database',
  },
  {
    path: 'price-trends',
    loadComponent: () =>
      import('./features/price-trends/price-trends.component').then(
        (m) => m.PriceTrendsComponent
      ),
    title: 'Price Trends',
  },
  {
    // Catch-all: any unrecognized URL (typo, dead link) falls back to the home page instead of
    // showing a blank/broken screen. Must stay last — routes are matched top-to-bottom.
    path: '**',
    redirectTo: 'collection',
  },
];
