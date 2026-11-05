# DECISIONS – decyzje projektowe

Każda decyzja podjęta samodzielnie (zgodnie z SPEC §0 „bez pytań”) z uzasadnieniem.

## Nazwa i postać
- **„Bärni” → „Tatzli”.** Wyszukiwanie wykazało istniejącą, nieoficjalną postać niedźwiedzia z Berna „Bärni Bär” (projekt merchandisingowy burodestruct, 2010–2014) – kolizja nazwy i motywu. „Mutzli” jest już używane (czekolada „Bärner Mutzli”, pluszaki „Mutzli”). **Tatzli** („łapka”, berneńskie zdrobnienie od *Tatze*) – brak trafień dla aplikacji/marki. Bohater: miś Tatzli z Ostermundigen.
- Postać inspirowana misiem z herbu Berna, ale **nie kopiuje herbu** (okrągły pluszowy miś, czerwono-żółty szalik jako nawiązanie do barw Berna).
- Tatzli jest chłopcem (polski wymaga rodzaju: „głodny”); siostra **Lotti**, przyjaciele **Kasia** (wiewiórka z Polski), **Freddie** (lis z Anglii), **Tante Ottilie** (sowa, mówi Hochdeutsch).

## Języki i pisownia
- Pisownia BE: „Dieth-nahe”, czytelna dla rodzica (szczegóły `docs/BAERNDUETSCH.md`). Wokalizacja *l* zawsze zapisywana jako *u* (Wäut, Miuch, Schueu) – dlatego poziom 6–7 lat nazywa się **„Schueu”** (SPEC pisał „Schuel”; wymowa berneńska to *Schueu*).
- Kolory języków dobrane po **jasności** (BE ciemnoczerwony L≈38, DE złoty L≈72, PL morski L≈55, EN granatowy L≈32) – rozróżnialne przy daltonizmie; do tego zawsze flaga/symbol.
- Rodzajniki w BE/DE w słowach („dr Bär”), EN bez rodzajnika (naturalniejsze dla małych dzieci).
- Język interfejsu rodzica: PL/DE/EN (domyślnie wg przeglądarki).

## Dźwięk
- Format **AAC (.m4a), mono 24 kHz ~40 kb/s** zamiast Opus: Opus w Safari/iOS bywa zawodny, AAC działa wszędzie (iOS, Android WebView, desktop).
- Audio **nie jest w precache** service workera (byłoby kilkanaście MB). Zamiast tego: runtime CacheFirst + automatyczne pobranie wszystkiego w tle po pierwszym starcie (i przycisk „Pobierz całe audio offline”). W APK pliki są w paczce.
- Kolejność źródeł: nagranie rodziny → audio AI (dla zatwierdzonych treści AI) → plik wygenerowany przy budowie → syntezator urządzenia (BE: głos de-CH) → widoczny komunikat 🔇 z tekstem. Napisy do każdego dźwięku.
- Batching TTS: kilka krótkich haseł w jednym zapytaniu Gemini z pauzami, potem cięcie po ciszy (oszczędza limit darmowego pakietu); przy niezgodnej liczbie segmentów – zapytania pojedyncze.
- Silnik BE: **Gemini TTS z instrukcją mówienia po berneńsku** – jedyna realnie dostępna opcja z licencją dopuszczającą użycie w aplikacji. Porównanie:
  | Opcja | Dialekt berneński | Licencja / dostępność | Decyzja |
  |---|---|---|---|
  | Gemini TTS (gemini-2.5-flash-preview-tts) | tak, sterowany promptem; jakość weryfikowana ASR | darmowy pakiet API (limity w AI Studio), wynik wolno wykorzystać | **wybrany** |
  | STT4SG-350 / SwissDial (FHNW) | korpusy z dialektami (m.in. BE) | licencje badawcze/niekomercyjne, brak gotowego TTS | odrzucone |
  | XTTS dostrojony do dialektów | możliwy | Coqui Public Model License (niekomercyjna) + brak oficjalnych wag BE | odrzucone |
  | Piper (de_DE-thorsten) | nie (Hochdeutsch) | CC0 | zapas tylko dla DE/PL/EN (wymaga zgody na uruchomienie binarki) |
  | Azure/Edge de-CH-Leni | tylko szwajcarski standard, nie dialekt | warunki usług | odrzucone |
- Weryfikacja wymowy BE: ASR szwajcarskoniemieckie. Modele Whisper dostrojone do Swiss German (np. na STT4SG) są dostępne w HF, ale wymagają Pythona/GPU i licencje bywają niekomercyjne → użyto **rozumienia audio Gemini** (transkrypcja + znaczenie w DE + ocena dialektu) jako niezależnego modelu rozpoznawania; wynik w `docs/BAERNDUETSCH_REVIEW.md`.

## Metodyka / UX
- Brak „złych odpowiedzi” dla 2–3 lat: dotknięcie innego obrazka → radosna reakcja, obrazek mówi swoją nazwę, potem łagodnie pokazujemy cel.
- Naklejka za **udział** (dwie różne aktywności w temacie), nigdy za wynik. Brak serii, liczników, losowych nagród, powiadomień.
- Sesja: 10/15/20 min wg poziomu (WHO), potem rytuał „Tatzli geit go schlafe”; przedłużyć może tylko dorosły (bramka).
- Muzyka w tle domyślnie **włączona, bardzo cicha** (generatywna pentatonika), wyłączalna.
- Poziom 1 (2–3 lata): brak tekstu w widokach dziecka; napisy dźwięków zostają (pomoc dla rodzica, dostępność).
- Pula „Überraschung”: jeśli rodzic nic nie wybrał, wszystkie wbudowane historie/piosenki poziomu są uznane za zatwierdzone; treści AI trafiają do puli dopiero po zatwierdzeniu.
- Zadania TPR potwierdza dorosły („Zrobione!”) – dziecko nie jest oceniane.
- Mapa: miejsca „śpią” (wyszarzone, „zz”) dopóki dziecko ich nie odwiedzi – ożywają, ale niczego nie blokujemy.

## Technologia
- Vite 8 / React 19 / TS 6 strict / Tailwind 4 / Dexie 4 / motion / vite-plugin-pwa 2 / Capacitor 8.
- Treści jako dane TS (`content/`) z typami + testy walidacyjne (Vitest), bez osobnego schematu runtime (szybszy start); treści AI walidowane schematem **zod**.
- PDF: pdf-lib + Nunito TTF (OFL) w dwóch podzbiorach (latin/latin-ext) – działa także w APK (zapis + udostępnienie przez Capacitor Share).
- Klucz Gemini: AES-GCM, nieeksportowalny klucz CryptoKey w IndexedDB; klucz nie trafia do kopii zapasowej.
- Fałszywy provider AI (`window.__tatzliFakeAi`) do testów E2E.
- APK budowany w GitHub Actions (JDK + Android SDK na runnerze), keystore lokalnie w `~/baerni-keystore`, sekrety w GitHub Secrets.
