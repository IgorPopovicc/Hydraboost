import { ServiceItem } from '../models/content.models';

export const SERVICES: readonly ServiceItem[] = [
  {
    id: 'hidratacija-i-oporavak',
    name: 'Hidratacija i oporavak',
    shortDescription: 'Nadoknada tečnosti i elektrolita uz prethodnu procenu zdravstvenog stanja.',
    description: 'Infuziona terapija može se primeniti radi nadoknade tečnosti i esencijalnih elektrolita kod dehidratacije, fizičke iscrpljenosti i drugih stanja kada postoji odgovarajuća medicinska indikacija.',
    context: 'Sastav i primena određuju se individualno, nakon konsultacije i provere mogućih kontraindikacija.',
    image: '/assets/images/editorial/nadzor-infuzione-terapije-760.webp',
    imageSrcset: '/assets/images/editorial/nadzor-infuzione-terapije-480.webp 480w, /assets/images/editorial/nadzor-infuzione-terapije-760.webp 760w',
    imageAvifSrcset: '/assets/images/editorial/nadzor-infuzione-terapije-480.avif 480w, /assets/images/editorial/nadzor-infuzione-terapije-760.avif 760w',
    imageAlt: 'Medicinski radnik nadzire infuzionu terapiju',
  },
  {
    id: 'imuno-podrska',
    name: 'Imuno i vitaminska podrška',
    shortDescription: 'Vitaminska terapija prilagođena individualnim potrebama i medicinskoj proceni.',
    description: 'Vitamini, minerali i drugi sastojci biraju se prema individualnim potrebama pacijenta. Terapija se ne primenjuje rutinski, već isključivo kada je procenjena kao odgovarajuća.',
    context: 'Konačan sastav ne određuje se unapred preko sajta. Prethodna konsultacija je obavezna.',
    image: '/assets/images/editorial/priprema-infuzije-760.webp',
    imageSrcset: '/assets/images/editorial/priprema-infuzije-480.webp 480w, /assets/images/editorial/priprema-infuzije-760.webp 760w',
    imageAvifSrcset: '/assets/images/editorial/priprema-infuzije-480.avif 480w, /assets/images/editorial/priprema-infuzije-760.avif 760w',
    imageAlt: 'Medicinski radnik priprema sterilnu infuzionu opremu',
  },
  {
    id: 'energija-i-vitalnost',
    name: 'Energija i vitalnost',
    shortDescription: 'Individualno sastavljena podrška kod iscrpljenosti i povećanog fizičkog napora.',
    description: 'Kombinacija vitamina, minerala ili aminokiselina razmatra se kod osećaja iscrpljenosti, povećanog napora i potrebe za oporavkom, u skladu sa zdravstvenim stanjem i indikacijom.',
    context: 'Terapija nije zamena za pregled i lečenje uzroka dugotrajnog umora ili drugih tegoba.',
    image: '/assets/images/services/energija-i-vitalnost.webp',
    imageAlt: 'Infuziona terapija za podršku energiji i vitalnosti',
  },
  {
    id: 'individualna-terapija',
    name: 'Individualno prilagođena terapija',
    shortDescription: 'Sastav, termin i način primene usklađeni sa Vašim stanjem i medicinskom indikacijom.',
    description: 'Kada postoji potreba za drugačijim sastavom ili primenom terapije, svaki slučaj razmatramo zasebno. Cilj je bezbedna usluga bez unapred pripremljenih univerzalnih paketa.',
    context: 'Konsultacija je neophodna pre dogovora. Pojedine terapije mogu zahtevati prethodnu preporuku lekara.',
    image: '/assets/images/services/individualna-terapija.webp',
    imageAlt: 'Medicinski radnik priprema individualnu infuzionu terapiju',
  },
] as const;
