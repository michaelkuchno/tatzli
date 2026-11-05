# Bärndütsch – raport weryfikacji

Wygenerowano: 2026-11-05 przez `npx tsx scripts/verify-be.ts --report`.

## Statystyki

| | liczba |
|---|---|
| Pozycje BE (słowa, frazy, zdania historii, wersy piosenek, tytuły, polecenia) | 833 |
| – w tym słowa | 368 |
| Słowa potwierdzone w berndeutsch.ch (dokładnie lub wariant) | 240 |
| Pozycje sprawdzone przez Gemini (druga kontrola) | 0 |
| Pozycje oznaczone przez Gemini jako wątpliwe | 0 |
| Pewność **wysoka** | 231 |
| Pewność **średnia** | 549 |
| Pewność **niska** (nie trafia do dziecka) | 53 |

Zasady przyznawania pewności: patrz `docs/BAERNDUETSCH.md` → „Procedura weryfikacji”.

## Pozycje oznaczone przez drugą kontrolę (Gemini) lub reguły

| id | BE | DE | słownik | Gemini | reguły | pewność | decyzja |
|---|---|---|---|---|---|---|---|
| w.soeili | ds Söili | das Schwein | no entry | – | – | low |  |
| w.loei | dr Löi | der Löwe | no entry | – | – | low |  |
| w.igu | dr Igu | der Igel | no entry | – | – | low |  |
| w.schiudchrot | d Schiudchrot | die Schildkröte | no entry | – | – | low |  |
| w.steibock | dr Steibock | der Steinbock | no entry | – | – | low |  |
| w.brueder | dr Brueder | der Bruder | no entry | – | – | low |  |
| w.haar | d Haar | die Haare | no entry | – | – | low |  |
| w.rys | dr Rys | der Reis | no entry | – | – | low |  |
| w.mueesli | ds Müesli | das Müsli | no entry | – | – | low |  |
| w.teddy | dr Teddy | der Teddybär | no entry | – | – | low |  |
| w.kloetzli | d Klötzli | die Bauklötze | no entry | – | – | low |  |
| w.rutschbahn | d Rutschbahn | die Rutsche | no entry | – | – | low |  |
| w.sandchaschte | dr Sandchaschte | der Sandkasten | no entry | – | – | low |  |
| w.trottinett | ds Trottinett | der Roller | no entry | – | – | low |  |
| w.farbstift | dr Farbstift | der Buntstift | no entry | – | – | low |  |
| w.badwanne | d Badwanne | die Badewanne | no entry | – | – | low |  |
| w.zahbuerschte | d Zahbürschte | die Zahnbürste | no entry | – | – | low |  |
| w.handtuech | ds Handtuech | das Handtuch | no entry | – | – | low |  |
| w.decki | d Decki | die Decke | no entry | – | – | low |  |
| w.gummistifu | d Gummistifu | die Gummistiefel | no entry | – | – | low |  |
| w.sunnebrueue | d Sunnebrüue | die Sonnenbrille | no entry | – | – | low |  |
| w.raegemantu | dr Rägemantu | der Regenmantel | no entry | – | – | low |  |
| w.thek | dr Thek | der Schulranzen | no entry | – | – | low |  |
| w.violett | violett | lila | no entry | – | – | low |  |
| w.n10 | zäh | zehn | no entry | – | – | low |  |
| w.n13 | drizäh | dreizehn | no entry | – | – | low |  |
| w.n14 | vierzäh | vierzehn | no entry | – | – | low |  |
| w.n15 | füfzäh | fünfzehn | no entry | – | – | low |  |
| w.n17 | sibezäh | siebzehn | no entry | – | – | low |  |
| w.n18 | achtzäh | achtzehn | no entry | – | – | low |  |
| w.n19 | nünzäh | neunzehn | no entry | – | – | low |  |
| w.raege | dr Räge | der Regen | no entry | – | – | low |  |
| w.raegeboge | dr Rägeboge | der Regenbogen | no entry | – | – | low |  |
| w.schneema | dr Schneema | der Schneemann | no entry | – | – | low |  |
| w.spiuplatz | dr Spiuplatz | der Spielplatz | no entry | – | – | low |  |
| w.haltesteu | d Haltesteu | die Haltestelle | no entry | – | haltesteu: Bern vokalisiert l vor Konsonant / im Auslaut (l → u) | low |  |
| w.billett | ds Billett | die Fahrkarte | no entry | – | – | low |  |
| w.singe | singe | singen | no entry | – | – | low |  |
| w.klatsche | klatsche | klatschen | no entry | – | – | low |  |
| w.winke | winke | winken | no entry | – | – | low |  |
| w.mole | mole | malen | no entry | – | – | low |  |
| w.waesche | wäsche | waschen | no entry | – | – | low |  |
| w.draeie | dräie | drehen | no entry | – | – | low |  |
| w.gae | gä | geben | no entry | – | – | low |  |
| w.stampfe | stampfe | stampfen | no entry | – | – | low |  |
| w.unde | unde | unten | no entry | – | – | low |  |
| w.offe | offe | offen | no entry | – | – | low |  |
| w.lut | lut | laut | no entry | – | – | low |  |
| w.liisli | liisli | leise | no entry | – | – | low |  |
| w.duerschtig | dürschtig | durstig | no entry | – | – | low |  |
| w.buechstabe | dr Buechstabe | der Buchstabe | no entry | – | – | low |  |
| w.wandtafele | d Wandtafele | die Wandtafel | no entry | – | – | low |  |
| w.huet | hüt | heute | no entry | – | – | low |  |

