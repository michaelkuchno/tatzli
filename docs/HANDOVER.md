# HANDOVER – rzeczy, które wymagają Ciebie

## 1. GitHub ✔ (2026-11-05)
- Repozytorium: https://github.com/michaelkuchno/tatzli
- PWA (iPhone/iPad/laptop/TV): https://michaelkuchno.github.io/tatzli/
- Release: https://github.com/michaelkuchno/tatzli/releases/latest → `Tatzli.apk` (Android), `Tatzli-unsigned.ipa` (iOS natywnie, wymaga konta Apple Developer / AltStore), `Tatzli-iOS-Simulator.app.zip`.
- Aplikacje natywne ładują aktualną PWA z GitHub Pages i trzymają ją offline → nowe nagrania docierają bez reinstalacji.

## 2. Dwa polecenia, których Claude Code nie może wykonać (blokada bezpieczeństwa)
Uruchom raz w PowerShell:
```powershell
cd C:\Users\micha\projects\baerni
# a) sekrety: Twój keystore do podpisu APK + klucz Gemini dla codziennego audio w chmurze (workflow audio.yml)
powershell -ExecutionPolicy Bypass -File scripts\set-secrets.ps1
# b) albo/oraz: codzienne dogenerowywanie nagrań na tym komputerze o 09:35
schtasks /Create /TN "Tatzli daily audio" /SC DAILY /ST 09:35 /F /TR "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\micha\projects\baerni\scripts\daily-audio.ps1"
```
Wystarczy jedno źródło codziennego audio (a – chmura, b – ten komputer). Po (a) kolejne APK są podpisywane Twoim keystore – przy przejściu z v1.0.2 (klucz CI) trzeba raz odinstalować i zainstalować APK ponownie (dane dziecka są lokalne: zrób wcześniej kopię w Panelu rodzica → Dane).

## 3. Limit Gemini TTS
Darmowy pakiet: ok. 250–300 krótkich nagrań dziennie (4 modele TTS). Komplet: **3476** par pozycja×język → ok. 2 tygodnie przy codziennym zadaniu. Szybciej: płatny pakiet w Google AI Studio (Tier 1, kilka USD) – wtedy komplet w kilka godzin.
W trybie ścisłym (domyślnym) pozycje bez sprawdzonego nagrania są pokazywane bez dźwięku i nie trafiają do Kina – żadnej zgadywanej wymowy.

## 4. Klucz Gemini – zmień go 🔐
Klucz był wklejony w czat. Po zakończeniu generowania utwórz nowy w AI Studio, usuń stary, potem `setx GEMINI_API_KEY "NOWY_KLUCZ"` i ponownie `scripts\set-secrets.ps1`.

## 5. Przechowaj bezpiecznie 🔐
Keystore Androida: `C:\Users\micha\baerni-keystore\tatzli-release.p12` (PKCS12, alias `tatzli`), hasło w `C:\Users\micha\baerni-keystore\README.txt` → skopiuj do menedżera haseł.
