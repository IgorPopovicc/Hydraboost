# Hydraboost SEO pregled — 10. septembar 2026.

## Početno stanje i mapa namera

Angular 22.1.5, CLI/SSR 22.1.7; standalone komponente, lazy rute, hidracija i zvanični prerender. Produkcija: statički Apache/DreamWeb paket, opciono Express SSR. Šest indeksabilnih ruta već ima različite naslove i opise, jedan H1, AVIF/WebP slike, lokalni font, kontakt linkove i XML sitemap. Nije potreban prelazak na drugi framework niti dodatni SSR sloj.

| Ruta | Primarna namera | Sekundarne teme | Nalaz pre izmena |
| --- | --- | --- | --- |
| `/` | **infuzije Beograd**, komercijalno/lokalno | infuzije na kućnoj adresi, mobilne/kućne infuzije, infuzija kod kuće | H1 „Medicinska nega, tamo gde se osećate najudobnije.“ ne identifikuje uslugu/lokaciju; title počinje užim terminom „Mobilne infuzije“ |
| `/usluge` | vitaminske infuzije i IV terapija Beograd | hidratacija infuzijom, individualna procena | H1 „Nega prilagođena Vašim potrebama.“ je generički; metadata previše slična nameri početne |
| `/cenovnik` | cena infuzije Beograd | cena vitaminske infuzije, primena lekova, previjanje | Cene postoje u kodu, ali README netačno navodi da nisu potvrđene; potrebno razjasniti da naziv paketa nije obećanje rezultata |
| `/o-nama` | HydraBoost tim i način rada | mobilna medicinska nega, nadzor, područje rada | Postoje navodi o licenciranom osoblju, ali nema imena, brojeva licenci, pravnog identiteta ni medicinskog recenzenta; stock fotografija može delovati kao slika stvarnog tima |
| `/faq` | pitanja pre infuzije kod kuće | trajanje, konsultacija, adresa, zakazivanje | Dva gotovo ista pitanja o tome ko može primiti terapiju; zatvoreni odgovori nemaju interakciju bez JS-a |
| `/kontakt` | HydraBoost kontakt i zakazivanje | telefon, Beograd i okolina, Viber/WhatsApp/e-pošta | Generički H1; polja nemaju vezu sa porukama grešaka; forma koristi mailto, nema backend slanja |

Sve stranice su povezane kroz zaglavlje/podnožje. Četiri teme usluga imaju fragment linkove, ali ne dovoljno potvrđenih jedinstvenih podataka za zasebne odredišne stranice. Cenovnik sadrži i stvarne dodatne usluge. Zadržati rute i cene; unaprediti sadržaj i put od usluge do cene/kontakta. Vitamin C nije potvrđen kao zasebna ponuda i ne targetira se izmišljenom stranicom.

## Provera javnog servera pre izmena

Direktni HTTP zahtevi 10.09.2026.:

- `https://www.hydraboost-infuzije.rs/` i HTTPS bez `www`: oba 200, canonical bez `www`.
- `/usluge`, `/cenovnik`, `/o-nama`, `/faq`, `/kontakt`: 301 na završnu kosu crtu; `/usluge/` vraća 200, canonical bez završne crte i bez `www`.
- `/index.html` i `/usluge/index.html`: 200 duplikati.
- `/our-services`: 301 na `/our-services/`, umesto neposrednog preusmerenja na `/usluge`.
- Nepostojeća adresa: 404, generički Apache dokument. `/404/index.html`: 200.
- robots/sitemap: 200, domen bez `www`; provereni odgovori bez Cache-Control.
- Nije pronađen verification meta tag ili analitika u source kodu. DNS verifikacija Search Console nije utvrdiva iz ovog nalaza.

Ovo ukazuje da postojeća `.htaccess` konfiguracija nije aktivna ili je server nadjačava. Konačni upload mora uključiti skrivenu datoteku; stvarni produkcijski statusi proveravaju se ponovo nakon deploya.

## Odluke o implementaciji

1. Jedinstven traženi canonical origin `https://www.hydraboost-infuzije.rs`, postojeće kratke rute bez završne kose crte.
2. Zadržati Angular prerender; proveriti oba produkcijska builda i stvarni HTML bez izvršavanja JS-a.
3. Odvojiti podatke metadata od servisa, povezati WebPage/WebSite/MedicalBusiness graf i ograničiti Service podatke na relevantan sadržaj.
4. Bez izmišljene adrese, recenzija, licenci ili medicinskih rezultata. MedicalBusiness je precizan Schema.org tip za postojeći opis mobilne medicinske usluge; bez javne adrese ne obećavati Google LocalBusiness rich result.
5. Zadržati korisna vidljiva FAQ pitanja, ukloniti FAQ rich-result markup. Google dokumentacija navodi da FAQ rich results više nisu prikazani od 7. maja 2026.
6. Ukloniti univerzalni preload hero slike; prioritet dati odgovarajućoj slici svake rute. Sačuvati postojeće optimizovane formate i dizajn.
7. Ne objavljivati izmišljenu pravnu politiku. Dodati samo proverljivo objašnjenje forme i dokumentovati konkretne podatke koje vlasnik mora dostaviti.

Izvori provereni 10.09.2026: [Angular prerender/SSR](https://angular.dev/guide/ssr), [MedicalBusiness](https://schema.org/MedicalBusiness), [Google LocalBusiness zahtevi](https://developers.google.com/search/docs/appearance/structured-data/local-business), [Google izmene za FAQ](https://developers.google.com/search/updates).

## Dopuna: Google Search Console

Direktna `dig TXT` provera 10.09.2026. potvrdila je postojeći `google-site-verification` DNS zapis za domen. DNS nije menjan. Odsustvo meta tokena u HTML-u ne znači odsustvo verifikacije. Pristup nalogu i stanje svojine ostaju za vlasničku proveru.
