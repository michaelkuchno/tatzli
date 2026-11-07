# PROGRESS

Instrukcja wznowienia: „kontynuuj według docs/PROGRESS.md” → wykonaj pierwszy niezakończony punkt.

- [x] 1. Szkielet projektu (2026-11-05)
- [x] 2. Model treści: typy, ~367 słów, ~110 fraz, prompty
- [x] 3. Ilustracje SVG (≈380 obiektów, 15 miejsc × 4 pory roku, mapa, Tatzli z pozami)
- [x] 4. Historie (20) i piosenki (10, własne melodie)
- [x] 5. Tematy: 11+11+11 + 6 sezonowych
- [x] 6. Rdzeń aplikacji (9 aktywności, Überraschung, album, sen, klawiatura, bramka, TV, efekty myszy)
- [x] 7. Panel rodzica (w tym dźwięk w 1–4 językach w dowolnej kolejności – migracja DB v3)
- [x] 8. AI (klucz szyfrowany, studio, warianty, pomysły, QC, kontrola BE, TTS, kolejka)
- [x] 9. Weryfikacja BE: reguły + berndeutsch.ch + druga kontrola Gemini (wszystkie 833 pozycje); rozbieżności rozstrzygnięte (`content/be-overrides.json`, `docs/BAERNDUETSCH_REVIEW.md`)
- [x] 10. Audio (2026-11-06, Vertex AI): **3656/3660 zweryfikowanych** (DE/EN 100 %, PL 914/915, BE 912/915). 4 luki (ds Söili, d Stäge, D Sunne schynt, pl zimny – 10 rund różnymi modelami) (model TTS uparcie mówi «Schuel», gubi «d») – w trybie ścisłym cicho + napis, nigdy zgadywana wymowa; lista: `tests/unit/audio-gaps.json` (`npx tsx scripts/audio-gaps.ts`). Wszystkie pliki sprawdzone dekoderem ffmpeg (3 uszkodzone wymienione).
- [x] 11. PWA na GitHub Pages ✔, Release v1.0.2 (Tatzli.apk podpisany, iOS .ipa + symulator) ✔; aplikacje natywne ładują aktualną PWA. Pozostaje: sekrety + codzienne audio (HANDOVER §2).
- [x] 12. QA (v1.0.8): typecheck ✔, unit 45/45 ✔ (64 kombinacje języków), E2E 41/41 ✔, audyt kombinacji języków (klikanie) – patrz HANDOVER.
- [x] 13. Treści wciągające (2026-11-06): 19 historii + 7 piosenek przerobione (refreny, gagi, „Mach mit”) – `docs/CONTENT_REVIEW.md`; BE ponownie zweryfikowane (0 niskiej pewności).
- [x] 14. Po aktywności propozycje następnego kroku (bez autoodtwarzania); pasek przewijania nie zasłania przycisków; przerwany dźwięk nie blokuje gry (audio.stopAll rozwiązuje oczekujące odtwarzanie).
- [x] 15. Tempo mowy na dziecko (Rodzic → Języki: 70/80/90/100 %, domyślnie wg poziomu 80/90/100 %, wysokość głosu bez zmian, przycisk „Posłuchaj”); przerwy wbudowane w warstwę audio (min. 0,5 s między nagraniami, 0,6 s zapowiedź→słowo, 0,8 s między językami – dłuższe przy wolniejszym tempie); łańcuchy grupowane per język («Wo isch dr Aff?» … «Wo ist der Affe?»).
- [x] 16. Każda lekcja jako prezentacja (przycisk „Aaluege” w temacie): wszystkie słowa → zdania → historia → piosenka, sama się odtwarza (pasek przewijania, pauza, ekran nie gaśnie), na końcu „zagraj tę lekcję” / „następna lekcja”.

## Po utworzeniu repo (komendy dla Claude Code)
```powershell
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\baerni-keystore\tatzli-release.p12"))
gh secret set TATZLI_KEYSTORE_B64 --body $b64 -R michaelkuchno/tatzli
gh secret set TATZLI_KEYSTORE_PASSWORD --body (Select-String 'password: (.+)$' "$HOME\baerni-keystore\README.txt").Matches[0].Groups[1].Value -R michaelkuchno/tatzli
gh secret set GEMINI_API_KEY --body $env:GEMINI_API_KEY -R michaelkuchno/tatzli
git push -u origin main
gh api -X POST repos/michaelkuchno/tatzli/pages -f build_type=workflow
git tag v1.0.0; git push origin v1.0.0
```
