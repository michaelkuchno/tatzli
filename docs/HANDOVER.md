# HANDOVER – rzeczy, które wymagają Ciebie

## 1. Repozytorium GitHub (blokuje: push, Pages, Release, codzienne audio w chmurze)
Claude Code nie może samodzielnie utworzyć **publicznego** repozytorium (blokada bezpieczeństwa). Wykonaj w PowerShell **w folderze projektu** (`C:\Users\micha\projects\baerni` – folder nazywa się *baerni*, repozytorium *tatzli*):
```powershell
cd C:\Users\micha\projects\baerni
gh repo create michaelkuchno/tatzli --public --source . --remote origin
```
Potem napisz w Claude Code „kontynuuj według docs/PROGRESS.md” – ustawię sekrety, wypchnę `main`, włączę Pages i utworzę tag `v1.0.0` (Release: podpisany APK + iOS).

## 2. Limit Gemini TTS (blokuje: komplet nagrań)
Darmowy pakiet pozwala na ok. 250–300 krótkich nagrań dziennie (4 modele TTS × ~10–20 zapytań). Komplet to **3476** par pozycja×język → ok. 2 tygodnie.
- **Automatycznie:** workflow `.github/workflows/audio.yml` codziennie o 09:30 (po resecie limitu) dogeneruje kolejne nagrania (najpierw 2–3 lata, potem 4–5, potem 6–7), sprawdzi wymowę BE, zrobi commit i wdroży PWA. Wymaga sekretu `GEMINI_API_KEY` w repozytorium (ustawię go po utworzeniu repo).
- **Szybciej (opcjonalnie, płatnie):** w Google AI Studio włącz rozliczenia (Tier 1) – wtedy komplet w kilka godzin, koszt rzędu kilku USD.
- Do czasu kompletu aplikacja mówi brakujące pozycje **głosem urządzenia** (z napisami), więc działa w pełni.

## 3. Klucz Gemini – zmień go 🔐
Klucz był wklejony w czat. Po zakończeniu generowania utwórz nowy w AI Studio, usuń stary, i ustaw:
```powershell
setx GEMINI_API_KEY "NOWY_KLUCZ"
gh secret set GEMINI_API_KEY -R michaelkuchno/tatzli
```

## 4. Przechowaj bezpiecznie 🔐
- Keystore Androida: `C:\Users\micha\baerni-keystore\tatzli-release.p12` (PKCS12, alias `tatzli`), hasło w `C:\Users\micha\baerni-keystore\README.txt` → skopiuj do menedżera haseł.

## 5. iOS
- **Zalecane:** PWA z GitHub Pages w Safari → „Do ekranu początkowego” (działa offline, bez App Store).
- Release zawiera też natywną wersję iOS (Capacitor) **bez podpisu Apple** (`Tatzli-unsigned.ipa`) i wersję na symulator. Instalacja na iPhonie wymaga konta Apple Developer (re-signing w Xcode) lub narzędzia typu AltStore – Apple nie pozwala instalować niepodpisanych aplikacji.

## 6. Opcjonalnie
- Uruchamianie pobranych binarek (Piper TTS, przenośny JDK) było zablokowane – nie jest potrzebne (APK/iOS budują GitHub Actions).
- Osoba z Berna może oznaczyć pozycje jako „sprawdzone” w panelu rodzica.
