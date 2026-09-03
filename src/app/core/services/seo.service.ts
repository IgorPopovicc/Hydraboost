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
  },
  '/usluge': {
    title: 'Usluge mobilne IV terapije | HydraBoost Beograd',
    description: 'Hidratacija, vitaminska podrška i individualno prilagođene infuzione terapije na adresi u Beogradu, uz prethodnu medicinsku procenu.',
    path: '/usluge',
  },
  '/cenovnik': {
    title: 'Cenovnik mobilnih infuzija | HydraBoost',
    description: 'Saznajte kako se formira cena HydraBoost mobilne infuzione terapije u Beogradu. Transparentna procena troškova pre potvrde termina.',
    path: '/cenovnik',
  },
  '/o-nama': {
    title: 'O nama | HydraBoost mobilne infuzije Beograd',
    description: 'Upoznajte pristup HydraBoost tima: licencirano medicinsko osoblje, sterilna oprema i individualna nega na Vašoj adresi u Beogradu.',
    path: '/o-nama',
  },
  '/faq': {
    title: 'Česta pitanja o mobilnim infuzijama | HydraBoost',
    description: 'Odgovori o zakazivanju, trajanju, proceni, kontraindikacijama, ceni i području dolaska HydraBoost mobilne IV terapije u Beogradu.',
    path: '/faq',
    faq: true,
  },
  '/kontakt': {
    title: 'Kontakt i zakazivanje | HydraBoost Infuzije',
    description: 'Kontaktirajte HydraBoost za konsultaciju i zakazivanje mobilne infuzione terapije na adresi u Beogradu i okolini.',
    path: '/kontakt',
  },
};

const NOT_FOUND_SEO: SeoConfig = {
  title: 'Stranica nije pronađena | HydraBoost Infuzije',
  description: 'Tražena stranica nije pronađena. Vratite se na početnu stranicu HydraBoost Infuzija.',
  path: '/404',
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
    const socialImage = `${SITE_URL}/assets/images/og/hydraboost-social-preview.jpg`;

    this.title.setTitle(config.title);
    this.setMeta('name', 'description', config.description);
    this.setMeta('name', 'robots', config.robots ?? 'index, follow');
    this.setMeta('property', 'og:title', config.title);
    this.setMeta('property', 'og:description', config.description);
    this.setMeta('property', 'og:type', 'website');
    this.setMeta('property', 'og:url', canonicalUrl);
    this.setMeta('property', 'og:image', socialImage);
    this.setMeta('property', 'og:image:width', '1200');
    this.setMeta('property', 'og:image:height', '630');
    this.setMeta('property', 'og:locale', 'sr_RS');
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', config.title);
    this.setMeta('name', 'twitter:description', config.description);
    this.setMeta('name', 'twitter:image', socialImage);
    this.updateCanonical(canonicalUrl);
    this.updateStructuredData(path, canonicalUrl, Boolean(config.faq));
  }

  private setMeta(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content }, `${attribute}='${key}'`);
  }

  private updateCanonical(url: string): void {
    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
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
        image: `${SITE_URL}/assets/images/og/hydraboost-social-preview.jpg`,
        logo: `${SITE_URL}/assets/brand/logo-96.png`,
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
