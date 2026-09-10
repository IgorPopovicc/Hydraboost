import { ServiceItem } from '../models/content.models';

export const SERVICES: readonly ServiceItem[] = [
  {
    id: 'hidratacija-i-oporavak',
    name: 'Hidratacija i oporavak',
    shortDescription: 'Nadoknada tečnosti i elektrolita uz prethodnu procenu zdravstvenog stanja.',
    description: 'Infuzija za hidrataciju namenjena je nadoknadi tečnosti i elektrolita kada za to postoji medicinska indikacija. O potrebi za primenom odlučuje se nakon procene zdravstvenog stanja.',
    context: 'Sastav i primena određuju se individualno, nakon konsultacije i provere mogućih kontraindikacija.',
    image: '/assets/images/editorial/nadzor-infuzione-terapije-760.webp',
    imageSrcset: '/assets/images/editorial/nadzor-infuzione-terapije-480.webp 480w, /assets/images/editorial/nadzor-infuzione-terapije-760.webp 760w',
    imageAvifSrcset: '/assets/images/editorial/nadzor-infuzione-terapije-480.avif 480w, /assets/images/editorial/nadzor-infuzione-terapije-760.avif 760w',
    imageAlt: 'Infuzioni rastvori i pumpa uz bolnički krevet',
  },
  {
    id: 'imuno-podrska',
    name: 'Vitaminske infuzije',
    shortDescription: 'Vitaminska terapija prilagođena individualnim potrebama i medicinskoj proceni.',
    description: 'Vitamini, minerali i drugi sastojci biraju se prema individualnim potrebama pacijenta. Terapija se ne primenjuje rutinski, već isključivo kada je procenjena kao odgovarajuća.',
    context: 'Konačan sastav ne određuje se unapred preko sajta. Prethodna konsultacija je obavezna.',
    image: '/assets/images/editorial/priprema-infuzije-760.webp',
    imageSrcset: '/assets/images/editorial/priprema-infuzije-480.webp 480w, /assets/images/editorial/priprema-infuzije-760.webp 760w',
    imageAvifSrcset: '/assets/images/editorial/priprema-infuzije-480.avif 480w, /assets/images/editorial/priprema-infuzije-760.avif 760w',
    imageAlt: 'Ruke u rukavicama podešavaju bocu rastvora na stalku',
  },
  {
    id: 'energija-i-vitalnost',
    name: 'Energija i vitalnost',
    shortDescription: 'Konsultacija o mogućnosti primene terapije uz procenu uzroka iscrpljenosti.',
    description: 'Osećaj umora sam po sebi nije dovoljan razlog za infuziju. Mogućnost primene vitamina, minerala ili aminokiselina razmatra se isključivo prema zdravstvenom stanju i medicinskoj indikaciji.',
    context: 'Terapija nije zamena za pregled i lečenje uzroka dugotrajnog umora ili drugih tegoba.',
    image: '/assets/images/services/energija-i-vitalnost.webp',
    imageAlt: 'Komora infuzionog sistema sa rastvorom',
  },
  {
    id: 'individualna-terapija',
    name: 'Individualno prilagođena terapija',
    shortDescription: 'Sastav, termin i način primene usklađeni sa Vašim stanjem i medicinskom indikacijom.',
    description: 'Kada postoji potreba za drugačijim sastavom ili primenom terapije, svaki slučaj razmatramo zasebno. Vrsta i način primene zavise od medicinske indikacije, bez univerzalnih paketa za svakoga.',
    context: 'Konsultacija je neophodna pre dogovora. Pojedine terapije mogu zahtevati prethodnu preporuku lekara.',
    image: '/assets/images/services/individualna-terapija.webp',
    imageAlt: 'Medicinski radnik postavlja infuziju pacijentkinji',
  },
] as const;