## Słowa bez wpisu w berndeutsch.ch

| id | BE | DE | Gemini | pewność |
|---|---|---|---|---|
| w.hund | dr Hund | der Hund | – | medium |
| w.soeili | ds Söili | das Schwein | – | low |
| w.fisch | dr Fisch | der Fisch | – | medium |
| w.frosch | dr Frosch | der Frosch | – | medium |
| w.biene | d Biene | die Biene | – | medium |
| w.elefant | dr Elefant | der Elefant | – | medium |
| w.loei | dr Löi | der Löwe | – | low |
| w.giraffe | d Giraffe | die Giraffe | – | medium |
| w.pinguin | dr Pinguin | der Pinguin | – | medium |
| w.zebra | ds Zebra | das Zebra | – | medium |
| w.igu | dr Igu | der Igel | – | low |
| w.reh | ds Reh | das Reh | – | medium |
| w.schiudchrot | d Schiudchrot | die Schildkröte | – | low |
| w.steibock | dr Steibock | der Steinbock | – | low |
| w.otter | dr Otter | der Otter | – | medium |
| w.storch | dr Storch | der Storch | – | medium |
| w.luchs | dr Luchs | der Luchs | – | medium |
| w.hirsch | dr Hirsch | der Hirsch | – | medium |
| w.krokodil | ds Krokodil | das Krokodil | – | medium |
| w.mami | d Mami | die Mama | – | medium |
| w.schwoeschter | d Schwöschter | die Schwester | – | high |
| w.brueder | dr Brueder | der Bruder | – | low |
| w.lehrerin | d Lehrerin | die Lehrerin | – | medium |
| w.oug | ds Oug | das Auge | – | medium |
| w.muu | ds Muu | der Mund | – | high |
| w.haar | d Haar | die Haare | – | low |
| w.oepfu | dr Öpfu | der Apfel | – | medium |
| w.orange | d Orange | die Orange | – | medium |
| w.zitrone | d Zitrone | die Zitrone | – | medium |
| w.aprikose | d Aprikose | die Aprikose | – | medium |
| w.tomate | d Tomate | die Tomate | – | medium |
| w.gurke | d Gurke | die Gurke | – | medium |
| w.miuch | d Miuch | die Milch | – | high |
| w.ei | ds Ei | das Ei | – | medium |
| w.wasser | ds Wasser | das Wasser | – | medium |
| w.rys | dr Rys | der Reis | – | low |
| w.tee | dr Tee | der Tee | – | medium |
| w.mueesli | ds Müesli | das Müsli | – | low |
| w.pilz | dr Pilz | der Pilz | – | medium |
| w.teddy | dr Teddy | der Teddybär | – | low |
| w.kloetzli | d Klötzli | die Bauklötze | – | low |
| w.puzzle | ds Puzzle | das Puzzle | – | medium |
| w.rutschbahn | d Rutschbahn | die Rutsche | – | low |
| w.sandchaschte | dr Sandchaschte | der Sandkasten | – | low |
| w.trottinett | ds Trottinett | der Roller | – | low |
| w.farbstift | dr Farbstift | der Buntstift | – | low |
| w.zimmer | ds Zimmer | das Zimmer | – | medium |
| w.tisch | dr Tisch | der Tisch | – | medium |
| w.tuer | d Tür | die Tür | – | medium |
| w.tasse | d Tasse | die Tasse | – | medium |
| w.badwanne | d Badwanne | die Badewanne | – | low |
| w.zahbuerschte | d Zahbürschte | die Zahnbürste | – | low |
| w.seife | d Seife | die Seife | – | medium |
| w.handtuech | ds Handtuech | das Handtuch | – | low |
| w.decki | d Decki | die Decke | – | low |
| w.schluessu | dr Schlüssu | der Schlüssel | – | high |
| w.sofa | ds Sofa | das Sofa | – | medium |
| w.telefon | ds Telefon | das Telefon | – | medium |
| w.tshirt | ds T-Shirt | das T-Shirt | – | medium |
| w.schue | d Schue | die Schuhe | – | high |
| w.gummistifu | d Gummistifu | die Gummistiefel | – | low |
| w.jupe | dr Jupe | der Rock | – | medium |
| w.sunnebrueue | d Sunnebrüue | die Sonnenbrille | – | low |
| w.raegemantu | dr Rägemantu | der Regenmantel | – | low |
| w.thek | dr Thek | der Schulranzen | – | low |
| w.rot | rot | rot | – | medium |
| w.orangsch | orange | orange | – | medium |
| w.violett | violett | lila | – | low |
| w.rosa | rosa | rosa | – | medium |
| w.schwarz | schwarz | schwarz | – | medium |
| w.n1 | eis | eins | – | high |
| w.n10 | zäh | zehn | – | low |
| w.n13 | drizäh | dreizehn | – | low |
| w.n14 | vierzäh | vierzehn | – | low |
| w.n15 | füfzäh | fünfzehn | – | low |
| w.n17 | sibezäh | siebzehn | – | low |
| w.n18 | achtzäh | achtzehn | – | low |
| w.n19 | nünzäh | neunzehn | – | low |
| w.raege | dr Räge | der Regen | – | low |
| w.schnee | dr Schnee | der Schnee | – | medium |
| w.raegeboge | dr Rägeboge | der Regenbogen | – | low |
| w.blatt | ds Blatt | das Blatt | – | medium |
| w.see | dr See | der See | – | medium |
| w.fluss | dr Fluss | der Fluss | – | medium |
| w.schneema | dr Schneema | der Schneemann | – | low |
| w.zug | dr Zug | der Zug | – | medium |
| w.traktor | dr Traktor | der Traktor | – | medium |
| w.fuerwehrouto | ds Füürwehrouto | das Feuerwehrauto | – | medium |
| w.lade | dr Lade | der Laden | – | high |
| w.spiuplatz | dr Spiuplatz | der Spielplatz | – | low |
| w.haltesteu | d Haltesteu | die Haltestelle | – | low |
| w.billett | ds Billett | die Fahrkarte | – | low |
| w.singe | singe | singen | – | low |
| w.klatsche | klatsche | klatschen | – | low |
| w.winke | winke | winken | – | low |
| w.mole | mole | malen | – | low |
| w.waesche | wäsche | waschen | – | low |
| w.draeie | dräie | drehen | – | low |
| w.gae | gä | geben | – | low |
| w.stampfe | stampfe | stampfen | – | low |
| w.gross | gross | gross | – | medium |
| w.heiss | heiss | heiss | – | medium |
| w.langsam | langsam | langsam | – | medium |
| w.unde | unde | unten | – | low |
| w.offe | offe | offen | – | low |
| w.lut | lut | laut | – | low |
| w.liisli | liisli | leise | – | low |
| w.lang | lang | lang | – | medium |
| w.erchluepft | erchlüpft | erschrocken | – | high |
| w.ueberrascht | überrascht | überrascht | – | medium |
| w.hungrig | hungrig | hungrig | – | medium |
| w.duerschtig | dürschtig | durstig | – | low |
| w.buechstabe | dr Buechstabe | der Buchstabe | – | low |
| w.zahl | d Zahl | die Zahl | – | medium |
| w.papier | ds Papier | das Papier | – | medium |
| w.garderobe | d Garderobe | die Garderobe | – | medium |
| w.wandtafele | d Wandtafele | die Wandtafel | – | low |
| w.kreis | dr Kreis | der Kreis | – | medium |
| w.dreieck | ds Dreieck | das Dreieck | – | medium |
| w.quadrat | ds Quadrat | das Quadrat | – | medium |
| w.advaentschranz | dr Adväntschranz | der Adventskranz | – | medium |
| w.oschterei | ds Oschterei | das Osterei | – | medium |
| w.maske | d Maske | die Maske | – | medium |
| w.lampion | dr Lampion | der Lampion | – | medium |
| w.geburtstag | dr Geburtstag | der Geburtstag | – | medium |
| w.oblate | d Oblate | die Oblate | – | medium |
| w.mittag | dr Mittag | der Mittag | – | medium |
| w.huet | hüt | heute | – | low |

