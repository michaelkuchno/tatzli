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
- [~] 10. Audio: generator z łańcuchem modeli TTS i kolejnością poziomów; **stan: `scripts/data/audio-status.json`** (2026-11-05: 189/3476 – dzienny limit darmowy wyczerpany). Dalej: codziennie `npx tsx scripts/generate-audio.ts` lub workflow `audio.yml` w GitHub Actions; potem `npx tsx scripts/verify-be-audio.ts --delete-failed`.
- [x] 11. PWA na GitHub Pages ✔, Release v1.0.2 (Tatzli.apk podpisany, iOS .ipa + symulator) ✔; aplikacje natywne ładują aktualną PWA. Pozostaje: sekrety + codzienne audio (HANDOVER §2).
- [~] 12. QA: lint ✔, typecheck ✔, unit (test 4×audio czeka na komplet nagrań), E2E 26/26 ✔, Lighthouse Perf mediana 92 / A11y 100 / BP 100.

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
