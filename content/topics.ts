import type { ActivityKind, CountSpec, Level, PlaceId, SeasonalWindow, SortSpec, Topic } from './types'

type Tip = [pl: string, de: string, en: string]
interface Opt {
  story?: string
  song?: string
  games: ActivityKind[]
  sort?: SortSpec
  count?: CountSpec
  tips: Tip[]
  off: [pl: string, de: string, en: string, phrase?: string]
  sticker: string
  seasonal?: SeasonalWindow
}
function tp(id: string, level: Level, place: PlaceId, title: [string, string, string, string], icon: string, words: string[], phrases: string[], o: Opt): Topic {
  return {
    id,
    level,
    place,
    title: { be: title[0], de: title[1], pl: title[2], en: title[3] },
    icon,
    words,
    phrases,
    story: o.story,
    song: o.song,
    games: o.games,
    sort: o.sort,
    count: o.count,
    parentTips: o.tips.map(([pl, de, en]) => ({ pl, de, en })),
    offscreen: { pl: o.off[0], de: o.off[1], en: o.off[2], phrase: o.off[3] },
    sticker: o.sticker,
    seasonal: o.seasonal,
  }
}
const bin = (be: string, de: string, pl: string, en: string, illu: string, words: string[]) => ({ label: { be, de, pl, en }, illu, words })

