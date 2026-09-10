import { FaqItem } from '../models/content.models';

export const FAQS: readonly FaqItem[] = [
  { question: 'Kako funkcioniše mobilni termin za infuziju?', answer: 'Nakon telefonske konsultacije dogovaramo termin i lokaciju. Medicinsko osoblje dolazi sa potrebnom opremom, proverava osnovne vitalne parametre i, ako su ispunjeni uslovi, sprovodi terapiju uz stručni nadzor.' },
  { question: 'Da li su medicinski radnici licencirani?', answer: 'Da. Terapije koje nudi HydraBoost sprovode isključivo licencirani i iskusni medicinski radnici.' },
  { question: 'Koliko traje jedna infuziona terapija?', answer: 'Uobičajeno trajanje je od 30 do 60 minuta, u zavisnosti od vrste terapije i individualnih potreba pacijenta.' },
  { question: 'Ko može da primi infuzionu terapiju?', answer: 'Odluka se donosi nakon procene zdravstvenog stanja i anamneze, u skladu sa preporukom i medicinskom indikacijom. Terapija nije odgovarajuća za svakoga.' },
  { question: 'Da li dolazite na kućnu adresu?', answer: 'Da. HydraBoost pruža uslugu na dogovorenoj adresi u Beogradu i okolini — kod kuće, u kancelariji ili hotelu.' },
  { question: 'Da li je potrebna prethodna konsultacija?', answer: 'Da. Pre svake terapije procenjujemo zdravstveno stanje, alergije na lekove, postojeću terapiju i moguće kontraindikacije. Početna konsultacija obavlja se telefonom.' },
  { question: 'Da li dolazite i u okolinu Beograda?', answer: 'Da, usluga je dostupna u Beogradu i okolini uz prethodni dogovor. Za udaljenija mesta proverite dostupnost termina i eventualne troškove puta tokom razgovora, pre potvrde dolaska.' },
  { question: 'Kolika je cena usluge?', answer: 'Cena zavisi od vrste i sastava infuzije, individualnih medicinskih potreba i lokacije dolaska. Tačnu cenu dobijate tokom telefonskog razgovora, pre potvrde termina i bez skrivenih troškova.' },
  { question: 'Kako mogu da zakažem termin?', answer: 'Termin možete dogovoriti telefonom, putem Vibera, WhatsAppa ili e-pošte. Kontakt formom šaljete poruku direktno našem timu, a potvrda slanja prikazuje se na sajtu.' },
  { question: 'Da li je potreban uput lekara?', answer: 'To zavisi od zdravstvenog stanja i vrste terapije. Za neke terapije može biti potrebna prethodna preporuka lekara, dok se ostale sprovode nakon odgovarajuće procene i medicinske indikacije.' },
  { question: 'Da li pružate uslugu hitne medicinske pomoći?', answer: 'Ne. HydraBoost nije hitna medicinska služba. U slučaju naglog pogoršanja zdravstvenog stanja ili hitnog medicinskog problema pozovite Hitnu pomoć na broj 194.' },
] as const;
