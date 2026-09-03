import { FAQS } from './faq.data';
import { PRICING } from './pricing.data';
import { SITE_INFO } from './site.data';
import { SERVICES } from './services.data';

describe('Centralized public content', () => {
  it('keeps data-driven packages without fabricated numeric prices', () => {
    expect(PRICING.every((item) => item.priceLabel === 'Cena na upit')).toBe(true);
    expect(new Set(PRICING.map((item) => item.id)).size).toBe(PRICING.length);
    expect(PRICING.filter((item) => item.recommended)).toHaveLength(1);
    expect(PRICING.some((item) => item.combo)).toBe(true);
    expect(SERVICES.length).toBeGreaterThan(0);
  });

  it('uses one verified contact source and preserves the emergency guidance', () => {
    expect(SITE_INFO.phoneInternational).toBe('+381653698376');
    expect(SITE_INFO.email).toBe('info@hydraboostinfuzije.com');
    expect(FAQS.at(-1)?.answer).toContain('194');
  });
});
