import { FaqItem } from '../models/content.models';

export const FAQS: readonly FaqItem[] = [
  { question: 'Kako funkcioniše mobilni termin za infuziju?', answer: 'Nakon telefonske konsultacije dogovaramo termin i lokaciju. Medicinsko osoblje dolazi sa potrebnom opremom, provjerava osnovne vitalne parametre i, ako su ispunjeni uslovi, sprovodi terapiju uz stručni nadzor.' },
  { question: 'Da li su medicinski radnici licencirani?', answer: 'Da. Terapije koje nudi HydraBoost sprovode isključivo licencirani i iskusni medicinski radnici.' },
  { question: 'Koliko traje jedna infuziona terapija?', answer: 'Uobičajeno trajanje je od 30 do 60 minuta, u zavisnosti od vrste terapije i individualnih potreba pacijenta.' },
  { question: 'Ko može da primi infuzionu terapiju?', answer: 'Odluka se donosi nakon procjene zdravstvenog stanja i anamneze, u skladu sa preporukom i medicinskom indikacijom. Terapija nije odgovarajuća za svakoga.' },
  { question: 'Da li dolazite na kućnu adresu?', answer: 'Da. HydraBoost pruža uslugu na dogovorenoj adresi u Beogradu i okolini — kod kuće, u kancelariji ili hotelu.' },
  { question: 'Da li je potrebna prethodna konsultacija?', answer: 'Da. Prije svake terapije procjenjujemo zdravstveno stanje, alergije na lijekove, postojeću terapiju i moguće kontraindikacije. Početna konsultacija obavlja se telefonom.' },
  { question: 'Da li terapiju mogu primiti svi pacijenti?', answer: 'Ne. Postoje zdravstvena stanja i kontraindikacije zbog kojih pojedine terapije možda nisu odgovarajuće. Svaki slučaj procjenjuje se individualno.' },
  { question: 'Kolika je cijena usluge?', answer: 'Cijena zavisi od vrste i sastava infuzije, individualnih medicinskih potreba i lokacije dolaska. Tačnu cijenu dobijate tokom telefonskog razgovora, prije potvrde termina i bez skrivenih troškova.' },
  { question: 'Kako mogu da zakažem termin?', answer: 'Termin možete dogovoriti telefonom, putem Vibera, WhatsAppa ili e-pošte. Kontakt forma na sajtu priprema poruku za slanje iz Vaše aplikacije za e-poštu.' },
  { question: 'Da li je potreban uput ljekara?', answer: 'To zavisi od zdravstvenog stanja i vrste terapije. Za neke terapije može biti potrebna prethodna preporuka ljekara, dok se ostale sprovode nakon odgovarajuće procjene i medicinske indikacije.' },
  { question: 'Da li pružate uslugu hitne medicinske pomoći?', answer: 'Ne. HydraBoost nije hitna medicinska služba. U slučaju naglog pogoršanja zdravstvenog stanja ili hitnog medicinskog problema pozovite Hitnu pomoć na broj 194.' },
] as const;
