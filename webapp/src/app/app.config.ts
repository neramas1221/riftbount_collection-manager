import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * The app's root dependency-injection setup. Standalone Angular apps (no NgModules) register
 * everything the whole app needs here via `bootstrapApplication(App, appConfig)` in main.ts —
 * this is the modern replacement for the old AppModule's `providers: [...]` array.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Reports uncaught errors/promise rejections to Angular's error handler instead of only
    // the browser console — mostly useful in production so errors don't vanish silently.
    provideBrowserGlobalErrorListeners(),

    // Wires up the Router using the route table in app.routes.ts. Without this, [routerLink]
    // and <router-outlet> in templates wouldn't do anything.
    provideRouter(routes),

    // Makes HttpClient (used by every service under core/services/) injectable anywhere via
    // inject(HttpClient). withFetch() switches its transport from XMLHttpRequest to the
    // native fetch() API — mostly relevant for compatibility with SSR, harmless here.
    provideHttpClient(withFetch())
  ]
};
