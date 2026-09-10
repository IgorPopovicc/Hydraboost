# HydraBoost Infuzije

Produkcijski Angular sajt za **HydraBoost Infuzije**, mobilnu infuzionu terapiju na zakazanoj adresi u Beogradu i okolini. Projekat koristi prepoznatljiv vizuelni sistem, sadržaj na srpskom jeziku (latinica, ekavica), prerenderovane stranice i centralizovane poslovne podatke.

## Tehnologije

- Angular 22.1 (standalone komponente, TypeScript i Angular provera templejta)
- Angular Router sa lenjim učitavanjem svih javnih stranica
- Angular SSR / statički prerender
- SCSS sa dizajn tokenima i lokalnim stilovima komponenti
- Angular Reactive Forms
- Vitest preko zvaničnog Angular test buildera
- Lokalno hostovan Manrope varijabilni font (OFL-1.1)

## Razvojno okruženje

Projekat zahteva **Node.js 24.15.0** i npm 11.12.1. Verzija Node.js-a je zaključana u `.nvmrc` datoteci.

```bash
nvm install
nvm use
npm ci
```

Ne koristiti `--force` ili `--legacy-peer-deps`. `npm ci` koristi zaključane i međusobno kompatibilne verzije iz `package-lock.json` datoteke.

## Dostupne komande

```bash
npm start          # razvojni server na http://localhost:4200
npm run lint       # TypeScript provera aplikacije i testova
npm test           # Angular testovi
npm run test:contact      # PHP validacija, zaštita i email ugovor
npm run test:contact:http # stvarni lokalni PHP HTTP endpoint sa test transportom
npm run serve:contact    # PHP API na 127.0.0.1:8081 (konfiguracija u vodiču ispod)
npx playwright install chromium  # jednokratna priprema E2E pregledača
npm run test:e2e   # produkcijski build + responsive, navigacioni i validacioni E2E testovi
npm run build      # optimizovan SSR/prerender produkcijski build
npm run build:static # DreamWeb prerender + javni PHP ulaz + odvojeni privatni API
npm run audit:static # provera sirovog HTML-a i deploy artefakta
npm run audit:http   # statusi i preusmerenja na lokalnom preview serveru
npm run preview:static # lokalni pregled DreamWeb builda na http://localhost:4000
npm run serve:ssr  # lokalno pokretanje već izgrađenog SSR servera
```

SSR izlaz se generiše u `dist/Hydraboost/`. DreamWeb Lite paket se generiše u `dist/Hydraboost-static/browser/`, a sadržaj spreman za upload u `deploy/public_html/`. Privatni PHP deo je u `deploy/hydraboost-private/contact/` i prenosi se **pored** `public_html`, nikada u njega. VS Code Live Server (`Go Live`) može prikazati stranice, ali ne izvršava PHP; za rad forme koristite PHP API uz `npm start` ili `npm run preview:static`.

## Stranice

- `/` — početna stranica
- `/usluge` — pregled terapija i standarda usluge
- `/cenovnik` — data-driven paketi i transparentan model cena
- `/o-nama` — pristup, misija i tok dolaska
- `/faq` — česta pitanja i medicinski važne napomene
- `/kontakt` — direktne kontakt akcije i forma za pozadinsko serversko slanje
- `**` — lokalizovana 404 stranica

Stare adrese `/our-services`, `/about-us` i `/contact` preusmjeravaju se na nove srpske rute.

## Struktura projekta

```text
src/app/
  core/
    data/           # kontakt, usluge, cene i FAQ kao jedini izvori podataka
    models/         # strogo tipizovani modeli sadržaja
    services/       # upravljanje metadata i JSON-LD podacima
  features/         # lenjo učitane stranice
  layout/           # zaglavlje i podnožje
  shared/           # FAQ harmonika i završni CTA
public/assets/
  brand/            # optimizovan HydraBoost znak
  fonts/            # lokalni font i licenca
  images/           # lokalne WebP/AVIF slike po namjeni
```

## Sadržaj i cene

Legitiman sadržaj, usluge, FAQ, kontakt podaci, društvene mreže i fotografije migrirani su sa zvaničnog sajta `hydraboostinfuzije.com`. Medicinske formulacije su jezički uređene i ublažene tako da ne obećavaju ishode.