Pozycje o niskiej pewności: w.soeili, w.loei, w.igu, w.schiudchrot, w.steibock, w.brueder, w.haar, w.rys, w.mueesli, w.teddy, w.kloetzli, w.rutschbahn, w.sandchaschte, w.trottinett, w.farbstift, w.badwanne, w.zahbuerschte, w.handtuech, w.decki, w.gummistifu, w.sunnebrueue, w.raegemantu, w.thek, w.violett, w.n10, w.n13, w.n14, w.n15, w.n17, w.n18, w.n19, w.raege, w.raegeboge, w.schneema, w.spiuplatz, w.haltesteu, w.billett, w.singe, w.klatsche, w.winke, w.mole, w.waesche, w.draeie, w.gae, w.stampfe, w.unde, w.offe, w.lut, w.liisli, w.duerschtig, w.buechstabe, w.wandtafele, w.huet

<!-- MANUAL -->
## Decyzje ręczne (2026-11-05)

Poprawki form na podstawie wyszukiwań w berndeutsch.ch (pierwsza runda, przed kontrolą Gemini):

| Było | Jest | Źródło / uzasadnienie |
|---|---|---|
| d Wouke | **d Wulche** | berndeutsch.ch: Wulche [Wouche] = Wolke |
| ds Ärdbeeri | **ds Äppeeri** | berndeutsch.ch: Äppeeri [Ärppeeri] = Erdbeere |
| dr Grossätti | **dr Grosätti** | berndeutsch.ch: Grosätti, Grosvati … = Grossvater |
| dr Summervogu | **dr Schmätterling** | berndeutsch.ch: Summervogel [Summervogu] = veraltet/poetisch; Schmätterling gebräuchlich |
| ds Pyjama | **ds Pyschi** | berndeutsch.ch: Pyschi = Pyjama |
| d Rytti (Schaukel) | **d Ryti** | berndeutsch.ch: Rytiplampi [… Ryti …] = Kinderschaukel |
| d Gygampfi (Wippe) | *usunięte* | berndeutsch.ch: Gygampfi = Schaukel (nie Wippe) – kolizja znaczeń; scena w historii zmieniona na huśtawkę |
| dr Bleistift | **dr Blofi** | berndeutsch.ch: Blofi [Blofer] = Bleistift |
| d Üle | **dr Chuz** | berndeutsch.ch: Chuz = Kauz, Eule; „Üle” niepoświadczone |
| dr Hung (Honig) | **dr Honig** | berndeutsch.ch: Honig; „Hung” niepoświadczone dla miodu |
| Wiehnachte, Wiehnachtsboum | **Wienachte, Wienachtsboum** | berndeutsch.ch: Wienacht [Wienecht, Wienachte] |
| d Konfi | **d Gomfi** | berndeutsch.ch: Gomfitüre [Gonfitüre, Gomfi, Gumfi] |
| umarme / Umarm! | **ärfele / Ärfel!** | berndeutsch.ch: ärfele, umärfele = umarmen |

Potwierdzone ręcznym wyszukiwaniem (wpisy w content/be-overrides.json): Schwöschter, Muu, Miuch, Oug, Öpfu, Mami, eis, erchlüpft, Advänt, Oschtere, Lade, Schue, Schlüssu, Füürwehr, Jupe, Chindsgi (Chintsch [Chindsgi]), Haus = Hals, Zeche = Zehe, Löffu, Gable, Chüeuschrank, Brüue, Glungge, Himugüegeli, Murmeli, Gygampfi (= Schaukel).

Teksty cioci Ottilie (sowa) w historiach są celowo w Hochdeutsch (postać mówi standardowym niemieckim) – nie są błędem BE.

## Weryfikacja wymowy BE
Czeka na klucz Gemini (patrz HANDOVER §1). Procedura: każde nagranie BE → Gemini (rozumienie audio): transkrypcja szwajcarskoniemiecka + znaczenie po niemiecku + ocena dialektu → porównanie z tekstem DE/BE; niezrozumiałe lub o złym znaczeniu → ponowna generacja (inny głos/ustawienia), po 3 próbach uproszczenie frazy.
