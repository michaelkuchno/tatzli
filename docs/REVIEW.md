# Przegląd użyteczności i spójności (2026-11-05)

Metoda: przejście wszystkich ścieżek na telefonie (Pixel 7, pion/poziom), tablecie, laptopie, TV 1080p/4K (zrzuty z testów E2E `tests/e2e/review-shots.spec.ts`), ocena wg potrzeb dziecka 2–3 lata i mamy obsługującej telefon jedną ręką przy stole.

## Czy jest banalna w użyciu?
| Ścieżka | Kroki | Ocena |
|---|---|---|
| Dziecko: start → temat → gra | 3 dotknięcia (profil, kafelek, gra) | ✔ duże kafelki (≥ 100 px dla 2–3 lat), bez tekstu, każda akcja daje reakcję |
| Mama: włącz Kino przy jedzeniu | 1 dotknięcie (żółty przycisk „Kino” na mapie) albo kłódka → zakładka *Kino* (pierwsza) → „▶ Włącz Kino” | ✔ |
| Mama: zmiana czasu Kina / zwrotu „powtórz” / języków | Kłódka 3 s → *Kino* (suwak, 4 gotowe zwroty) / *Języki i dźwięk* (zaznacz 1–4 języki, strzałki = kolejność) | ✔ |
| Wyjście dziecka z aplikacji / ustawień | wymaga przytrzymania 3 s + zadania dla dorosłego | ✔ |

## Spójność
- Jeden świat (Tatzli, mapa Ostermundigen–Bern), ten sam styl SVG, te same kolory i flagi języków wszędzie (słowa, zdania, Kino, PDF, panel).
- Kino używa tych samych treści, nagrań, ilustracji i komponentów (WordLabel, AlignedSentence, SceneView) co gry – postęp z Kina liczy się do powtórek.
- Kolory: w każdej akcji z kolorem (prawy klik / długie przytrzymanie, dotknięcie słowa koloru, „Wo isch?”, Memory, Kino) pojawia się duże koło w tym kolorze z nazwą w wybranych językach.

## Zachęta do korzystania (bez manipulacji)
- Ruch, dźwięk, iskierki, naklejki za udział, budzące się miejsca na mapie; Kino: duży animowany obrazek → słowo pojawia się z animacją → Tatzli z mikrofonem zaprasza „Jetz du!” (konfigurowalne: „Säg's no mau!”, „Säg mit mir!”, „Chasch du das o säge?”) → 3–4 s na powtórzenie → wzorzec jeszcze raz.
- Brak serii, kar, losowych nagród, reklam, powiadomień; Kino kończy się samo po ustawionym czasie (5–30 min, domyślnie 20).

## Wymowa i tłumaczenia – zasada „bez zgadywania”
- **Tryb ścisły (domyślnie włączony):** dziecko słyszy wyłącznie nagrania wygenerowane przy budowie (Gemini TTS, BE z kontrolą rozpoznawaniem mowy), nagrania rodziny albo zatwierdzone nagrania AI. Syntezator urządzenia jest wyłączony; pozycje bez nagrania są pokazywane bez dźwięku (z napisem) i **nie trafiają do Kina**.
- Bärndütsch: 3 źródła (reguły, berndeutsch.ch, druga kontrola Gemini) – 0 pozycji o niskiej pewności; rozbieżności rozstrzygnięte na korzyść form poświadczonych w berndeutsch.ch (raport: `docs/BAERNDUETSCH_REVIEW.md`).
- Tłumaczenia DE/PL/EN: wyrównanie fraz sprawdzane testem dla każdego zdania (4 języki, te same grupy).

## Znalezione i poprawione w przeglądzie
1. Telefon w pionie: mała mapa i dużo pustej przestrzeni → **duże kafelki tematów pod mapą**.
2. Kino bez nagrań pokazywało tylko „0/163” → czytelny komunikat dla rodzica (ile nagrań gotowych).
3. „Wo isch?” pokazywało kolor przed odpowiedzią → kolor pokazywany dopiero po trafieniu.

## Ograniczenie, które zostaje (uczciwie)
- Nagrania powstają w darmowym limicie Gemini (~250–300 dziennie). Do skompletowania (≈ 2 tygodnie, codzienny workflow) część treści jest w trybie ścisłym niema; Kino pokazuje tylko gotowe treści. Szybciej: płatny pakiet Gemini (patrz HANDOVER).
