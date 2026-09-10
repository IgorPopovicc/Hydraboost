# SEO validacija i konačni metadata

Provera: 10.09.2026. Izlaz za objavljivanje: `deploy/public_html/`. Produkcija nije menjana; rezultati se odnose na lokalno generisani paket.

## Okruženje i opseg

Node 24.15.0, npm 11.12.1; čist `npm ci` (404 paketa), bez novih runtime zavisnosti ili promene lockfile-a. Angular 22.1.5, CLI/SSR 22.1.7. Šest indeksabilnih ruta. Statički build generiše 11 putanja: šest javnih stranica, četiri legacy redirect dokumenta i 404. Samo šest kanonskih stranica ulazi u sitemap. Alternativni SSR build prerenderuje šest stranica i serverski obrađuje 404.

## Konačni metadata po ruti

### /

- Title: Infuzije Beograd na kućnoj adresi | HydraBoost
- Description: Infuzije na kućnoj adresi u Beogradu, u kancelariji ili hotelu, uz prethodnu medicinsku procenu i stručni nadzor. Pozovite HydraBoost i dogovorite termin.
- Canonical: https://www.hydraboost-infuzije.rs/
- H1: Infuzije u Beogradu, na Vašoj adresi.
- OG image: https://www.hydraboost-infuzije.rs/assets/social/og-home.jpg
- Schema: MedicalBusiness, WebSite, WebPage, Service

### /usluge

- Title: Vitaminske infuzije i IV terapija Beograd | HydraBoost
- Description: Vitaminske infuzije, hidratacija i individualna IV terapija na adresi u Beogradu. Saznajte kako se bira terapija i zašto je prethodna procena neophodna.
- Canonical: https://www.hydraboost-infuzije.rs/usluge
- H1: Vitaminske infuzije i IV terapija u Beogradu.
- OG image: https://www.hydraboost-infuzije.rs/assets/social/og-usluge.jpg
- Schema: MedicalBusiness, WebSite, WebPage, Service, Service, Service, Service, Service, BreadcrumbList

### /cenovnik

- Title: Cene infuzija u Beogradu – cenovnik | HydraBoost
- Description: Cenovnik infuzione terapije, primene lekova i previjanja u Beogradu. Pogledajte cene u RSD, šta obuhvata dolazak i kada se cena prilagođava.
- Canonical: https://www.hydraboost-infuzije.rs/cenovnik
- H1: Cenovnik infuzija i usluga u Beogradu.
- OG image: https://www.hydraboost-infuzije.rs/assets/social/og-cenovnik.jpg
- Schema: MedicalBusiness, WebSite, WebPage, BreadcrumbList

### /o-nama

- Title: O nama – medicinska nega na adresi | HydraBoost Beograd
- Description: Upoznajte način rada HydraBoost mobilne medicinske usluge u Beogradu: konsultacija pre dolaska, individualna procena i primena terapije uz nadzor.
- Canonical: https://www.hydraboost-infuzije.rs/o-nama
- H1: HydraBoost – medicinska nega na adresi.
- OG image: https://www.hydraboost-infuzije.rs/assets/social/og-o-nama.jpg
- Schema: MedicalBusiness, WebSite, AboutPage, BreadcrumbList

### /faq

- Title: Infuzija kod kuće – česta pitanja | HydraBoost
- Description: Kako se zakazuje infuzija kod kuće, koliko traje i gde dolazimo? Pročitajte odgovore o proceni, ceni i organizaciji termina u Beogradu i okolini.
- Canonical: https://www.hydraboost-infuzije.rs/faq
- H1: Infuzija kod kuće: pitanja i odgovori.
- OG image: https://www.hydraboost-infuzije.rs/assets/social/og-faq.jpg
- Schema: MedicalBusiness, WebSite, WebPage, BreadcrumbList

### /kontakt

