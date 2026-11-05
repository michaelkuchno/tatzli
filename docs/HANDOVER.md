# HANDOVER – rzeczy, które wymagają Ciebie

## 1. Klucz Gemini (blokuje: nagrania 4 języki + druga kontrola BE)
`GEMINI_API_KEY` nie był ustawiony w środowisku przez całą sesję. Bez niego:
- brak plików audio (`public/audio/…`) → test „każda pozycja ma 4 pliki audio” nie przechodzi; aplikacja działa, ale mówi **syntezatorem urządzenia** (Web Speech; BE głosem de-CH) – z napisami;
- 53 słowa BE nie mają drugiego potwierdzenia → test „tylko pewność wysoka/średnia” nie przechodzi.

**Co zrobić (PowerShell):**
```powershell
setx GEMINI_API_KEY "TWÓJ_KLUCZ_Z_AI_STUDIO"   # nowe okno terminala po tym poleceniu
cd C:\Users\micha\projects\baerni
npx tsx scripts/verify-be.ts --gemini --report      # druga kontrola BE → content/be-review.json + docs/BAERNDUETSCH_REVIEW.md
npx tsx scripts/generate-audio.ts                   # wznawialne; przy limicie dziennym uruchom ponownie następnego dnia
npm run check                                       # wszystko zielone
```
Albo napisz w Claude Code: „kontynuuj według docs/PROGRESS.md” – dokończę te kroki, ocenię wyniki Gemini (popraw/usuń pozycje „niska”) i zweryfikuję wymowę BE.

## 2. Publiczne repozytorium GitHub + Pages + Release (blokuje: linki PWA i APK)
Tworzenie **publicznego** repozytorium zostało zablokowane przez zabezpieczenia Claude Code (wymaga Twojej zgody). Wszystko jest gotowe lokalnie (commity na `main`, workflowy `ci.yml`, `pages.yml`, `release.yml`). Do wykonania (lub zezwól mi):
```powershell
cd C:\Users\micha\projects\baerni
gh repo create michaelkuchno/tatzli --public --source . --remote origin --push
# sekrety do podpisu APK:
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\baerni-keystore\tatzli-release.p12"))
gh secret set TATZLI_KEYSTORE_B64 --body $b64 -R michaelkuchno/tatzli
gh secret set TATZLI_KEYSTORE_PASSWORD -R michaelkuchno/tatzli   # wklej hasło z ~/baerni-keystore/README.txt
gh api -X POST repos/michaelkuchno/tatzli/pages -f build_type=workflow
git tag v1.0.0; git push origin v1.0.0       # → GitHub Release z podpisanym Tatzli.apk
```
Linki po publikacji: PWA `https://michaelkuchno.github.io/tatzli/`, APK `https://github.com/michaelkuchno/tatzli/releases/latest`.

## 3. Uruchamianie pobranych programów (opcjonalne)
Zablokowano uruchomienie pobranych binarek: **Piper TTS** (`C:\Users\micha\tools\piper\piper.exe`, głosy CC0/public domain – zapasowy darmowy syntezator offline dla DE/PL/EN) i przenośnego **JDK 21** (`C:\Users\micha\tools\jdk-21*`, lokalny build APK). Nie są wymagane: APK buduje GitHub Actions, a audio – Gemini.

## 4. Przechowaj bezpiecznie 🔐
- Keystore Androida: `C:\Users\micha\baerni-keystore\tatzli-release.p12` (PKCS12, alias `tatzli`).
- Hasło keystore + odcisk SHA-256: `C:\Users\micha\baerni-keystore\README.txt` – **skopiuj do menedżera haseł**. Utrata = brak możliwości aktualizacji APK tym samym podpisem.
- Klucz Gemini: tylko w zmiennej środowiskowej / w aplikacji (szyfrowany lokalnie). Nigdy w repozytorium.

## 5. Opcjonalnie
- Osoba z Berna może oznaczyć pozycje jako „sprawdzone” w panelu rodzica → *Bärndütsch – źródła*.
- Nagrania rodziny (studio w panelu rodzica) zastępują nagrania syntetyczne.
