# Izveštaj o runtime greškama i navigaciji

Datum: 11. septembar 2026. Polazni commit: `7bfb30c`. Provereni Angular paketi: `22.1.5`; Chrome: `152.0.7977.84`; Firefox: `153.0`; Node za build: `24.15.0`.

Izmene su u radnom direktorijumu i u pripremljenom `deploy/public_html`. Nisu objavljene na DreamWeb-u. Sažeti rezultati i identifikacija bundle-ova nalaze se u [RUNTIME-DEBUG-EVIDENCE.json](./RUNTIME-DEBUG-EVIDENCE.json).

## 1. Uzrok startTime greške i vlasništvo nad VM skriptom

**Da li VM14 / VM17 kod pripada Hydraboost aplikaciji: NE.** Pripada ugrađenom Chrome DevTools Performance panelu.

Dokaz nije samo odsustvo simbola iz repozitorijuma:

- U zasebnom Chrome profilu, bez instaliranih ekstenzija, otvaranje Performance panela ubacuje anoniman skript u izolovani execution context nazvan `DevTools Performance Metrics`.
- CDP `Debugger.getScriptSource` je preuzeo stvarni skript. Ima 20.705 znakova, sa početnim redom `window.devToolsReportSoftNavs = true;`.
- SHA-256 celog skripta: `0f2eb3b63431416befd0d826255fb1736117e0ddbca120c5c3e54aca03a1810d`.
- Drugi red, kolona 19.429, dereferencira `t.entries[0].startTime` u INP callback-u. Poklapaju se i ostale pozicije iz prijavljenog stack trace-a: `13070`, `331`, `6141`, `6153`, `6321`, `2895`, `5652`.
- U automatski otvorenom DevTools panelu reprodukovan je isti uncaught TypeError tokom stvarne SPA navigacije. Broj skripta u toj sesiji bio je VM13; VM brojevi su lokalni identifikatori, a ne nazivi Angular fajlova.
- Neizmenjeni preuzeti skript je zatim ponovo izvršen u istom tipu izolovanog konteksta. Pauziranje na izuzetku pokazalo je stvarni argument: `entries: []`, `value: 8`, `navigationType: "soft-navigation"`.

U tom izdanju ugrađeni Web Vitals kod za brzu interakciju posle soft navigacije, bez pojedinačnog Event Timing zapisa, može da vrati procenjenu INP metriku sa vrednošću 8 i praznim `entries`. Njegov attribution kod eksplicitno obrađuje praznu listu. DevTools callback, međutim, bezuslovno pristupa prvom zapisu. **Puca DevTools-ov potrošač INP metrike; nije LCP merenje, SEO servis niti Angular Router.**

Provereni su izvorni kod, lockfile, instalirane zavisnosti i git istorija, kao i svih 11 deploy JavaScript fajlova i svih 11 JavaScript fajlova preuzetih sa živog sajta. U oba kompleta bundle-ova nema `reportAllChanges`, `startTime`, `PerformanceObserver`, `requestIdleCallback` ni `web-vitals`. Nije pronađena aplikaciona Web Vitals/analytics zavisnost. Nedavni SEO commit `c4f463f` nije uveo takvu instrumentaciju.