- Title: Kontakt i zakazivanje infuzije u Beogradu | HydraBoost
- Description: Zakažite konsultaciju za infuziju na adresi u Beogradu i okolini. Pozovite HydraBoost na 065/369-8376 ili pošaljite upit Viberom, WhatsAppom ili e-poštom.
- Canonical: https://www.hydraboost-infuzije.rs/kontakt
- H1: Kontakt i zakazivanje infuzije u Beogradu.
- OG image: https://www.hydraboost-infuzije.rs/assets/social/og-kontakt.jpg
- Schema: MedicalBusiness, WebSite, ContactPage, BreadcrumbList

## Slike i grafički resursi

Sve glavne fotografije vizuelno pregledane; ispravljeni su alt opisi koji su pripisivali nevidljiv medicinski kontekst ili korist terapije. Postojeći AVIF/WebP formati, dimenzije, lokalni font i OG slike 1200×1200 zadržani su. Prerender audit proverava dostupnost svakog src/srcset kandidata, alt, dimenzije, eager prioritet glavne slike i lazy loading ostalih. Preload početne fotografije postoji samo na početnoj; browser test potvrđuje da Kontakt ne preuzima tu fotografiju. Favicon je 64×64 PNG, logo 112×112 WebP. Neiskorišćene lokalne fotografije ne preuzimaju se na stranicama i nisu uklanjane.

| Datoteka (fallback) | Stranice | Alt | Dimenzije | Učitavanje | Veličina |
| --- | --- | --- | --- | --- | --- |
| `public/assets/images/hero/mobile-iv-care-896.webp` | / | Medicinska radnica priprema mobilnu infuziju u kućnom ambijentu | 896×1200 | eager; high | 36.6 KiB |
| `public/assets/images/about/profesionalna-medicinska-njega.webp` | /, /o-nama | Medicinski radnik pruža infuzionu terapiju pacijentu kod kuće | 1000×700 | lazy; auto | 70.0 KiB |
| `public/assets/images/editorial/usluge-konsultacija-1200.webp` | /usluge | Razgovor dve osobe u medicinskim uniformama | 1200×900 | eager; high | 31.6 KiB |
| `public/assets/images/editorial/nadzor-infuzione-terapije-760.webp` | /usluge | Infuzioni rastvori i pumpa uz bolnički krevet | 760×570 | lazy; auto | 22.6 KiB |
| `public/assets/images/editorial/priprema-infuzije-760.webp` | /usluge | Ruke u rukavicama podešavaju bocu rastvora na stalku | 760×570 | lazy; auto | 16.2 KiB |
| `public/assets/images/services/energija-i-vitalnost.webp` | /usluge | Komora infuzionog sistema sa rastvorom | 760×570 | lazy; auto | 8.9 KiB |
| `public/assets/images/services/individualna-terapija.webp` | /usluge | Medicinski radnik postavlja infuziju pacijentkinji | 760×570 | lazy; auto | 37.5 KiB |
| `public/assets/images/editorial/cenovnik-konsultacija-1200.webp` | /cenovnik | Lekar objašnjava pacijentkinji naredne korake tokom konsultacije | 1200×800 | eager; high | 46.9 KiB |
| `public/assets/images/editorial/o-nama-medicinski-tim-1200.webp` | /o-nama | Medicinske radnice zajedno proveravaju dokumentaciju | 1200×960 | eager; high | 48.4 KiB |
| `public/assets/images/about/mobilna-usluga-na-adresi-1000.webp` | /o-nama | Ruke u rukavicama pripremaju infuzioni rastvor | 1000×700 | lazy; auto | 19.8 KiB |
| `public/assets/images/editorial/faq-razgovor-1200.webp` | /faq | Medicinski radnik beleži informacije tokom razgovora sa pacijentkinjom | 1200×900 | eager; high | 24.3 KiB |
| `public/assets/images/editorial/kontakt-podrska-1200.webp` | /kontakt | Razgovor dve žene uz tablet | 1200×900 | eager; high | 25.7 KiB |

## Automatizovane provere

