# Tatzli 🐻 – Bärndütsch für Chind

<img src="public/icons/icon-512.png" width="120" align="right" alt="Tatzli">

**PL:** Tatzli to darmowa, spokojna aplikacja do nauki **Bärndütsch** (główny cel), **niemieckiego**, **polskiego** i **angielskiego** dla dzieci w wieku 2–7 lat. Bez reklam, bez kont, bez śledzenia, działa offline.

**DE:** Tatzli ist eine kostenlose, ruhige App zum Lernen von **Bärndütsch** (Hauptziel), **Hochdeutsch**, **Polnisch** und **Englisch** für Kinder von 2 bis 7 Jahren. Ohne Werbung, ohne Konto, ohne Tracking, funktioniert offline.

## Pobierz · Herunterladen

| | PL | DE |
|---|---|---|
| 📱 **iPhone / iPad** | Otwórz w Safari **https://michaelkuchno.github.io/tatzli/** → Udostępnij → „Do ekranu początkowego” | In Safari **https://michaelkuchno.github.io/tatzli/** öffnen → Teilen → «Zum Home-Bildschirm» |
| 🤖 **Android** | Pobierz **Tatzli.apk** z [Releases](https://github.com/michaelkuchno/tatzli/releases/latest) i zainstaluj (zezwól na instalację z tego źródła) | **Tatzli.apk** unter [Releases](https://github.com/michaelkuchno/tatzli/releases/latest) laden und installieren |
| 💻📺 **Laptop / TV (HDMI)** | Otwórz link PWA w Chrome/Edge → „Zainstaluj”; tryb TV włącza się automatycznie na dużym ekranie | PWA-Link in Chrome/Edge öffnen → «Installieren»; TV-Modus startet auf grossen Bildschirmen automatisch |

## Co jest w środku · Was steckt drin

- **Miś Tatzli z Ostermundigen**, jego rodzina i przyjaciele (wiewiórka Kasia z Polski, lis Freddie z Anglii, sowa Tante Ottilie mówiąca Hochdeutsch) · **Tatzli, der Bär aus Ostermundigen**, mit Familie und Freunden.
- **Mapa okolicy**: dom, Steinbruch, bus do Berna, Zytglogge, Bärenpark i Aare, Gurten, Dählhölzli, Märit, Chindsgi i Schueu, Spiuplatz · **Karte der Umgebung**.
- **369 słów, ~110 fraz, 20 historii, 10 własnych piosenek**, 39 tematów (3 poziomy + święta: Zibelemärit, Samichlous, Wiehnachte/Wigilia, Fasnacht, Ostere/Wielkanoc, 1. August).
- Wszystko w **4 językach** z podświetlaniem odpowiedników (na poziomie fraz) i **wymową w każdym języku**.
- Gry: Dotknij i odkryj, „Wo isch …?”, „Mach mit!” (TPR), Memory, Sortowanie, Liczenie, Historie z wyborami, Piosenki, „Red wie Tatzli”, codzienna „Überraschung”.
- **Tryb rodzica** (bramka): postępy, czas, propozycje, słowniczek PDF, kopia zapasowa, studio nagrań rodziny, studio AI (Gemini, wszystko do zatwierdzenia), źródła BE, prywatność.
- Metodyka: zrozumiały input, TPR, powtórki rozłożone w czasie, narracja, uczenie bez błędów, wspólne korzystanie, transfer do życia, krótkie sesje (WHO) – patrz [docs/METHOD.md](docs/METHOD.md).
- Bärndütsch sprawdzony regułami, słownikiem berndeutsch.ch i drugą kontrolą AI – [docs/BAERNDUETSCH.md](docs/BAERNDUETSCH.md), [raport](docs/BAERNDUETSCH_REVIEW.md).

## Prywatność · Datenschutz

Wszystkie dane zostają na urządzeniu (IndexedDB). Brak serwera, analityki, reklam i zewnętrznych czcionek. Nagrania mikrofonu nigdy nie opuszczają urządzenia. · Alle Daten bleiben auf dem Gerät. Kein Server, keine Analyse, keine Werbung. Konform mit nDSG und DSGVO.

## Dla programistów · Für Entwickler

```powershell
npm ci
npm run dev              # Entwicklung
./scripts/start-local.ps1  # Build + Vorschau im WLAN
npm run check            # lint + typecheck + unit + build + e2e
npx tsx scripts/verify-be.ts --dict --gemini --report   # Bärndütsch-Prüfung
npx tsx scripts/generate-audio.ts                       # Aussprache (GEMINI_API_KEY)
```

Stack: React 19, TypeScript (strict), Vite, Tailwind, motion, Dexie, vite-plugin-pwa, Capacitor (Android), Vitest, Playwright.
Illustrationen, Figuren, Lieder und Melodien sind Originalwerke dieses Projekts. Schrift Nunito (SIL OFL).
