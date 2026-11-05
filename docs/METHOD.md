# METHOD – metodyka nauki w Tatzli

Tatzli łączy sprawdzone metody wczesnej nauki języków (2–7 lat) i dwujęzyczności. Poniżej: zasada → jak jest zrealizowana → źródła.

| Zasada | Realizacja w aplikacji | Źródła |
|---|---|---|
| **Zrozumiały input** (comprehensible input) | Znaczenie wynika z ilustracji, animacji i sceny; tłumaczenia są pomocą dla rodzica, a nie metodą. Zdania krótkie, konkretne, „tu i teraz”. | Krashen, S. (1982). *Principles and Practice in Second Language Acquisition*. |
| **TPR – Total Physical Response** | Aktywność „Mach mit!”: polecenia ruchowe (Gump!, Klatsch i d Händ!, Zeig mer d Nase!), Tatzli wykonuje ruch, dorosły klika „Zrobione”. Piosenki z gestami. | Asher, J. (1969). The Total Physical Response approach to second language learning. *Modern Language Journal* 53(1). |
| **Powtórki rozłożone w czasie + wariacja** | Algorytm Leitnera na poziomie dziecka (`src/lib/srs.ts`): ekspozycja/rozpoznanie/podpowiedź, odstępy 0–1–2–4–7–14–30 dni, bez wkuwania w jednej sesji. Te same słowa wracają w scenach, grach, historiach, piosenkach i wariantach AI. | Cepeda et al. (2006) *Psychological Bulletin* 132(3); Leitner, S. (1972) *So lernt man lernen*. |
| **Narracja i świat** | Jeden świat: Tatzli z Ostermundigen, mapa okolicy (Steinbruch, Bus nach Bärn, Zytglogge, Bärenpark, Aare, Gurten, Dählhölzli, Märit, Chindsgi/Schueu, Spiuplatz), 20 historii. | Wright, A. (1995). *Storytelling with Children*; Bruner (1983) *Child’s Talk*. |
| **Wielozmysłowość** | Obraz + ruch + dźwięk (4 języki) + gest + melodia; mysz/dotyk/klawiatura wywołują reakcje (ruch, dźwięk, kolor, rozmiar). | Shams & Seitz (2008). Benefits of multisensory learning. *Trends in Cognitive Sciences* 12(11). |
| **Uczenie bez błędów** (errorless learning) dla 2–3 lat | „Wo isch?”: brak złej odpowiedzi – każdy obrazek mówi swoją nazwę, potem łagodnie pokazujemy cel; animowana podpowiedź po kilku sekundach. Starsze dzieci: „Fasch! Probier no mau” zamiast „błąd”. | Terrace (1963) *JEAB* 6(1); Mueller et al. (2007) *Journal of Early Intensive Behavior Intervention*. |
| **Wspólne korzystanie z mediów** (joint media engagement) | Przy każdym temacie „Podpowiedź dla rodzica” (pytania do zadania w BE, gesty) – wyłączalne. | Takeuchi & Stevens (2011). *The New Coviewing*. Joan Ganz Cooney Center. |
| **Transfer do życia** | „Zadanie poza ekranem” w każdym temacie (Migros/Coop, Märit, bus, Aare, Gurten) + zdanie BE do użycia. Pomysły AI na zabawy bez ekranu. | Barr (2010) Transfer of learning between 2D and 3D sources. *Developmental Review* 30(2). |
| **Krótkie sesje, zdrowe nawyki** | Domyślnie 10/15/20 min (2–3 / 4–5 / 6–7 lat), rytuał „Tatzli geit go schlafe”, przedłużenie tylko przez dorosłego. | WHO (2019) *Guidelines on physical activity, sedentary behaviour and sleep for children under 5 years of age*. |
| **Bez manipulacji** | Brak serii z karą, losowych nagród, nieskończonego przewijania, powiadomień, reklam. Naklejki za udział, nie za wynik. | Radesky et al. (2022) Prevalence and characteristics of manipulative design in mobile applications used by children. *JAMA Netw Open* 5(6). |
| **Dwujęzyczność dom/otoczenie** | Polski jako język domowy i oparcie (wyświetlany i dźwiękowy na życzenie), BE jako główny cel, DE i EN obok. Polskie święta (Wigilia, Wielkanoc) obok berneńskich. | Grosjean (2010) *Bilingual: Life and Reality*; De Houwer (2009) *Bilingual First Language Acquisition*. |
| **Dostosowanie trudności** | `src/lib/adapt.ts`: częste pomijanie → krócej i mniej opcji; dużo podpowiedzi → łatwiej; płynna gra → trochę więcej wyzwań w obrębie poziomu. | Vygotsky – strefa najbliższego rozwoju; Hirsh-Pasek et al. (2015) Putting education in “educational” apps. *Psychological Science in the Public Interest* 16(1). |

## Poziomy
- **Chlyni Bärli (2–3):** pojedyncze słowa (zwierzęta, rodzina, jedzenie, ciało, zabawki, odgłosy), „Wo isch …?”, dotknij i usłysz, piosenki; bez tekstu; cele dotyku ≥ 100 px.
- **Chindsgi (4–5):** krótkie frazy, czasowniki, kolory, liczby do 10, przeciwieństwa, emocje, pory roku, historie z jednym wyborem, TPR, zwroty z Chindsgi.
- **Schueu (6–7):** zdania, historie z kilkoma wyborami i pytaniami, liczby do 20, memory obraz–słowo (pierwsze czytanie DE/EN), mini-dialogi (sklep, plac zabaw, bus).