- `npm run lint`: TypeScript provera aplikacije i testova; projekat nema ESLint konfiguraciju.
- `npm test -- --watch=false`: 13/13 testova u 7 datoteka.
- `npm run build`: uspešan SSR build, 6 prerenderovanih stranica.
- `npm run build:static`: uspešan statički build, 11 generisanih putanja, upload paket napravljen.
- `npm run audit:static`: 6/6 kanonskih stranica; jedinstven title/description/H1, jezik, hijerarhija naslova, jedna glavna oblast, canonical/OG/Twitter, JSON-LD sintaksa i reference, vidljivi Service opisi, slike, linkovi i fragmenti, forme, sitemap/robots, 404, deployment sadržaj.
- `npx playwright test`: 22/22 testova prolazi (38,3 s na konačnom statičkom buildu). Testovi obuhvataju šest stranica na širinama 320–1920 px, meni, skrol, cene, hidraciju, formu, metadata pri navigaciji, bez-JS režim, redirects i 404.
- `npm run audit:http`: direktni 200 statusi, 301 preusmerenja uz očuvanje query parametara, 404 i robots/sitemap na lokalnom preview serveru; isti test pokrenut na Node SSR-u i stvarnom Apache 2.4.67.
- Apache konfiguracija: `httpd -t` → Syntax OK; testirano sa produkcijskim Host zaglavljem i simuliranim pouzdanim TLS proxy-jem. Provereni HTTP→HTTPS i non-www→www, završna kosa crta, index.html, stari URL-ovi i direktni error dokumenti. `curl --compressed` potvrđuje gzip i Cache-Control: no-cache.
- Postojeći google-site-verification DNS TXT zapis potvrđen direktnim `dig` pozivom; nije menjan. Pristup Search Console nije potvrđen.

JSON-LD provera je lokalna provera sintakse, grafa i podudaranja sa sadržajem, a ne potvrda Google rich-result podobnosti. MedicalBusiness nema izmišljenu fizičku adresu. Potpuna manuelna pristupačnost, Safari/iOS uređaji, Google indeksiranje i stvarni CrUX/INP/TTFB sa produkcije nisu potvrđeni lokalnim testovima.

## Završni pregled

Zadržane su zatečene izmene poslovne e-pošte i Igorovog potpisa. Vraćeni su originalni pricing-category fragment identifikatori uz dodavanje novih odredišta za linkove iz Usluga. Ispravljeni su pogrešni alt opisi, struktura address elementa, naziv logo linka za čitače ekrana na 320px i zaključavanje skrola pri prelasku na desktop. Direktni pozivi su dodati u uvod Kontakt i Usluge stranica. Nema novih stranica po naseljima, izmišljenih recenzija, medicinskih identiteta, tokena ili usluge vitamin C.

Posle deploya pokrenuti:

`SEO_BASE_URL=https://www.hydraboost-infuzije.rs npm run audit:http`

Ako postojeća hosting/CDN konfiguracija nadjačava .htaccess, lokalni rezultat ne garantuje isti odgovor na produkciji. Proveriti skriveni .htaccess, AllowOverride i konfliktna cPanel/CDN pravila.

## Izmenjene datoteke

Putanje su relativne na koren repozitorijuma. Zatečene izmene u tri datoteke sačuvane su i jasno navedene. Generisani dist/deploy i Lighthouse izlazi nisu izvorni kod i git ih ignoriše.

