# PLAN – Tatzli (roboczo „Bärni”)

Aplikacja PWA + APK do nauki Bärndütsch (główny cel), Hochdeutsch, angielskiego z polskim jako językiem domowym; dzieci 2–7 lat.
Nazwa „Bärni” koliduje z istniejącą postacią „Bärni Bär” (Bern) → **Tatzli** (patrz DECISIONS.md).

## Architektura

| Warstwa | Technologia | Gdzie |
|---|---|---|
| UI | React 19 + TypeScript strict + Vite 8, Tailwind 4, `motion`, animacje SVG/CSS | `src/` |
| Treści | dane TS z typami + walidacja (Vitest) | `content/` |
| Ilustracje | własne komponenty SVG (100×100 obiekty, 160×90 sceny), części animowane klasami CSS | `src/illustrations/` |
| Dane | IndexedDB przez Dexie (wersjonowane migracje) | `src/lib/db.ts` |
| Dźwięk | pliki AAC (m4a) z build-time TTS + nagrania rodziny + audio AI + Web Speech fallback, napisy | `src/lib/audio.ts`, `scripts/generate-audio.ts` |
| SFX / muzyka | Web Audio (syntezowane, oryginalne melodie) | `src/lib/sound.ts` |
| AI | Gemini REST z przeglądarki, tylko w trybie rodzica, kolejka do zatwierdzenia | `src/lib/ai/` |
| Offline | vite-plugin-pwa (precache app shell + treści), audio CacheFirst + „pobierz wszystko” | `vite.config.ts` |
| Android | Capacitor 8, podpisany APK w GitHub Actions | `android/`, `.github/workflows/` |
| Testy | Vitest (algorytmy, wyrównanie, walidacja treści, audio 4×), Playwright (E2E, TV 1080p/4K, telefon, offline) | `tests/` |

## Etapy

1. **Szkielet** – Vite/TS/Tailwind/ESLint/Vitest/Playwright, dokumenty. ✔
2. **Model treści** – typy, wyrównanie fraz, słowa (~370), frazy (~110), prompty. ✔
3. **Ilustracje SVG** – zwierzęta, obiekty, świat, postacie (Tatzli + pozy + rodzina + przyjaciele), tła 15 miejsc × 4 pory roku, mapa.
4. **Historie i piosenki** – 20 mini-historii (z wyborami), 10 oryginalnych piosenek z melodiami.
5. **Tematy** – 10 tematów × 3 poziomy + tematy sezonowe, sortowanie/liczenie, wskazówki dla rodzica, zadania „poza ekranem”, naklejki.
6. **Rdzeń aplikacji** – profile, mapa, temat, aktywności (Dotknij i odkryj, Wo isch, Mach mit, Memory, Sortowanie, Liczenie, Historia, Piosenka, Mów jak Tatzli, Überraschung), album, rytuał końca sesji, bramka rodzica, pełny ekran, tryb TV, efekty myszy/klawiatury.
7. **Panel rodzica** – postęp, czas, propozycje, PDF, kopia zapasowa, języki, dźwięk, dostępność, studio nagrań, prywatność, źródła BE.
8. **AI** – klucz szyfrowany, studio treści, warianty, pomysły, QC, kontrola BE, TTS, kolejka; fałszywy provider do testów.
9. **Weryfikacja BE** – reguły + berndeutsch.ch (automatyczne wyszukiwanie) + druga kontrola Gemini → `content/be-review.json`, `docs/BAERNDUETSCH_REVIEW.md`.
10. **Audio** – `scripts/generate-audio.ts` (Gemini TTS, batch, cięcie po ciszy, AAC), weryfikacja BE przez ASR, manifest, test 4×.
11. **PWA/Android/CI** – ikony, manifest, GitHub Pages, keystore, workflow release z podpisanym APK.
12. **QA** – lint, typecheck, unit, E2E, build, Lighthouse; README PL/DE; HANDOVER.

Po każdym etapie: lint + typecheck + testy + build, commit.
