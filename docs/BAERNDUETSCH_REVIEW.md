# Bärndütsch – raport weryfikacji

Wygenerowano: 2026-11-05 przez `npx tsx scripts/verify-be.ts --report`.

## Statystyki

| | liczba |
|---|---|
| Pozycje BE (słowa, frazy, zdania historii, wersy piosenek, tytuły, polecenia) | 833 |
| – w tym słowa | 368 |
| Słowa potwierdzone w berndeutsch.ch (dokładnie lub wariant) | 238 |
| Pozycje sprawdzone przez Gemini (druga kontrola) | 795 |
| Pozycje oznaczone przez Gemini jako wątpliwe | 19 |
| Pewność **wysoka** | 715 |
| Pewność **średnia** | 118 |
| Pewność **niska** (nie trafia do dziecka) | 0 |

Zasady przyznawania pewności: patrz `docs/BAERNDUETSCH.md` → „Procedura weryfikacji”.

## Pozycje oznaczone przez drugą kontrolę (Gemini) lub reguły

| id | BE | DE | słownik | Gemini | reguły | pewność | decyzja |
|---|---|---|---|---|---|---|---|
| w.uele | dr Chuz | die Eule | match: Chuz | ✗ «Chuz» bezeichnet spezifisch den Kauz. Für Eule heisst es auf Berndeutsch «d Uele». → d Uele | – | medium | berndeutsch.ch: Chuz = Kauz, Eule; Gemini bevorzugt «Üele» (nicht im Wörterbuch) |
| w.summervogu | dr Schmätterling | der Schmetterling | match: Schmätterling | ✗ «Schmätterling» ist Schriftdeutsch; das Berndeutsche Wort ist «dr Summervogu». → dr Summervogu | – | medium | berndeutsch.ch: Schmätterling; Summervogu = veraltet/poetisch |
| w.biene | d Biene | die Biene | no entry | ✗ Das traditionelle berndeutsche Wort für Biene ist «d Imme». → d Imme | – | medium | Gemini: traditionell «Imme» – im Wörterbuch nicht belegt; «Biene» heute üblich |
| w.chnoei | ds Chnöi | das Knie | match: Chnöi | ✗ Zürichdeutsche Form; auf Berndeutsch 'ds Chnee' → ds Chnee | – | high | Gemini schlug «Chnee» vor; berndeutsch.ch: Chnöi = Knie (+ chnöile, Chnöiblätz) → beibehalten |
| w.haus | dr Haus | der Hals | match: Haus | ✗ l-Vokalisierung von al zu ou: berndeutsch 'dr Hous' → dr Hous | – | high | Gemini: «Hous»; berndeutsch.ch: Hals [Haus] → Haus |
| w.aerdbeeri | ds Äppeeri | die Erdbeere | match: Äppeeri | ✗ Falsches Geschlecht und Form; berndeutsch 'd Äärbeere' → d Äärbeere | – | high | berndeutsch.ch: Äppeeri [Ärppeeri] = Erdbeere |
| w.konfi | d Gomfi | die Marmelade | match: Gomfi | ✗ Zürich-/Nordwestschweizer Form mit m; berndeutsch 'd Gonfi' oder 'd Konfi' → d Gonfi | – | high | berndeutsch.ch: Gomfitüre [Gonfitüre, Gomfi, Gumfi] → Gomfi beibehalten |
| w.hung | dr Honig | der Honig | match: Honig | ✗ Hochdeutsche Form; berndeutsch 'dr Hung' → dr Hung | – | medium | berndeutsch.ch: Honig (Gemini: Hung – nicht im Wörterbuch) |
| w.gable | d Gable | die Gabel | match: Gable | ✗ Fehlende L-Vokalisierung → d Gabeu | – | high | Gemini: «Gabeu»; berndeutsch.ch: Gable = Gabel |
| w.seife | d Seife | die Seife | no entry | ✗ Typisch berndeutsch ist die Endung auf -i → d Seifi | – | high | Gemini: «Seifi»; berndeutsch.ch: Seife (Seifechischte, yseife) |
| w.haendsche | d Händsche | die Handschuhe | match: Händsche | ✗ Typisch zürichdeutsch; berndeutsch ist Händschig → d Händschig | – | high | Gemini schlug «Händschig» vor; berndeutsch.ch: Häntsche [Händsche] = Handschuh |
| w.wouke | d Wulche | die Wolke | match: Wulche | ✗ Zürichdeutsch/Ostschweiz; Berndeutsch nutzt l-Vokalisierung → d Wouke | wulche: Bern vokalisiert l vor Konsonant / im Auslaut (l → u) | high | Gemini schlug «Wouke» vor; berndeutsch.ch: Wulche [Wouche] → Wulche |
| w.strass | d Strass | die Strasse | match: Strass | ✗ Typisch Ostschweiz/Zürich; im Berndeutschen Verdumpfung zu o → d Stross | – | high | berndeutsch.ch: Strass [Stross] – beide Formen; Strass beibehalten |
| w.zelle | zelle | zählen | match: zelle | ✗ «zelle» bedeutet plaudern/erzählen. Für «zählen» sagt man «zähle». → zähle | – | high | Gemini: «zelle» = erzählen; berndeutsch.ch: zelle [zeue] = 1. zählen → beibehalten |
| w.umarme | ärfele | umarmen | match: ärfele, äärfele | ✗ «ärfele» bedeutet herumhantieren oder necken, nicht umarmen. → in Arm näh | – | high | Gemini: ärfele = necken; berndeutsch.ch: ärfele, umärfele = umarmen, liebkosen |
| w.bleistift | dr Blofi | der Bleistift | match: Blofi | ✗ «Blofi» ist kein berndeutsches Wort für Bleistift. → dr Bleschtift | – | high | Gemini zweifelt; berndeutsch.ch: Blofi [Blofer] = Bleistift → beibehalten |
| song.plitsch-platsch.2 | Ds Handtuech macht aues troche, | Das Handtuch macht alles trocken, | – | ✗ Handtuech ist untypisch (nd wird zu ng) → Ds Hangtuech macht aues troche | – | medium | Gemini: «Hangtuech»; Handtuech lesbar und verständlich, Velarisierung nicht obligatorisch |
| t.l2-zelle | Zelle bis zäh | Zählen bis zehn | – | ✗ Zelle ist zürichdeutsch; Berndeutsch zele → Zele bis zäh | – | high | Gemini: «zele»; berndeutsch.ch: zelle [zeue] = zählen → beibehalten |
| ui.count | Mir zelle zäme! | Wir zählen zusammen! | – | ✗ zelle ist zürichdeutsch; Berndeutsch zele → Mir zele zäme! | – | high | berndeutsch.ch: zelle = zählen |

