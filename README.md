# HydraBoost Infuzije

Produkcijski Angular sajt za **HydraBoost Infuzije**, mobilnu infuzionu terapiju na zakazanoj adresi u Beogradu i okolini. Projekat je potpuna zamjena prethodnog Webador sajta, sa novim vizuelnim sistemom, ispravljenim sadržajem na srpskom jeziku (latinica, ijekavica), prerenderovanim stranicama i centralizovanim poslovnim podacima.

## Tehnologije

- Angular 22.1 (standalone komponente, strogi TypeScript i stroga provjera templejta)
- Angular Router sa lijenim učitavanjem svih javnih stranica
- Angular SSR / statički prerender
- SCSS sa dizajn tokenima i lokalnim stilovima komponenti
- Angular Reactive Forms
- Vitest preko zvaničnog Angular test buildera
- Lokalno hostovan Manrope varijabilni font (OFL-1.1)

## Razvojno okruženje

Projekat zahtijeva **Node.js 24.15.0** i npm 11.12.1. Verzija Node.js-a je zaključana u `.nvmrc` datoteci.

```bash
nvm install
nvm use
npm ci
```

Ne koristiti `--force` ili `--legacy-peer-deps`. `npm ci` koristi zaključane i međusobno kompatibilne verzije iz `package-lock.json` datoteke.

## Dostupne komande

```bash
npm start          # razvojni server na http://localhost:4200
npm run lint       # stroga TypeScript provjera aplikacije i testova
npm test           # testovi
npx playwright install chromium  # jednokratna priprema E2E pregledača
npm run test:e2e   # produkcijski build + responsive, navigacioni i validacioni E2E testovi
npm run build      # optimizovan SSR/prerender produkcijski build
npm run serve:ssr  # lokalno pokretanje već izgrađenog SSR servera
```

Produkcijski izlaz se generiše u `dist/Hydraboost/`. Statičke stranice nalaze se u `dist/Hydraboost/browser/`, a Node SSR server u `dist/Hydraboost/server/`.

## Stranice

- `/` — početna stranica
- `/usluge` — pregled terapija i standarda usluge
- `/cjenovnik` — transparentan model cijena
- `/o-nama` — pristup, misija i tok dolaska
- `/faq` — česta pitanja i medicinski važne napomene
- `/kontakt` — direktne kontakt akcije i forma koja priprema e-poruku
- `**` — lokalizovana 404 stranica

Stare adrese `/our-services`, `/about-us` i `/contact` preusmjeravaju se na nove srpske rute.

## Struktura projekta

```text
src/app/
  core/
    data/           # kontakt, usluge, cijene i FAQ kao jedini izvori podataka
    models/         # strogo tipizovani modeli sadržaja
    services/       # upravljanje metadata i JSON-LD podacima
  features/         # lijeno učitane stranice
  layout/           # zaglavlje i podnožje
  shared/           # FAQ harmonika i završni CTA
public/assets/
  brand/            # optimizovan HydraBoost znak
  fonts/            # lokalni font i licenca
  images/           # lokalne WebP/AVIF slike po namjeni
```

## Sadržaj i cijene

Legitiman sadržaj, usluge, FAQ, kontakt podaci, društvene mreže i fotografije migrirani su sa zvaničnog sajta `hydraboostinfuzije.com`. Medicinske formulacije su jezički uređene i ublažene tako da ne obećavaju ishode.

Zvanične numeričke cijene nisu javno potvrđene. Zbog toga su sve stavke namjerno prikazane kao **„Cijena na upit“**. Kada cijene budu odobrene, mijenjaju se isključivo u:

```text
src/app/core/data/pricing.data.ts
```

Telefon, e-pošta, područje rada i društveni linkovi održavaju se u `src/app/core/data/site.data.ts`.

## Kontakt forma

Projekat ne glumi backend potvrdu. Ispravno popunjena forma priprema naslov i sadržaj poruke, a zatim otvara korisnikovu aplikaciju za e-poštu. Korisnik završava slanje u toj aplikaciji. Za potpuno serversko slanje potrebno je kasnije povezati odobreni API u `ContactPage`, uz validaciju na serveru, zaštitu od zloupotrebe i politiku privatnosti.

## SEO i prerender

Svaka javna ruta ima jedinstven naslov, opis, canonical URL, Open Graph i Twitter metadata. `SeoService` u prerenderovanu HTML stranicu upisuje validne `MedicalBusiness`, `Service`, `BreadcrumbList` i, samo na FAQ ruti, `FAQPage` JSON-LD podatke.

Sajt uključuje:

- `public/robots.txt`
- `public/sitemap.xml`
- lokalnu OG sliku dimenzija 1200 × 630
- semantičku hijerarhiju naslova i sadržaj dostupan bez klijentskog JavaScripta
- prerender za svih šest indeksabilnih javnih ruta

## Performanse i pristupačnost

- AVIF i WebP varijante hero fotografije; lokalne optimizovane WebP slike za ostatak sajta
- eksplicitne dimenzije slika radi sprečavanja CLS-a
- hero slika ima visoki prioritet i nije lijeno učitana; slike ispod prevoja jesu
- jedan lokalni varijabilni font i jedan preload
- lijeno učitavanje svake stranice na nivou rute
- gzip kompresiju HTML-a, CSS-a, JavaScripta i drugih tekstualnih resursa na Node serveru
- semantički elementi, vidljiv fokus, tastaturna navigacija i pristupačna FAQ harmonika
- mobilni meni sa zaključavanjem skrola, Escape komandom i upravljanjem fokusa
- podrška za `prefers-reduced-motion`

## Deploy

Za statički hosting objaviti sadržaj `dist/Hydraboost/browser/` i podesiti fallback na odgovarajući prerenderovani `index.html`. Za Node hosting pokrenuti `dist/Hydraboost/server/server.mjs` iza HTTPS reverse proxyja.

Produkcijski domen treba da ostane `https://www.hydraboostinfuzije.com`, jer su canonical, sitemap i Open Graph URL-ovi pripremljeni za taj domen. Prilikom migracije DNS-a podesiti trajna preusmjerenja sa starih ruta i provjeriti da hosting vraća stvarni HTTP 404 status za nepostojeće adrese.

## Autor

Dizajn i razvoj: **Igor Popovic**.
