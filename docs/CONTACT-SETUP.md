# Kontakt forma: aktivacija na DreamWeb-u

Implementirano 10.09.2026. Recipient je fiksno `info@hydraboost-infuzije.rs`. Slanje sa pravog Resend naloga i isporuka u sanduče još nisu provereni jer ključ nije dostupan. Lokalni testovi koriste jasno odvojen test transport; taj transport se ne prenosi u produkciju.

## Zašto PHP + Resend

Angular 22.1.5 ima opcionu Express SSR ulaznu tačku, ali stvarni deploy projekta je DreamWeb Lite sa prerenderovanim stranicama. [DreamWeb ponuda](https://www.dreamwebhosting.net/hosting-ssd) navodi PHP/Apache na shared hostingu, a Node.js za više pakete. Dodati PHP endpoint radi na postojećem Lite paketu. Koristi Resend HTTPS API preko ugrađenog cURL-a: nema mail klijenta posetioca, SMTP lozinke u browseru, novog UI frameworka, npm ili Composer zavisnosti. Express SSR i lokalni preview prosleđuju isti endpoint lokalnom PHP procesu, bez druge implementacije email pravila.

Tok: ContactPage → ContactService → POST /api/contact → PHP validacija i ograničenje → Resend /emails → poslovno sanduče. HTTP 200 `{ "ok": true, "status": "accepted" }` nastaje tek kada Resend vrati uspešan HTTP odgovor sa validnim ID-jem poruke. To potvrđuje prihvatanje za slanje; naknadno odbijanje, spam folder ili isporuku proveriti u Resend evidenciji i samom sandučetu.

## 1. Proveriti hosting i sanduče

1. Otvoriti DreamWeb cPanel za ovaj domen.
2. Software → **Select PHP Version** → **8.4** → **Set as current**. Proveriti da su `curl` i `mbstring` uključeni; `json`, `filter` i `openssl` moraju biti dostupni. U Options podesiti `display_errors=Off`, `log_errors=On`. [DreamWeb uputstvo](https://helpdesk.dreamweb.rs/sr/baza-znanja/article/promena-php-verzije-i-konfiguracije).
3. Email → **Email Accounts**: potvrditi da `info@hydraboost-infuzije.rs` postoji i da prima običnu probnu poruku. Kod ne kreira sanduče niti menja njegovu lozinku.
4. Od DreamWeb podrške tražiti proveru izlaznog HTTPS saobraćaja ka `api.resend.com:443` ako je blokiran. Nisu potrebni otvoreni SMTP portovi.

## 2. Napraviti Resend nalog i verifikovati domen

1. Otvoriti [Resend](https://resend.com/signup) i napraviti nalog za poslovanje.
2. Domains → **Add Domain** → upisati `hydraboost-infuzije.rs` (bez `www` i bez `https://`). Izabrati evropski region koji dashboard nudi.
3. Koristiti slanje; prijem pošte ostaje na DreamWeb-u. U Records delu kopirati **tačna imena, tipove, prioritete i vrednosti** DKIM i SPF/Return-Path zapisa koje Resend generiše. Tokeni se razlikuju po nalogu i ne mogu se unapred izmisliti. [Zvanično uputstvo za domen](https://resend.com/docs/add-a-domain).
4. DNS provera 10.09.2026. pokazuje `dns1.dwhost.net`, `dns2.dwhost.net`, `dns3.dwhost.net`, pa zapise trenutno dodati kroz DreamWeb cPanel → **Domains → Zone Editor → Manage** za domen. Za svaki Resend zapis izabrati Add Record, odgovarajući TXT/MX/CNAME tip i uneti vrednosti iz dashboarda. Proveriti da editor ne dopiše domen dvaput.
5. Postojeći glavni MX je `0 mail.hydraboost-infuzije.rs`; **sačuvati ga**. Resend Return-Path obično koristi poddomen `send.hydraboost-infuzije.rs`. Njegove TXT/MX zapise dodati na ime prikazano u Resend-u, bez zamene MX-a glavnog domena i bez dodavanja drugog SPF TXT zapisa na isto DNS ime. Postojeći `_dmarc` je `v=DMARC1; p=none;` — sačuvati, bez dupliranja. Sačuvati postojeće Google verification zapise.
6. Ako se nameserveri naknadno prebace na Cloudflare, iste zapise dodavati tamo; email CNAME zapisi moraju biti DNS only. U Resend-u proveriti da domen ima status **Verified**. Ne menjati postojeću poštu radi Resend opcije Receiving.
7. Ostaviti open/click tracking isključen za kontakt poruke. From u kodu će biti postojeća poslovna adresa `info@hydraboost-infuzije.rs`; Reply-To je validna adresa posetioca ako ju je uneo.

## 3. Napraviti privatni ključ

1. Resend → **API Keys → Create API Key**.
2. Naziv: `HydraBoost contact production`.
3. Permission: **Sending access**. Domain: **hydraboost-infuzije.rs**. Sačuvati generisani ključ u menadžeru lozinki; vrednost se prikazuje samo jednom. [Uputstvo za ključ](https://resend.com/docs/create-an-api-key).
4. Ključ ide samo u `RESEND_API_KEY` privatnog PHP config fajla iz narednog koraka. Ne ide u Angular environment, JavaScript, `.htaccess`, javni folder, Git ili ovaj dokument. Javni ključ ne postoji i nije potreban.

## 4. Build i upload u dva odvojena direktorijuma

Lokalno, sa Node.js iz `.nvmrc`:

```bash
nvm use
npm ci
npm run build:static
npm run audit:static
```

U cPanel File Manager-u otvoriti home naloga, tipično `/home/CPANEL_USER/`. `CPANEL_USER` zameniti stvarnim korisničkim imenom prikazanim u cPanel-u. Posle rezervne kopije postojećeg sajta:

- Sadržaj `deploy/public_html/` preneti u `/home/CPANEL_USER/public_html/`, uključujući skrivenu `.htaccess` i `api/contact.php`.
- `deploy/hydraboost-private/` preneti u `/home/CPANEL_USER/hydraboost-private/`, **pored** `public_html`.
- U privatnom `contact/` kopirati `config.example.php` kao `config.php`.
- Popuniti konfiguraciju koristeći tabelu ispod. Nikada ne kopirati popunjen config nazad u javni deploy.

Očekivana struktura:

```text
/home/CPANEL_USER/
  public_html/
    .htaccess
    index.html
    kontakt/index.html
    api/contact.php
    ... ostale prerenderovane stranice i javni asseti
  hydraboost-private/
    contact/
      handler.php
      config.example.php
      config.php          # pravi ključ, samo na serveru
      state/              # PHP automatski kreira; mora imati pravo pisanja
        rate.json
```

Ako je document root drugačiji, privatni folder i dalje mora biti pored stvarnog `public_html`; javni entry računa putanju u odnosu na `api/contact.php`. PHP `open_basedir`, ako je uključen, mora dozvoliti ovaj privatni direktorijum. Zatražiti to od podrške ako nije dozvoljeno, bez premeštanja ključa u javni folder.

| PHP ključ / serverska promenljiva | Tačna vrednost / poreklo |
| --- | --- |
| `RESEND_API_KEY` | Privatni Resend ključ iz prethodnog koraka |
| `CONTACT_FROM_EMAIL` | `info@hydraboost-infuzije.rs` nakon verifikacije domena |
| `CONTACT_RATE_SECRET` | Nasumična tajna dobijena komandom `openssl rand -hex 32`; kopirati rezultat samo u privatni config |
| `CONTACT_ALLOWED_ORIGIN` | `https://www.hydraboost-infuzije.rs` |
| `CONTACT_STATE_DIR` | Opciono; podrazumevano `__DIR__ . '/state'` u privatnom PHP folderu. Podesivo u config fajlu. |

Prva četiri ključa mogu biti i stvarne serverske environment promenljive i tada imaju prednost nad config fajlom. `.env` se ne učitava automatski. Na cPanel-u je opisani privatni PHP fajl najjednostavniji postupak. Kod ne zahteva SMTP korisnika ili lozinku i ne prihvata promenljivog primaoca iz browsera.

Za `hydraboost-private` i `contact` podesiti dozvole 700, a za `config.php` 600, pod istim vlasnikom kao PHP proces. PHP mora moći da napravi/piše `state/`. Ako LSAPI radi pod drugim korisnikom, tražiti od DreamWeb podrške odgovarajuće vlasništvo/dozvole; ne koristiti 777. Javni fajlovi zadržavaju uobičajene hosting dozvole.

Pri sledećem uploadu menjati `handler.php` i javne fajlove; **sačuvati produkcijski `config.php` i `state/`**. Build namerno kopira samo handler i prazan primer u privatni paket. Ne sinhronizovati privatni folder sa opcijom koja briše dodatne serverske fajlove.

## 5. Proveriti objavljeni sajt i isporuku

1. Očistiti cache posle deploya. `/api/*` ne sme biti keširan; PHP već vraća `Cache-Control: no-store`. Sačuvati HTTPS i www kanonikalizaciju iz postojeće konfiguracije.
2. Otvoriti `https://www.hydraboost-infuzije.rs/api/contact` u browseru: očekivan je **405** i `{"ok":false}`, jer GET nije dozvoljen. 503 znači da privatni handler nije na očekivanoj putanji ili ima grešku. Izvorni PHP tekst znači da hosting nije uključio PHP izvršavanje — popraviti handler na hostingu pre upotrebe forme.
3. Otvoriti `/kontakt`. Poslati jednu jasno označenu test poruku, sa svojim telefonom i emailom, bez zdravstvenih podataka. Očekivati „Slanje...”, zatim potvrdu uspeha i ostanak na sajtu. Zatvaranje potvrde prazni formu.
4. U Resend → **Emails** otvoriti poslatu poruku i proveriti status **Delivered**, primaoca i From. U DreamWeb Webmail-u otvoriti `info@hydraboost-infuzije.rs`, proveriti Inbox i Spam/Junk. Odgovor na poruku treba da koristi posetiočev email kao Reply-To.
5. Uspešno prihvatanje za slanje ne garantuje kasniji prijem u Inbox. Ako Resend prikazuje bounced/rejected, ispraviti sanduče/DNS prema njegovom događaju i ponoviti sa novom test porukom.
6. Ako se prikaže greška, proveriti PHP error log: beleže se samo kategorija i provider HTTP/cURL status, bez sadržaja i tajni. 422 = payload/honeypot, 403 = Origin, 429 = limit, 502 = Resend odbio ili nije odgovorio, 503 = nedostaje konfiguracija, PHP modul ili pristup privatnom stanju. Posetiocu se ne prikazuju ovi tehnički detalji.
7. Kod 429 sačekati do 15 minuta. Limit je 5 validnih pokušaja/15 min po IP adresi i 60/h ukupno, uključujući neuspehe provajdera. Iza CDN-a DreamWeb mora postaviti stvarni `REMOTE_ADDR` kroz provereni proxy/mod_remoteip; kod namerno ne veruje proizvoljnom `X-Forwarded-For`. Lokalni Node proxy grupiše posetioce pod loopback adresom i namenjen je razvoju; za javni Node deploy potrebno je prilagoditi pouzdan proxy/IP konfiguraciju.
8. Pokrenuti `SEO_BASE_URL=https://www.hydraboost-infuzije.rs npm run audit:http` radi provere postojećih stranica, statusa i preusmerenja.

## Lokalni razvoj i testovi

PHP CLI 8.4 mora biti na PATH-u. Na ovom računaru provereni binary je `/opt/homebrew/opt/php@8.4/bin/php`. Homebrew je instalirao PHP i zavisnosti, ali je njegov završni konfiguracioni korak prijavio `unknown install step: configure_php`; CLI, curl i mbstring rade i svi navedeni PHP testovi su pokrenuti tim binarnim fajlom. Nije pokrenut stalni PHP servis. Ako se koristi ovaj računar:

```bash
export PATH="/opt/homebrew/opt/php@8.4/bin:$PATH"
nvm use
npm run test:contact
npm run test:contact:http
npm test -- --watch=false
npm run lint
npm run test:e2e
```

Automatski PHP i browser integracioni testovi pokreću lokalni PHP server i test transport; ne šalju internet email. Potrebni su slobodni portovi 4000, 8081 i 8082. Test adapteri ostaju u `tests/` i nisu deo deploya.

Za ručno testiranje sa pravim ključem napraviti ignorisani `server/contact/config.php` iz primera. Prvi terminal:

```bash
CONTACT_ALLOWED_ORIGIN=http://localhost:4200 npm run serve:contact
```

Drugi terminal: `npm start`, pa otvoriti **http://localhost:4200/kontakt**. Za produkcijski lokalni preview umesto toga koristiti origin `http://127.0.0.1:4000` i drugi terminal `npm run preview:static`. Različiti hostovi/portovi su različiti origini i moraju se tačno poklopiti. Relativni `/api/contact` centralizovan je u `src/app/core/config/contact.config.ts`, bez tajni.

Opcionom Express SSR serveru PHP mora biti pokrenut posebno. `CONTACT_BACKEND_URL` je serverska Node promenljiva; podrazumevano `http://127.0.0.1:8081/api/contact`. Angular dev server koristi `proxy.conf.json`. Ako PHP nije pokrenut, UI uredno prikazuje grešku, bez otvaranja email aplikacije.

## Ponašanje i privatnost podataka u kodu

Nema automatskog ponavljanja zahteva. Dugme i guard sprečavaju paralelne zahteve. Pri ručnom ponavljanju neizmenjene poruke zadržava se isti UUID u memoriji; Resend [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys) sprečava dupliranje u roku od 24h. Posle 23h servis pravi novi ključ. Ponovno učitavanje stranice završava ovu zaštitu u memoriji; nema localStorage kopije ličnih podataka.

Server koristi tekstualni email sa fiksnim Subject/To, verifikovanim From i validiranim opcionim Reply-To. Ne zapisuje poruke u fajlove niti logove. Rate limit čuva HMAC IP oznaku i vreme, najviše 60 stavki; stare stavke se uklanjaju pri narednom validnom zahtevu. Sadržaj poruke prolazi kroz Resend i poslovni email sistem. Vlasnik treba da uskladi postojeće obaveštenje o obradi podataka sa stvarnom upotrebom tih servisa; forma već traži da se ne unose osetljivi zdravstveni podaci ili dokumentacija. Nisu izmišljeni rokovi čuvanja niti pravna obećanja.
