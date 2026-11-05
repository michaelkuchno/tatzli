# Bärndütsch w Tatzli – pisownia, źródła, procedura weryfikacji

## Zasady pisowni (Dieth-nahe, czytelna dla rodzica)
Dialekt nie ma obowiązującej ortografii; berndeutsch.ch zaleca **konsekwencję** w obrębie tekstu. Stosujemy:

| Zasada | Przykłady |
|---|---|
| Długie samogłoski podwojone | Huus, Muus, Buuch, liisli |
| **‹y›** dla dawnego długiego î (tradycja berneńska, jak *Zytglogge*) | Zyt, wyss, chly, schrybe, Rys, Lym |
| Dyftongi ‹ie ue üe› | lieb, guet, Chue, müed, Brueder |
| Początkowe k → ‹ch› | Chatz, Chind, Chopf, Chuchi, Chäs |
| **Wokalizacja l → u** (przed spółgłoską i w wygłosie) | Wäut, aui, viu, Miuch, Vogu, Öpfu, Schueu, Spiuplatz, Waud, chaut, schnäu, vou, euf, zwöuf, Stueu |
| Nieakcentowane *e* zostaje *e* (nie ‹ä›) | Gipfeli (nie *Gipfäli*), Meitschi |
| Rodzajniki | dr (der), d (die), ds (das), Plural d; *z* = zu |
| Formy czasowników berneńskich | i gange / mir göh, geit, chunnt / mir chöme, i ha / mir hei, i bi / mir sy, i wott / mir wei, i cha / mir chöi, „go + bezokolicznik” (*Tatzli geit go schlafe*) |
| Zaimek „my” | **mir** (nie *mer*); *mer* tylko jako nieakcentowane „mi/mich” (*Zeig mer…*) |
| Słownictwo berneńskie zamiast zuryskiego | Grüessech (nie Grüezi), Meitschi (nie Meitli), Giel, chly (nie chli), nid (nie nöd), Gspänli, Titti, Rytti, Gygampfi, Glungge, Härdöpfu, Anke, Güggu, Himugüegeli |
| Velaryzacja nd → ng | tylko w ustalonych słowach (dr Hung = miód); *Hund*, *Chind* zostawiamy w formie czytelnej |

## Źródła (do sprawdzania form; teksty nie są kopiowane)
1. **berndeutsch.ch – Wörterbuch Berndeutsch–Deutsch** – https://www.berndeutsch.ch/ (>7000 haseł, walidowane przez wolontariuszy; strona „Schrybe” z zaleceniami pisowni: https://www.berndeutsch.ch/pages/schrybe). Odpytywane automatycznie (`scripts/verify-be.ts --dict`, 0,7 s przerwy, robots.txt zezwala); zapisujemy tylko hasła i warianty pisowni.
2. **Otto von Greyerz, Ruth Bietenhard: *Berndeutsches Wörterbuch*** (Bern, wyd. 1997) – standardowy słownik drukowany (por. Historisches Lexikon der Schweiz, https://hls-dhs-dss.ch/articles/011556).
3. **Schweizerisches Idiotikon** – https://www.idiotikon.ch/ (słownik historyczny dialektów szwajcarskich).
4. **Sprachatlas der deutschen Schweiz (SDS) / Kleiner Sprachatlas der deutschen Schweiz** – geografia form (l-wokalizacja, nd-velaryzacja w Bernie).
5. **Bernese German / Bernese German phonology** – https://en.wikipedia.org/wiki/Bernese_German, https://en.wikipedia.org/wiki/Bernese_German_phonology (przegląd cech fonetyczno-morfologicznych).
6. **Zalecenia pisowni** U. Pinheiro-Weber (bliska pismu) i H. J. Zingg (bliska wymowie) – linkowane na berndeutsch.ch/Schrybe.
7. **Druga kontrola**: Gemini (Google) – niezależny model AI proszony o wskazanie form niebernejskich (`scripts/verify-be.ts --gemini`).

## Procedura weryfikacji (SPEC §2)
1. **Reguły** (`src/lib/beRules.ts`): formy innych dialektów → błąd (Grüezi, hoi, gönd, gaat, nöd, Meitli, chli, Wält…), brak l-wokalizacji → ostrzeżenie, *ä* zamiast nieakcentowanego *e* → ostrzeżenie.
2. **Słownik**: dla każdego słowa wyszukiwanie formy BE i DE w berndeutsch.ch; dopasowanie dokładne (po normalizacji y/i, długości samogłosek) albo bliskie (wariant/zdrobnienie).
3. **Druga kontrola modelem** (Gemini) dla każdej pozycji: słowa, frazy, zdania historii, wersy piosenek, tytuły, polecenia.
4. **Pewność** (`content/be-review.json`):
   - słowo: *wysoka* = słownik (dokładnie) i model nie zgłasza problemu, albo słownik (wariant) + model OK; *średnia* = jedno ze źródeł; *niska* = brak potwierdzenia albo błąd reguły.
   - zdanie: *wysoka* = model OK i (brak ostrzeżeń reguł lub ≥30 % słów potwierdzonych w słowniku); *średnia* = model OK; *niska* = model lub reguły zgłaszają problem.
   - decyzje ręczne (`content/be-overrides.json`) po rozstrzygnięciu rozbieżności – preferowane formy najczęściej poświadczone w źródłach berneńskich.
5. Pozycje o niskiej pewności są **poprawiane lub usuwane** – test `content.test.ts` nie przepuszcza żadnej pozycji *niskiej* do treści dziecka.
6. Wymowa: nagrania BE sprawdzane przez rozpoznawanie mowy (Gemini audio) – patrz `BAERNDUETSCH_REVIEW.md`.
7. Rodzic może w panelu oznaczyć pozycję jako „sprawdzone przez osobę z Berna” (opcjonalnie).
