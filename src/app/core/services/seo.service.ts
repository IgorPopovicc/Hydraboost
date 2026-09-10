import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SERVICES } from '../data/services.data';
import { STEFAN_PROFILE } from '../data/about.data';
import { NAVIGATION, SITE_INFO, SITE_URL } from '../data/site.data';
import { NOT_FOUND_SEO, SEO_BY_PATH } from '../data/seo.data';
import { SeoConfig } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (this.router.navigated) this.apply(this.router.url);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.apply(event.urlAfterRedirects);
    });
  }

  private apply(rawUrl: string): void {
    const path = rawUrl.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
    const config = SEO_BY_PATH[path] ?? NOT_FOUND_SEO;
    const canonicalUrl = `${SITE_URL}${config.path === '/' ? '/' : config.path}`;
    const socialImage = `${SITE_URL}${config.socialImage}`;

    this.title.setTitle(config.title);
    this.setMeta('name', 'description', config.description);
    this.setMeta('name', 'robots', config.robots ?? 'index, follow, max-image-preview:large');
    this.setMeta('property', 'og:title', config.title);
    this.setMeta('property', 'og:description', config.description);
    this.setMeta('property', 'og:type', 'website');
    this.setMeta('property', 'og:site_name', SITE_INFO.name);
    this.setMeta('property', 'og:url', canonicalUrl);
    this.setMeta('property', 'og:image', socialImage);
    this.setMeta('property', 'og:image:secure_url', socialImage);
    this.setMeta('property', 'og:image:type', 'image/jpeg');
    this.setMeta('property', 'og:image:width', '1200');
    this.setMeta('property', 'og:image:height', '1200');
    this.setMeta('property', 'og:image:alt', config.socialImageAlt);
    this.setMeta('property', 'og:locale', 'sr_RS');
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', config.title);
    this.setMeta('name', 'twitter:description', config.description);
    this.setMeta('name', 'twitter:image', socialImage);
    this.setMeta('name', 'twitter:image:alt', config.socialImageAlt);
    this.updateCanonical(config === NOT_FOUND_SEO ? null : canonicalUrl);
    this.updateHeroPreload(path);
    this.updateStructuredData(config, canonicalUrl);
  }

  private setMeta(attribute: 'name' | 'property', key: string, content: string): void {
    const duplicates = this.document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    for (const duplicate of Array.from(duplicates).slice(1)) duplicate.remove();
    this.meta.updateTag({ [attribute]: key, content }, `${attribute}='${key}'`);
  }

  private updateCanonical(url: string | null): void {
    const canonicalLinks = this.document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      canonicalLinks.forEach((link) => link.remove());
      return;
    }
    let canonical = canonicalLinks.item(0);
    for (const duplicate of Array.from(canonicalLinks).slice(1)) duplicate.remove();
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private updateHeroPreload(path: string): void {
    this.document.head.querySelector('link[data-hydraboost-hero]')?.remove();
    if (path !== '/') return;
    const link = this.document.createElement('link');
    link.rel = 'preload';
    link.setAttribute('data-hydraboost-hero', 'true');
    link.setAttribute('as', 'image');
    link.type = 'image/avif';
    link.href = '/assets/images/hero/mobile-iv-care-672.avif';
    link.setAttribute('imagesrcset', '/assets/images/hero/mobile-iv-care-448.avif 448w, /assets/images/hero/mobile-iv-care-672.avif 672w, /assets/images/hero/mobile-iv-care-896.avif 896w');
    link.setAttribute('imagesizes', '(max-width: 768px) min(92vw, 480px), 42vw');
    link.setAttribute('fetchpriority', 'high');
    this.document.head.appendChild(link);
  }

  private updateStructuredData(config: SeoConfig, canonicalUrl: string): void {
    this.document.head.querySelectorAll('script[data-hydraboost-schema]').forEach((script) => script.remove());
    if (config === NOT_FOUND_SEO) return;

    const businessId = `${SITE_URL}/#business`;
    const websiteId = `${SITE_URL}/#website`;
    const pageId = `${canonicalUrl}#webpage`;
    const areaServed = [{ '@type': 'City', name: 'Beograd', containedInPlace: { '@type': 'Country', name: 'Srbija' } }, SITE_INFO.serviceArea];
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'MedicalBusiness',
        '@id': businessId,
        name: SITE_INFO.name,
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/assets/social/og-home.jpg`,
        logo: `${SITE_URL}/assets/brand/logo-112.webp`,
        telephone: SITE_INFO.phoneInternational,
        email: SITE_INFO.email,
        areaServed,
        sameAs: [SITE_INFO.instagramHref],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: SITE_INFO.phoneInternational,
          email: SITE_INFO.email,
          contactType: 'Zakazivanje i konsultacije',
          availableLanguage: 'sr',
          areaServed,
          url: `${SITE_URL}/kontakt`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${SITE_URL}/`,
        name: SITE_INFO.name,
        inLanguage: 'sr-Latn',
        publisher: { '@id': businessId },
      },
      {
        '@type': config.path === '/kontakt' ? 'ContactPage' : config.path === '/o-nama' ? 'AboutPage' : 'WebPage',
        '@id': pageId,
        url: canonicalUrl,
        name: config.title,
        description: config.description,
        inLanguage: 'sr-Latn',
        isPartOf: { '@id': websiteId },
        about: { '@id': businessId },
        ...(config.path !== '/' ? { breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` } } : {}),
      },
    ];

    if (config.path === '/o-nama') {
      const personId = `${SITE_URL}/o-nama#stefan-markovic`;
      graph.push({
        '@type': 'Person',
        '@id': personId,
        name: STEFAN_PROFILE.name,
        url: personId,
        description: [STEFAN_PROFILE.introduction, STEFAN_PROFILE.overview,
          ...STEFAN_PROFILE.hospitalExperience.map((experience) => experience.description),
          STEFAN_PROFILE.additionalExperience].join(' '),
        image: `${SITE_URL}/assets/images/about/stefan-markovic-hydraboost.webp`,
        affiliation: { '@id': businessId },
        mainEntityOfPage: { '@id': pageId },
      });
      graph[2]['mainEntity'] = { '@id': personId };
    }

    if (config.path === '/' || config.path === '/usluge') {
      graph.push({
        '@type': 'Service',
        '@id': `${SITE_URL}/#mobile-iv-service`,
        name: 'Mobilna infuziona terapija',
        serviceType: 'Infuziona terapija na dogovorenoj adresi',
        description: 'Infuzije u domu, kancelariji ili hotelu u Beogradu i okolini, uz prethodnu konsultaciju, medicinsku procenu i stručni nadzor.',
        url: `${SITE_URL}/usluge`,
        provider: { '@id': businessId },
        areaServed,
      });
      graph[2]['mainEntity'] = { '@id': `${SITE_URL}/#mobile-iv-service` };
    }

    if (config.path === '/usluge') {
      graph.push(...SERVICES.map((service) => ({
        '@type': 'Service',
        '@id': `${SITE_URL}/usluge#${service.id}`,
        name: service.name,
        description: `${service.description} ${service.context}`,
        url: `${SITE_URL}/usluge#${service.id}`,
        provider: { '@id': businessId },
        areaServed,
        mainEntityOfPage: { '@id': pageId },
      })));
    }

    if (config.path !== '/') {
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Početna', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: NAVIGATION.find((item) => item.path === config.path)?.label, item: canonicalUrl },
        ],
      });
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-hydraboost-schema', 'true');
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }
}
