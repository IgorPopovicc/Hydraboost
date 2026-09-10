import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('Public routes', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('loads the dedicated pricing page', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/cenovnik');
    const element = harness.routeNativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Cenovnik infuzija');
  });

  it('redirects the former Ijekavian pricing URL to the Ekavian route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/cjenovnik');
    expect(TestBed.inject(Router).url).toBe('/cenovnik');
  });

  it('redirects the original services URL to the new Serbian route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/our-services');
    expect(TestBed.inject(Router).url).toBe('/usluge');
  });
});
