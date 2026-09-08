import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FAQS } from '../data/faq.data';
import { SERVICES } from '../data/services.data';
import { SITE_INFO, SITE_URL } from '../data/site.data';
import { SeoConfig } from '../models/content.models';

const SEO_BY_PATH: Readonly<Record<string, SeoConfig>> = {
  '/': {
    title: 'Mobilne infuzije Beograd | HydraBoost Infuzije',
    description: 'Mobilne vitaminske i IV infuzije na kućnoj adresi, u kancelariji ili hotelu u Beogradu. Konsultacija, individualna procena i stručni nadzor.',
    path: '/',
    socialImage: '/assets/social/og-home.jpg',
    socialImageAlt: 'HydraBoost Infuzije — mobilne infuzije Beograd',
  },
  '/usluge': {
    title: 'Mobilne infuzione terapije Beograd | HydraBoost',
    description: 'HydraBoost infuzione terapije dolaze na Vašu adresu u Beogradu, uz prethodnu konsultaciju, individualnu procenu i medicinski nadzor.',
    path: '/usluge',
    socialImage: '/assets/social/og-usluge.jpg',
    socialImageAlt: 'HydraBoost mobilne infuzione terapije',
  },
  '/cenovnik': {
    title: 'Cenovnik mobilnih medicinskih usluga | HydraBoost',
    description: 'Cenovnik infuzione terapije, primene lekova i previjanja na terenu u Beogradu, uz mogućnost HydraBoost personalizovanog paketa.',
    path: '/cenovnik',
    socialImage: '/assets/social/og-cenovnik.jpg',
    socialImageAlt: 'HydraBoost cenovnik mobilnih medicinskih usluga',
  },
  '/o-nama': {
    title: 'O nama | HydraBoost mobilna medicinska usluga',
    description: 'Upoznajte HydraBoost individualni pristup profesionalnoj medicinskoj usluzi i nezi na dogovorenoj adresi u Beogradu.',
    path: '/o-nama',
    socialImage: '/assets/social/og-o-nama.jpg',
    socialImageAlt: 'HydraBoost profesionalna medicinska usluga',
  },
  '/faq': {
    title: 'Česta pitanja o mobilnim infuzijama | HydraBoost',
    description: 'Odgovori na česta pitanja o infuzionim terapijama, konsultaciji, zakazivanju i dolasku HydraBoost medicinske usluge na Vašu adresu.',
    path: '/faq',
    socialImage: '/assets/social/og-faq.jpg',
    socialImageAlt: 'Konsultacija o HydraBoost uslugama',
    faq: true,
  },
  '/kontakt': {
    title: 'HydraBoost kontakt i zakazivanje | Beograd',
    description: 'Kontaktirajte HydraBoost u Beogradu radi konsultacije i zakazivanja mobilne medicinske usluge na dogovorenoj adresi.',
    path: '/kontakt',
    socialImage: '/assets/social/og-kontakt.jpg',
    socialImageAlt: 'HydraBoost kontakt i zakazivanje',
  },
};

const NOT_FOUND_SEO: SeoConfig = {
  title: 'Stranica nije pronađena | HydraBoost Infuzije',
  description: 'Tražena stranica nije pronađena. Vratite se na početnu stranicu HydraBoost Infuzija.',
  path: '/404',
  socialImage: '/assets/social/og-home.jpg',
  socialImageAlt: 'HydraBoost Infuzije',
  robots: 'noindex, nofollow',
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);

  constructor() {
    this.apply(this.router.url);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
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
    this.setMeta('name', 'robots', config.robots ?? 'index, follow');
    this.setMeta('property', 'og:title', config.title);
    this.setMeta('property', 'og:description', config.description);
    this.setMeta('property', 'og:type', 'website');
    this.setMeta('property', 'og:site_name', SITE_INFO.name);
    this.setMeta('property', 'og:url', canonicalUrl);
    this.setMeta('property', 'og:image', socialImage);
    this.setMeta('property', 'og:image:secure_url', socialImage);
    this.setMeta('property', 'og:image:type', 'image/jpeg');
    this.setMeta('property', 'og:image:width', '1200');
    this.setMeta('property', 'og:image:height', '630');
    this.setMeta('property', 'og:image:alt', config.socialImageAlt);
    this.setMeta('property', 'og:locale', 'sr_RS');
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', config.title);
    this.setMeta('name', 'twitter:description', config.description);
    this.setMeta('name', 'twitter:image', socialImage);
    this.setMeta('name', 'twitter:image:alt', config.socialImageAlt);
    this.updateCanonical(canonicalUrl);
    this.updateStructuredData(path, canonicalUrl, Boolean(config.faq));
  }

  private setMeta(attribute: 'name' | 'property', key: string, content: string): void {
    const duplicates = this.document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    for (const duplicate of Array.from(duplicates).slice(1)) duplicate.remove();
    this.meta.updateTag({ [attribute]: key, content }, `${attribute}='${key}'`);
  }

  private updateCanonical(url: string): void {
    const canonicalLinks = this.document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
    let canonical = canonicalLinks.item(0);
    for (const duplicate of Array.from(canonicalLinks).slice(1)) duplicate.remove();
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private updateStructuredData(path: string, canonicalUrl: string, includeFaq: boolean): void {
    this.document.head.querySelector('script[data-hydraboost-schema]')?.remove();
    const graph: Record<string, unknown>[] = [
      {
        '@type': ['MedicalBusiness', 'LocalBusiness'],
        '@id': `${SITE_URL}/#business`,
        name: SITE_INFO.name,
        url: SITE_URL,
        image: `${SITE_URL}/assets/social/og-home.jpg`,
        logo: `${SITE_URL}/assets/brand/logo-112.webp`,
        telephone: SITE_INFO.phoneInternational,
        email: SITE_INFO.email,
        areaServed: { '@type': 'City', name: 'Beograd' },
        sameAs: [SITE_INFO.instagramHref],
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/#mobile-iv-service`,
        name: 'Mobilna infuziona terapija',
        serviceType: 'Mobilna infuziona terapija na zakazanoj adresi',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: { '@type': 'City', name: 'Beograd' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'HydraBoost usluge',
          itemListElement: SERVICES.map((service) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: service.name } })),
        },
      },
    ];

    if (path !== '/') {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Početna', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: SEO_BY_PATH[path]?.title.split('|')[0].trim() ?? 'Stranica', item: canonicalUrl },
        ],
      });
    }

    if (includeFaq) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      });
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-hydraboost-schema', 'true');
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    this.document.head.appendChild(script);
  }
}