export const TOPICS: Topic[] = [
  // =====================================================================
  // Level 1 – Chlyni Bärli (2–3): single words, no text for the child
  // =====================================================================
  tp('l1-familie', 1, 'home', ['Tatzlis Familie', 'Tatzlis Familie', 'Rodzina Tatzlego', 'Tatzli’s family'], 'familie', ['mami', 'papi', 'grosi', 'grossaetti', 'schwoeschter', 'bebe', 'baer', 'huus', 'teddy'], ['hallo', 'guete-morge', 'i-ha-di-gaern', 'tschou'], {
    story: 'wo-isch-d-chatz',
    song: 'guete-morge',
    games: ['whereIs', 'memory', 'tpr'],
    tips: [
      ['Zapytaj: „Wo isch ds Mami?” i pokażcie razem na zdjęcie rodziny.', 'Fragen Sie: «Wo isch ds Mami?» und zeigen Sie gemeinsam auf ein Familienfoto.', 'Ask: “Wo isch ds Mami?” and point together at a family photo.'],
      ['Przy każdym „i ha di gärn” przytulcie się – gest pomaga zapamiętać.', 'Bei jedem «I ha di gärn» umarmen – die Geste hilft beim Merken.', 'Hug at every “I ha di gärn” – the gesture helps memory.'],
    ],
    off: ['Przy śniadaniu nazwijcie każdego członka rodziny po berneńsku: Mami, Papi, Grosi…', 'Beim Frühstück jedes Familienmitglied auf Berndeutsch nennen: Mami, Papi, Grosi…', 'At breakfast name each family member in Bernese: Mami, Papi, Grosi…', 'guete-morge'],
    sticker: 'familie',
  }),
  tp('l1-chopf-und-fuess', 1, 'home', ['Chopf, Nase, Buuch', 'Kopf, Nase, Bauch', 'Głowa, nos, brzuszek', 'Head, nose, tummy'], 'nase', ['chopf', 'nase', 'oug', 'ohr', 'muu', 'hand', 'fuess', 'bei', 'buuch', 'haar'], ['zeig-nase', 'zeig-ohr', 'klatsch', 'arme-ufe'], {
    song: 'wo-isch-d-nase',
    games: ['tpr', 'whereIs', 'memory'],
    tips: [
      ['Gdy Tatzli pokazuje nos, pokażcie razem swoje nosy i powiedzcie „d Nase!”.', 'Wenn Tatzli die Nase zeigt, zeigt zusammen eure Nasen: «d Nase!».', 'When Tatzli shows his nose, touch your noses together: “d Nase!”.'],
      ['Przy kąpieli: „Wo isch dr Buuch? Wo sy d Füess?”.', 'Beim Baden: «Wo isch dr Buuch? Wo sy d Füess?».', 'At bath time: “Wo isch dr Buuch? Wo sy d Füess?”.'],
    ],
    off: ['Zabawa w lustrze: rodzic mówi „Zeig mer d Nase!”, dziecko pokazuje.', 'Spiegelspiel: «Zeig mer d Nase!» – das Kind zeigt.', 'Mirror game: say “Zeig mer d Nase!” and the child points.', 'zeig-nase'],
    sticker: 'chopf',
  }),
  tp('l1-tier', 1, 'zoo', ['Tier mache Musig', 'Tiere machen Musik', 'Zwierzęta grają', 'Animal sounds'], 'chue', ['chue', 'soeili', 'ross', 'schaf', 'geiss', 'huen', 'aente', 'hund', 'chatz', 'gueggu', 'muus', 'esu'], ['das-isch-chatz', 'chatz-schlaft', 'wo-isch-baer'], {
    song: 'wie-mache-d-tier',
    games: ['whereIs', 'memory', 'sort'],
    sort: { bins: [bin('Uf em Hof', 'Auf dem Bauernhof', 'Na wsi', 'On the farm', 'traktor', ['chue', 'soeili', 'schaf', 'geiss', 'huen', 'ross']), bin('Im Huus', 'Im Haus', 'W domu', 'In the house', 'huus', ['hund', 'chatz', 'muus'])] },
    tips: [
      ['Naśladujcie odgłosy razem: „D Chue macht Muuh!”.', 'Macht die Tierstimmen zusammen nach: «D Chue macht Muuh!».', 'Make the animal sounds together: “D Chue macht Muuh!”.'],
      ['Zapytaj: „Wie macht dr Hund?” – i czekaj na odpowiedź dziecka.', 'Fragen Sie: «Wie macht dr Hund?» – und warten Sie auf das Kind.', 'Ask: “Wie macht dr Hund?” – and wait for the child.'],
    ],
    off: ['Na spacerze szukajcie zwierząt (pies, kot, ptak) i nazywajcie je po berneńsku.', 'Auf dem Spaziergang Tiere suchen und auf Berndeutsch benennen.', 'On a walk spot animals and name them in Bernese.', 'lueg-mau'],
    sticker: 'gueggu',
  }),
  tp('l1-zmorge', 1, 'kitchen', ['Mmm, Zmorge!', 'Mmm, Frühstück!', 'Mmm, śniadanie!', 'Yum, breakfast!'], 'brot', ['oepfu', 'bire', 'banane', 'aerdbeeri', 'brot', 'chaes', 'miuch', 'ei', 'wasser', 'guetzli', 'rueebli'], ['i-ha-hunger', 'i-wott-miuch', 'en-guete', 'merci'], {
    story: 'zmorge-mit-mami',
    games: ['whereIs', 'count', 'sort'],
    count: { word: 'oepfu', targets: [2, 3, 1], container: 'basket' },
    sort: { bins: [bin('Frücht', 'Obst', 'Owoce', 'Fruit', 'oepfu', ['oepfu', 'bire', 'banane', 'aerdbeeri']), bin('Spiuzüg', 'Spielzeug', 'Zabawki', 'Toys', 'box', ['bau', 'teddy', 'outo', 'kloetzli'])] },
    tips: [
      ['Przy stole mówcie „E Guete!” zanim zaczniecie jeść.', 'Am Tisch vor dem Essen «E Guete!» sagen.', 'Say “E Guete!” at the table before eating.'],
      ['Pozwól dziecku wybrać: „Wotsch e Öpfu oder e Banane?”.', 'Wählen lassen: «Wotsch e Öpfu oder e Banane?».', 'Offer a choice: “Wotsch e Öpfu oder e Banane?”.'],
    ],
    off: ['W Migros/Coop nazwijcie po berneńsku 3 owoce w koszyku.', 'Im Laden drei Früchte im Korb auf Berndeutsch benennen.', 'In the shop name three fruits in the basket in Bernese.', 'i-zaehle-oepfu'],
    sticker: 'aerdbeeri',
  }),
  tp('l1-spiele', 1, 'playground', ['Spiu mit Tatzli', 'Spiel mit Tatzli', 'Baw się z Tatzlim', 'Play with Tatzli'], 'bau', ['bau', 'ballon', 'outo', 'velo', 'kloetzli', 'trummle', 'titti', 'teddy', 'buech', 'spiuplatz'], ['rueer-dr-bau', 'chumm', 'no-mau', 'super'], {
    story: 'tatzli-und-dr-bau',
    games: ['whereIs', 'memory', 'count'],
    count: { word: 'bau', targets: [2, 3], container: 'box' },
    tips: [
      ['Rzucając piłkę mówcie „Rüer dr Bau!” – i „No mau!”.', 'Beim Ballwerfen «Rüer dr Bau!» und «No mau!» sagen.', 'Throwing a ball say “Rüer dr Bau!” and “No mau!”.'],
      ['Sprzątając zabawki nazywajcie je: „ds Outo, dr Teddy…”.', 'Beim Aufräumen die Spielsachen benennen.', 'Name the toys while tidying up.'],
    ],
    off: ['Na placu zabaw: „Rüer dr Bau!” – rzucajcie piłkę po kolei.', 'Auf dem Spielplatz abwechselnd den Ball werfen: «Rüer dr Bau!».', 'At the playground take turns: “Rüer dr Bau!”.', 'rueer-dr-bau'],
    sticker: 'ballon',
  }),
  tp('l1-garte', 1, 'garden', ['Im Garte', 'Im Garten', 'W ogrodzie', 'In the garden'], 'bluem', ['sunne', 'bluem', 'boum', 'vogu', 'biene', 'frosch', 'igu', 'haas', 'eichhoernli', 'raege'], ['d-sunne-schynt', 'es-raegnet', 'lueg-mau', 'vogu-singt'], {
    story: 'schoeni-oschtere',
    song: 'plitsch-platsch',
    games: ['whereIs', 'memory', 'tpr'],
    tips: [
      ['Patrząc przez okno: „D Sunne schynt!” albo „Es rägnet!”.', 'Aus dem Fenster schauen: «D Sunne schynt!» oder «Es rägnet!».', 'Look out of the window: “D Sunne schynt!” or “Es rägnet!”.'],
      ['Kasia (wiewiórka) mówi czasem po polsku – zapytaj dziecko, jak to jest po berneńsku.', 'Kasia spricht manchmal Polnisch – fragen Sie, wie es auf Berndeutsch heisst.', 'Kasia sometimes speaks Polish – ask how it is in Bernese.'],
    ],
    off: ['Szukajcie w ogrodzie/parku: Bluem, Boum, Vogu.', 'Im Garten/Park suchen: Bluem, Boum, Vogu.', 'Find in the garden/park: Bluem, Boum, Vogu.', 'lueg-mau'],
    sticker: 'biene',
  }),
  tp('l1-baerepark', 1, 'baerepark', ['Bi de Bäre', 'Bei den Bären', 'U niedźwiedzi', 'At the bears'], 'baer', ['baer', 'fisch', 'boum', 'wasser', 'aente', 'vogu', 'gross', 'chly'], ['wo-isch-baer', 'da-isch-er', 'schlaf-wie-baer', 'mach-di-gross', 'mach-di-chly'], {
    story: 'im-baerepark',
    games: ['tpr', 'whereIs', 'sort'],
    sort: { bins: [bin('Gross', 'Gross', 'Duże', 'Big', 'elefant', ['baer', 'elefant', 'ross']), bin('Chly', 'Klein', 'Małe', 'Small', 'muus', ['muus', 'fisch', 'biene'])] },
    tips: [
      ['„Mach di gross!” – wyciągnijcie się wysoko; „Mach di chly!” – zwińcie w kulkę.', '«Mach di gross!» – ganz gross machen; «Mach di chly!» – ganz klein.', '“Mach di gross!” – stretch tall; “Mach di chly!” – curl up small.'],
      ['W Bärenpark w Bernie możecie zobaczyć prawdziwe niedźwiedzie.', 'Im Berner Bärenpark könnt ihr echte Bären sehen.', 'In Bern’s Bärenpark you can see real bears.'],
    ],
    off: ['Odwiedźcie Bärenpark i powiedzcie razem: „Lueg, dr Bär!”.', 'Besucht den Bärenpark: «Lueg, dr Bär!».', 'Visit the Bärenpark: “Lueg, dr Bär!”.', 'wo-isch-baer'],
    sticker: 'baer',
  }),
  tp('l1-farbe', 1, 'market', ['Rot, blau, gäub', 'Rot, blau, gelb', 'Czerwony, niebieski, żółty', 'Red, blue, yellow'], 'rot', ['rot', 'blau', 'gaeub', 'grueen', 'oepfu', 'banane', 'tomate', 'ballon'], ['oepfu-isch-rot', 'banane-gaeub'], {
    games: ['whereIs', 'sort', 'memory'],
    sort: { bins: [bin('Rot', 'Rot', 'Czerwone', 'Red', 'rot', ['oepfu', 'aerdbeeri', 'tomate', 'chriesi']), bin('Gäub', 'Gelb', 'Żółte', 'Yellow', 'gaeub', ['banane', 'zitrone', 'sunne'])] },
    tips: [
      ['Prawym kliknięciem (albo długim dotknięciem) obiekt zmienia kolor i mówi jego nazwę.', 'Rechtsklick (oder langes Tippen) färbt ein Objekt um und sagt die Farbe.', 'Right-click (or long-press) recolours an object and says the colour.'],
      ['Pokaż w kuchni coś czerwonego: „Was isch rot?”.', 'Zeigen Sie in der Küche etwas Rotes: «Was isch rot?».', 'Show something red in the kitchen: “Was isch rot?”.'],
    ],
    off: ['Szukajcie w domu rzeczy w jednym kolorze: „Alles, wo rot isch!”.', 'Im Haus Dinge in einer Farbe suchen: «Alles, wo rot isch!».', 'Hunt for things of one colour at home.', 'oepfu-isch-rot'],
    sticker: 'raegeboge',
  }),
  tp('l1-zelle', 1, 'gurten', ['Eis, zwöi, drü', 'Eins, zwei, drei', 'Raz, dwa, trzy', 'One, two, three'], 'n3', ['n1', 'n2', 'n3', 'oepfu', 'guetzli', 'ballon', 'staern'], ['i-zaehle-oepfu', 'zell-mit'], {
    song: 'zelle-bis-fuef',
    games: ['count', 'whereIs', 'tpr'],
    count: { word: 'guetzli', targets: [1, 2, 3], container: 'basket' },
    tips: [
      ['Liczcie na palcach razem z Tatzlim: „eis, zwöi, drü!”.', 'Mit den Fingern mitzählen: «eis, zwöi, drü!».', 'Count on fingers with Tatzli: “eis, zwöi, drü!”.'],
      ['Liczcie schody w drodze do domu.', 'Zählt die Treppenstufen auf dem Heimweg.', 'Count the stairs on the way home.'],
    ],
    off: ['Przy podwieczorku liczcie ciastka: „eis, zwöi, drü Guetzli!”.', 'Beim Zvieri Guetzli zählen: «eis, zwöi, drü!».', 'At snack time count biscuits: “eis, zwöi, drü!”.', 'i-zaehle-oepfu'],
    sticker: 'n3',
  }),
  tp('l1-fahre', 1, 'bus', ['Tüüt tüüt!', 'Tüt tüt!', 'Pi pi!', 'Beep beep!'], 'bus', ['bus', 'tram', 'zug', 'outo', 'traktor', 'flugzueg', 'velo'], ['mir-fahre-bus', 's-tram-chunnt'], {
    games: ['whereIs', 'memory', 'tpr'],
    tips: [
      ['W autobusie: „Lueg, ds Tram!” – kto pierwszy zobaczy tramwaj?', 'Im Bus: «Lueg, ds Tram!» – wer sieht zuerst ein Tram?', 'On the bus: “Lueg, ds Tram!” – who sees a tram first?'],
      ['Naśladujcie dźwięki pojazdów: „Tüüt tüüt!”, „Bimm bimm!”.', 'Fahrzeuggeräusche nachmachen: «Tüüt tüüt!», «Bimm bimm!».', 'Copy vehicle sounds: “Tüüt tüüt!”, “Bimm bimm!”.'],
    ],
    off: ['Jadąc do Berna, nazwijcie pojazdy za oknem po berneńsku.', 'Auf dem Weg nach Bern Fahrzeuge auf Berndeutsch benennen.', 'On the way to Bern name vehicles in Bernese.', 'mir-fahre-bus'],
    sticker: 'tram',
  }),
  tp('l1-guetnacht', 1, 'room', ['Gueti Nacht', 'Gute Nacht', 'Dobranoc', 'Good night'], 'mond', ['bett', 'chuessi', 'decki', 'pyjama', 'mond', 'staern', 'teddy', 'schlafe'], ['gueti-nacht', 'is-bett', 'tatzli-geit-go-schlafe', 'bis-morn'], {
    story: 'gueti-nacht-tatzli',
    song: 'tatzli-geit-go-schlafe',
    games: ['whereIs', 'tpr'],
    tips: [
      ['Wieczorem mówcie „Gueti Nacht!” do ulubionej przytulanki.', 'Am Abend dem Lieblingskuscheltier «Gueti Nacht!» sagen.', 'Say “Gueti Nacht!” to the favourite cuddly toy.'],
      ['Ta piosenka to spokojny rytuał – można ją nucić bez ekranu.', 'Das Lied ist ein ruhiges Ritual – auch ohne Bildschirm summen.', 'The song is a calm ritual – hum it without a screen.'],
    ],
    off: ['Przy usypianiu: „Wo isch dr Mond? Wo sy d Stärne?” – wyjrzyjcie przez okno.', 'Beim Einschlafen: «Wo isch dr Mond?» – zum Fenster hinausschauen.', 'At bedtime: “Wo isch dr Mond?” – look out of the window.', 'gueti-nacht'],
    sticker: 'staern',
  }),

  // =====================================================================
  // Level 2 – Chindsgi (4–5): short phrases, verbs, colours, numbers to 10
  // =====================================================================
  tp('l2-chindsgi', 2, 'chindsgi', ['Im Chindsgi', 'Im Kindergarten', 'W przedszkolu', 'At kindergarten'], 'chindsgi', ['chindsgi', 'lehrerin', 'gspaenli', 'znueni', 'pouse', 'schaeri', 'papier', 'farbstift', 'garderobe', 'jagge', 'hocke'], ['i-gange-chindsgi', 'grueessech', 'darf-i-wc', 'chasch-mer-haeufe', 'wo-isch-jagge', 'kreis', 'znueni', 'hock-ab', 'fertig'], {
    story: 'ds-znueni-im-chindsgi',
    games: ['whereIs', 'tpr', 'memory'],
    tips: [
      ['Przećwiczcie zdania, które przydadzą się w Chindsgi: „Darf i ufs WC?”, „Chasch mer häufe?”.', 'Sätze üben, die im Chindsgi helfen: «Darf i ufs WC?», «Chasch mer häufe?».', 'Practise sentences useful at Chindsgi: “Darf i ufs WC?”, “Chasch mer häufe?”.'],
      ['Zabawcie się w przedszkole: rodzic jest „Lehrerin”, dziecko mówi „Grüessech!”.', 'Chindsgi spielen: Elternteil ist «Lehrerin», Kind sagt «Grüessech!».', 'Play kindergarten: the parent is the teacher, the child says “Grüessech!”.'],
    ],
    off: ['Rano w drodze do przedszkola powiedzcie razem: „I gange id Chindsgi!”.', 'Auf dem Weg: «I gange id Chindsgi!».', 'On the way say together: “I gange id Chindsgi!”.', 'i-gange-chindsgi'],
    sticker: 'thek',
  }),
  tp('l2-bus', 2, 'bus', ['Mir fahre mit em Bus', 'Wir fahren mit dem Bus', 'Jedziemy autobusem', 'We go by bus'], 'bus', ['bus', 'tram', 'zug', 'billett', 'strass', 'bruegg', 'schiff', 'fuerwehrouto', 'velo', 'trottinett'], ['mir-fahre-bus', 'uf-bus-warte', 's-tram-chunnt', 'mir-sy-z-bern'], {
    story: 'mit-em-bus-uf-baern',
    song: 'dr-bus-fahrt-uf-baern',
    games: ['whereIs', 'memory', 'count'],
    count: { word: 'billett', targets: [3, 4, 5], container: 'box' },
    tips: [
      ['W autobusie 10 do Berna: liczcie przystanki razem.', 'Im Bus nach Bern die Haltestellen zusammen zählen.', 'On the bus to Bern count the stops together.'],
      ['Zapytaj: „Was fahrt da?” – dziecko odpowiada „ds Tram!”.', 'Fragen: «Was fahrt da?» – «ds Tram!».', 'Ask: “Was fahrt da?” – “ds Tram!”.'],
    ],
    off: ['Przy następnej jeździe autobusem dziecko mówi „Mir fahre mit em Bus!”.', 'Bei der nächsten Busfahrt: «Mir fahre mit em Bus!».', 'On the next bus ride: “Mir fahre mit em Bus!”.', 'mir-fahre-bus'],
    sticker: 'bus',
  }),
  tp('l2-farbe', 2, 'market', ['Aui Farbe', 'Alle Farben', 'Wszystkie kolory', 'All the colours'], 'raegeboge', ['rot', 'blau', 'gaeub', 'grueen', 'orangsch', 'violett', 'rosa', 'bruun', 'schwarz', 'wyss'], ['oepfu-isch-rot', 'banane-gaeub', 'rueebli-sy-orange'], {
    song: 'd-jahreszyte',
    games: ['whereIs', 'sort', 'memory'],
    sort: {
      bins: [
        bin('Rot', 'Rot', 'Czerwone', 'Red', 'rot', ['oepfu', 'aerdbeeri', 'tomate', 'chriesi']),
        bin('Gäub', 'Gelb', 'Żółte', 'Yellow', 'gaeub', ['banane', 'zitrone', 'sunne']),
        bin('Grüen', 'Grün', 'Zielone', 'Green', 'grueen', ['gurke', 'salat', 'blatt', 'frosch']),
      ],
    },
    tips: [
      ['Zabawa „Ich gseh öppis, wo rot isch…” (widzę coś czerwonego).', 'Spiel «I gseh öppis, wo rot isch…».', 'Play “I gseh öppis, wo rot isch…” (I spy something red).'],
      ['Ubierając się: „Wele Pulli? Dr blau oder dr rot?”.', 'Beim Anziehen: «Wele Pulli? Dr blau oder dr rot?».', 'While dressing: “Wele Pulli? Dr blau oder dr rot?”.'],
    ],
    off: ['Na targu (Märit) policzcie czerwone i zielone warzywa.', 'Auf dem Märit rotes und grünes Gemüse zählen.', 'At the market count red and green vegetables.', 'rueebli-sy-orange'],
    sticker: 'violett',
  }),
  tp('l2-zelle', 2, 'gurten', ['Zelle bis zäh', 'Zählen bis zehn', 'Liczymy do dziesięciu', 'Counting to ten'], 'n10', ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'staern', 'oepfu'], ['zell-mit', 'i-zaehle-oepfu', 'i-haett-gaern-oepfu'], {
    song: 'zaeh-staerne',
    games: ['count', 'memory', 'whereIs'],
    count: { word: 'oepfu', targets: [4, 5, 6, 7, 8, 10], container: 'basket' },
    tips: [
      ['Skaczcie i liczcie: każdy skok to jedna liczba.', 'Hüpfen und zählen: jeder Hüpfer eine Zahl.', 'Jump and count: one number per jump.'],
      ['Liczcie po polsku, potem po berneńsku – porównajcie.', 'Zuerst auf Polnisch, dann auf Berndeutsch zählen – vergleichen.', 'Count in Polish, then in Bernese – compare.'],
    ],
    off: ['Na Gurten liczcie szyszki albo kamienie do 10.', 'Auf dem Gurten Tannzapfen oder Steine bis 10 zählen.', 'On the Gurten count pine cones or stones to 10.', 'zell-mit'],
    sticker: 'n10',
  }),
  tp('l2-gegeteil', 2, 'playground', ['Gross u chly', 'Gross und klein', 'Duży i mały', 'Big and small'], 'gross', ['gross', 'chly', 'heiss', 'chaut', 'schnaeu', 'langsam', 'obe', 'unde', 'offe', 'zue', 'lut', 'liisli', 'lang', 'churz'], ['mach-di-gross', 'mach-di-chly', 'spring-schnaeu', 'louf-langsam', 'obe-unde'], {
    games: ['sort', 'tpr', 'memory'],
    sort: { bins: [bin('Gross', 'Gross', 'Duże', 'Big', 'gross', ['elefant', 'giraffe', 'bus', 'baerg']), bin('Chly', 'Klein', 'Małe', 'Small', 'chly', ['muus', 'biene', 'himugueegeli', 'schnaegg'])] },
    tips: [
      ['Kółko myszy powiększa i zmniejsza obiekty – mówiąc „gross / chly”.', 'Mausrad macht Dinge grösser/kleiner – mit «gross / chly».', 'The mouse wheel grows/shrinks objects – saying “gross / chly”.'],
      ['Mówcie raz „lut” (głośno), raz „lysli” (cicho).', 'Abwechselnd «lut» und «lysli» sprechen.', 'Take turns speaking “lut” (loud) and “lysli” (quiet).'],
    ],
    off: ['Na placu zabaw: „Schnäu!” – biegnijcie; „Langsam!” – idźcie powoli.', 'Auf dem Spielplatz: «Schnäu!» – rennen; «Langsam!» – langsam gehen.', 'At the playground: “Schnäu!” – run; “Langsam!” – walk slowly.', 'spring-schnaeu'],
    sticker: 'gygampfi',
  }),
  tp('l2-gfuehl', 2, 'room', ['Wie geit s dir?', 'Wie geht es dir?', 'Jak się czujesz?', 'How do you feel?'], 'froehlech', ['froehlech', 'truurig', 'mueed', 'haessig', 'lieb', 'hungrig', 'duerschtig', 'lache', 'briegge', 'umarme'], ['wie-geits', 'mir-geits-guet', 'i-bi-froehlech', 'i-bi-truurig', 'troeschte', 'i-bi-mueed'], {
    games: ['whereIs', 'memory', 'tpr'],
    tips: [
      ['Pytaj codziennie: „Wie geit s dir?” – a dziecko pokazuje minę.', 'Täglich fragen: «Wie geit s dir?» – das Kind zeigt ein Gesicht.', 'Ask daily: “Wie geit s dir?” – the child shows a face.'],
      ['Nazwanie emocji pomaga ją przeżyć – po każdemu języku.', 'Gefühle benennen hilft – in jeder Sprache.', 'Naming feelings helps – in every language.'],
    ],
    off: ['Zróbcie miny przed lustrem: fröhlech, truurig, müed.', 'Gesichter vor dem Spiegel: fröhlech, truurig, müed.', 'Make faces in a mirror: fröhlech, truurig, müed.', 'wie-geits'],
    sticker: 'lieb',
  }),
  tp('l2-jahreszyte', 2, 'gurten', ['Sunne, Räge, Schnee', 'Sonne, Regen, Schnee', 'Słońce, deszcz, śnieg', 'Sun, rain, snow'], 'raegeboge', ['fruehlig', 'summer', 'herbscht', 'winter', 'sunne', 'raege', 'schnee', 'wind', 'raegeboge', 'wouke', 'blatt', 'schneema'], ['d-sunne-schynt', 'es-raegnet', 'es-schneit', 'd-blaetter-faue', 'es-isch-chaut', 'es-isch-heiss', 'd-blueme-bluee', 'schneema-boue'], {
    song: 'd-jahreszyte',
    games: ['sort', 'whereIs', 'memory'],
    sort: { bins: [bin('Summer', 'Sommer', 'Lato', 'Summer', 'summer', ['sunne', 'glace', 'sunnebrueue', 'bluem']), bin('Winter', 'Winter', 'Zima', 'Winter', 'winter', ['schnee', 'schneema', 'haendsche', 'chappe'])] },
    tips: [
      ['Treść zmienia się z porą roku – mapa też! Zapytaj: „Was isch jetz?”.', 'Inhalte ändern sich mit der Jahreszeit – die Karte auch! «Was isch jetz?».', 'Content follows the seasons – the map too! Ask “Was isch jetz?”.'],
      ['Każdego ranka sprawdźcie pogodę: „Es rägnet” czy „D Sunne schynt”?', 'Jeden Morgen das Wetter: «Es rägnet» oder «D Sunne schynt»?', 'Check the weather each morning.'],
    ],
    off: ['Zbierzcie liście jesienią / zbudujcie bałwana zimą i nazwijcie to po berneńsku.', 'Im Herbst Blätter sammeln / im Winter einen Schneemann bauen.', 'Collect leaves in autumn / build a snowman in winter.', 'schneema-boue'],
    sticker: 'schneema',
  }),
  tp('l2-zoo', 2, 'zoo', ['Im Dählhölzli', 'Im Tierpark', 'W zoo', 'At the zoo'], 'elefant', ['elefant', 'loei', 'giraffe', 'aff', 'pinguin', 'zebra', 'schwan', 'steibock', 'murmeli', 'reh', 'wouf', 'otter'], ['lueg-mau', 'baer-im-baerepark', 'i-gseh-steibock'], {
    story: 'im-zoo',
    song: 'wie-mache-d-tier',
    games: ['whereIs', 'memory', 'sort'],
    sort: { bins: [bin('I dr Schwyz', 'In der Schweiz', 'W Szwajcarii', 'In Switzerland', 'steibock', ['steibock', 'murmeli', 'reh', 'wouf']), bin('Wyt wäg', 'Weit weg', 'Daleko', 'Far away', 'giraffe', ['elefant', 'loei', 'giraffe', 'zebra'])] },
    tips: [
      ['Tierpark Dählhölzli ma zwierzęta z Europy – Steinbock, Murmeli, Wolf.', 'Der Tierpark Dählhölzli zeigt europäische Tiere – Steinbock, Murmeli, Wolf.', 'Dählhölzli zoo shows European animals – ibex, marmot, wolf.'],
      ['Udawajcie zwierzęta: dziecko pokazuje, rodzic zgaduje.', 'Tiere nachmachen: Kind zeigt, Eltern raten.', 'Act out animals: the child shows, the parent guesses.'],
    ],
    off: ['W zoo (Dählhölzli) dziecko prowadzi: „Lueg mau, dr Steibock!”.', 'Im Tierpark führt das Kind: «Lueg mau, dr Steibock!».', 'At the zoo the child guides: “Lueg mau, dr Steibock!”.', 'i-gseh-steibock'],
    sticker: 'giraffe',
  }),
  tp('l2-bewegig', 2, 'quarry', ['Gump u tanz!', 'Spring und tanz!', 'Skacz i tańcz!', 'Jump and dance!'], 'pose-jump', ['gumpe', 'springe', 'loufe', 'tanze', 'chlaettere', 'schwuemme', 'fluege', 'stampfe', 'draeie', 'winke', 'klatsche', 'stei'], ['gump', 'tanz', 'flueg', 'stampf', 'draei-di', 'chlaetter', 'schwuemm', 'winke'], {
    story: 'dr-stei-turm',
    games: ['tpr', 'whereIs', 'memory'],
    tips: [
      ['TPR: ruch + słowo = lepsze zapamiętanie. Róbcie wszystko razem z Tatzlim.', 'TPR: Bewegung + Wort = besseres Merken. Alles mit Tatzli mitmachen.', 'TPR: movement + word = better memory. Do everything with Tatzli.'],
      ['Odwróćcie role: dziecko mówi polecenie, rodzic wykonuje.', 'Rollen tauschen: Kind gibt Befehle, Eltern machen.', 'Swap roles: the child gives commands.'],
    ],
    off: ['W Steinbruch Ostermundigen: „Chlätter ufe!” – (bezpiecznie, na niskim kamieniu).', 'Im Steinbruch: «Chlätter ufe!» – sicher, auf einem niedrigen Stein.', 'At the quarry: “Chlätter ufe!” – safely on a low rock.', 'chlaetter'],
    sticker: 'stei',
  }),
  tp('l2-chuchi', 2, 'kitchen', ['Mir choche', 'Wir kochen', 'Gotujemy', 'We cook'], 'suppe', ['suppe', 'haerdoepfu', 'gurke', 'zibele', 'salat', 'chuerbis', 'anke', 'konfi', 'zopf', 'gipfeli', 'mueesli', 'zmorge', 'zmittag', 'znacht', 'zvieri', 'taeller', 'loeffu', 'gable', 'tasse'], ['mami-choche', 'en-guete', 'i-ha-hunger', 'i-ha-durscht', 'haend-waesche'], {
    story: 'wiehnachte-mit-kasia',
    games: ['count', 'sort', 'whereIs'],
    count: { word: 'haerdoepfu', targets: [3, 4, 5, 6], container: 'basket' },
    sort: { bins: [bin('Zmorge', 'Frühstück', 'Śniadanie', 'Breakfast', 'zmorge', ['zopf', 'gipfeli', 'mueesli', 'anke', 'konfi']), bin('Znacht', 'Abendessen', 'Kolacja', 'Dinner', 'znacht', ['suppe', 'haerdoepfu', 'salat', 'chuerbis'])] },
    tips: [
      ['W niedzielę piekcie Zopf – i liczcie warkocze po berneńsku.', 'Am Sonntag Zopf backen – und auf Berndeutsch zählen.', 'Bake a Zopf on Sunday – and count in Bernese.'],
      ['Nakrywając do stołu: „Dr Täller, dr Löffu, d Gable”.', 'Beim Tischdecken: «Dr Täller, dr Löffu, d Gable».', 'Laying the table: “Dr Täller, dr Löffu, d Gable”.'],
    ],
    off: ['Ugotujcie razem zupę i nazywajcie warzywa po berneńsku.', 'Zusammen Suppe kochen und Gemüse auf Berndeutsch benennen.', 'Cook soup together naming vegetables in Bernese.', 'mami-choche'],
    sticker: 'zopf',
  }),
  tp('l2-chleider', 2, 'home', ['Aalege!', 'Anziehen!', 'Ubieramy się!', 'Getting dressed!'], 'jagge', ['tshirt', 'hose', 'schue', 'socke', 'chappe', 'jagge', 'haendsche', 'gummistifu', 'pyjama', 'chleid', 'pulli'], ['aalege', 'wo-isch-schue', 'es-isch-chaut', 'es-raegnet'], {
    games: ['sort', 'whereIs', 'memory'],
    sort: { bins: [bin('Summer', 'Sommer', 'Lato', 'Summer', 'sunne', ['tshirt', 'chleid', 'sunnebrueue']), bin('Winter', 'Winter', 'Zima', 'Winter', 'schnee', ['chappe', 'haendsche', 'pulli', 'jagge'])] },
    tips: [
      ['Ubierając się rano nazywajcie każdą rzecz: „Zersch d Socke, när d Hose…”.', 'Beim Anziehen jedes Teil benennen: «Zersch d Socke, när d Hose…».', 'Name each item when dressing: “Zersch d Socke, när d Hose…”.'],
      ['Przed wyjściem: „Es isch chaut – d Chappe!”.', 'Vor dem Rausgehen: «Es isch chaut – d Chappe!».', 'Before going out: “Es isch chaut – d Chappe!”.'],
    ],
    off: ['Spakujcie plecak na wycieczkę i nazwijcie każde ubranie po berneńsku.', 'Rucksack packen und jedes Kleidungsstück benennen.', 'Pack a backpack and name each item in Bernese.', 'aalege'],
    sticker: 'gummistifu',
  }),

  // =====================================================================
  // Level 3 – Schueu (6–7): sentences, stories with choices, numbers to 20, first reading
  // =====================================================================
  tp('l3-schueu', 3, 'school', ['I dr Schueu', 'In der Schule', 'W szkole', 'At school'], 'schueu', ['schueu', 'buechstabe', 'zahl', 'bleistift', 'lym', 'wandtafele', 'thek', 'laese', 'schrybe', 'zelle', 'lehrerin', 'pouse'], ['i-gange-schueu', 'grueessech', 'darf-i-wc', 'chasch-mer-haeufe', 'los-guet', 'i-cha-zelle'], {
    story: 'dr-erscht-schueutag',
    games: ['memory', 'whereIs', 'tpr'],
    tips: [
      ['Memory łączy obrazek ze słowem – to pierwsze czytanie (DE/EN).', 'Memory verbindet Bild und Wort – erstes Lesen (DE/EN).', 'Memory pairs picture and word – first reading (DE/EN).'],
      ['Zapytaj po historii: „Was het Tatzli i Thek ta?”.', 'Nach der Geschichte fragen: «Was het Tatzli i Thek ta?».', 'Ask after the story: “Was het Tatzli i Thek ta?”.'],
    ],
    off: ['Spakujcie razem tornister i nazwijcie rzeczy po berneńsku.', 'Zusammen den Thek packen und benennen.', 'Pack the school bag together naming things.', 'i-gange-schueu'],
    sticker: 'buechstabe',
  }),
  tp('l3-maerit', 3, 'market', ['Uf em Märit', 'Auf dem Markt', 'Na targu', 'At the market'], 'maerit', ['maerit', 'lade', 'aprikose', 'chriesi', 'zwaetschge', 'rys', 'hung', 'nuss', 'zibele', 'haerdoepfu', 'n10', 'n12'], ['i-haett-gaern-oepfu', 'was-choschtet', 'merci-viu-mau', 'i-zahle', 'es-sackli', 'grueessech'], {
    story: 'am-zibelemaerit',
    games: ['count', 'whereIs', 'memory'],
    count: { word: 'aprikose', targets: [6, 8, 10, 12], container: 'basket' },
    tips: [
      ['Mini-dialog w sklepie: dziecko jest klientem – „I hätt gärn…”, rodzic sprzedawcą.', 'Mini-Dialog: Kind kauft – «I hätt gärn…», Eltern verkaufen.', 'Mini dialogue: the child buys – “I hätt gärn…”.'],
      ['W sklepie dziecko samo mówi „Grüessech” i „Merci viu mau”.', 'Im Laden sagt das Kind selbst «Grüessech» und «Merci viu mau».', 'In the shop the child says “Grüessech” and “Merci viu mau”.'],
    ],
    off: ['Na Märit (Bundesplatz, wtorek/sobota) dziecko kupuje 3 owoce po berneńsku.', 'Auf dem Märit kauft das Kind drei Früchte auf Berndeutsch.', 'At the market the child buys three fruits in Bernese.', 'i-haett-gaern-oepfu'],
    sticker: 'zwaetschge',
  }),
  tp('l3-aare', 3, 'aare', ['A dr Aare', 'An der Aare', 'Nad Aare', 'By the Aare'], 'fluss', ['fluss', 'schwuemme', 'fisch', 'otter', 'biber', 'schwan', 'aente', 'wasser', 'nass', 'troche', 'summer', 'bruegg'], ['aare-nume-mit', 'es-isch-heiss', 'schwuemm'], {
    story: 'mir-goeh-go-schwuemme',
    games: ['whereIs', 'memory', 'sort'],
    sort: { bins: [bin('Im Wasser', 'Im Wasser', 'W wodzie', 'In the water', 'wasser', ['fisch', 'otter', 'biber', 'schwan']), bin('Uf em Land', 'An Land', 'Na lądzie', 'On land', 'gras', ['chue', 'hund', 'igu', 'haas'])] },
    tips: [
      ['Aare jest szybka i zimna – kąpiel tylko z dorosłym i w kamizelce/rękawkach.', 'Die Aare ist schnell und kalt – nur mit Erwachsenen und Schwimmhilfe.', 'The Aare is fast and cold – only with adults and a swim aid.'],
      ['Po historii zapytaj: „Mit wäm darf me id Aare?”.', 'Nach der Geschichte: «Mit wäm darf me id Aare?».', 'After the story: “Mit wäm darf me id Aare?”.'],
    ],
    off: ['Na spacerze nad Aare liczcie kaczki i łabędzie po berneńsku.', 'Beim Aare-Spaziergang Enten und Schwäne zählen.', 'On an Aare walk count ducks and swans in Bernese.', 'aare-nume-mit'],
    sticker: 'schwan',
  }),
  tp('l3-gurte', 3, 'gurten', ['Uf em Gurte', 'Auf dem Gurten', 'Na Gurten', 'On the Gurten'], 'baerg', ['baerg', 'waud', 'tannzapfe', 'hirsch', 'luchs', 'wind', 'wouke', 'fahne', 'lampion', 'himu', 'staern'], ['uf-em-gurte', 'erschte-august', 'lueg', 'es-isch-chaut'], {
    story: 'dr-1-ougschte-uf-em-gurte',
    games: ['whereIs', 'memory', 'count'],
    count: { word: 'tannzapfe', targets: [7, 9, 11, 13], container: 'basket' },
    tips: [
      ['Z Gurten widać Alpy – nazwijcie: „dr Bärg, dr Himu, d Wulche”.', 'Vom Gurten sieht man die Alpen: «dr Bärg, dr Himu, d Wulche».', 'From the Gurten you see the Alps: “dr Bärg, dr Himu, d Wulche”.'],
      ['Zapytaj o wybory w historii: „Was hättisch du gmacht?”.', 'Nach den Entscheidungen fragen: «Was hättisch du gmacht?».', 'Ask about story choices: “Was hättisch du gmacht?”.'],
    ],
    off: ['Piknik na Gurten: zbierzcie i policzcie szyszki do 15.', 'Picknick auf dem Gurten: Tannzapfen bis 15 zählen.', 'Picnic on the Gurten: count pine cones to 15.', 'uf-em-gurte'],
    sticker: 'lampion',
  }),
  tp('l3-zyt', 3, 'zytglogge', ['D Zyt', 'Die Zeit', 'Czas', 'Time'], 'zytglogge', ['uhr', 'zytglogge', 'morge', 'mittag', 'abe', 'nacht', 'tag', 'huet', 'morn', 'geschter', 'n11', 'n12'], ['wie-spaet', 'd-uhr-schlaat', 'aes-isch-geburi', 'bis-morn'], {
    story: 'd-zytglogge-schlaht-zwoeuf',
    games: ['whereIs', 'memory', 'tpr'],
    tips: [
      ['Pod Zytglogge co godzinę ruszają figurki – warto przyjść kilka minut przed pełną godziną.', 'An der Zytglogge bewegen sich zur vollen Stunde die Figuren – ein paar Minuten vorher da sein.', 'The Zytglogge figures move on the hour – arrive a few minutes early.'],
      ['Codziennie: „Was hei mir hüt gmacht? Was mache mir morn?”.', 'Täglich: «Was hei mir hüt gmacht? Was mache mir morn?».', 'Daily: “Was hei mir hüt gmacht? Was mache mir morn?”.'],
    ],
    off: ['Pod wieżą Zytglogge liczcie uderzenia dzwonu.', 'Unter der Zytglogge die Glockenschläge zählen.', 'Under the Zytglogge count the bell strikes.', 'd-uhr-schlaat'],
    sticker: 'zytglogge',
  }),
  tp('l3-zelle', 3, 'quarry', ['Bis zwänzg', 'Bis zwanzig', 'Do dwudziestu', 'Up to twenty'], 'n20', ['n11', 'n12', 'n13', 'n14', 'n15', 'n16', 'n17', 'n18', 'n19', 'n20', 'stei', 'zahl'], ['i-cha-zelle', 'zell-mit'], {
    games: ['count', 'memory', 'whereIs'],
    count: { word: 'stei', targets: [11, 13, 15, 17, 20], container: 'box' },
    tips: [
      ['„Euf” i „zwöuf” – posłuchajcie, jak w Bernie „l” zmienia się w „u”.', '«Euf» und «zwöuf» – hört, wie in Bern das «l» zu «u» wird.', '“Euf” and “zwöuf” – hear how Bernese turns “l” into “u”.'],
      ['Liczcie dziesiątkami: 10 + 3 = drizäh.', 'In Zehnern zählen: 10 + 3 = drizäh.', 'Count in tens: 10 + 3 = drizäh.'],
    ],
    off: ['W kamieniołomie Ostermundigen zbierzcie 20 kamyków i ułóżcie je w dwie dziesiątki.', 'Im Steinbruch 20 Steine sammeln und in zwei Zehner legen.', 'At the quarry collect 20 pebbles in two tens.', 'i-cha-zelle'],
    sticker: 'n20',
  }),
  tp('l3-unterwaegs', 3, 'bus', ['Unterwägs uf Bärn', 'Unterwegs nach Bern', 'W drodze do Berna', 'On the way to Bern'], 'haltesteu', ['haltesteu', 'billett', 'bus', 'tram', 'zug', 'bruegg', 'strass', 'schiff', 'flugzueg'], ['uf-bus-warte', 'drueck-knopf', 'mir-sy-z-bern', 'wie-spaet'], {
    story: 'mit-em-bus-uf-baern',
    song: 'dr-bus-fahrt-uf-baern',
    games: ['whereIs', 'memory', 'tpr'],
    tips: [
      ['Mini-dialog w autobusie: „Isch dä Platz frei?” – „Ja, bitte.”.', 'Mini-Dialog im Bus: «Isch dä Platz frei?» – «Ja, bitte.».', 'Bus mini dialogue: “Isch dä Platz frei?” – “Ja, bitte.”.'],
      ['Dziecko naciska guzik „Halt” i mówi „Drück dr Chnopf!”.', 'Das Kind drückt den Halteknopf: «Drück dr Chnopf!».', 'The child presses the stop button: “Drück dr Chnopf!”.'],
    ],
    off: ['Niech dziecko powie, na którym przystanku wysiadacie.', 'Das Kind sagt, an welcher Haltestelle ihr aussteigt.', 'Let the child say at which stop you get off.', 'drueck-knopf'],
    sticker: 'haltesteu',
  }),
  tp('l3-spiuplatz', 3, 'playground', ['Uf em Spiuplatz', 'Auf dem Spielplatz', 'Na placu zabaw', 'At the playground'], 'rutschbahn', ['rytti', 'rutschbahn', 'sandchaschte', 'trottinett', 'velo', 'bau', 'gspaenli', 'fruend'], ['chasch-mitspile', 'ig-bi-dra', 'stoss-mi-a', 'i-rutsche', 'mir-boue-sandburg', 'mir-spile-dusse'], {
    story: 'tatzli-und-dr-bau',
    games: ['whereIs', 'memory', 'tpr'],
    tips: [
      ['Przećwiczcie, jak dołączyć do zabawy: „Darf i mitspile?”.', 'Üben, wie man mitspielen darf: «Darf i mitspile?».', 'Practise joining in: “Darf i mitspile?”.'],
      ['Zabawa w kolejkę: „Jetz bi ig dra!” – „Jetz bisch du dra!”.', 'Abwechseln: «Jetz bi ig dra!» – «Jetz bisch du dra!».', 'Taking turns: “Jetz bi ig dra!”.'],
    ],
    off: ['Na placu zabaw dziecko samo pyta inne dziecko: „Darf i mitspile?”.', 'Auf dem Spielplatz fragt das Kind selbst: «Darf i mitspile?».', 'At the playground the child asks: “Darf i mitspile?”.', 'chasch-mitspile'],
    sticker: 'sandcastle',
  }),
  tp('l3-huus', 3, 'room', ['Bi üs dihei', 'Bei uns zu Hause', 'U nas w domu', 'At our home'], 'huus', ['chaschte', 'chueeuschrank', 'staege', 'faenschter', 'tuer', 'lampe', 'sofa', 'schluessu', 'telefon', 'badwanne', 'zahbuerschte', 'handtuech', 'seife'], ['zaehn-putze', 'ufruume', 'haend-waesche', 'papi-laest'], {
    story: 'd-huette-im-zimmer',
    games: ['whereIs', 'memory', 'sort'],
    sort: { bins: [bin('Badzimmer', 'Badezimmer', 'Łazienka', 'Bathroom', 'badwanne', ['zahbuerschte', 'handtuech', 'seife']), bin('Chuchi', 'Küche', 'Kuchnia', 'Kitchen', 'chuchi', ['chueeuschrank', 'taeller', 'tasse', 'loeffu'])] },
    tips: [
      ['Zabawa w chowanego z przedmiotem: „Isch dr Schlüssu im Chaschte?”.', 'Versteckspiel: «Isch dr Schlüssu im Chaschte?».', 'Hide and seek with an object: “Isch dr Schlüssu im Chaschte?”.'],
      ['Wieczorem: „Mir putze d Zähn!” – w czterech językach po kolei.', 'Abends: «Mir putze d Zähn!» – in allen vier Sprachen.', 'Evenings: “Mir putze d Zähn!” – in all four languages.'],
    ],
    off: ['Przyklejcie karteczki z berneńskimi słowami na drzwi, okno i lodówkę.', 'Zettel mit Berndeutsch-Wörtern an Tür, Fenster und Kühlschrank kleben.', 'Stick Bernese word labels on the door, window and fridge.', 'ufruume'],
    sticker: 'schluessu',
  }),
  tp('l3-gegeteil', 3, 'kitchen', ['Vou oder läär?', 'Voll oder leer?', 'Pełny czy pusty?', 'Full or empty?'], 'vou', ['vou', 'laeaer', 'nass', 'troche', 'hell', 'dunku', 'suber', 'draeckig', 'schwaer', 'liecht', 'aut', 'noei'], ['es-isch-chaut', 'es-isch-heiss', 'haend-waesche'], {
    games: ['sort', 'memory', 'whereIs'],
    sort: { bins: [bin('Schwär', 'Schwer', 'Ciężkie', 'Heavy', 'schwaer', ['stei', 'elefant', 'chuerbis', 'bus']), bin('Liecht', 'Leicht', 'Lekkie', 'Light', 'liecht', ['blatt', 'ballon', 'summervogu', 'papier'])] },
    tips: [
      ['Eksperyment: nalejcie wody – „vou!”, wylejcie – „läär!”.', 'Experiment: Wasser einfüllen – «vou!», ausleeren – «läär!».', 'Experiment: fill water – “vou!”, pour out – “läär!”.'],
      ['Zgadywanie: „Isch dä Stei schwär oder liecht?”.', 'Raten: «Isch dä Stei schwär oder liecht?».', 'Guess: “Isch dä Stei schwär oder liecht?”.'],
    ],
    off: ['W kuchni znajdźcie 3 pary przeciwieństw (pełny/pusty, czysty/brudny…).', 'In der Küche drei Gegensatzpaare finden.', 'Find three pairs of opposites in the kitchen.', 'es-isch-heiss'],
    sticker: 'glas',
  }),
  tp('l3-waud', 3, 'garden', ['Im Waud mit Kasia', 'Im Wald mit Kasia', 'W lesie z Kasią', 'In the woods with Kasia'], 'eichhoernli', ['eichhoernli', 'nuss', 'igu', 'wurm', 'spinne', 'schnaegg', 'pilz', 'blatt', 'tannzapfe', 'himugueegeli', 'waud', 'summervogu'], ['lueg-mau', 'was-isch-das', 'd-blaetter-faue'], {
    story: 'kasia-und-d-nuess',
    games: ['whereIs', 'count', 'memory'],
    count: { word: 'nuss', targets: [8, 10, 12, 14], container: 'basket' },
    tips: [
      ['Kasia mówi po polsku – dziecko może być „tłumaczem” na berneński.', 'Kasia spricht Polnisch – das Kind kann «übersetzen».', 'Kasia speaks Polish – the child can “translate” to Bernese.'],
      ['Grzybów w lesie nie zbieramy bez dorosłego – tylko oglądamy.', 'Pilze im Wald nur anschauen, nicht pflücken.', 'Only look at mushrooms in the woods – don’t pick them.'],
    ],
    off: ['W lesie szukajcie: Tannzapfe, Blatt, Schnägg – i opowiedzcie, co znaleźliście.', 'Im Wald suchen: Tannzapfe, Blatt, Schnägg – und erzählen.', 'In the woods find: Tannzapfe, Blatt, Schnägg – and tell about it.', 'was-isch-das'],
    sticker: 'eichhoernli',
  }),

  // =====================================================================
  // Seasonal topics (appear on the map in their calendar window)
  // =====================================================================
  tp('s-zibelemaerit', 2, 'market', ['Zibelemärit', 'Zwiebelmarkt', 'Targ cebulowy', 'Onion market'], 'zibelemaerit', ['zibelemaerit', 'zibele', 'maerit', 'chueche', 'n4', 'n5'], ['zibelemaerit-phrase', 'i-haett-gaern-oepfu', 'merci-viu-mau'], {
    story: 'am-zibelemaerit',
    games: ['count', 'whereIs'],
    count: { word: 'zibele', targets: [3, 5, 7], container: 'basket' },
    tips: [
      ['Zibelemärit w Bernie: czwarty poniedziałek listopada – warkocze z cebuli i konfetti.', 'Zibelemärit: vierter Montag im November – Zwiebelzöpfe und Konfetti.', 'Zibelemärit: fourth Monday of November – onion braids and confetti.'],
      ['Policzcie cebule w warkoczu po berneńsku.', 'Zwiebeln im Zopf auf Berndeutsch zählen.', 'Count onions in a braid in Bernese.'],
    ],
    off: ['Kupcie na Zibelemärit mały warkocz cebuli i nazwijcie go po berneńsku.', 'Am Zibelemärit einen kleinen Zwiebelzopf kaufen.', 'Buy a small onion braid at the Zibelemärit.', 'zibelemaerit-phrase'],
    sticker: 'zibelemaerit',
    seasonal: { from: '11-13', to: '11-30', holiday: 'Zibelemärit' },
  }),
  tp('s-samichlous', 2, 'home', ['Dr Samichlous chunnt', 'Der Nikolaus kommt', 'Mikołaj przychodzi', 'Saint Nicholas is coming'], 'samichlous', ['samichlous', 'grittibaenz', 'nuss', 'orange', 'guetzli', 'schnee', 'cherze'], ['samichlous-chunnt', 'es-vaersli', 'merci'], {
    story: 'dr-samichlous-chunnt',
    song: 'samichlous-chumm',
    games: ['whereIs', 'count', 'memory'],
    count: { word: 'nuss', targets: [3, 5, 6], container: 'basket' },
    tips: [
      ['6 grudnia: w Szwajcarii i w Polsce przychodzi Mikołaj – porównajcie zwyczaje.', '6. Dezember: in der Schweiz und in Polen kommt der Nikolaus – vergleicht die Bräuche.', '6 December: Saint Nicholas comes in Switzerland and Poland – compare customs.'],
      ['Nauczcie się krótkiego wierszyka („Värsli”) dla Samichlous.', 'Ein kurzes Värsli für den Samichlous lernen.', 'Learn a short rhyme for Samichlous.'],
    ],
    off: ['Upieczcie Grittibänz i powiedzcie razem wierszyk.', 'Einen Grittibänz backen und das Värsli aufsagen.', 'Bake a Grittibänz and say the rhyme.', 'es-vaersli'],
    sticker: 'grittibaenz',
    seasonal: { from: '11-28', to: '12-07', holiday: 'Samichlous' },
  }),
  tp('s-wiehnachte', 2, 'kitchen', ['Wienachte u Wigilia', 'Weihnachten und Wigilia', 'Boże Narodzenie i Wigilia', 'Christmas and Wigilia'], 'wiehnachtsboum', ['wiehnachtsboum', 'gschaenk', 'cherze', 'advaentschranz', 'oblate', 'guetzli', 'staern', 'schnee'], ['froehlechi-wiehnachte', 'aes-gschaenk', 'merci'], {
    story: 'wiehnachte-mit-kasia',
    games: ['whereIs', 'memory', 'count'],
    count: { word: 'cherze', targets: [1, 2, 3, 4], container: 'box' },
    tips: [
      ['Wigilia (PL) i Wienachte (CH): opłatek, pierwsza gwiazdka, Guetzli – dwie tradycje w jednym domu.', 'Wigilia (PL) und Wienachte (CH): Oblate, erster Stern, Guetzli – zwei Traditionen.', 'Wigilia and Swiss Christmas: wafer, first star, Guetzli – two traditions.'],
      ['W Adwencie liczcie świeczki na wieńcu.', 'Im Advent die Kerzen am Kranz zählen.', 'In Advent count the candles on the wreath.'],
    ],
    off: ['Pieczcie razem Guetzli i nazywajcie kształty: Stärn, Härz…', 'Zusammen Guetzli backen und Formen benennen: Stärn, Härz…', 'Bake Guetzli together naming the shapes: Stärn, Härz…', 'froehlechi-wiehnachte'],
    sticker: 'wiehnachtsboum',
    seasonal: { from: '12-01', to: '12-31', holiday: 'Advent / Wienachte / Wigilia' },
  }),
  tp('s-fasnacht', 2, 'zytglogge', ['Fasnacht z Bärn', 'Fasnacht in Bern', 'Karnawał w Bernie', 'Bern carnival'], 'fasnacht', ['fasnacht', 'maske', 'trummle', 'baer', 'lut', 'liisli'], ['tanz', 'stampf', 'super'], {
    story: 'fasnacht-z-baern',
    games: ['whereIs', 'tpr', 'memory'],
    tips: [
      ['Bärner Fasnacht: niedźwiedź jest „budzony” na początku karnawału.', 'Bärner Fasnacht: Zu Beginn wird der Bär geweckt.', 'Bern carnival begins by “waking the bear”.'],
      ['Zróbcie maskę z papierowego talerza i nazwijcie kolory.', 'Eine Maske aus einem Papierteller basteln und Farben benennen.', 'Make a paper-plate mask and name the colours.'],
    ],
    off: ['Zróbcie maskę i zatańczcie: „Tanz mit mir!”.', 'Maske basteln und tanzen: «Tanz mit mir!».', 'Make a mask and dance: “Tanz mit mir!”.', 'tanz'],
    sticker: 'maske',
    seasonal: { from: '01-25', to: '03-15', holiday: 'Fasnacht' },
  }),
  tp('s-oschtere', 1, 'garden', ['Oschtere u Wielkanoc', 'Ostern', 'Wielkanoc', 'Easter'], 'oschterei', ['oschterhaas', 'oschterei', 'haas', 'bluem', 'ei', 'aente'], ['schoeni-oschtere', 'lueg-mau', 'da-isch-er'], {
    story: 'schoeni-oschtere',
    games: ['whereIs', 'count', 'memory'],
    count: { word: 'oschterei', targets: [2, 3, 4], container: 'basket' },
    tips: [
      ['Polska święconka i szwajcarskie „Eiertütschen” – stuknijcie się jajkami!', 'Polnische Święconka und Schweizer Eiertütschen – Eier anstossen!', 'Polish Święconka and Swiss egg tapping – tap eggs!'],
      ['Ukryjcie pisanki i mówcie „Lueg mau!”, gdy dziecko znajdzie.', 'Eier verstecken: «Lueg mau!», wenn das Kind eines findet.', 'Hide eggs and say “Lueg mau!” when one is found.'],
    ],
    off: ['Szukajcie ukrytych pisanek i liczcie je po berneńsku.', 'Versteckte Ostereier suchen und zählen.', 'Hunt hidden eggs and count them in Bernese.', 'schoeni-oschtere'],
    sticker: 'oschterhaas',
    seasonal: { from: '03-15', to: '04-30', holiday: 'Ostere / Wielkanoc' },
  }),
  tp('s-august', 2, 'gurten', ['Erschte August', '1. August', '1 sierpnia (święto Szwajcarii)', 'Swiss National Day'], 'fahne', ['fahne', 'lampion', 'fuerwaerch', 'cherze', 'nacht', 'staern'], ['erschte-august', 'lueg', 'super'], {
    story: 'dr-1-ougschte-uf-em-gurte',
    games: ['whereIs', 'memory', 'count'],
    count: { word: 'lampion', targets: [2, 4, 5], container: 'box' },
    tips: [
      ['1 sierpnia: święto Szwajcarii – lampiony i flagi. Fajerwerki oglądamy z daleka.', '1. August: Lampions und Fahnen – Feuerwerk aus der Ferne anschauen.', '1 August: lanterns and flags – watch fireworks from afar.'],
      ['Narysujcie szwajcarską flagę: rot u wyss.', 'Eine Schweizer Fahne malen: rot u wyss.', 'Draw a Swiss flag: rot u wyss.'],
    ],
    off: ['Zróbcie lampion i nazwijcie jego kolory po berneńsku.', 'Einen Lampion basteln und die Farben benennen.', 'Make a lantern and name its colours.', 'erschte-august'],
    sticker: 'fahne',
    seasonal: { from: '07-20', to: '08-02', holiday: '1. August' },
  }),
]