Postojeći cenovnik sadrži brojčane cene u RSD i stavke koje se određuju individualno. Sve zatečene cene su sačuvane. Vlasnik potvrđuje aktuelnost pre objavljivanja; vrednosti se menjaju isključivo u:

```text
src/app/core/data/pricing.data.ts
```

Telefon, e-pošta, područje rada i društveni linkovi održavaju se u `src/app/core/data/site.data.ts`.

## Kontakt forma

Forma šalje JSON na `POST /api/contact`. PHP endpoint na DreamWeb-u proverava podatke i šalje poruku putem Resend HTTPS API-ja na `info@hydraboost-infuzije.rs`. Tek potvrđeno prihvatanje poruke od servisa pokreće uspešan modal. Greška čuva unete podatke, a forma se prazni kada korisnik zatvori potvrdu uspeha. Email polje ostaje opciono i služi za `Reply-To`.

**Pre aktivacije potrebni su Resend nalog, verifikovan domen i privatna serverska konfiguracija.** Bez njih API vraća grešku 503; nema lažnog uspeha. Kompletna uputstva, putanje, DNS i promenljive: [Kontakt API — podešavanje i provera](docs/CONTACT-SETUP.md). Rezultati testova i spisak izmena: [Provera kontakt forme](docs/CONTACT-VALIDATION.md).

Frontend koristi postojeći Angular HttpClient/Reactive Forms, RxJS i nativni `<dialog>`. Nema novih npm/Composer biblioteka. Serverski uslov: PHP 8.4 sa `curl`, `mbstring`, `json`, `filter` i `openssl` podrškom.

## SEO i prerender

Svaka javna ruta ima jedinstven naslov, opis, canonical URL, Open Graph i Twitter metadata. `SeoService` u prerenderovanu HTML stranicu upisuje validne `MedicalBusiness`, `WebSite`, `WebPage` (odnosno `AboutPage`/`ContactPage`), `Service` na relevantnim stranicama i `BreadcrumbList` JSON-LD podatke. Graf koristi povezane `@id` identifikatore. Nema izmišljene adrese, ocena ili kvalifikacija. FAQ je vidljiv i interaktivan bez JavaScripta, bez FAQ rich-result markup-a.

Sajt uključuje:

- `public/robots.txt`
- `public/sitemap.xml`
- lokalne brendirane OG slike dimenzija 1200 × 1200
- semantičku hijerarhiju naslova i sadržaj dostupan bez klijentskog JavaScripta
- prerender za svih šest indeksabilnih javnih ruta

## Performanse i pristupačnost

- AVIF i WebP varijante hero fotografije; lokalne optimizovane WebP slike za ostatak sajta
- eksplicitne dimenzije slika radi sprečavanja CLS-a
- hero slika ima visoki prioritet i nije lenjo učitana; slike ispod prevoja jesu
- jedan lokalni varijabilni font i jedan preload
- lenjo učitavanje svake stranice na nivou rute
- gzip kompresiju HTML-a, CSS-a, JavaScripta i drugih tekstualnih resursa preko Apache konfiguracije
- semantički elementi, vidljiv fokus, tastaturna navigacija i pristupačna FAQ harmonika
- mobilni meni sa zaključavanjem skrola, Escape komandom i upravljanjem fokusa
- podrška za `prefers-reduced-motion`

## DreamWeb Lite deploy

Zvanični produkcijski origin je `https://www.hydraboost-infuzije.rs`, sa `www`. Stranice koriste statički/prerenderovani Angular izlaz, a kontakt API izvršava PHP. Node.js proces nije potreban.

