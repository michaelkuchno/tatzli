# Bärndütsch – raport weryfikacji

Wygenerowano: 2026-11-05 przez `npx tsx scripts/verify-be.ts --report`.

## Statystyki

| | liczba |
|---|---|
| Pozycje BE (słowa, frazy, zdania historii, wersy piosenek, tytuły, polecenia) | 833 |
| – w tym słowa | 368 |
| Słowa potwierdzone w berndeutsch.ch (dokładnie lub wariant) | 240 |
| Pozycje sprawdzone przez Gemini (druga kontrola) | 350 |
| Pozycje oznaczone przez Gemini jako wątpliwe | 24 |
| Pewność **wysoka** | 280 |
| Pewność **średnia** | 547 |
| Pewność **niska** (nie trafia do dziecka) | 6 |

Zasady przyznawania pewności: patrz `docs/BAERNDUETSCH.md` → „Procedura weryfikacji”.

## Pozycje oznaczone przez drugą kontrolę (Gemini) lub reguły

| id | BE | DE | słownik | Gemini | reguły | pewność | decyzja |
|---|---|---|---|---|---|---|---|
| w.uele | dr Chuz | die Eule | match: Chuz | ✗ «Chuz» bezeichnet spezifisch den Kauz. Für Eule heisst es auf Berndeutsch «d Uele». → d Uele | – | medium | «Chuz» bezeichnet spezifisch den Kauz. Für Eule heisst es auf Berndeutsch «d Uele». |
| w.summervogu | dr Schmätterling | der Schmetterling | match: Schmätterling | ✗ «Schmätterling» ist Schriftdeutsch; das Berndeutsche Wort ist «dr Summervogu». → dr Summervogu | – | medium | «Schmätterling» ist Schriftdeutsch; das Berndeutsche Wort ist «dr Summervogu». |
| w.biene | d Biene | die Biene | no entry | ✗ Das traditionelle berndeutsche Wort für Biene ist «d Imme». → d Imme | – | low | Das traditionelle berndeutsche Wort für Biene ist «d Imme». |
| w.mami | d Mami | die Mama | no entry | ✗ Auf Berndeutsch ist Mami sächlich («ds Mami»). «d Mami» ist ostschweizerisch/zürichdeutsch. → ds Mami | – | medium | berndeutsch.ch: Mama [Mamma, Mammi]; «Mami» allgemein schweizerisch |
| w.chnoei | ds Chnöi | das Knie | match: Chnöi | ✗ Zürichdeutsche Form; auf Berndeutsch 'ds Chnee' → ds Chnee | – | medium | Zürichdeutsche Form; auf Berndeutsch 'ds Chnee' |
| w.haus | dr Haus | der Hals | match: Haus | ✗ l-Vokalisierung von al zu ou: berndeutsch 'dr Hous' → dr Hous | – | medium | l-Vokalisierung von al zu ou: berndeutsch 'dr Hous' |
| w.aerdbeeri | ds Äppeeri | die Erdbeere | match: Äppeeri | ✗ Falsches Geschlecht und Form; berndeutsch 'd Äärbeere' → d Äärbeere | – | medium | Falsches Geschlecht und Form; berndeutsch 'd Äärbeere' |
| w.glace | ds Glace | das Eis | match: Glace | ✗ Falsches Geschlecht; berndeutsch 'd Glace' → d Glace | – | medium | Falsches Geschlecht; berndeutsch 'd Glace' |
| w.konfi | d Gomfi | die Marmelade | match: Gomfi | ✗ Zürich-/Nordwestschweizer Form mit m; berndeutsch 'd Gonfi' oder 'd Konfi' → d Gonfi | – | medium | Zürich-/Nordwestschweizer Form mit m; berndeutsch 'd Gonfi' oder 'd Konfi' |
| w.hung | dr Honig | der Honig | match: Honig | ✗ Hochdeutsche Form; berndeutsch 'dr Hung' → dr Hung | – | medium | Hochdeutsche Form; berndeutsch 'dr Hung' |
| w.titti | ds Titti | die Puppe | match: Titti | ✗ Falsches Wort; Puppe heisst auf Berndeutsch 'ds Bäbi' → ds Bäbi | – | medium | Falsches Wort; Puppe heisst auf Berndeutsch 'ds Bäbi' |
| w.kloetzli | d Klötzli | die Bauklötze | no entry | ✗ Anlaut K- wird im Berndeutschen zu Ch-: 'd Chlötzli' → d Chlötzli | – | low | Anlaut K- wird im Berndeutschen zu Ch-: 'd Chlötzli' |
| w.gable | d Gable | die Gabel | match: Gable | ✗ Fehlende L-Vokalisierung → d Gabeu | – | medium | Fehlende L-Vokalisierung |
| w.seife | d Seife | die Seife | no entry | ✗ Typisch berndeutsch ist die Endung auf -i → d Seifi | – | low | Typisch berndeutsch ist die Endung auf -i |
| w.haendsche | d Händsche | die Handschuhe | match: Händsche | ✗ Typisch zürichdeutsch; berndeutsch ist Händschig → d Händschig | – | medium | Typisch zürichdeutsch; berndeutsch ist Händschig |
| w.wouke | d Wulche | die Wolke | match: Wulche | ✗ Zürichdeutsch/Ostschweiz; Berndeutsch nutzt l-Vokalisierung → d Wouke | wulche: Bern vokalisiert l vor Konsonant / im Auslaut (l → u) | medium | Zürichdeutsch/Ostschweiz; Berndeutsch nutzt l-Vokalisierung |
| w.bluem | d Bluem | die Blume | near: Blueme | ✗ Im Berndeutschen mit Endung -e → d Blueme | – | medium | Im Berndeutschen mit Endung -e |
| w.strass | d Strass | die Strasse | match: Strass | ✗ Typisch Ostschweiz/Zürich; im Berndeutschen Verdumpfung zu o → d Stross | – | medium | Typisch Ostschweiz/Zürich; im Berndeutschen Verdumpfung zu o |
| w.zytglogge | d Zytglogge | der Zeitglockenturm | match: Zytglogge | ✗ Als Bezeichnung für den Turm/das Wahrzeichen im Berndeutschen männlich → dr Zytglogge | – | medium | Als Bezeichnung für den Turm/das Wahrzeichen im Berndeutschen männlich |
| w.zelle | zelle | zählen | match: zelle | ✗ «zelle» bedeutet plaudern/erzählen. Für «zählen» sagt man «zähle». → zähle | – | medium | «zelle» bedeutet plaudern/erzählen. Für «zählen» sagt man «zähle». |
| w.umarme | ärfele | umarmen | match: ärfele, äärfele | ✗ «ärfele» bedeutet herumhantieren oder necken, nicht umarmen. → in Arm näh | – | medium | «ärfele» bedeutet herumhantieren oder necken, nicht umarmen. |
| w.bleistift | dr Blofi | der Bleistift | match: Blofi | ✗ «Blofi» ist kein berndeutsches Wort für Bleistift. → dr Bleschtift | – | medium | «Blofi» ist kein berndeutsches Wort für Bleistift. |
| w.kreis | dr Kreis | der Kreis | no entry | ✗ Wird im Berndeutschen mit «Ch-» gesprochen. → dr Chreis | – | low | Wird im Berndeutschen mit «Ch-» gesprochen. |
| w.dreieck | ds Dreieck | das Dreieck | no entry | ✗ Im Berndeutschen heisst es «Drüegg». → ds Drüegg | – | low | Im Berndeutschen heisst es «Drüegg». |
| w.huet | hüt | heute | no entry | – | – | low |  |

