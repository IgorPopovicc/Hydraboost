import { ServiceItem } from '../models/content.models';

export const SERVICES: readonly ServiceItem[] = [
  {
    id: 'hidratacija-i-oporavak',
    name: 'Hidratacija i oporavak',
    shortDescription: 'Nadoknada tečnosti i elektrolita uz prethodnu procjenu zdravstvenog stanja.',
    description: 'Infuziona terapija može se primijeniti radi nadoknade tečnosti i esencijalnih elektrolita kod dehidratacije, fizičke iscrpljenosti i drugih stanja kada postoji odgovarajuća medicinska indikacija.',
    context: 'Sastav i primjena određuju se individualno, nakon konsultacije i provjere mogućih kontraindikacija.',
    image: '/assets/images/services/hidratacija-i-oporavak.webp',
    imageAlt: 'Infuziona terapija za hidrataciju i oporavak',
  },
  {
    id: 'imuno-podrska',
    name: 'Imuno i vitaminska podrška',
    shortDescription: 'Vitaminska terapija prilagođena individualnim potrebama i medicinskoj procjeni.',
    description: 'Vitamini, minerali i drugi sastojci biraju se prema individualnim potrebama pacijenta. Terapija se ne primjenjuje rutinski, već isključivo kada je procijenjena kao odgovarajuća.',
    context: 'Konačan sastav ne određuje se unaprijed preko sajta. Prethodna konsultacija je obavezna.',
    image: '/assets/images/services/imuno-podrska.webp',
    imageAlt: 'Vitaminska infuzija pripremljena za individualnu terapiju',
  },
  {
    id: 'energija-i-vitalnost',
    name: 'Energija i vitalnost',
    shortDescription: 'Individualno sastavljena podrška kod iscrpljenosti i povećanog fizičkog napora.',
    description: 'Kombinacija vitamina, minerala ili aminokiselina razmatra se kod osjećaja iscrpljenosti, povećanog napora i potrebe za oporavkom, u skladu sa zdravstvenim stanjem i indikacijom.',
    context: 'Terapija nije zamjena za pregled i liječenje uzroka dugotrajnog umora ili drugih tegoba.',
    image: '/assets/images/services/energija-i-vitalnost.webp',
    imageAlt: 'Infuziona terapija za podršku energiji i vitalnosti',
  },
  {
    id: 'individualna-terapija',
    name: 'Individualno prilagođena terapija',
    shortDescription: 'Sastav, termin i način primjene usklađeni sa Vašim stanjem i medicinskom indikacijom.',
    description: 'Kada postoji potreba za drugačijim sastavom ili primjenom terapije, svaki slučaj razmatramo zasebno. Cilj je bezbjedna usluga bez unaprijed pripremljenih univerzalnih paketa.',
    context: 'Konsultacija je neophodna prije dogovora. Pojedine terapije mogu zahtijevati prethodnu preporuku ljekara.',
    image: '/assets/images/services/individualna-terapija.webp',
    imageAlt: 'Medicinski radnik priprema individualnu infuzionu terapiju',
  },
] as const;
