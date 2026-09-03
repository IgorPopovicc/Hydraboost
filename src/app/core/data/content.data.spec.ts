import { FAQS } from './faq.data';
import { PRICING } from './pricing.data';
import { SITE_INFO } from './site.data';
import { SERVICES } from './services.data';

describe('Centralized public content', () => {
  it('keeps one price entry for every service without fabricated numeric prices', () => {
    expect(PRICING).toHaveLength(SERVICES.length);
    expect(PRICING.every((item) => item.price === 'Cijena na upit')).toBe(true);
    expect(new Set(PRICING.map((item) => item.serviceId))).toEqual(new Set(SERVICES.map((item) => item.id)));
  });

  it('uses one verified contact source and preserves the emergency guidance', () => {
    expect(SITE_INFO.phoneInternational).toBe('+381653698376');
    expect(SITE_INFO.email).toBe('info@hydraboostinfuzije.com');
    expect(FAQS.at(-1)?.answer).toContain('194');
  });
});
