import { SeoConfig } from '../models/content.models';

export const SEO_BY_PATH: Readonly<Record<string, SeoConfig>> = {
  '/': {
    title: 'Infuzije Beograd na kućnoj adresi | HydraBoost',
    description: 'Infuzije na kućnoj adresi u Beogradu, u kancelariji ili hotelu, uz prethodnu medicinsku procenu i stručni nadzor. Pozovite HydraBoost i dogovorite termin.',
    path: '/',
    socialImage: '/assets/social/og-home.jpg',
    socialImageAlt: 'HydraBoost Infuzije — mobilne infuzije Beograd',
  },
  '/usluge': {
    title: 'Vitaminske infuzije i IV terapija Beograd | HydraBoost',
    description: 'Vitaminske infuzije, hidratacija i individualna IV terapija na adresi u Beogradu. Saznajte kako se bira terapija i zašto je prethodna procena neophodna.',
    path: '/usluge',
    socialImage: '/assets/social/og-usluge.jpg',
    socialImageAlt: 'HydraBoost mobilne infuzione terapije',
  },
  '/cenovnik': {
    title: 'Cene infuzija u Beogradu – cenovnik | HydraBoost',
    description: 'Cenovnik infuzione terapije, primene lekova i previjanja u Beogradu. Pogledajte cene u RSD, šta obuhvata dolazak i kada se cena prilagođava.',
    path: '/cenovnik',
    socialImage: '/assets/social/og-cenovnik.jpg',
    socialImageAlt: 'HydraBoost cenovnik mobilnih medicinskih usluga',
  },
  '/o-nama': {
    title: 'O nama – medicinska nega na adresi | HydraBoost Beograd',
    description: 'Upoznajte način rada HydraBoost mobilne medicinske usluge u Beogradu: konsultacija pre dolaska, individualna procena i primena terapije uz nadzor.',
    path: '/o-nama',
    socialImage: '/assets/social/og-o-nama.jpg',
    socialImageAlt: 'HydraBoost profesionalna medicinska usluga',
  },
  '/faq': {
    title: 'Infuzija kod kuće – česta pitanja | HydraBoost',
    description: 'Kako se zakazuje infuzija kod kuće, koliko traje i gde dolazimo? Pročitajte odgovore o proceni, ceni i organizaciji termina u Beogradu i okolini.',
    path: '/faq',
    socialImage: '/assets/social/og-faq.jpg',
    socialImageAlt: 'Konsultacija o HydraBoost uslugama',
  },
  '/kontakt': {
    title: 'Kontakt i zakazivanje infuzije u Beogradu | HydraBoost',
    description: 'Zakažite konsultaciju za infuziju na adresi u Beogradu i okolini. Pozovite HydraBoost na 065/369-8376 ili pošaljite upit Viberom, WhatsAppom ili e-poštom.',
    path: '/kontakt',
    socialImage: '/assets/social/og-kontakt.jpg',
    socialImageAlt: 'HydraBoost kontakt i zakazivanje',
  },
};

export const NOT_FOUND_SEO: SeoConfig = {
  title: 'Stranica nije pronađena | HydraBoost Infuzije',
  description: 'Tražena stranica nije pronađena. Vratite se na početnu stranicu HydraBoost Infuzija.',
  path: '/404',
  socialImage: '/assets/social/og-home.jpg',
  socialImageAlt: 'HydraBoost Infuzije',
  robots: 'noindex, follow',
};