1. Aktivirati besplatan SSL sertifikat za `hydraboost-infuzije.rs` i `www.hydraboost-infuzije.rs` u cPanel-u.
2. Pokrenuti `npm run build:static` sa Node.js 24.15.0.
3. U DreamWeb File Manager-u otvoriti `public_html`, napraviti rezervnu kopiju postojećeg sajta i preneti **sadržaj** lokalnog direktorijuma `deploy/public_html/`.
4. Proveriti da je skrivena datoteka `.htaccess` preneta zajedno sa `index.html`, rutama, assetima, `robots.txt` i `sitemap.xml`.
5. Preneti `deploy/hydraboost-private/` u koren hosting naloga **pored** `public_html`, pa podesiti privatni `contact/config.php` prema [vodiču](docs/CONTACT-SETUP.md). Postojeći `config.php` i `state/` sačuvati pri sledećim deployima. Ne prenositi `deploy` kao roditeljski direktorijum, `node_modules`, `src`, testove, `.git` niti `dist/Hydraboost/server`.
6. Proveriti da nadređeni `.htaccess`, cPanel i CDN nemaju pravilo koje vraća na domen bez `www` ili dodaje završnu kosu crtu. Ako `/usluge` i dalje preusmerava na `/usluge/`, zatražiti od DreamWeb podrške aktivaciju `AllowOverride All`, `mod_rewrite`, `mod_dir`, `mod_headers` i `mod_deflate` za ovaj direktorijum.
7. Proveriti `/`, `/usluge`, `/cenovnik`, `/o-nama`, `/faq`, `/kontakt`, legacy preusmerenja i nepostojeću adresu koja mora vratiti 404.

`.htaccess` normalizuje HTTP i domen bez `www` na `https://www.hydraboost-infuzije.rs`, služi stvarni prerenderovani HTML svake rute, komprimuje tekstualne resurse, daje dug cache heširanim JS/CSS datotekama i kraći cache slikama/fontovima. HTML, sitemap i robots nisu immutable keširani.

Ako Cloudflare Free stoji ispred DreamWeb-a, DNS zapisi za root i `www` treba da budu proxied, a SSL/TLS režim **Full (strict)** nakon aktivacije origin sertifikata. Ne koristiti Flexible. Posle svakog produkcijskog deploya očistiti Cloudflare cache, a nakon prvog objavljivanja poslati `https://www.hydraboost-infuzije.rs/sitemap.xml` u Google Search Console i povezati isti URL sa Google Business profilom.

## Autor

Dizajn i razvoj: **Igor Popovic**.

## SEO održavanje i provera posle deploya

- [Audit i mapa namera](docs/SEO-AUDIT.md)
- [Metadata i rezultati provera](docs/SEO-VALIDATION.md)
- [Nedostajući poslovni i medicinski podaci](docs/BUSINESS-DETAILS-TODO.md)
- Metadata: `src/app/core/data/seo.data.ts`; poslovni kontakti: `site.data.ts`; JSON-LD: `seo.service.ts`.
- Canonical host je eksplicitna produkcijska konstanta. Lokalni preview i razvojni domeni nikada ne određuju SEO URL-ove.
- Greške vraćaju 404 i `noindex, follow`, bez canonical-a ili promotivnog schema grafa. Ne prenositi CSR shell i ne koristiti catch-all prepisivanje na početnu.
- Favicon 64×64 ostaje; manifest nije potreban jer sajt nije PWA. Postojeće lokalne OG slike imaju 1200×1200 i odgovarajuća metadata polja.
- `npm run lint` je TypeScript provera, ne ESLint. Nisu dodate runtime zavisnosti.

```bash
# Nakon objavljivanja proverava stvarne HTTP odgovore bez automatskog praćenja redirecta:
SEO_BASE_URL=https://www.hydraboost-infuzije.rs npm run audit:http
```

Na produkciji dodatno proveriti HTTP i non-www varijante, SSL za oba imena i Google-ov izabrani canonical u Search Console. Poslati sitemap `https://www.hydraboost-infuzije.rs/sitemap.xml`; u URL Inspection proveriti svih šest adresa bez završne kose crte. Verifikacioni token nije pronađen u kodu, ali je direktnom TXT DNS proverom 10.09.2026. potvrđeno da domen već ima `google-site-verification` zapis. Zapis je sačuvan; vlasnik treba da proveri pristup odgovarajućoj Search Console svojini.

Prepoznavanje `MedicalBusiness` entiteta nije obećanje Google LocalBusiness rich rezultata: javna fizička adresa nije dostupna, a Google je zahteva za tu funkciju. FAQ rich rezultati su uklonjeni iz Google pretrage u maju 2026. [Zahtevi za LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), [Google evidencija promena](https://developers.google.com/search/updates).
