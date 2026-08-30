import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

// Angular's default generated test for the root component — mostly a smoke test that the app
// bootstraps at all, plus a check that the sidebar nav actually renders. `provideRouter([])`
// (an empty route table) is supplied because App's template uses [routerLink] and
// <router-outlet>, both of which need SOME router configured to exist, even in a test.
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the primary navigation', async () => {
    const fixture = TestBed.createComponent(App);
    // Angular doesn't render synchronously — whenStable() waits for pending async work
    // (change detection, in this case) to finish before the assertion below inspects the DOM.
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Card Database');
  });
});
