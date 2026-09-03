import { NavigationItem } from '../models/content.models';

export const SITE_URL = 'https://www.hydraboostinfuzije.com';

export const SITE_INFO = {
  name: 'HydraBoost Infuzije',
  phoneDisplay: '065/369-8376',
  phoneInternational: '+381653698376',
  phoneHref: 'tel:+381653698376',
  email: 'info@hydraboostinfuzije.com',
  emailHref: 'mailto:info@hydraboostinfuzije.com',
  viberHref: 'viber://chat?number=%2B381653698376',
  whatsappHref: 'https://wa.me/381653698376',
  instagramHref: 'https://instagram.com/hydraboost_infuzije',
  instagramLabel: '@hydraboost_infuzije',
  serviceArea: 'Beograd i okolina',
  workingHours: 'Po pozivu i zakazanom terminu',
  emergencyPhone: '194',
  emergencyHref: 'tel:194',
} as const;

export const NAVIGATION: readonly NavigationItem[] = [
  { label: 'Početna', path: '/' },
  { label: 'Usluge', path: '/usluge' },
  { label: 'Cenovnik', path: '/cenovnik' },
  { label: 'O nama', path: '/o-nama' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Kontakt', path: '/kontakt' },
];

export const PROCESS_STEPS = [
  { number: '01', title: 'Kontaktirate nas', text: 'Pozovite nas ili pošaljite osnovne informacije o terminu i lokaciji.' },
  { number: '02', title: 'Kratka konsultacija', text: 'Razgovaramo o zdravstvenom stanju, terapiji, alergijama i mogućim kontraindikacijama.' },
  { number: '03', title: 'Dogovaramo termin', text: 'Potvrđujemo vreme dolaska, lokaciju i cenu pre polaska.' },
  { number: '04', title: 'Dolazimo na adresu', text: 'Medicinsko osoblje donosi kompletnu sterilnu opremu u Vaš dom, kancelariju ili hotel.' },
  { number: '05', title: 'Stručni nadzor', text: 'Pre primene proveravaju se vitalni parametri, a terapija se sprovodi uz nadzor.' },
] as const;
