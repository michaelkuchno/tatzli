# PROGRESS

Instrukcja wznowienia: „kontynuuj według docs/PROGRESS.md” → wykonaj pierwszy niezakończony punkt.

- [x] 1. Szkielet projektu (2026-11-05)
- [x] 2. Model treści: typy, 368 słów, ~110 fraz, prompty (2026-11-05)
- [x] 3. Ilustracje SVG: zwierzęta/kolory/liczby, obiekty, świat, postacie + pozy, 15 miejsc × 4 pory roku, mapa
- [x] 4. Historie (20) i piosenki (10, własne melodie)
- [x] 5. Tematy: 11+11+11 + 6 sezonowych
- [x] 6. Rdzeń aplikacji: profile, mapa, temat, 9 aktywności, Überraschung, album, sen, klawiatura, bramka, TV, efekty
- [x] 7. Panel rodzica: postępy, PDF, kopia, języki, komfort, studio, niespodzianki, źródła BE, prywatność
- [x] 8. AI: klucz szyfrowany, studio, warianty, pomysły, QC, kontrola BE, TTS, kolejka, fałszywy provider
- [~] 9. Weryfikacja BE: reguły ✔, berndeutsch.ch ✔ (automatycznie + ręczne wyszukiwania, 12 poprawek form), **druga kontrola Gemini – czeka na klucz** (HANDOVER §1)
- [ ] 10. Audio: skrypt gotowy (`scripts/generate-audio.ts`) – **czeka na klucz Gemini**; potem weryfikacja wymowy BE (`scripts/verify-be-audio.ts` – do napisania razem z wynikami)
- [~] 11. PWA ✔ / Android (Capacitor, podpis z env) ✔ / workflowy CI-Pages-Release ✔ / keystore ✔ / **publikacja repo – czeka na zgodę** (HANDOVER §2)
- [~] 12. QA: lint ✔, typecheck ✔, unit 37/39 (2 czekają na Gemini), E2E 25/25 ✔ (desktop, TV 1080p/4K, telefon pion/poziom, tablet, offline), Lighthouse: Perf 88–99 (mediana 92), A11y 100, Best Practices 100

## Następne kroki po otrzymaniu klucza
1. `npx tsx scripts/verify-be.ts --gemini --report` → przejrzeć pozycje oznaczone, poprawić/usunąć, wpisać decyzje do `content/be-overrides.json` i sekcji MANUAL raportu.
2. `npx tsx scripts/generate-audio.ts` (wznawialne) → weryfikacja wymowy BE przez rozpoznawanie mowy (Gemini audio) → ponowna generacja nieudanych.
3. `npm run check`, commit, publikacja (HANDOVER §2), tag `v1.0.0`.