## Słowa bez wpisu w berndeutsch.ch

| id | BE | DE | Gemini | pewność |
|---|---|---|---|---|
| w.hund | dr Hund | der Hund | ok | high |
| w.soeili | ds Söili | das Schwein | ok | medium |
| w.fisch | dr Fisch | der Fisch | ok | high |
| w.frosch | dr Frosch | der Frosch | ok | high |
| w.biene | d Biene | die Biene | ✗ Das traditionelle berndeutsche Wort für Biene ist «d Imme». → d Imme | medium |
| w.elefant | dr Elefant | der Elefant | ok | high |
| w.loei | dr Löi | der Löwe | ok | medium |
| w.giraffe | d Giraffe | die Giraffe | ok | high |
| w.pinguin | dr Pinguin | der Pinguin | ok | high |
| w.zebra | ds Zebra | das Zebra | ok | high |
| w.igu | dr Igu | der Igel | ok | medium |
| w.reh | ds Reh | das Reh | ok | high |
| w.schiudchrot | d Schiudchrot | die Schildkröte | ok | medium |
| w.steibock | dr Steibock | der Steinbock | ok | medium |
| w.otter | dr Otter | der Otter | ok | high |
| w.storch | dr Storch | der Storch | ok | high |
| w.luchs | dr Luchs | der Luchs | ok | high |
| w.hirsch | dr Hirsch | der Hirsch | ok | high |
| w.krokodil | ds Krokodil | das Krokodil | ok | high |
| w.mami | ds Mami | die Mama | ok | medium |
| w.grossaetti | dr Grosspapi | der Opa | ok | high |
| w.schwoeschter | d Schwöschter | die Schwester | ok | high |
| w.brueder | dr Brueder | der Bruder | ok | medium |
| w.lehrerin | d Lehrerin | die Lehrerin | ok | high |
| w.oug | ds Oug | das Auge | ok | medium |
| w.muu | ds Muu | der Mund | ok | high |
| w.haar | d Haar | die Haare | ok | medium |
| w.oepfu | dr Öpfu | der Apfel | ok | medium |
| w.orange | d Orange | die Orange | ok | high |
| w.zitrone | d Zitrone | die Zitrone | ok | high |
| w.aprikose | d Aprikose | die Aprikose | ok | high |
| w.tomate | d Tomate | die Tomate | ok | high |
| w.gurke | d Gurke | die Gurke | ok | high |
| w.miuch | d Miuch | die Milch | ok | high |
| w.ei | ds Ei | das Ei | ok | high |
| w.wasser | ds Wasser | das Wasser | ok | high |
| w.rys | dr Rys | der Reis | ok | medium |
| w.tee | dr Tee | der Tee | ok | high |
| w.mueesli | ds Müesli | das Müsli | ok | medium |
| w.pilz | dr Pilz | der Pilz | ok | high |
| w.teddy | dr Teddy | der Teddybär | ok | medium |
| w.kloetzli | d Chlötzli | die Bauklötze | ok | medium |
| w.puzzle | ds Puzzle | das Puzzle | ok | high |
| w.rutschbahn | d Rutschbahn | die Rutsche | ok | medium |
| w.sandchaschte | dr Sandchaschte | der Sandkasten | ok | medium |
| w.trottinett | ds Trottinett | der Roller | ok | medium |
| w.farbstift | dr Farbstift | der Buntstift | ok | medium |
| w.zimmer | ds Zimmer | das Zimmer | ok | high |
| w.tisch | dr Tisch | der Tisch | ok | high |
| w.tuer | d Tür | die Tür | ok | high |
| w.tasse | d Tasse | die Tasse | ok | high |
| w.badwanne | d Badwanne | die Badewanne | ok | medium |
| w.zahbuerschte | d Zahbürschte | die Zahnbürste | ok | medium |
| w.seife | d Seife | die Seife | ✗ Typisch berndeutsch ist die Endung auf -i → d Seifi | high |
| w.handtuech | ds Handtuech | das Handtuch | ok | medium |
| w.decki | d Decki | die Decke | ok | medium |
| w.schluessu | dr Schlüssu | der Schlüssel | ok | high |
| w.sofa | ds Sofa | das Sofa | ok | high |
| w.telefon | ds Telefon | das Telefon | ok | high |
| w.tshirt | ds T-Shirt | das T-Shirt | ok | high |
| w.schue | d Schue | die Schuhe | ok | high |
| w.gummistifu | d Gummistifu | die Gummistiefel | ok | medium |
| w.jupe | dr Jupe | der Rock | ok | medium |
| w.sunnebrueue | d Sunnebrüue | die Sonnenbrille | ok | medium |
| w.raegemantu | dr Rägemantu | der Regenmantel | ok | medium |
| w.thek | dr Thek | der Schulranzen | ok | medium |
| w.rot | rot | rot | ok | high |
| w.orangsch | orange | orange | ok | high |
| w.violett | violett | lila | ok | medium |
| w.rosa | rosa | rosa | ok | high |
| w.schwarz | schwarz | schwarz | ok | high |
| w.n1 | eis | eins | ok | high |
| w.n10 | zäh | zehn | ok | medium |
| w.n13 | drizäh | dreizehn | ok | medium |
| w.n14 | vierzäh | vierzehn | ok | medium |
| w.n15 | füfzäh | fünfzehn | ok | medium |
| w.n17 | sibezäh | siebzehn | ok | medium |
| w.n18 | achtzäh | achtzehn | ok | medium |
| w.n19 | nünzäh | neunzehn | ok | medium |
| w.raege | dr Räge | der Regen | ok | medium |
| w.schnee | dr Schnee | der Schnee | ok | high |
| w.raegeboge | dr Rägeboge | der Regenbogen | ok | medium |
| w.bluem | d Blueme | die Blume | ok | high |
| w.blatt | ds Blatt | das Blatt | ok | high |
| w.see | dr See | der See | ok | high |
| w.fluss | dr Fluss | der Fluss | ok | high |
| w.schneema | dr Schneema | der Schneemann | ok | medium |
| w.zug | dr Zug | der Zug | ok | high |
| w.traktor | dr Traktor | der Traktor | ok | high |
| w.fuerwehrouto | ds Füürwehrouto | das Feuerwehrauto | ok | medium |
| w.lade | dr Lade | der Laden | ok | high |
| w.spiuplatz | dr Spiuplatz | der Spielplatz | ok | medium |
| w.haltesteu | d Haltesteu | die Haltestelle | ok | medium |
| w.billett | ds Billett | die Fahrkarte | ok | medium |
| w.singe | singe | singen | ok | medium |
| w.klatsche | chlatsche | klatschen | ok | medium |
| w.winke | winke | winken | ok | medium |
| w.mole | mole | malen | ok | medium |
| w.waesche | wäsche | waschen | ok | medium |
| w.draeie | dräie | drehen | ok | medium |
| w.gae | gä | geben | ok | medium |
| w.stampfe | stampfe | stampfen | ok | medium |
| w.gross | gross | gross | ok | high |
| w.heiss | heiss | heiss | ok | high |
| w.langsam | langsam | langsam | ok | high |
| w.unde | unde | unten | ok | medium |
| w.offe | offe | offen | ok | medium |
| w.lut | lut | laut | ok | medium |
| w.liisli | lysli | leise | ok | medium |
| w.lang | lang | lang | ok | high |
| w.erchluepft | erchlüpft | erschrocken | ok | high |
| w.ueberrascht | überrascht | überrascht | ok | high |
| w.hungrig | hungrig | hungrig | ok | high |
| w.duerschtig | dürschtig | durstig | ok | medium |
| w.buechstabe | dr Buechstabe | der Buchstabe | ok | medium |
| w.zahl | d Zahl | die Zahl | ok | high |
| w.papier | ds Papier | das Papier | ok | high |
| w.garderobe | d Garderobe | die Garderobe | ok | high |
| w.wandtafele | d Wandtafele | die Wandtafel | ok | medium |
| w.kreis | dr Chreis | der Kreis | ok | medium |
| w.dreieck | ds Drüegg | das Dreieck | ok | medium |
| w.quadrat | ds Quadrat | das Quadrat | ok | high |
| w.advaentschranz | dr Adväntschranz | der Adventskranz | ok | medium |
| w.oschterei | ds Oschterei | das Osterei | ok | medium |
| w.maske | d Maske | die Maske | ok | high |
| w.lampion | dr Lampion | der Lampion | ok | high |
| w.geburtstag | dr Geburtstag | der Geburtstag | ok | high |
| w.oblate | d Oblate | die Oblate | ok | high |
| w.mittag | dr Mittag | der Mittag | ok | high |
| w.huet | hüt | heute | ok | medium |

Pozycje o niskiej pewności: brak – wszystkie zastąpione lub usunięte.

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