## Słowa bez wpisu w berndeutsch.ch

| id | BE | DE | Gemini | pewność |
|---|---|---|---|---|
| w.hund | dr Hund | der Hund | ok | high |
| w.soeili | ds Söili | das Schwein | ok | medium |
| w.fisch | dr Fisch | der Fisch | ok | high |
| w.frosch | dr Frosch | der Frosch | ok | high |
| w.biene | d Biene | die Biene | ✗ Das traditionelle berndeutsche Wort für Biene ist «d Imme». → d Imme | low |
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
| w.mami | d Mami | die Mama | ✗ Auf Berndeutsch ist Mami sächlich («ds Mami»). «d Mami» ist ostschweizerisch/zürichdeutsch. → ds Mami | medium |
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
| w.kloetzli | d Klötzli | die Bauklötze | ✗ Anlaut K- wird im Berndeutschen zu Ch-: 'd Chlötzli' → d Chlötzli | low |
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
| w.seife | d Seife | die Seife | ✗ Typisch berndeutsch ist die Endung auf -i → d Seifi | low |
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
| w.klatsche | klatsche | klatschen | ok | medium |
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
| w.liisli | liisli | leise | ok | medium |
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
| w.kreis | dr Kreis | der Kreis | ✗ Wird im Berndeutschen mit «Ch-» gesprochen. → dr Chreis | low |
| w.dreieck | ds Dreieck | das Dreieck | ✗ Im Berndeutschen heisst es «Drüegg». → ds Drüegg | low |
| w.quadrat | ds Quadrat | das Quadrat | ok | high |
| w.advaentschranz | dr Adväntschranz | der Adventskranz | ok | medium |
| w.oschterei | ds Oschterei | das Osterei | – | medium |
| w.maske | d Maske | die Maske | – | medium |
| w.lampion | dr Lampion | der Lampion | – | medium |
| w.geburtstag | dr Geburtstag | der Geburtstag | – | medium |
| w.oblate | d Oblate | die Oblate | – | medium |
| w.mittag | dr Mittag | der Mittag | – | medium |
| w.huet | hüt | heute | – | low |

Pozycje o niskiej pewności: w.biene, w.kloetzli, w.seife, w.kreis, w.dreieck, w.huet

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
