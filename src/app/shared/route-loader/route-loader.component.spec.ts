import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationSkippedCode,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subject } from 'rxjs';
import { RouteLoaderComponent } from './route-loader.component';

class RouterStub {
  readonly events = new Subject<NavigationStart | NavigationEnd | NavigationCancel | NavigationError | NavigationSkipped>();
  navigated = true;
}

describe('RouteLoaderComponent', () => {
  let router: RouterStub;

  beforeEach(async () => {
    router = new RouterStub();
    await TestBed.configureTestingModule({
      imports: [RouteLoaderComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();
  });

  it('ignores the initial navigation and responds to later route changes', () => {
    router.navigated = false;
    const fixture = TestBed.createComponent(RouteLoaderComponent);
    const overlay = fixture.nativeElement.querySelector('.route-loader') as HTMLElement;

    router.events.next(new NavigationStart(1, '/'));
    fixture.detectChanges();
    expect(overlay.classList.contains('is-active')).toBe(false);

    router.events.next(new NavigationEnd(1, '/', '/'));
    router.events.next(new NavigationStart(2, '/usluge'));
    fixture.detectChanges();
    expect(overlay.classList.contains('is-active')).toBe(true);

    router.events.next(new NavigationEnd(2, '/usluge', '/usluge'));
    fixture.detectChanges();
    expect(overlay.classList.contains('is-active')).toBe(false);
  });

  it('closes on successful, cancelled, failed, and skipped navigation', () => {
    const fixture = TestBed.createComponent(RouteLoaderComponent);
    const overlay = fixture.nativeElement.querySelector('.route-loader') as HTMLElement;
    const terminalEvents = [
      (id: number) => new NavigationEnd(id, '/usluge', '/usluge'),
      (id: number) => new NavigationCancel(id, '/usluge', 'Guard rejected', NavigationCancellationCode.GuardRejected),
      (id: number) => new NavigationError(id, '/usluge', new Error('Navigation failed')),
      (id: number) => new NavigationSkipped(id, '/usluge', 'Same URL', NavigationSkippedCode.IgnoredSameUrlNavigation),
    ];

    terminalEvents.forEach((terminalEvent, index) => {
      const id = index + 1;
      router.events.next(new NavigationStart(id, '/usluge'));
      fixture.detectChanges();
      expect(overlay.classList.contains('is-active')).toBe(true);

      router.events.next(terminalEvent(id));
      fixture.detectChanges();
      expect(overlay.classList.contains('is-active')).toBe(false);
    });
  });

  it('does not let a superseded navigation hide the current transition', () => {
    const fixture = TestBed.createComponent(RouteLoaderComponent);
    const overlay = fixture.nativeElement.querySelector('.route-loader') as HTMLElement;

    router.events.next(new NavigationStart(10, '/usluge'));
    router.events.next(new NavigationStart(11, '/cenovnik'));
    router.events.next(new NavigationCancel(10, '/usluge', 'Superseded', NavigationCancellationCode.SupersededByNewNavigation));
    fixture.detectChanges();
    expect(overlay.classList.contains('is-active')).toBe(true);

    router.events.next(new NavigationEnd(11, '/cenovnik', '/cenovnik'));
    fixture.detectChanges();
    expect(overlay.classList.contains('is-active')).toBe(false);
  });
});