| Putanja | Promena |
| --- | --- |
| [README.md](../README.md) | Aktuelno uputstvo za www domen, cene, deploy, proveru i potvrđenu DNS verifikaciju. |
| [docs/BUSINESS-DETAILS-TODO.md](../docs/BUSINESS-DETAILS-TODO.md) | Tačni nedostajući pravni, poslovni i medicinski podaci; bez izmišljenih placeholder činjenica. |
| [docs/SEO-AUDIT.md](../docs/SEO-AUDIT.md) | Početni audit, opažanja sa produkcije, mapa namera i obrazloženja odluka. |
| [docs/SEO-VALIDATION.md](../docs/SEO-VALIDATION.md) | Konačni metadata, inventar slika, rezultati testova, ograničenja i ovaj spisak izmena. |
| [e2e/site.spec.ts](../e2e/site.spec.ts) | Ažurirani metadata očekivanja; testovi bez JavaScripta, 301/404, cache-a, preload-a i menija. |
| [hosting/dreamweb/.htaccess](../hosting/dreamweb/.htaccess) | 301 normalizacija hosta/HTTPS/putanja, direktni index i 404 dokumenti, precizan cache i gzip. |
| [package.json](../package.json) | Nova komanda audit:http; nema novih zavisnosti. |
| [public/robots.txt](../public/robots.txt) | Produkcijski www sitemap uz dozvoljeno indeksiranje javnog sadržaja. |
| [public/sitemap.xml](../public/sitemap.xml) | Šest kanonskih www URL-ova bez proizvoljnih priority/changefreq/lastmod vrednosti. |
| [src/app/app.html](../src/app/app.html) | Fokusabilan glavni sadržaj za skip link. |
| [src/app/app.routes.spec.ts](../src/app/app.routes.spec.ts) | Očekivani novi naslov cenovnika. |
| [src/app/app.spec.ts](../src/app/app.spec.ts) | Test čuva zatečeni Igorov potpis sa slovom ć. |
| [src/app/core/data/content.data.spec.ts](../src/app/core/data/content.data.spec.ts) | Provera www domena i zatečene nove poslovne e-pošte. |
| [src/app/core/data/faq.data.ts](../src/app/core/data/faq.data.ts) | Uklonjeno ponovljeno pitanje o podobnosti; pojašnjena pokrivenost okoline. |
| [src/app/core/data/seo.data.ts](../src/app/core/data/seo.data.ts) | Nova izdvojena centralna metadata konfiguracija svih ruta i 404. |
| [src/app/core/data/services.data.ts](../src/app/core/data/services.data.ts) | Precizniji nazivi/opisi, odgovorna medicinska formulacija i opisni alt tekstovi. |
| [src/app/core/data/site.data.ts](../src/app/core/data/site.data.ts) | Jedinstveni www origin; zatečena izmena e-pošte sačuvana. |
| [src/app/core/models/content.models.ts](../src/app/core/models/content.models.ts) | Uklonjeno više nekorišćeno faq SEO polje. |
| [src/app/core/services/seo.service.spec.ts](../src/app/core/services/seo.service.spec.ts) | Regresije query/fragment/legacy navigacije i prelaska 404 → kontakt. |
| [src/app/core/services/seo.service.ts](../src/app/core/services/seo.service.ts) | Povezan graf, page entiteti, usluge prema ruti, canonical i robots stanje, preload samo početne, bez FAQ rich-result markupa. |
| [src/app/features/about/about.page.html](../src/app/features/about/about.page.html) | Precizan H1, istinita oznaka ilustrativne fotografije tima i alt detalji. |
| [src/app/features/contact/contact.page.html](../src/app/features/contact/contact.page.html) | Lokalni H1, direktan poziv i WhatsApp, service-area/cenovnik link, povezana polja/greške i objašnjenje privatnosti forme. |
| [src/app/features/contact/contact.page.scss](../src/app/features/contact/contact.page.scss) | Stil uvodnog CTA, polja od 16 px i čitljiviji placeholder. |
| [src/app/features/contact/contact.page.ts](../src/app/features/contact/contact.page.ts) | Fokus na prvo neispravno polje; postojeće mailto slanje sačuvano. |
| [src/app/features/faq/faq.page.html](../src/app/features/faq/faq.page.html) | Tematski H1 i linkovi ka cenama i kontaktu. |
| [src/app/features/home/home.page.html](../src/app/features/home/home.page.html) | Glavni komercijalni/lokalni H1 i opis, precizniji H2, responsive hero sizes i centralna servisna zona. |
| [src/app/features/pricing/pricing.page.html](../src/app/features/pricing/pricing.page.html) | Tematski H1, medicinska ograda naziva, interni linkovi i fragment ciljevi; originalni fragmenti sačuvani. |
| [src/app/features/services/services.page.html](../src/app/features/services/services.page.html) | Jasan H1, objašnjenje IV, CTA, veze ka cenama/dodatnim stvarnim uslugama i korektan alt. |
| [src/app/features/services/services.page.scss](../src/app/features/services/services.page.scss) | Razmak uvodnog CTA u postojećem dizajnu. |
| [src/app/layout/footer/footer.component.html](../src/app/layout/footer/footer.component.html) | Heading izmešten iz address elementa; zatečeni LinkedIn potpis sačuvan. |
| [src/app/layout/footer/footer.component.scss](../src/app/layout/footer/footer.component.scss) | Kontakt grupisanje zadržava raspored; zatečeni .sign stil sačuvan. |
| [src/app/layout/header/header.component.html](../src/app/layout/header/header.component.html) | Aktivna ruta označena aria-current; naziv logo linka potiče iz teksta. |
| [src/app/layout/header/header.component.scss](../src/app/layout/header/header.component.scss) | Naziv brenda ostaje dostupan čitačima ekrana i kada je vizuelno sklonjen na 320 px. |
| [src/app/layout/header/header.component.ts](../src/app/layout/header/header.component.ts) | Oslobađanje zaključanog skrola kada otvoreni mobilni meni pređe na desktop širinu. |
| [src/app/shared/faq-list/faq-list.component.html](../src/app/shared/faq-list/faq-list.component.html) | Native details/summary pitanja rade i bez JavaScripta. |
| [src/app/shared/faq-list/faq-list.component.scss](../src/app/shared/faq-list/faq-list.component.scss) | Isti vizuelni stil harmonike prilagođen native disclosure elementima. |
| [src/app/shared/faq-list/faq-list.component.spec.ts](../src/app/shared/faq-list/faq-list.component.spec.ts) | Prerender svih odgovora i početno otvoreno pitanje. |
| [src/app/shared/faq-list/faq-list.component.ts](../src/app/shared/faq-list/faq-list.component.ts) | Uklonjeno nepotrebno JavaScript stanje harmonike. |
| [src/index.html](../src/index.html) | Osnovni naslov, uklonjen globalni image preload i pogrešna implikacija medicinskog autora; bez-JS kontakt alternativa. |
| [src/server.ts](../src/server.ts) | SSR normalizacija URL-ova, cache prema tipu i 404 zaštita generisanih dokumenata. |
| [tools/audit-http.mjs](../tools/audit-http.mjs) | Nova HTTP provera za preview, stvarni Apache, SSR i produkciju nakon deploya. |
| [tools/audit-static-build.mjs](../tools/audit-static-build.mjs) | Proširena provera HTML-a, metadata, JSON-LD grafa, slika, linkova, fragmenta, formi, sitemap-a i 404. |
| [tools/serve-static-preview.mjs](../tools/serve-static-preview.mjs) | Preview odražava 301/404 i cache pravila produkcijskog paketa. |

