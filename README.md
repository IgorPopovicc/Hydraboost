# HydraBoost Infuzije

Produkcijski Angular sajt za **HydraBoost Infuzije**, mobilnu infuzionu terapiju na zakazanoj adresi u Beogradu i okolini. Projekat koristi prepoznatljiv vizuelni sistem, sadržaj na srpskom jeziku (latinica, ekavica), prerenderovane stranice i centralizovane poslovne podatke.

## Tehnologije

- Angular 22.1 (standalone komponente, strogi TypeScript i stroga provera templejta)
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
npm run lint       # stroga TypeScript provera aplikacije i testova
npm test           # testovi
npx playwright install chromium  # jednokratna priprema E2E pregledača
npm run test:e2e   # produkcijski build + responsive, navigacioni i validacioni E2E testovi
npm run build      # optimizovan SSR/prerender produkcijski build
npm run build:static # potpuno statički DreamWeb Lite build
npm run audit:static # provera sirovog HTML-a i deploy artefakta
npm run preview:static # lokalni pregled DreamWeb builda na http://localhost:4000
npm run serve:ssr  # lokalno pokretanje već izgrađenog SSR servera
```

SSR izlaz se generiše u `dist/Hydraboost/`. DreamWeb Lite paket se generiše u `dist/Hydraboost-static/browser/`, a sadržaj spreman za upload u `deploy/public_html/`. VS Code Live Server (`Go Live`) prikazuje finalni `public_html` folder.

## Stranice

- `/` — početna stranica
- `/usluge` — pregled terapija i standarda usluge
- `/cenovnik` — data-driven paketi i transparentan model cena
- `/o-nama` — pristup, misija i tok dolaska
- `/faq` — česta pitanja i medicinski važne napomene
- `/kontakt` — direktne kontakt akcije i forma koja priprema e-poruku
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

Zvanične numeričke cene nisu javno potvrđene. Zbog toga su sve stavke namerno prikazane kao **„Cena na upit“**. Kada cene budu odobrene, menjaju se isključivo u:

```text
src/app/core/data/pricing.data.ts
```

Telefon, e-pošta, područje rada i društveni linkovi održavaju se u `src/app/core/data/site.data.ts`.

## Kontakt forma

Projekat ne glumi backend potvrdu. Ispravno popunjena forma priprema naslov i sadržaj poruke, a zatim otvara korisnikovu aplikaciju za e-poštu. Korisnik završava slanje u toj aplikaciji. Za potpuno serversko slanje potrebno je kasnije povezati odobreni API u `ContactPage`, uz validaciju na serveru, zaštitu od zloupotrebe i politiku privatnosti.

## SEO i prerender

Svaka javna ruta ima jedinstven naslov, opis, canonical URL, Open Graph i Twitter metadata. `SeoService` u prerenderovanu HTML stranicu upisuje validne `MedicalBusiness`, `WebSite`, `Service`, `BreadcrumbList` i, samo na FAQ ruti, `FAQPage` JSON-LD podatke.

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

Zvanični produkcijski origin je `https://hydraboost-infuzije.rs`, bez `www`. Produkcija koristi isključivo statički/prerenderovani Angular izlaz i ne zahteva Node.js proces.

1. Aktivirati besplatan SSL sertifikat za `hydraboost-infuzije.rs` i `www.hydraboost-infuzije.rs` u cPanel-u.
2. Pokrenuti `npm run build:static` sa Node.js 24.15.0.
3. U DreamWeb File Manager-u otvoriti `public_html`, ukloniti samo prethodnu verziju sajta i preneti **sadržaj** lokalnog direktorijuma `deploy/public_html/`.
4. Proveriti da je skrivena datoteka `.htaccess` preneta zajedno sa `index.html`, rutama, assetima, `robots.txt` i `sitemap.xml`.
5. Ne prenositi `deploy` kao roditeljski direktorijum, `node_modules`, `src`, testove, `.git` niti `dist/Hydraboost/server`.
6. Proveriti `/`, `/usluge`, `/cenovnik`, `/o-nama`, `/faq`, `/kontakt`, legacy preusmerenja i nepostojeću adresu koja mora vratiti 404.

`.htaccess` normalizuje HTTP i `www` na `https://hydraboost-infuzije.rs`, služi stvarni prerenderovani HTML svake rute, komprimuje tekstualne resurse, daje dug cache heširanim JS/CSS datotekama i kraći cache slikama/fontovima. HTML, sitemap i robots nisu immutable keširani.

Ako Cloudflare Free stoji ispred DreamWeb-a, DNS zapisi za root i `www` treba da budu proxied, a SSL/TLS režim **Full (strict)** nakon aktivacije origin sertifikata. Ne koristiti Flexible. Posle svakog produkcijskog deploya očistiti Cloudflare cache, a nakon prvog objavljivanja poslati `https://hydraboost-infuzije.rs/sitemap.xml` u Google Search Console i povezati isti URL sa Google Business profilom.

## Autor

Dizajn i razvoj: **Igor Popovic**.
