import { PersonalizedPricingPackage, PricingCategory, PricingItem } from '../models/content.models';

// Jedinstveno mesto za izmene svih javno prikazanih usluga i cena.
export const PRICING_CATEGORIES: readonly PricingCategory[] = [
  {
    id: 'infuzione-terapije',
    title: 'Infuzione terapije',
    description:
      'Infuzione terapije na dogovorenoj adresi, uz prethodnu konsultaciju i medicinsku procenu.',
    items: [
      { id: 'vitaminska-infuzija', name: 'Vitaminska infuzija', price: '5.000 RSD' },
      { id: 'detoksikacija', name: 'Detoksikacija', price: '6.000 RSD' },
      { id: 'infuzija-za-mamurluk', name: 'Infuzija za mamurluk', price: '6.000 RSD' },
      { id: 'infuzija-za-imunitet', name: 'Infuzija za imunitet', price: '5.500 RSD' },
      { id: 'glutation-infuzija', name: 'Glutation infuzija', price: '6.000 RSD' },
      { id: 'infuzija-gvozdja', name: 'Infuzija gvožđa', price: '6.000 RSD' },
      {
        id: 'infuzija-nakon-hemoterapije',
        name: 'Infuzija nakon hemoterapije',
        price: '5.000 RSD',
      },
      {
        id: 'prilagodjena-infuziona-terapija',
        name: 'Prilagođena infuziona terapija',
        price: 'Cena zavisi od preporučene terapije i doze',
        priceType: 'descriptive',
      },
    ],
  },
  {
    id: 'primena-lekova',
    title: 'Primena lekova',
    description: 'Stručna primena propisane terapije na dogovorenoj adresi.',
    items: [
      {
        id: 'intramuskularna-primena-leka',
        name: 'Intramuskularna primena leka',
        price: '2.500 RSD',
      },
      { id: 'subkutana-primena-leka', name: 'Subkutana primena leka', price: '2.500 RSD' },
    ],
  },
  {
    id: 'previjanje-na-terenu',
    title: 'Previjanje na terenu',
    description: 'Previjanje uz odgovarajući materijal i profesionalnu negu na terenu.',
    items: [
      { id: 'malo-previjanje-na-terenu', name: 'Malo previjanje na terenu', price: '2.500 RSD' },
      {
        id: 'veliko-previjanje-na-terenu',
        name: 'Veliko previjanje na terenu',
        price: '3.500 RSD',
      },
    ],
  },
] as const;

// Ravan pregled koristi Početna; vrednosti se i dalje menjaju samo u kategorijama iznad.
export const PRICING: readonly PricingItem[] = PRICING_CATEGORIES.flatMap(
  (category) => category.items,
);

export const PERSONALIZED_PACKAGE: PersonalizedPricingPackage = {
  id: 'hydraboost-personalizovani-paket',
  label: 'Personalizovano',
  name: 'HydraBoost personalizovani paket',
  introduction:
    'Individualno osmišljen paket prema Vašim potrebama, zdravstvenom stanju i medicinskoj proceni.',
  description:
    'HydraBoost personalizovani paket formira se nakon konsultacije i individualne procene. Sastav i vrsta terapije prilagođavaju se potrebama klijenta i medicinskoj indikaciji.',
  features: [
    'Konsultacija pre terapije',
    'Individualna procena',
    'Personalizovan izbor terapije',
    'Primena uz stručni medicinski nadzor',
  ],
  price: 'Cena na upit',
  cta: 'Dogovorite konsultaciju',
} as const;
