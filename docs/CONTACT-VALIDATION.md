# Provera nove kontakt forme

Datum: 10.09.2026. Implementacija je lokalno završena. Produkcijski upload, Resend ključ, verifikacija domena i stvarni prijem emaila ostaju za vlasnika prema [uputstvu](CONTACT-SETUP.md). Postojeće SEO izmene iz prethodnog zadatka sačuvane su.

## Rezultati izvršenih provera

| Provera | Rezultat |
| --- | --- |
| `npm run lint` | PASS; TypeScript aplikacije i testova, nije ESLint |
| `npm test -- --watch=false` | 27/27 testova u 9 fajlova |
| `npm run test:contact` | 45/45 serverskih provera |
| `npm run test:contact:http` | 1/1 HTTP integracioni test sa više zahteva i stvarnim PHP procesom |
| `npm run test:e2e` | 43/43 Chromium E2E testa, 39,7 s |
| `npm run build` | PASS; produkcijski SSR i 6 prerenderovanih javnih ruta |
| `npm run build:static` | PASS; 11 izlaznih ruta i DreamWeb deploy paket |
| `npm run audit:static` | PASS; 6 javnih canonical URL-ova, metadata/schema, sitemap, robots, 404 i odvajanje privatnog PHP dela |
| `SEO_BASE_URL=http://127.0.0.1:4090 npm run audit:http` | PASS; SSR stranice, preusmerenja i 404; API GET=405, nedostupan PHP=503 JSON |
| PHP `-l` | PASS za svih 6 PHP izvora/test fajlova |
| `git diff --check` | PASS |

Posle finalnog izdvajanja provere Resend odgovora ponovo su izvršeni PHP, HTTP, Angular i type-check testovi; privatni backend je ponovo kopiran u deploy paket. Dva E2E scenarija na 390/1440 px dodatno su pokrenuta radi snimaka završenih animacija: 2/2 PASS. Posebno je proširen i izvršen test Tab/Shift-Tab na kratkom ekranu: 1/1 PASS.

Početni browser paket: oko 348,60 kB, procenjeni prenos 95,60 kB; kontakt ruta ostaje lenjo učitana (~63,93 kB / ~15,32 kB prenosa). Nema upozorenja o build budžetu. U ovom zadatku nije ponovo meren Lighthouse niti laboratorijski Core Web Vitals; ne pripisivati mu stare SEO rezultate kao novo merenje.

## Pokriveno ponašanje

- Prazna/whitespace forma i neispravan email ne šalju zahtev; fokus odlazi na prvo neispravno polje.
- Ime, telefon, opciona e-pošta, lokacija i poruka su sačuvani. Trim, dužine i realni lokalni/međunarodni telefonski formati provereni na klijentu i serveru.
- Uspeh se prikazuje tek nakon potvrde prihvatanja; dugme prikazuje „Slanje...”, dupli submit ostaje jedan zahtev, forma se prazni posle zatvaranja uspešnog modala.
- 403/422/429/502/503, offline, timeout i neispravna 2xx struktura daju grešku i čuvaju podatke. Isti sadržaj pri ponovnom pokušaju zadržava idempotency ključ.
- Poseban E2E test prolazi kroz browser → Node preview proxy → stvarni PHP HTTP endpoint → ubrizgani test email transport → modal. Provereni su tačan primalac, Reply-To i tekst emaila.
- PHP testovi pokrivaju fixed From/To/Subject, header injection, neočekivana polja/tipove, honeypot, telo preko 16 KiB, Origin, metode, content-type, nedostajuće tajne, neispravne provider odgovore, 5/15 min IP i 60/h globalni limit, neprihvatanje lažnog X-Forwarded-For i čišćenje starih HMAC oznaka.
- Modal: dostupan naziv/opis, semantički dugmići, SVG status, početni fokus, Tab/Shift-Tab, Escape, vraćanje fokusa, zaključavanje skrola i reduced-motion.
- Širine 320, 360, 375, 390, 414, 768, 1024, 1440, 1920 px; obe vrste modala i forma bez horizontalnog overflow-a. Proveren i ekran 320×480. Ovo je browser emulacija, ne fizički iPhone/Android test.
- Stare SEO/navigacione/no-JavaScript provere ostale su u celom E2E skupu. Kontakt-forma mailto logika je uklonjena; namerni email linkovi su sačuvani.

Prvo E2E pokretanje otkrilo je izlazak Tab fokusa u chrome pregledača iz nativnog dijaloga. Dodata je eksplicitna petlja fokusa, pa svih 43 testa prolazi. Vizuelno su pregledani konačni mobilni uspeh i desktop greška. Snimci i lokalni logovi su u ignorisanom `tmp/` direktorijumu, bez produkcijskih tajni.

## Granice potvrde

Nije poslat stvarni email, nije proverena Resend prihvaćena poruka preko pravog ključa, DNS verifikacija nije izvršena i live sajt nije objavljen. Nema dostupnih privatnih credentials; produkcija bez njih vraća grešku 503. Test transport namerno simulira prihvatanje/odbijanje i nikada se ne kopira u javni ili privatni deploy. API prihvatanje je odvojeno od naknadne isporuke u sanduče.

Lokalni Node/PHP proxy je razvojna podrška. Ako se u budućnosti koristi kao javni SSR hosting, potrebno je podesiti pouzdano prosleđivanje IP-a; DreamWeb produkcija direktno izvršava PHP.

## Izmenjeni i novi fajlovi samo ovog zadatka

- `.gitignore`
- `README.md`
- `docs/CONTACT-SETUP.md`
- `docs/CONTACT-VALIDATION.md`
- `e2e/contact.spec.ts`
- `e2e/site.spec.ts`
- `hosting/dreamweb/.htaccess`
- `hosting/dreamweb/api/contact.php`
- `package.json`
- `proxy.conf.json`
- `server/contact-proxy.d.mts`
- `server/contact-proxy.mjs`
- `server/contact/config.example.php`
- `server/contact/handler.php`
- `src/app/app.config.ts`
- `src/app/core/config/contact.config.ts`
- `src/app/core/data/faq.data.ts`
- `src/app/core/services/contact.service.spec.ts`
- `src/app/core/services/contact.service.ts`
- `src/app/features/contact/contact.page.html`
- `src/app/features/contact/contact.page.scss`
- `src/app/features/contact/contact.page.spec.ts`
- `src/app/features/contact/contact.page.ts`
- `src/app/features/contact/contact.validators.spec.ts`
- `src/app/features/contact/contact.validators.ts`
- `src/app/shared/contact-result/contact-result.component.html`
- `src/app/shared/contact-result/contact-result.component.scss`
- `src/app/shared/contact-result/contact-result.component.ts`
- `src/server.ts`
- `tests/contact/handler.test.php`
- `tests/contact/http.test.mjs`
- `tests/contact/router.php`
- `tools/audit-static-build.mjs`
- `tools/contact-router.php`
- `tools/prepare-static-build.mjs`
- `tools/serve-static-preview.mjs`