## Lighthouse — lokalno laboratorijsko merenje

Lighthouse 13.4.1 na konačnom statičkom paketu, Chrome headless, simulirani mobile profil i desktop profil, 10.09.2026. Ne predstavlja produkcijske CrUX podatke, stvarni INP niti garanciju brzine kod korisnika.

| Profil | Performance | Accessibility | Best practices | SEO tehničke provere | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | 99 | 100 | 100 | 100 | 2.0 s | 0 | 10 ms |
| desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 | 0 ms |

Početni JS+CSS paket: 329,37 kB nekomprimovan / 90,63 kB procenjenog prenosa po Angular buildu; stranice ostaju lazy-loaded. Izveštaj o neiskorišćenom delu Angular runtime-a nije razlog za rizičnu promenu framework-a. Svi resursi stranice su lokalni; nema dodatnih analitičkih skripti.

Izveštaji za pregled u radnom direktorijumu: `tmp/seo/lighthouse-mobile.report.html` i `tmp/seo/lighthouse-desktop.report.html`; JSON parovi su u istom folderu. Ovo su generisani, git-ignorisani artefakti. Za ponavljanje koristiti `npm exec --yes --package=lighthouse@13.4.1 -- lighthouse http://127.0.0.1:4000/ --chrome-flags="--headless=new"` dok radi statički preview.

