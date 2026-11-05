# Bärndütsch – raport weryfikacji

Wygenerowano: 2026-11-05 przez `npx tsx scripts/verify-be.ts --report`.

## Statystyki

| | liczba |
|---|---|
| Pozycje BE (słowa, frazy, zdania historii, wersy piosenek, tytuły, polecenia) | 833 |
| – w tym słowa | 368 |
| Słowa potwierdzone w berndeutsch.ch (dokładnie lub wariant) | 240 |
| Pozycje sprawdzone przez Gemini (druga kontrola) | 623 |
| Pozycje oznaczone przez Gemini jako wątpliwe | 48 |
| Pewność **wysoka** | 525 |
| Pewność **średnia** | 284 |
| Pewność **niska** (nie trafia do dziecka) | 24 |

Zasady przyznawania pewności: patrz `docs/BAERNDUETSCH.md` → „Procedura weryfikacji”.

## Pozycje oznaczone przez drugą kontrolę (Gemini) lub reguły

| id | BE | DE | słownik | Gemini | reguły | pewność | decyzja |
|---|---|---|---|---|---|---|---|
| w.uele | dr Chuz | die Eule | match: Chuz | ✗ «Chuz» bezeichnet spezifisch den Kauz. Für Eule heisst es auf Berndeutsch «d Uele». → d Uele | – | medium | berndeutsch.ch: Chuz = Kauz, Eule; Gemini bevorzugt «Üele» (nicht im Wörterbuch) |
| w.summervogu | dr Schmätterling | der Schmetterling | match: Schmätterling | ✗ «Schmätterling» ist Schriftdeutsch; das Berndeutsche Wort ist «dr Summervogu». → dr Summervogu | – | medium | berndeutsch.ch: Schmätterling; Summervogu = veraltet/poetisch |
| w.biene | d Biene | die Biene | no entry | ✗ Das traditionelle berndeutsche Wort für Biene ist «d Imme». → d Imme | – | medium | Gemini: traditionell «Imme» – im Wörterbuch nicht belegt; «Biene» heute üblich |
| w.mami | d Mami | die Mama | no entry | ✗ Auf Berndeutsch ist Mami sächlich («ds Mami»). «d Mami» ist ostschweizerisch/zürichdeutsch. → ds Mami | – | medium | geändert: d Mami → ds Mami (Gemini: in Bern sächlich; berndeutsch.ch: Mama/Mammi) |
| w.chnoei | ds Chnöi | das Knie | match: Chnöi | ✗ Zürichdeutsche Form; auf Berndeutsch 'ds Chnee' → ds Chnee | – | high | Gemini schlug «Chnee» vor; berndeutsch.ch: Chnöi = Knie (+ chnöile, Chnöiblätz) → beibehalten |
| w.haus | dr Haus | der Hals | match: Haus | ✗ l-Vokalisierung von al zu ou: berndeutsch 'dr Hous' → dr Hous | – | high | Gemini: «Hous»; berndeutsch.ch: Hals [Haus] → Haus |
| w.aerdbeeri | ds Äppeeri | die Erdbeere | match: Äppeeri | ✗ Falsches Geschlecht und Form; berndeutsch 'd Äärbeere' → d Äärbeere | – | high | berndeutsch.ch: Äppeeri [Ärppeeri] = Erdbeere |
| w.glace | ds Glace | das Eis | match: Glace | ✗ Falsches Geschlecht; berndeutsch 'd Glace' → d Glace | – | medium | berndeutsch.ch: Glace [Glasse]; Genus schwankt (es/d Glace), «ds Glace» beibehalten |
| w.konfi | d Gomfi | die Marmelade | match: Gomfi | ✗ Zürich-/Nordwestschweizer Form mit m; berndeutsch 'd Gonfi' oder 'd Konfi' → d Gonfi | – | high | berndeutsch.ch: Gomfitüre [Gonfitüre, Gomfi, Gumfi] → Gomfi beibehalten |
| w.hung | dr Honig | der Honig | match: Honig | ✗ Hochdeutsche Form; berndeutsch 'dr Hung' → dr Hung | – | medium | berndeutsch.ch: Honig (Gemini: Hung – nicht im Wörterbuch) |
| w.titti | ds Titti | die Puppe | match: Titti | ✗ Falsches Wort; Puppe heisst auf Berndeutsch 'ds Bäbi' → ds Bäbi | – | high | geändert: Titti → Bäbi (berndeutsch.ch: Bääbi [Bäbi] = Puppe; Gemini) |
| w.kloetzli | d Klötzli | die Bauklötze | no entry | ✗ Anlaut K- wird im Berndeutschen zu Ch-: 'd Chlötzli' → d Chlötzli | – | medium | geändert: Klötzli → Chlötzli (berndeutsch.ch: Chlotz = Klotz) |
| w.gable | d Gable | die Gabel | match: Gable | ✗ Fehlende L-Vokalisierung → d Gabeu | – | high | Gemini: «Gabeu»; berndeutsch.ch: Gable = Gabel |
| w.seife | d Seife | die Seife | no entry | ✗ Typisch berndeutsch ist die Endung auf -i → d Seifi | – | high | Gemini: «Seifi»; berndeutsch.ch: Seife (Seifechischte, yseife) |
| w.haendsche | d Händsche | die Handschuhe | match: Händsche | ✗ Typisch zürichdeutsch; berndeutsch ist Händschig → d Händschig | – | high | Gemini schlug «Händschig» vor; berndeutsch.ch: Häntsche [Händsche] = Handschuh |
| w.wouke | d Wulche | die Wolke | match: Wulche | ✗ Zürichdeutsch/Ostschweiz; Berndeutsch nutzt l-Vokalisierung → d Wouke | wulche: Bern vokalisiert l vor Konsonant / im Auslaut (l → u) | high | Gemini schlug «Wouke» vor; berndeutsch.ch: Wulche [Wouche] → Wulche |
| w.bluem | d Bluem | die Blume | near: Blueme | ✗ Im Berndeutschen mit Endung -e → d Blueme | – | high | geändert: Bluem → Blueme (berndeutsch.ch: Blueme = Blume) |
| w.strass | d Strass | die Strasse | match: Strass | ✗ Typisch Ostschweiz/Zürich; im Berndeutschen Verdumpfung zu o → d Stross | – | high | berndeutsch.ch: Strass [Stross] – beide Formen; Strass beibehalten |
| w.zytglogge | d Zytglogge | der Zeitglockenturm | match: Zytglogge | ✗ Als Bezeichnung für den Turm/das Wahrzeichen im Berndeutschen männlich → dr Zytglogge | – | medium | geändert: d → dr Zytglogge (in Bern männlich), Dativ «bim / vor em Zytglogge» |
| w.zelle | zelle | zählen | match: zelle | ✗ «zelle» bedeutet plaudern/erzählen. Für «zählen» sagt man «zähle». → zähle | – | high | Gemini: «zelle» = erzählen; berndeutsch.ch: zelle [zeue] = 1. zählen → beibehalten |
| w.umarme | ärfele | umarmen | match: ärfele, äärfele | ✗ «ärfele» bedeutet herumhantieren oder necken, nicht umarmen. → in Arm näh | – | high | Gemini: ärfele = necken; berndeutsch.ch: ärfele, umärfele = umarmen, liebkosen |
| w.bleistift | dr Blofi | der Bleistift | match: Blofi | ✗ «Blofi» ist kein berndeutsches Wort für Bleistift. → dr Bleschtift | – | high | Gemini zweifelt; berndeutsch.ch: Blofi [Blofer] = Bleistift → beibehalten |
| w.kreis | dr Kreis | der Kreis | no entry | ✗ Wird im Berndeutschen mit «Ch-» gesprochen. → dr Chreis | – | medium | geändert: Kreis → Chreis (K- → Ch-) |
| w.dreieck | ds Dreieck | das Dreieck | no entry | ✗ Im Berndeutschen heisst es «Drüegg». → ds Drüegg | – | medium | geändert: Dreieck → Drüegg |
| p.en-guete | En Guete! | Guten Appetit! | – | ✗ En ist eher Zürichdeutsch → E Guete! | – | low | En ist eher Zürichdeutsch |
| p.lueg | Lueg obe! | Schau nach oben! | – | ✗ obe ist statisch, ufe ist die Richtung → Lueg ufe! | – | low | obe ist statisch, ufe ist die Richtung |
| p.umarm | Ärfel dr Teddy! | Umarm den Teddy! | – | ✗ ärfle ist sehr veraltet/nischig → Nimm dr Teddy i Arm! | ärfel: Bern vokalisiert l vor Konsonant / im Auslaut (l → u) | low | ärfle ist sehr veraltet/nischig |
| s.im-zoo.2 | Grosätti fragt: «Wohi göh mir jitz?» | Opa fragt: «Wohin gehen wir jetzt?» | – | ✗ 'Grosätti' ist innerschweizerisch; 'wohi' ist verständlich, aber 'wohäre' ist bernerischer. → Grosspapi fragt: «Wohäre göh mir jitz?» | – | low | 'Grosätti' ist innerschweizerisch; 'wohi' ist verständlich, aber 'wohäre' ist bernerischer. |
| s.im-zoo.2.c | Was wosch gseh? | Was willst du sehen? | – | ✗ 'wosch' ist Zürichdeutsch/Ostschweizerisch. → Was wottsch gseh? | – | low | 'wosch' ist Zürichdeutsch/Ostschweizerisch. |
| s.im-zoo.3 | D Affe chlättere. U-u-a-a! Tatzli macht o dr Aff. Grosätti lachet. | Die Affen klettern. U-u-a-a! Tatzli spielt auch Affe. Opa lacht. | – | ✗ 'Grosätti' ist nicht bernerisch. → D Affe chlättere. U-u-a-a! Tatzli macht o dr Aff. Grosspapi lachet. | – | low | 'Grosätti' ist nicht bernerisch. |
| s.im-zoo.4 | D Pinguine schwümme. Platsch! Tatzli louft wie ne Pinguin. Grosätti lachet. | Die Pinguine schwimmen. Platsch! Tatzli läuft wie ein Pinguin. Opa lacht. | – | ✗ 'Grosätti' ist nicht bernerisch. → D Pinguine schwümme. Platsch! Tatzli louft wie ne Pinguin. Grosspapi lachet. | – | low | 'Grosätti' ist nicht bernerisch. |
| s.wiehnachte-mit-kasia.2.c | Was macht Tatzli bis denn? | Was macht Tatzli bis dahin? | – | ✗ 'bis denn' ist eher Hochdeutsch. → Was macht Tatzli bis dert? | – | low | 'bis denn' ist eher Hochdeutsch. |
| s.dr-stei-turm.0 | Tatzli und Grosätti sy im Steibruch. Da het es viu Steine. | Tatzli und Opa sind im Steinbruch. Hier gibt es viele Steine. | – | ✗ 'Grosätti' ist nicht bernerisch. → Tatzli und Grosspapi sy im Steibruch. Da het es viu Steine. | – | low | 'Grosätti' ist nicht bernerisch. |
| s.dr-stei-turm.3 | Dr gross Stei isch schwär. Wackel, wackel … Bumm! Dr Turm gheit um. Tatzli und Grosätti lache. Nomau! | Der grosse Stein ist schwer. Wackel, wackel … Bumm! Der Turm fällt um. Tatzli und Opa lachen. Nochmal! | – | ✗ 'Grosätti' ist nicht bernerisch. → Dr gross Stei isch schwär. Wackel, wackel … Bumm! Dr Turm gheit um. Tatzli und Grosspapi lache. Nomau! | wackel: Bern vokalisiert l vor Konsonant / im Auslaut (l → u); wackel: Bern vokalisiert l vor Konsonant / im Auslaut (l → u) | low | 'Grosätti' ist nicht bernerisch. |
| s.dr-stei-turm.4 | Dr chly Stei passt. Dr Turm steit! Grosätti seit: «Bravo, Tatzli!» | Der kleine Stein passt. Der Turm steht! Opa sagt: «Bravo, Tatzli!» | – | ✗ 'Grosätti' ist nicht bernerisch. → Dr chly Stei passt. Dr Turm steit! Grosspapi seit: «Bravo, Tatzli!» | – | low | 'Grosätti' ist nicht bernerisch. |
| s.mir-goeh-go-schwuemme.3.o0 | Es Glace | Ein Eis | – | ✗ Glace ist in Bern weiblich. → E Glace | – | low | Glace ist in Bern weiblich. |
| s.mir-goeh-go-schwuemme.4.o0 | Es Glace | Ein Eis | – | ✗ Glace ist in Bern weiblich. → E Glace | – | low | Glace ist in Bern weiblich. |
| s.mir-goeh-go-schwuemme.5 | Mami bringt es Glace. Tatzli isst ds Glace uf em Handtuech. Tatzli seit: «Schwümme nume mit de Grosse!» | Mama bringt ein Eis. Tatzli isst das Eis auf dem Handtuch. Tatzli sagt: «Schwimmen nur mit den Grossen!» | – | ✗ Glace ist in Bern weiblich (e/d Glace). → Mami bringt e Glace. Tatzli isst d Glace uf em Handtuech. Tatzli seit: «Schwümme nume mit de Grosse!» | – | low | Glace ist in Bern weiblich (e/d Glace). |
| song.zelle-bis-fuef.3 | füf Steine im Sand! | fünf Steine im Sand! | – | ✗ Plural von Stei ist Stei → füf Stei im Sand | – | low | Plural von Stei ist Stei |
| song.samichlous-chumm.2 | Dr Esu treit dr schwär Sack, | Der Esel trägt den schweren Sack, | – | ✗ Adjektivendung fehlt bei bestimmtem Artikel → Dr Esu treit dr schwäre Sack | – | low | Adjektivendung fehlt bei bestimmtem Artikel |
| sg.plitsch-platsch | Plitsch, platsch – Händ wäsche! | Plitsch, platsch – Hände waschen! | – | ✗ Händ ist Zürichdeutsch (nd wird zu ng) → Plitsch, platsch – Häng wäsche! | – | low | Händ ist Zürichdeutsch (nd wird zu ng) |
| song.plitsch-platsch.0 | Händ is Wasser, plitsch, platsch, | Hände ins Wasser, plitsch, platsch, | – | ✗ Händ ist Zürichdeutsch (nd wird zu ng) → Häng is Wasser, plitsch, platsch | – | low | Händ ist Zürichdeutsch (nd wird zu ng) |
| song.plitsch-platsch.2 | Ds Handtuech macht aues troche, | Das Handtuch macht alles trocken, | – | ✗ Handtuech ist untypisch (nd wird zu ng) → Ds Hangtuech macht aues troche | – | low | Handtuech ist untypisch (nd wird zu ng) |
| song.plitsch-platsch.5 | d Klötzli göh is Bett – das mag i! | die Klötze gehen ins Bett – das mag ich! | – | ✗ Klötzli ist untypisch (k wird zu ch) → d Chlötzli göh is Bett – das mag i! | – | low | Klötzli ist untypisch (k wird zu ch) |
| song.tatzli-geit-go-schlafe.2 | d Stärne lüüchte liisli, | die Sterne leuchten leise, | – | ✗ liisli ist zürichdeutsch; Schreibung mit y fehlt → d Stärne lüüchte lyysli | – | low | liisli ist zürichdeutsch; Schreibung mit y fehlt |
| song.tatzli-geit-go-schlafe.4 | Gueti Nacht, Tatzli, schlaf guet und warm, | Gute Nacht, Tatzli, schlaf gut und warm, | – | ✗ und ist eher hochdeutsch/zürichdeutsch geprägt → Gueti Nacht, Tatzli, schlaf guet u warm | – | low | und ist eher hochdeutsch/zürichdeutsch geprägt |
| t.l2-zelle | Zelle bis zäh | Zählen bis zehn | – | ✗ Zelle ist zürichdeutsch; Berndeutsch zele → Zele bis zäh | – | low | Zelle ist zürichdeutsch; Berndeutsch zele |
| ui.count | Mir zelle zäme! | Wir zählen zusammen! | – | ✗ zelle ist zürichdeutsch; Berndeutsch zele → Mir zele zäme! | – | low | zelle ist zürichdeutsch; Berndeutsch zele |

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
| w.kloetzli | d Klötzli | die Bauklötze | ✗ Anlaut K- wird im Berndeutschen zu Ch-: 'd Chlötzli' → d Chlötzli | medium |
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
| w.kreis | dr Kreis | der Kreis | ✗ Wird im Berndeutschen mit «Ch-» gesprochen. → dr Chreis | medium |
| w.dreieck | ds Dreieck | das Dreieck | ✗ Im Berndeutschen heisst es «Drüegg». → ds Drüegg | medium |
| w.quadrat | ds Quadrat | das Quadrat | ok | high |
| w.advaentschranz | dr Adväntschranz | der Adventskranz | ok | medium |
| w.oschterei | ds Oschterei | das Osterei | ok | medium |
| w.maske | d Maske | die Maske | ok | high |
| w.lampion | dr Lampion | der Lampion | ok | high |
| w.geburtstag | dr Geburtstag | der Geburtstag | ok | high |
| w.oblate | d Oblate | die Oblate | ok | high |
| w.mittag | dr Mittag | der Mittag | ok | high |
| w.huet | hüt | heute | ok | medium |

Pozycje o niskiej pewności: p.en-guete, p.lueg, p.umarm, s.im-zoo.2, s.im-zoo.2.c, s.im-zoo.3, s.im-zoo.4, s.wiehnachte-mit-kasia.2.c, s.dr-stei-turm.0, s.dr-stei-turm.3, s.dr-stei-turm.4, s.mir-goeh-go-schwuemme.3.o0, s.mir-goeh-go-schwuemme.4.o0, s.mir-goeh-go-schwuemme.5, song.zelle-bis-fuef.3, song.samichlous-chumm.2, sg.plitsch-platsch, song.plitsch-platsch.0, song.plitsch-platsch.2, song.plitsch-platsch.5, song.tatzli-geit-go-schlafe.2, song.tatzli-geit-go-schlafe.4, t.l2-zelle, ui.count

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
