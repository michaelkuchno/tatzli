# AI w Tatzli (Gemini)

## Zasady
- Aplikacja działa **w pełni bez AI**. **Dziecko nigdy nie rozmawia z AI.** AI jest dostępne wyłącznie w trybie rodzica (za bramką).
- Wszystko, co wygeneruje AI, trafia do **kolejki do zatwierdzenia** (`aiQueue`, status *pending*). Dziecko widzi tylko pozycje *approved*.
- Do AI **nie są wysyłane dane dziecka**: ani przezwisko, ani wiek z datą, ani nagrania, ani postępy. Prompt zawiera tylko: miejsce, poziom (2–3/4–5/6–7), długość, listę słów tematu (test jednostkowy to sprawdza).
- Klucz z Google AI Studio wpisuje rodzic; jest **szyfrowany lokalnie** (AES-GCM, nieeksportowalny CryptoKey w IndexedDB) i nie trafia do kopii zapasowej.

## Funkcje (`src/lib/ai/pipeline.ts`)
1. **Studio treści** – miejsce + poziom + długość + temat → mini-historia w 4 językach z wyrównaniem fraz `[tekst]N`, listą słów, pytaniami dla rodzica i zadaniem poza ekranem, w schemacie JSON (zod). Przy błędzie walidacji – do 3 ponowień z listą błędów.
2. **Ilustracje** – AI wybiera tylko klucze z istniejącego słownika postaci/rekwizytów (SVG). Nie generujemy bitmap.
3. **Świeżość** – warianty: nowe zdania z tymi samymi słowami tematu.
4. **Pomysły dla rodzica** – zabawy poza ekranem dopasowane do pory roku i wieku.
5. **Kontrola jakości** – druga prośba: odpowiedniość wiekowa, brak strasznych/niebezpiecznych treści, spójność tłumaczeń → wynik widoczny w kolejce.
6. **Kontrola BE** – reguły + druga kontrola modelem + udział słownictwa już zweryfikowanego → `beConfidence` w kolejce.
7. **Wymowa** – po zatwierdzeniu: Gemini TTS dla 4 języków, zapis lokalny (IndexedDB). Brak/limit → zapas: głos urządzenia.

## Tłumacz (`src/lib/ai/translate.ts`, Rodzic → Tłumacz)
- Dowolny wpisany tekst (do 600 znaków) w jednym z 4 języków – także berneńskim – → pozostałe 3. Język rozpoznawany automatycznie albo wybrany ręcznie.
- Oryginał zostaje dokładnie taki, jak wpisany; jeśli model go zmieni albo popsuje wyrównanie, każdy język dostaje jeden blok (tłumaczenie nadal poprawne).
- Berneński: reguły (`beRules`) + druga kontrola modelem (`beCheck`) → znacznik pewności high/medium/low z uwagami.
- Wymowa: domyślnie tylko tekst (zasada: żadnej niesprawdzonej wymowy). Opcjonalnie „głos AI – niesprawdzony" (ustawienie w zakładce), z tempem mowy dziecka.
- „Do kolejki dla dziecka" → `aiQueue` (variant, pending) – do dziecka trafia dopiero po akceptacji.
- Wymaga internetu i klucza Gemini zapisanego w zakładce AI (Generative Language API musi być włączone). Koszt: ułamek centa za tłumaczenie.
- Testy: `tests/unit/translate.test.ts` (atrapa), E2E „translator", test na żywo `TATZLI_LIVE=1 GEMINI_API_KEY=… npx vitest run tests/unit/translate.live.test.ts` (5 kierunków, w tym berneński → reszta).

## Obsługa błędów
- **429 / limit** → komunikat „Limit zapytań Gemini wyczerpany”, kolejka zostaje, można ponowić później.
- **Brak internetu** → „Brak internetu – AI niedostępne. Aplikacja działa dalej bez AI.”
- **401/403** → „Klucz nie działa”.
- Model konfigurowalny (pole tekstowe + lista modeli pobrana z API przez „Sprawdź klucz”). Domyślnie: tekst `gemini-2.5-flash`, TTS `gemini-2.5-flash-preview-tts`.

## Limity i koszty
- Gemini API ma **darmowy pakiet** (Free tier) dla wybranych modeli, w tym modeli Flash i (stan 2026) modeli TTS Flash w wersji preview. Dokładne limity RPM/TPM/RPD **dla Twojego projektu** pokazuje Google AI Studio (Rate limits) – dokumentacja publiczna nie podaje wszystkich wartości, a limity się zmieniają.
- Modele TTS Pro nie mają darmowego pakietu.
- **Subskrypcja Google AI Pro (Gemini Advanced) NIE zwiększa limitów API.** Limity API rozlicza się osobno, w projekcie Google Cloud/AI Studio (Free tier lub płatny Tier 1+ z rozliczeniem).
- Klucze w jednym projekcie dzielą wspólny limit.
- Wywołania odbywają się bezpośrednio z przeglądarki (`generativelanguage.googleapis.com`, nagłówek `x-goog-api-key`), bez serwera pośredniczącego.

## Testy
- `tests/unit/db-ai.test.ts` – fałszywy provider: generowanie → kolejka *pending*, QC, `beConfidence`, odrzucanie złego JSON i złego wyrównania, brak danych dziecka w prompcie.
- `tests/e2e/app.spec.ts` – UI: generuj → kolejka → zatwierdź (z `window.__tatzliFakeAi = true`).