## Ručne akcije posle objavljivanja

1. Napraviti backup produkcije, preneti sadržaj `deploy/public_html/`, uključujući skriveni `.htaccess`. Sačuvati tuđe verifikacione datoteke i DNS zapise. Očistiti CDN cache ako postoji; ne ostaviti konfliktno pravilo koje vraća na non-www ili dodaje završnu kosu crtu.
2. Pokrenuti `SEO_BASE_URL=https://www.hydraboost-infuzije.rs npm run audit:http`. Ručno proveriti HTTP i non-www početnu: krajnji URL mora biti HTTPS sa www. Ako canonical rute ne vraćaju neposredno 200, proveriti aktivaciju `.htaccess` sa hosting podrškom.
3. U postojeću Search Console svojinu (DNS verifikacioni zapis postoji) dodati `https://www.hydraboost-infuzije.rs/sitemap.xml` u Sitemaps → Add a new sitemap → Submit. Proveriti status Success.
4. URL Inspection: proveriti svih šest canonical URL-ova, Test live URL, dostupnost za indeksiranje, prikazani HTML i izabrani canonical. Zatražiti indeksiranje početne i izmenjenih važnih stranica kada live provera uspe.
5. Google Business Profile: usaglasiti stvarni naziv, telefon +381653698376, HTTPS www sajt i stvarnu servisnu zonu. Ne dodavati nepostojeću poslovnicu ili privatnu adresu radi SEO-a. Prikupiti autentične dobrovoljne recenzije bez izmišljanja ili kupovine.
6. Odgovorno lice dostavlja podatke iz `BUSINESS-DETAILS-TODO.md`: identitet pružaoca, potvrđene profesionalne kvalifikacije, medicinski pregled, privatnost, uslove i potvrdu cena. Stvarnim slanjem/prijemom proveriti poslovnu e-poštu i kontakt aplikacije; ovi testovi nisu slali poruke.
7. Na objavljenom sajtu pokrenuti PageSpeed Insights za početnu, usluge i kontakt na mobilnom profilu; zatim pratiti stvarne Core Web Vitals u Search Console. U Rich Results Test proveriti podržane tipove, a u Schema.org validatoru ceo graf. Očekivani nedostatak fizičke adrese nije razlog da se izmisli adresa.
8. Uskladiti podatke u postojećim legitimnim direktorijumima i partnerskim profilima. Razvijati stvarne stručne sadržaje i odnose koji mogu doneti relevantne uredničke linkove; nisu pravljeni veštački linkovi niti stranice po naseljima.

Izvori: [Search Console Sitemaps](https://support.google.com/webmasters/answer/7451001), [Google Business Profile smernice](https://support.google.com/business/answer/3038177).

## Stručna procena spremnosti (0–10)

Ocene su stručna procena implementacije i dostupnih dokaza, ne procena Google pozicije niti Lighthouse ocene.

| Oblast | Ocena | Ograničenje |
| --- | --- | --- |
| Technical SEO | 9 | Hosting mora zaista primeniti potvrđena pravila i www canonical |
| On-page SEO | 9 | Dalje odluke treba zasnivati na stvarnim Search Console upitima |
| Local SEO | 7 | GBP, lokalna reputacija i poslovni identitet nisu potvrđeni kroz naloge |
| Performance | 9 | Odličan lokalni lab rezultat; produkcijski TTFB i stvarni INP nisu izmereni |
| Mobile | 9 | Chromium 320–1920 px prolazi; fizički iOS/Safari uređaji nisu provereni |
| Structured Data | 8 | Graf i sadržaj usaglašeni; nema javne adrese za LocalBusiness rich result |
| Content | 8 | Nema izmišljenih terapija; dodatni medicinski detalji zahtevaju odgovorno lice |
| Trust / E-E-A-T | 5 | Nedostaju javni pravni identitet, proverljive licence i medicinski recenzent |
| Overall readiness | 8 | Kod i paket validirani; ostaju objavljivanje i vlasničke/poslovne radnje |