Izvor Chrome skripta za provereno izdanje: [Chrome DevTools generated Web Vitals script](https://chrome-devtools-frontend.appspot.com/serve_rev/@4334922f44c77b1208072c4deac29db3af39bbea/models/live-metrics/web-vitals-injected/web-vitals-injected.generated.js). Arhitektura ubrizgavanja je vidljiva i u [zvaničnom LiveMetrics izvoru](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/models/live-metrics/LiveMetrics.ts).

Nije dodato presretanje/sakrivanje greške niti menjanje browserovog skripta. Ekstenzija nije potrebna da bi se ovaj kvar pojavio. Sam Incognito nije garancija ako se u njemu uključi ista DevTools instrumentacija.

## 2. Problem navigacije

Reprodukovan je zaseban aplikacioni problem. Posle početne navigacije `RouteLoaderComponent` aktivira fiksni sloj preko celog ekrana, sa `z-index: 400` i `pointer-events: auto`. Header je na sloju 100. Kada se zahtev za lazy JavaScript chunk zadrži, loader ostaje iznad navigacije; `elementFromPoint()` iznad linka vraća loader. Novi klik zato ne stiže do RouterLink-a i nova navigacija uopšte ne počinje.

Loader je sada na imenovanom sloju 90, ispod headera 100. I dalje pokriva sadržaj koji se učitava, dok desktop linkovi i mobilni meni ostaju dostupni. Testovi stvarnim klikovima menjaju odredište dok prethodni zahtev još čeka. Stara navigacija se otkazuje i nova završava. Test prekida mrežnog zahteva potvrđuje i uklanjanje loadera posle greške.

Drugi problem bio je mobilni backdrop: posle zatvaranja menija primao je klikove do završetka `visibility` tranzicije. Sada zatvoreno stanje odmah ima `pointer-events: none`. Mobilni meni se zatvara već na `NavigationStart`, uključujući Back/Forward, uz postojeći cleanup na `NavigationEnd` i destroy.

Nema aplikacionih route guard-ova, route transition API-ja niti globalnog click handler-a koji otkazuje navbar navigaciju. `preventDefault` u aplikacionim komponentama ograničen je na Tab petlju otvorenog menija/dijaloga. Dekorativni elementi navbar-a nisu pokazali presretanje klikova. Ne postoji dokaz da je DevTools izuzetak izazvao konkretno ranije zamrzavanje; reprodukovan loader problem samostalno objašnjava blokirane klikove pri sporom učitavanju.

## 3. Autofocus i kontakt dijalog

Kontakt stranica stalno montira zatvoren `<dialog>`, a njegovo dugme je imalo HTML `autofocus`. Pri SPA ulasku na kontakt, browser obrađuje nov autofocus kandidat dok navigacioni link već drži fokus. CDP `Log.entryAdded` reprodukovao je poruku `Autofocus processing was blocked because a document already has a focused element.` Ovo je browser rendering poruka; samo slušanje Playwright `console` događaja nije bilo dovoljno da se uoči.

Uklonjen je statički `autofocus`. Dugme dobija programatski fokus tek nakon stvarnog `showModal()` kao odgovora na slanje forme. Ulazak na kontakt ne fokusira polje i ne otvara mobilnu tastaturu. Escape, zatvaranje dugmetom, Tab/Shift+Tab i vraćanje fokusa na submit dugme su provereni. Cleanup je idempotentan: zakasneli `close` događaj ne zatvara ponovo otvoren dijalog; destroy zatvara native dialog, vraća overflow i oslobađa referencu na stari fokus bez fokusiranja prethodne stranice.

## 4. Izmene

1. Ispravljena hijerarhija loader/header slojeva.
2. Isključeno primanje klikova zatvorenog mobilnog backdrop-a; meni se zatvara i na početku navigacije.
3. Fokus kontakt dijaloga vezan isključivo za otvaranje; ojačan close/destroy cleanup.
4. `provideClientHydration(withNoIncrementalHydration())` zadržava redovnu hidrataciju prerenderovanog HTML-a. Aplikacija nema `@defer` blokove. Ovim se uklanja nepotreban inkrementalni/event-replay registar koji u provereno instaliranom Angularu zadržava stare SPA DOM grane. Ne uvode se privatni Angular API-ji ili zakrpe u `node_modules`.
5. Jednokratno vraćanje početnog URL fragmenta nakon hidratacije. Angularov `RouterScroller.scheduleScrollEvent` u ovom izdanju preskače događaj dok je `isHydrating` true. Reprodukovan refresh `/usluge#hidratacija-i-oporavak` završavao je na `scrollY: 0` bez poziva scroller-a. Obrada sada čeka prvi render i stabilnost, proverava destroy i da je URL i dalje početni, pa skroluje do fragmenta. Ne dodaje timer ni trajnu Router pretplatu.
6. Dodati browser regresioni testovi za reprodukovane kvarove, stres navigacije, fokus, mrežne kvarove i fragment linkove.

Inkrementalna hidratacija je podrazumevana u Angularu 22; [zvanični javni API za njeno isključivanje](https://angular.dev/api/platform-browser/withNoIncrementalHydration) zadržava standardnu hidrataciju. Svesna posledica ove konfiguracije je da se početni događaji više ne baferuju kroz automatski event replay. Prerenderovanje, SEO sadržaj, lazy rutiranje i obični HTML linkovi ostaju funkcionalni. Ako se kasnije uvedu `@defer hydrate` blokovi, ovu odluku treba ponovo proveriti uz verziju Angulara u kojoj je registar ispravljen.

## 5. Izmenjeni fajlovi

Sve putanje su relativne na `/Users/igpopovic/Desktop/Hydraboost`:

- `src/app/app.config.ts`
- `src/app/app.ts`
- `src/styles.scss`
- `src/app/layout/header/header.component.ts`
- `src/app/layout/header/header.component.scss`
- `src/app/shared/route-loader/route-loader.component.scss`
- `src/app/shared/contact-result/contact-result.component.ts`
- `src/app/shared/contact-result/contact-result.component.html`
- `e2e/contact.spec.ts`
- `e2e/navigation.spec.ts` — nov
- `e2e/navigation-memory.spec.ts` — nov
- `docs/RUNTIME-DEBUG-REPORT.md` — nov
- `docs/RUNTIME-DEBUG-EVIDENCE.json` — nov

Build artefakti su regenerisani u ignorisanim direktorijumima `dist/` i `deploy/`. Privremeni dijagnostički skriptovi, logovi i heap snapshot-i su u `tmp/`; nisu uključeni u produkcione fajlove.

## 6. Lifecycle i memorija

Pronađen je stvaran retention problem u Angular event replay implementaciji. Heap snapshot prikazuje lanac `stashEventListeners → callback → JSACTION_BLOCK_ELEMENT_MAP → Set → odvojeni routerLink element → stara stranica`. `sharedMapFunction` registruje nove elemente i nakon početne hidratacije, a eager set se čisti samo jednom. Ovo je odvojeno od DevTools kvara.

U poređenju bez browser tracing snapshot-a, uz garbage collection i merenje uvek na istoj ruti:

| Merenje kroz 72 promene ruta | Pre konfiguracione ispravke | Posle |
| --- | --- | --- |
| Svi browser DOM čvorovi | 2.062 → 16.978 | 939 → 939 |
| DOM event listeneri | 55 → 55 | 53 → 53 |
| Priključeni elementi na završnoj ruti | 283 → 283 | 281 → 281 |

Završni Playwright/Chrome test na Apache-u, sa dodatnom test instrumentacijom, beleži 945 čvorova i 53 listenera u svih deset uzoraka. Privremeno praćenje Routera beleži 17 pretplata pre i posle ponavljanja, uključujući samu dijagnostičku pretplatu.

Nisu pronađene duplirane aplikacione Router/SEO pretplate. Postojeći `takeUntilDestroyed`, Angular HostListener cleanup i otkazivanje kontakt HTTP zahteva su provereni. Aplikacioni kod ne koristi `requestIdleCallback`, `PerformanceObserver`, `setTimeout`, `setInterval` ili ručni `requestAnimationFrame`. RxJS kontakt timeout je ograničen trajanjem zahteva i otkazuje se sa pretplatom. Nema zaostalog modalnog sloja ili aktivne Tab petlje posle destroy-a; provereno je napuštanje otvorenog success/error dijaloga i odlazak tokom slanja forme.

## 7. Router testovi

Obuhvaćene rute: `/`, `/usluge`, `/cenovnik`, `/o-nama`, `/faq`, `/kontakt`, aliasi i 404. Detalji usluga su četiri `/usluge#...` fragmenta, a ne zasebne route komponente. Provereni su i tri cenovnik fragmenta.

Testovi pokrivaju navbar klikove, Back/Forward, direktan URL, refresh svake glavne rute, refresh fragmenta, sporo/otkazano/neuspešno lazy učitavanje, desktop/mobilni prelaz i zatvaranje menija. Širine: 320, 360, 375, 390, 414, 768, 1024, **1088/1089**, 1440 px; postojeći širi testovi pokrivaju i 1920 px.

Privremena dev-mode dijagnostika uhvatila je 70 `NavigationStart`, 68 `NavigationEnd`, jedan očekivani `NavigationCancel` zbog promene odredišta, jedan namerno izazvan `NavigationError` i jedan `NavigationSkipped` za istu adresu. Praćeni su i `RoutesRecognized`, `GuardsCheckStart/End`, `ResolveStart/End` i Scroll događaji. Normalne navigacije nisu prijavljivale greške. Namerno dodat guard za testiranje `NavigationError` i dijagnostička pretplata postoje samo u privremenoj browser sesiji, ne u izvoru aplikacije.

## 8. Browser/extension poređenje

| Okruženje | Rezultat |
| --- | --- |
| Chrome, običan nov profil, bez Performance panela | 60/60 navigacija; bez exception-a, warning-a i CDP Log poruka |
| Chrome Incognito, ekstenzije isključene, bez Performance panela | 60/60; bez exception-a, warning-a i CDP Log poruka |
| Chrome sa automatski otvorenim DevTools Performance panelom, bez ekstenzija | Reprodukovan identičan `startTime` izuzetak; navigacija završava |
| Neizmenjeni isti DevTools skript, izolovan kontekst i pause-on-exception | Potvrđeni prazni `entries` i INP vrednost 8 |
| Firefox 153 | Navigacija i kontakt regresioni testovi prolaze; nema istog VM izuzetka |

DevTools kvar zavisi od tajminga. U jednom završnom dodatnom prolazu nije se pojavio ni sa Performance panelom, što nije dokaz da je browserov kod popravljen. Originalni korisnikov lični profil nije pregledan; reprodukcija sa novim profilom dokazuje da ekstenzija nije neophodan uzrok.

## 9. Produkcioni build, Apache i DreamWeb

Izvršeno:

| Komanda/provera | Rezultat |
| --- | --- |
| `npm run build:static` | PASS; production minifikacija, 11 prerenderovanih ruta; `main-55RGAXUZ.js` |
| `npm run lint` | PASS; oba TypeScript projekta |
| `npm test -- --watch=false` | PASS; 28 testova u 9 fajlova |
| `npm run audit:static` | PASS; SEO, artefakti, rute, `.htaccess`, statički deploy |
| `npx playwright test --output tmp/runtime-e2e-final-results` | PASS; 77 testova na postojećem statičkom preview-u |
| `npx playwright test --config tmp/runtime-matrix.config.ts` | 81 PASS, 1 SKIP na pravom lokalnom Apache-u u Chrome-u i Firefox-u |
| `SEO_BASE_URL=http://127.0.0.1:4001 npm run audit:http` | PASS; svi provereni 200/301/404 odgovori |
| `git diff --check` | PASS |

Jedini skip je CDP-specifično proveravanje Chrome autofocus poruke u Firefox-u, koji nema Chromium CDP Log domen. Firefox kontakt/fokus i navigacioni testovi su izvršeni.

Lokalni Apache je servirao kopiju finalnog `public_html` sa identičnim repozitorijumskim `.htaccess`; lokalno je simulirano kanonsko Host/TLS-proxy zaglavlje. Nema runtime SSR-a ni Node aplikacije u ovom Apache testu. Kontakt odgovori u browser matrici su kontrolisano simulirani; postojeći zaseban preview/PHP integracioni test takođe prolazi. Node ostaje samo build/test alat.

**Zaseban nalaz na živom hostingu:** HTTP odgovori trenutno ne odgovaraju repozitorijumskom `.htaccess`. Živi `/usluge` vraća 301 na `/usluge/`, `/usluge/index.html` vraća 200, a `/index.csr.html` vraća 200. Sa postojećim `.htaccess` na lokalnom Apache-u rezultati su, redom, 200, 301 na `/usluge` i 404. To ukazuje na različitu efektivnu hosting konfiguraciju; bez pristupa hosting podešavanjima nije potvrđeno da li fajl nedostaje ili se pravila drugačije primenjuju. Pri objavi treba uključiti skriveni `deploy/public_html/.htaccess` i proveriti da ga Apache primenjuje. Ovo nije uzrok presretanja SPA klikova.

## 10. Stanje konzole nakon izmena

**Hydraboost:** obična navigacija nema neočekivanih uncaught exception-a ni autofocus poruke. SEO canonical/meta/JSON-LD ostaju pojedinačni posle ponavljanja. Namerno prekinuti lazy zahtevi, kontakt HTTP greške i test guard proizvode očekivane, zabeležene poruke u negativnim testovima; one se ne skrivaju.

**Browser/eksterni alat:** identifikovan je Chrome DevTools INP izuzetak. Aplikacioni kod ne može da popravi taj izolovani browser skript. Nije dodat console filter, globalni catch ili presretanje browser API-ja u aplikaciju.

Test runner ispisuje i Node upozorenje da `FORCE_COLOR` ima prednost nad `NO_COLOR`; to nije poruka browser konzole niti greška sajta.

## 11. Završni odgovori

- Da li je `startTime` greška bila u našem kodu: **NE — Chrome DevTools.**
- Da li je navigation freeze imao uzrok u našem kodu: **DA — reprodukovano blokiranje navbar-a loaderom.** Nije dokazano da je baš to jedini uzrok ranijeg događaja koji korisnik opisuje.
- Da li su pronađeni memory/lifecycle leakovi: **DA — Angular event-replay registar; uklonjen konfiguracijom, merenje stabilno.**
- Da li je autofocus problem rešen: **DA.**
- Da li navbar pouzdano radi nakon višestruke navigacije: **DA, u opisanim testovima finalnog builda.**
- Da li production build prolazi: **DA.**

Za javni sajt preostaje objava pripremljenog statičkog builda i primena/verifikacija hosting `.htaccess`. Ovaj rad nije menjao produkcioni server.
