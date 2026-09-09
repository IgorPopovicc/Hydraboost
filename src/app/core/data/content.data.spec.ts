import { FAQS } from './faq.data';
import { PERSONALIZED_PACKAGE, PRICING, PRICING_CATEGORIES } from './pricing.data';
import { SITE_INFO, SITE_URL } from './site.data';
import { SERVICES } from './services.data';

describe('Centralized public content', () => {
  it('keeps the complete price list and personalized package centralized', () => {
    expect(PRICING_CATEGORIES).toHaveLength(3);
    expect(PRICING).toHaveLength(12);
    expect(new Set(PRICING.map((item) => item.id)).size).toBe(PRICING.length);
    expect(PRICING.map((item) => [item.name, item.price])).toEqual([
      ['Vitaminska infuzija', '5.000 RSD'],
      ['Detoksikacija', '6.000 RSD'],
      ['Infuzija za mamurluk', '6.000 RSD'],
      ['Infuzija za imunitet', '5.500 RSD'],
      ['Glutation infuzija', '6.000 RSD'],
      ['Infuzija gvožđa', '6.000 RSD'],
      ['Infuzija nakon hemoterapije', '5.000 RSD'],
      ['Prilagođena infuziona terapija', 'Cena zavisi od preporučene terapije i doze'],
      ['Intramuskularna primena leka', '2.500 RSD'],
      ['Subkutana primena leka', '2.500 RSD'],
      ['Malo previjanje na terenu', '2.500 RSD'],
      ['Veliko previjanje na terenu', '3.500 RSD'],
    ]);
    expect(PERSONALIZED_PACKAGE.name).toBe('HydraBoost personalizovani paket');
    expect(PERSONALIZED_PACKAGE.price).toBe('Cena na upit');
    expect(SERVICES.length).toBeGreaterThan(0);
  });

  it('uses one verified contact source and preserves the emergency guidance', () => {
    expect(SITE_URL).toBe('https://hydraboost-infuzije.rs');
    expect(SITE_INFO.phoneInternational).toBe('+381653698376');
    expect(SITE_INFO.email).toBe('info@hydraboostinfuzije.com');
    expect(SITE_INFO.whatsappHref).toBe('https://wa.me/381653698376');
    expect(SITE_INFO.instagramHref).toBe('https://instagram.com/hydraboost_infuzije');
    expect(FAQS.at(-1)?.answer).toContain('194');
  });
});
