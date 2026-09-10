import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { SITE_URL } from '../data/site.data';
import { SeoService } from './seo.service';

describe('SEO navigation lifecycle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    TestBed.inject(SeoService);
  });

  it('strips query and fragment variations and follows legacy redirects', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/our-services?utm_source=test#hidratacija-i-oporavak');
    const document = TestBed.inject(DOCUMENT);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/usluge`);
    expect(document.title).toContain('Vitaminske infuzije i IV terapija');
    expect(document.querySelector('link[data-hydraboost-hero]')).toBeNull();
  });

  it('clears error SEO after returning from a missing route', async () => {
    const harness = await RouterTestingHarness.create();
    const document = TestBed.inject(DOCUMENT);
    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/ne-postoji');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('script[data-hydraboost-schema]')).toBeNull();
    await harness.navigateByUrl('/kontakt');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('index, follow,');
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelectorAll('script[data-hydraboost-schema]')).toHaveLength(1);
    const graph = JSON.parse(document.querySelector('script[data-hydraboost-schema]')!.textContent!)['@graph'];
    expect(graph.some((entity: Record<string, unknown>) => entity['@type'] === 'ContactPage')).toBe(true);
    expect(graph.some((entity: Record<string, unknown>) => entity['@type'] === 'Service')).toBe(false);
  });
});
