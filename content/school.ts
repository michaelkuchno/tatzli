import type { ActivityKind, Level, Phrase, PhraseTag, Pose, SortSpec, Topic, CountSpec, Stage, Subject, MathSpec, OrderSpec, SchoolInfo } from './types'

/**
 * School lessons (Lehrplan 21, Kanton Bern – Zyklus 1 and the start of Zyklus 2): Kindergarten 1 and 2 ("Chindsgi",
 * in Poland przedszkole / zerówka) and the 1st–3rd primary class, in Bärndütsch, German, Polish and English.
 * Every lesson is a topic with a school stage and a subject; a teacher (d Lehrerin) opens it with one sentence.
 * Lessons never repeat a word or a sentence of another school lesson (checked by tests).
 * Facts are checked: colour mixing (paint), shapes, seasons, the Swiss road-safety rule "Warte, luege, lose, laufe" (BFU),
 * the water cycle, the calendar, plant needs, Bern as the federal city with the Aare loop, the Zytglogge and the Bärenpark.
 */
export type { Stage, Subject, MathSpec, OrderSpec, SchoolInfo }
export const STAGES: Stage[] = ['kg1', 'kg2', 'k1', 'k2', 'k3']

/** Level used for the activities (difficulty of the existing games) per stage */
export const STAGE_LEVEL: Record<Stage, Level> = { kg1: 2, kg2: 2, k1: 3, k2: 3, k3: 3 }

type PO = { words?: string[]; pose?: Pose; illu?: string; tags?: PhraseTag[] }
// school lessons are chosen by their stage, not by the child's level, so their sentences are never filtered out by level
function p(id: string, _level: Level, be: string, de: string, pl: string, en: string, o: PO = {}): Phrase {
  return { id: `sch-${id}`, level: 1, src: { be, de, pl, en }, words: o.words, pose: o.pose, illu: o.illu, tags: o.tags }
}

export const SCHOOL_PHRASES: Phrase[] = [
  // ---------- Chindsgi 1 ----------
  p('kg1-farbe-intro', 2, '[Hüt]1 [mische]2 [mir]3 [Farbe]4!', '[Heute]1 [mischen]2 [wir]3 [Farben]4!', '[Dziś]1 [mieszamy]2+3 [kolory]4!', '[Today]1 [we]3 [mix]2 [colours]4!', { illu: 'lehrerin' }),
  p('kg1-farbe-a', 2, '[Rot]1 [u]2 [gäub]3 [git]4 [orange]5.', '[Rot]1 [und]2 [Gelb]3 [gibt]4 [Orange]5.', '[Czerwony]1 [i]2 [żółty]3 [dają]4 [pomarańczowy]5.', '[Red]1 [and]2 [yellow]3 [make]4 [orange]5.', { words: ['rot', 'gaeub', 'orangsch'], illu: 'orangsch' }),
  p('kg1-farbe-b', 2, '[Blau]1 [u]2 [gäub]3 [git]4 [grüen]5.', '[Blau]1 [und]2 [Gelb]3 [gibt]4 [Grün]5.', '[Niebieski]1 [i]2 [żółty]3 [dają]4 [zielony]5.', '[Blue]1 [and]2 [yellow]3 [make]4 [green]5.', { words: ['blau', 'gaeub', 'grueen'], illu: 'grueen' }),
  p('kg1-farbe-c', 2, '[Rot]1 [u]2 [blau]3 [git]4 [violett]5.', '[Rot]1 [und]2 [Blau]3 [gibt]4 [Violett]5.', '[Czerwony]1 [i]2 [niebieski]3 [dają]4 [fioletowy]5.', '[Red]1 [and]2 [blue]3 [make]4 [purple]5.', { words: ['rot', 'blau', 'violett'], illu: 'violett' }),
  p('kg1-zelle-intro', 2, '[Hüt]1 [zelle]2 [mir]3 [zäme]4!', '[Heute]1 [zählen]2 [wir]3 [zusammen]4!', '[Dziś]1 [liczymy]2+3 [razem]4!', '[Today]1 [we]3 [count]2 [together]4!', { illu: 'lehrerin' }),
  p('kg1-zelle-a', 2, '[Wie viu]1 [Pünkt]2 [gsehsch]3?', '[Wie viele]1 [Punkte]2 [siehst du]3?', '[Ile]1 [kropek]2 [widzisz]3?', '[How many]1 [dots]2 [do you see]3?', { tags: ['question'], illu: 'zahl' }),
  p('kg1-zelle-b', 2, '[Drü]1 [isch]2 [meh]3 [aus]4 [zwöi]5.', '[Drei]1 [ist]2 [mehr]3 [als]4 [zwei]5.', '[Trzy]1 [to]2 [więcej]3 [niż]4 [dwa]5.', '[Three]1 [is]2 [more]3 [than]4 [two]5.', { words: ['n3', 'n2'], illu: 'n3' }),
  p('kg1-zelle-c', 2, '[E Hand]1 [het]2 [füf Finger]3.', '[Eine Hand]1 [hat]2 [fünf Finger]3.', '[Ręka]1 [ma]2 [pięć palców]3.', '[A hand]1 [has]2 [five fingers]3.', { words: ['n5'], illu: 'n5' }),
  p('kg1-gsund-intro', 2, '[Hüt]1 [lehre]2 [mir]3, [wie]4 [mir]5 [gsund]6 [blybe]7.', '[Heute]1 [lernen]2 [wir]3, [wie]4 [wir]5 [gesund]6 [bleiben]7.', '[Dziś]1 [uczymy się]2+3, [jak]4 [być]5+7 [zdrowym]6.', '[Today]1 [we]3 [learn]2 [how]4 [we]5 [stay]7 [healthy]6.', { illu: 'lehrerin' }),
  p('kg1-gsund-a', 2, '[Mit Seife]1 [wärde]2 [d Händ]3 [suber]4.', '[Mit Seife]1 [werden]2 [die Hände]3 [sauber]4.', '[Dzięki mydłu]1 [ręce]3 [stają się]2 [czyste]4.', '[Soap]1 [makes]2 [hands]3 [clean]4.', { words: ['seife'], illu: 'seife' }),
  p('kg1-gsund-b', 2, '[Zwöimau am Tag]1 [putze]2 [mir]3 [d Zähn]4.', '[Zweimal am Tag]1 [putzen]2 [wir]3 [die Zähne]4.', '[Dwa razy dziennie]1 [myjemy]2+3 [zęby]4.', '[We]3 [brush]2 [our teeth]4 [twice a day]1.', { words: ['zahbuerschte'], illu: 'zahbuerschte' }),
  p('kg1-gsund-c', 2, '[Wär]1 [müed]2 [isch]3, [brucht]4 [Schlaf]5.', '[Wer]1 [müde]2 [ist]3, [braucht]4 [Schlaf]5.', '[Kto]1 [jest]3 [zmęczony]2, [potrzebuje]4 [snu]5.', '[When you]1 [are]3 [tired]2, [you need]4 [sleep]5.', { words: ['mueed'], illu: 'bett' }),
  p('kg1-musig-intro', 2, '[Hüt]1 [mache]2 [mir]3 [Musig]4!', '[Heute]1 [machen]2 [wir]3 [Musik]4!', '[Dziś]1 [robimy]2+3 [muzykę]4!', '[Today]1 [we]3 [make]2 [music]4!', { illu: 'lehrerin' }),
  p('kg1-musig-a', 2, '[D Trummle]1 [tönt]2 [lut]3.', '[Die Trommel]1 [klingt]2 [laut]3.', '[Bębenek]1 [brzmi]2 [głośno]3.', '[The drum]1 [sounds]2 [loud]3.', { words: ['trummle', 'lut'], illu: 'trummle' }),
  p('kg1-musig-b', 2, '[Mir]1 [singe]2 [ganz]3 [lysli]4.', '[Wir]1 [singen]2 [ganz]3 [leise]4.', '[Śpiewamy]1+2 [bardzo]3 [cicho]4.', '[We]1 [sing]2 [very]3 [quietly]4.', { words: ['singe', 'liisli'], illu: 'pose-sing', pose: 'sing' }),
  p('kg1-musig-c', 2, '[Chlatsch]1 [im Takt]2!', '[Klatsch]1 [im Takt]2!', '[Klaszcz]1 [do rytmu]2!', '[Clap]1 [to the beat]2!', { words: ['klatsche'], illu: 'pose-clap', pose: 'clap', tags: ['tpr'] }),
  p('kg1-bewegig-intro', 2, '[Hüt]1 [bewege]2 [mir]3 [üs]4!', '[Heute]1 [bewegen]2 [wir]3 [uns]4!', '[Dziś]1 [się]4 [ruszamy]2+3!', '[Today]1 [we]3 [move]2+4!', { illu: 'lehrerin' }),
  p('kg1-bewegig-a', 2, '[Gump]1 [wie ne Frosch]2!', '[Spring]1 [wie ein Frosch]2!', '[Skacz]1 [jak żaba]2!', '[Jump]1 [like a frog]2!', { words: ['gumpe'], pose: 'jump', illu: 'pose-jump', tags: ['tpr'] }),
  p('kg1-bewegig-b', 2, '[Louf]1 [ganz lysli]2 [wie ne Muus]3!', '[Geh]1 [ganz leise]2 [wie eine Maus]3!', '[Chodź]1 [cichutko]2 [jak myszka]3!', '[Walk]1 [very quietly]2 [like a mouse]3!', { words: ['loufe'], pose: 'walk', illu: 'pose-walk', tags: ['tpr'] }),
  p('kg1-bewegig-c', 2, '[Stampf]1 [wie ne Elefant]2!', '[Stampf]1 [wie ein Elefant]2!', '[Tupnij]1 [jak słoń]2!', '[Stomp]1 [like an elephant]2!', { words: ['stampfe'], pose: 'stomp', illu: 'pose-stomp', tags: ['tpr'] }),
  // ---------- Chindsgi 2 ----------
  p('kg2-tag-intro', 2, '[Hüt]1 [verzelle]2 [mir]3, [was]4 [mir]5 [am ne Tag]6 [mache]7.', '[Heute]1 [erzählen]2 [wir]3, [was]4 [wir]5 [an einem Tag]6 [machen]7.', '[Dziś]1 [opowiadamy]2+3, [co]4 [robimy]5+7 [w ciągu dnia]6.', '[Today]1 [we]3 [tell]2 [what]4 [we]5 [do]7 [in a day]6.', { illu: 'lehrerin' }),
  p('kg2-tag-a', 2, '[Am Morge]1 [ässe]2 [mir]3 [Zmorge]4.', '[Am Morgen]1 [essen]2 [wir]3 [Frühstück]4.', '[Rano]1 [jemy]2+3 [śniadanie]4.', '[In the morning]1 [we]3 [have]2 [breakfast]4.', { words: ['zmorge'], illu: 'zmorge' }),
  p('kg2-tag-b', 2, '[Am Mittag]1 [gits]2 [Zmittag]3.', '[Am Mittag]1 [gibt es]2 [Mittagessen]3.', '[W południe]1 [jest]2 [obiad]3.', '[At noon]1 [there is]2 [lunch]3.', { words: ['zmittag'], illu: 'zmittag' }),
  p('kg2-tag-c', 2, '[Am Abe]1 [ässe]2 [mir]3 [Znacht]4.', '[Am Abend]1 [essen]2 [wir]3 [Abendessen]4.', '[Wieczorem]1 [jemy]2+3 [kolację]4.', '[In the evening]1 [we]3 [have]2 [dinner]4.', { words: ['znacht'], illu: 'znacht' }),
  p('kg2-reihe', 2, '[Was]1 [chunnt]2 [zersch]3?', '[Was]1 [kommt]2 [zuerst]3?', '[Co]1 [jest]2 [najpierw]3?', '[What]1 [comes]2 [first]3?', { illu: 'lehrerin' }),
  p('kg2-forme-intro', 2, '[Hüt]1 [sueche]2 [mir]3 [Forme]4!', '[Heute]1 [suchen]2 [wir]3 [Formen]4!', '[Dziś]1 [szukamy]2+3 [kształtów]4!', '[Today]1 [we]3 [look for]2 [shapes]4!', { illu: 'lehrerin' }),
  p('kg2-forme-a', 2, '[Es Drüegg]1 [het]2 [drü Egge]3.', '[Ein Dreieck]1 [hat]2 [drei Ecken]3.', '[Trójkąt]1 [ma]2 [trzy rogi]3.', '[A triangle]1 [has]2 [three corners]3.', { words: ['dreieck'], illu: 'dreieck' }),
  p('kg2-forme-b', 2, '[Es Quadrat]1 [het]2 [vier glych längi Syte]3.', '[Ein Quadrat]1 [hat]2 [vier gleich lange Seiten]3.', '[Kwadrat]1 [ma]2 [cztery równe boki]3.', '[A square]1 [has]2 [four equal sides]3.', { words: ['quadrat'], illu: 'quadrat' }),
  p('kg2-forme-c', 2, '[Dr Chreis]1 [het]2 [kei Egge]3.', '[Der Kreis]1 [hat]2 [keine Ecken]3.', '[Koło]1 [nie ma]2 [rogów]3.', '[A circle]1 [has]2 [no corners]3.', { words: ['kreis'], illu: 'kreis' }),
  p('kg2-jahr-intro', 2, '[Hüt]1 [lehre]2 [mir]3 [d Jahreszyte]4 [kenne]5.', '[Heute]1 [lernen]2 [wir]3 [die Jahreszeiten]4 [kennen]5.', '[Dziś]1 [poznajemy]2+3+5 [pory roku]4.', '[Today]1 [we]3 [get to know]2+5 [the seasons]4.', { illu: 'lehrerin' }),
  p('kg2-jahr-a', 2, '[Ds Jahr]1 [het]2 [vier Jahreszyte]3.', '[Das Jahr]1 [hat]2 [vier Jahreszeiten]3.', '[Rok]1 [ma]2 [cztery pory roku]3.', '[The year]1 [has]2 [four seasons]3.', { illu: 'fruehlig' }),
  p('kg2-jahr-b', 2, '[Im Herbscht]1 [wärde]2 [d Bletter]3 [farbig]4.', '[Im Herbst]1 [werden]2 [die Blätter]3 [bunt]4.', '[Jesienią]1 [liście]3 [robią się]2 [kolorowe]4.', '[In autumn]1 [the leaves]3 [turn]2 [colourful]4.', { words: ['herbscht'], illu: 'herbscht' }),
  p('kg2-jahr-c', 2, '[Nach em Winter]1 [chunnt]2 [dr Früelig]3.', '[Nach dem Winter]1 [kommt]2 [der Frühling]3.', '[Po zimie]1 [przychodzi]2 [wiosna]3.', '[After winter]1 [comes]2 [spring]3.', { words: ['winter', 'fruehlig'], illu: 'fruehlig' }),
  p('kg2-baschtle-intro', 2, '[Hüt]1 [baschtle]2 [mir]3 [zäme]4!', '[Heute]1 [basteln]2 [wir]3 [zusammen]4!', '[Dziś]1 [majsterkujemy]2+3 [razem]4!', '[Today]1 [we]3 [do crafts]2 [together]4!', { illu: 'lehrerin' }),
  p('kg2-baschtle-a', 2, '[Mit dr Schäri]1 [schnyde]2 [mir]3 [Papier]4.', '[Mit der Schere]1 [schneiden]2 [wir]3 [Papier]4.', '[Nożyczkami]1 [tniemy]2+3 [papier]4.', '[We]3 [cut]2 [paper]4 [with scissors]1.', { words: ['schaeri', 'papier'], illu: 'schaeri' }),
  p('kg2-baschtle-b', 2, '[Dr Lym]1 [chläbt]2.', '[Der Leim]1 [klebt]2.', '[Klej]1 [klei]2.', '[Glue]1 [sticks]2.', { words: ['lym'], illu: 'lym' }),
  p('kg2-baschtle-c', 2, '[Trag]1 [d Schäri]2 [geng]3 [mit dr Spitze nach unde]4!', '[Trag]1 [die Schere]2 [immer]3 [mit der Spitze nach unten]4!', '[Noś]1 [nożyczki]2 [zawsze]3 [ostrzem w dół]4!', '[Always]3 [carry]1 [scissors]2 [with the point down]4!', { words: ['schaeri'], illu: 'schaeri' }),
  p('kg2-tanz-intro', 2, '[Hüt]1 [tanze]2 [mir]3 [zu dr Musig]4!', '[Heute]1 [tanzen]2 [wir]3 [zur Musik]4!', '[Dziś]1 [tańczymy]2+3 [do muzyki]4!', '[Today]1 [we]3 [dance]2 [to the music]4!', { illu: 'lehrerin' }),
  p('kg2-tanz-a', 2, '[D Musig]1 [isch]2 [schnäu]3 – [mir]4 [tanze]5 [schnäu]6.', '[Die Musik]1 [ist]2 [schnell]3 – [wir]4 [tanzen]5 [schnell]6.', '[Muzyka]1 [jest]2 [szybka]3 – [tańczymy]4+5 [szybko]6.', '[The music]1 [is]2 [fast]3 – [we]4 [dance]5 [fast]6.', { words: ['schnaeu'], pose: 'dance', illu: 'pose-dance', tags: ['tpr'] }),
  p('kg2-tanz-b', 2, '[D Musig]1 [isch]2 [langsam]3 – [mir]4 [tanze]5 [langsam]6.', '[Die Musik]1 [ist]2 [langsam]3 – [wir]4 [tanzen]5 [langsam]6.', '[Muzyka]1 [jest]2 [wolna]3 – [tańczymy]4+5 [wolno]6.', '[The music]1 [is]2 [slow]3 – [we]4 [dance]5 [slowly]6.', { words: ['langsam'], pose: 'dance', illu: 'pose-dance', tags: ['tpr'] }),
  p('kg2-tanz-c', 2, '[Wenn]1 [d Musig]2 [ufhört]3, [blybe]4 [mir]5 [stah]6.', '[Wenn]1 [die Musik]2 [aufhört]3, [bleiben]4 [wir]5 [stehen]6.', '[Gdy]1 [muzyka]2 [cichnie]3, [stajemy]4+5+6.', '[When]1 [the music]2 [stops]3, [we]5 [stand still]4+6.', { pose: 'stand', illu: 'pose-stand', tags: ['tpr'] }),
  // ---------- 1. Klasse ----------
  p('k1-buechstabe-intro', 3, '[Hüt]1 [lehre]2 [mir]3 [Buechstabe]4!', '[Heute]1 [lernen]2 [wir]3 [Buchstaben]4!', '[Dziś]1 [uczymy się]2+3 [liter]4!', '[Today]1 [we]3 [learn]2 [letters]4!', { illu: 'lehrerin' }),
  p('k1-buechstabe-a', 3, '[Mit Buechstabe]1 [schrybe]2 [mir]3 [Wörter]4.', '[Mit Buchstaben]1 [schreiben]2 [wir]3 [Wörter]4.', '[Literami]1 [piszemy]2+3 [słowa]4.', '[We]3 [write]2 [words]4 [with letters]1.', { words: ['buechstabe'], illu: 'buechstabe' }),
  p('k1-buechstabe-b', 2, '[Weles Biud]1 [ghört]2 [zu däm Buechstabe]3?', '[Welches Bild]1 [gehört]2 [zu diesem Buchstaben]3?', '[Który obrazek]1 [pasuje]2 [do tej litery]3?', '[Which picture]1 [goes]2 [with this letter]3?', { tags: ['question'], illu: 'buechstabe' }),
  p('k1-buechstabe-c', 3, '[Lis]1 [mit mir]2!', '[Lies]1 [mit mir]2!', '[Czytaj]1 [ze mną]2!', '[Read]1 [with me]2!', { illu: 'buech' }),
  p('k1-rechne-intro', 3, '[Hüt]1 [rächne]2 [mir]3 [plus u minus]4!', '[Heute]1 [rechnen]2 [wir]3 [plus und minus]4!', '[Dziś]1 [ćwiczymy]2+3 [dodawanie i odejmowanie]4!', '[Today]1 [we]3 [do]2 [plus and minus]4!', { illu: 'lehrerin' }),
  p('k1-rechne-a', 3, '[Drü]1 [plus]2 [zwöi]3 [git]4 [füf]5.', '[Drei]1 [plus]2 [zwei]3 [gibt]4 [fünf]5.', '[Trzy]1 [dodać]2 [dwa]3 [to]4 [pięć]5.', '[Three]1 [plus]2 [two]3 [makes]4 [five]5.', { illu: 'zahl' }),
  p('k1-rechne-b', 3, '[Sibe]1 [minus]2 [vier]3 [git]4 [drü]5.', '[Sieben]1 [minus]2 [vier]3 [gibt]4 [drei]5.', '[Siedem]1 [odjąć]2 [cztery]3 [to]4 [trzy]5.', '[Seven]1 [minus]2 [four]3 [makes]4 [three]5.', { illu: 'zahl' }),
  p('k1-rechne-c', 3, '[Wie viu]1 [git]2 [das]3?', '[Wie viel]1 [gibt]2 [das]3?', '[Ile]1 [to]3 [jest]2?', '[How much]1 [is]2 [that]3?', { tags: ['question'], illu: 'zahl' }),
  p('k1-tier-intro', 3, '[Hüt]1 [luege]2 [mir]3, [wo]4 [d Tier]5 [wohne]6.', '[Heute]1 [schauen]2 [wir]3, [wo]4 [die Tiere]5 [wohnen]6.', '[Dziś]1 [sprawdzamy]2+3, [gdzie]4 [mieszkają]6 [zwierzęta]5.', '[Today]1 [we]3 [look at]2 [where]4 [animals]5 [live]6.', { illu: 'lehrerin' }),
  p('k1-tier-a', 3, '[Dr Fuchs]1 [wohnt]2 [im Waud]3.', '[Der Fuchs]1 [wohnt]2 [im Wald]3.', '[Lis]1 [mieszka]2 [w lesie]3.', '[The fox]1 [lives]2 [in the forest]3.', { words: ['fuchs'], illu: 'fuchs' }),
  p('k1-tier-b', 3, '[D Chue]1 [läbt]2 [uf em Purehof]3.', '[Die Kuh]1 [lebt]2 [auf dem Bauernhof]3.', '[Krowa]1 [mieszka]2 [w gospodarstwie]3.', '[The cow]1 [lives]2 [on the farm]3.', { words: ['chue'], illu: 'chue' }),
  p('k1-tier-c', 2, '[Ds Eichhörnli]1 [sammlet]2 [Nüss]3 [für dr Winter]4.', '[Das Eichhörnchen]1 [sammelt]2 [Nüsse]3 [für den Winter]4.', '[Wiewiórka]1 [zbiera]2 [orzechy]3 [na zimę]4.', '[The squirrel]1 [collects]2 [nuts]3 [for the winter]4.', { words: ['eichhoernli'], illu: 'eichhoernli' }),
  p('k1-waeg-intro', 3, '[Hüt]1 [lehre]2 [mir]3 [dr sicher Schuewäg]4.', '[Heute]1 [lernen]2 [wir]3 [den sicheren Schulweg]4.', '[Dziś]1 [uczymy się]2+3 [bezpiecznej drogi do szkoły]4.', '[Today]1 [we]3 [learn]2 [the safe way to school]4.', { illu: 'lehrerin' }),
  p('k1-waeg-a', 3, '[Warte]1, [luege]2, [lose]3, [loufe]4.', '[Warten]1, [schauen]2, [hören]3, [gehen]4.', '[Czekaj]1, [patrz]2, [słuchaj]3, [idź]4.', '[Wait]1, [look]2, [listen]3, [walk]4.', { pose: 'stand', illu: 'pose-stand', tags: ['tpr'] }),
  p('k1-waeg-b', 3, '[Bim Fuessgängerstreife]1 [luege]2 [mir]3 [links u rächts]4.', '[Am Fussgängerstreifen]1 [schauen]2 [wir]3 [links und rechts]4.', '[Przy przejściu dla pieszych]1 [patrzymy]2+3 [w lewo i w prawo]4.', '[At the zebra crossing]1 [we]3 [look]2 [left and right]4.', { words: ['strass'], pose: 'look', illu: 'pose-look', tags: ['tpr'] }),
  p('k1-waeg-c', 3, '[Ds Outo]1 [muess]2 [zersch]3 [aahaute]4.', '[Das Auto]1 [muss]2 [zuerst]3 [anhalten]4.', '[Samochód]1 [musi]2 [najpierw]3 [się zatrzymać]4.', '[The car]1 [must]2 [stop]4 [first]3.', { illu: 'strass' }),
  p('k1-gfueu-intro', 3, '[Hüt]1 [rede]2 [mir]3 [über Gfüeu]4.', '[Heute]1 [reden]2 [wir]3 [über Gefühle]4.', '[Dziś]1 [rozmawiamy]2+3 [o uczuciach]4.', '[Today]1 [we]3 [talk]2 [about feelings]4.', { illu: 'lehrerin' }),
  p('k1-gfueu-a', 2, '[Ruehig schnuufe]1 [hiuft]2 [gäge d Wuet]3.', '[Ruhig atmen]1 [hilft]2 [gegen die Wut]3.', '[Spokojny oddech]1 [pomaga]2 [na złość]3.', '[Calm breathing]1 [helps]2 [against anger]3.', { words: ['haessig'], illu: 'haessig' }),
  p('k1-gfueu-b', 3, '[Mi Fründin]1 [isch]2 [truurig]3, [i]4 [tröschte]5 [se]6.', '[Meine Freundin]1 [ist]2 [traurig]3, [ich]4 [tröste]5 [sie]6.', '[Moja koleżanka]1 [jest]2 [smutna]3, [pocieszam]4+5 [ją]6.', '[My friend]1 [is]2 [sad]3, [I]4 [comfort]5 [her]6.', { words: ['truurig'], illu: 'truurig' }),
  p('k1-gfueu-c', 3, '[Aui Gfüeu]1 [sy]2 [okay]3.', '[Alle Gefühle]1 [sind]2 [okay]3.', '[Wszystkie uczucia]1 [są]2 [w porządku]3.', '[All feelings]1 [are]2 [okay]3.', { illu: 'froehlech' }),
  // ---------- 2. Klasse ----------
  p('k2-gaegeteil-intro', 2, '[Hüt]1 [verglyche]2 [mir]3 [Sache]4!', '[Heute]1 [vergleichen]2 [wir]3 [Sachen]4!', '[Dziś]1 [porównujemy]2+3 [rzeczy]4!', '[Today]1 [we]3 [compare]2 [things]4!', { illu: 'lehrerin' }),
  p('k2-gaegeteil-a', 3, '[Dr Stei]1 [isch]2 [schwär]3, [ds Blatt]4 [isch]5 [liecht]6.', '[Der Stein]1 [ist]2 [schwer]3, [das Blatt]4 [ist]5 [leicht]6.', '[Kamień]1 [jest]2 [ciężki]3, [liść]4 [jest]5 [lekki]6.', '[The stone]1 [is]2 [heavy]3, [the leaf]4 [is]5 [light]6.', { words: ['schwaer', 'liecht'], illu: 'stei' }),
  p('k2-gaegeteil-b', 3, '[Am Tag]1 [isch es]2 [häll]3, [i dr Nacht]4 [dunku]5.', '[Am Tag]1 [ist es]2 [hell]3, [in der Nacht]4 [dunkel]5.', '[W dzień]1 [jest]2 [jasno]3, [w nocy]4 [ciemno]5.', '[During the day]1 [it is]2 [light]3, [at night]4 [dark]5.', { words: ['hell', 'dunku'], illu: 'mond' }),
  p('k2-gaegeteil-c', 3, '[Ds Glas]1 [isch]2 [vou]3, [d Tasse]4 [isch]5 [läär]6.', '[Das Glas]1 [ist]2 [voll]3, [die Tasse]4 [ist]5 [leer]6.', '[Szklanka]1 [jest]2 [pełna]3, [kubek]4 [jest]5 [pusty]6.', '[The glass]1 [is]2 [full]3, [the cup]4 [is]5 [empty]6.', { words: ['vou', 'laeaer'], illu: 'glas' }),
  p('k2-mau-intro', 3, '[Hüt]1 [lehre]2 [mir]3 [ds Einmaleis]4!', '[Heute]1 [lernen]2 [wir]3 [das Einmaleins]4!', '[Dziś]1 [uczymy się]2+3 [tabliczki mnożenia]4!', '[Today]1 [we]3 [learn]2 [the times tables]4!', { illu: 'lehrerin' }),
  p('k2-mau-a', 3, '[Zwöi]1 [mau]2 [drü]3 [git]4 [sächs]5.', '[Zwei]1 [mal]2 [drei]3 [gibt]4 [sechs]5.', '[Dwa]1 [razy]2 [trzy]3 [to]4 [sześć]5.', '[Two]1 [times]2 [three]3 [makes]4 [six]5.', { illu: 'zahl' }),
  p('k2-mau-b', 3, '[Zäh]1 [mau]2 [zwöi]3 [git]4 [zwänzg]5.', '[Zehn]1 [mal]2 [zwei]3 [gibt]4 [zwanzig]5.', '[Dziesięć]1 [razy]2 [dwa]3 [to]4 [dwadzieścia]5.', '[Ten]1 [times]2 [two]3 [makes]4 [twenty]5.', { illu: 'zahl' }),
  p('k2-mau-c', 3, '[Wie viu]1 [isch]2 [das]3 [mau]4 [das]5?', '[Wie viel]1 [ist]2 [das]3 [mal]4 [das]5?', '[Ile]1 [to]3 [jest]2 [razy]4 [to]5?', '[How much]1 [is]2 [this]3 [times]4 [that]5?', { tags: ['question'], illu: 'zahl' }),
  p('k2-wasser-intro', 3, '[Hüt]1 [lehre]2 [mir]3, [wo]4 [ds Wasser]5 [härchunnt]6.', '[Heute]1 [lernen]2 [wir]3, [woher]4+6 [das Wasser]5 [kommt]6.', '[Dziś]1 [dowiadujemy się]2+3, [skąd]4 [pochodzi]6 [woda]5.', '[Today]1 [we]3 [learn]2 [where]4 [water]5 [comes from]6.', { illu: 'lehrerin' }),
  p('k2-wasser-a', 2, '[D Sunne]1 [macht]2 [us Wasser]3 [Dampf]4.', '[Die Sonne]1 [macht]2 [aus Wasser]3 [Dampf]4.', '[Słońce]1 [robi]2 [z wody]3 [parę]4.', '[The sun]1 [turns]2 [water]3 [into vapour]4.', { words: ['sunne'], illu: 'sunne' }),
  p('k2-wasser-b', 3, '[Us em Dampf]1 [wärde]2 [Wulche]3.', '[Aus dem Dampf]1 [werden]2 [Wolken]3.', '[Z pary]1 [powstają]2 [chmury]3.', '[The vapour]1 [becomes]2 [clouds]3.', { words: ['wouke'], illu: 'wouke' }),
  p('k2-wasser-c', 2, '[Us dr Wulche]1 [chunnt]2 [Räge]3.', '[Aus der Wolke]1 [kommt]2 [Regen]3.', '[Z chmury]1 [pada]2 [deszcz]3.', '[Rain]3 [comes]2 [from the cloud]1.', { words: ['raege'], illu: 'raege' }),
  p('k2-wasser-d', 2, '[Vom Räge]1 [wärde]2 [d Bäch u Flüss]3 [vou]4.', '[Vom Regen]1 [werden]2 [die Bäche und Flüsse]3 [voll]4.', '[Od deszczu]1 [strumienie i rzeki]3 [stają się]2 [pełne]4.', '[The rain]1 [makes]2 [streams and rivers]3 [full]4.', { words: ['fluss'], illu: 'fluss' }),
  p('k2-zyt-intro', 3, '[Hüt]1 [lehre]2 [mir]3 [d Zyt]4 [kenne]5.', '[Heute]1 [lernen]2 [wir]3 [die Zeit]4 [kennen]5.', '[Dziś]1 [poznajemy]2+3+5 [czas]4.', '[Today]1 [we]3 [learn about]2+5 [time]4.', { illu: 'lehrerin' }),
  p('k2-zyt-a', 2, '[Geschter]1 [isch verby]2, [morn]3 [chunnt no]4.', '[Gestern]1 [ist vorbei]2, [morgen]3 [kommt noch]4.', '[Wczoraj]1 [minęło]2, [jutro]3 [dopiero nadejdzie]4.', '[Yesterday]1 [is over]2, [tomorrow]3 [is still to come]4.', { words: ['geschter', 'morn'], illu: 'mond' }),
  p('k2-zyt-b', 3, '[D Wuche]1 [het]2 [sibe Täg]3.', '[Die Woche]1 [hat]2 [sieben Tage]3.', '[Tydzień]1 [ma]2 [siedem dni]3.', '[The week]1 [has]2 [seven days]3.', { illu: 'sunne' }),
  p('k2-zyt-c', 3, '[Ds Jahr]1 [het]2 [zwöuf Mönet]3.', '[Das Jahr]1 [hat]2 [zwölf Monate]3.', '[Rok]1 [ma]2 [dwanaście miesięcy]3.', '[The year]1 [has]2 [twelve months]3.', { illu: 'staern' }),
  p('k2-aesse-intro', 3, '[Hüt]1 [lehre]2 [mir]3 [gsund]4 [ässe]5.', '[Heute]1 [lernen]2 [wir]3 [gesund]4 [essen]5.', '[Dziś]1 [uczymy się]2+3 [zdrowo]4 [jeść]5.', '[Today]1 [we]3 [learn]2 [to eat]5 [healthily]4.', { illu: 'lehrerin' }),
  p('k2-aesse-a', 3, '[Frücht u Gmües]1 [gä]2 [Chraft]3.', '[Obst und Gemüse]1 [geben]2 [Kraft]3.', '[Owoce i warzywa]1 [dają]2 [siłę]3.', '[Fruit and vegetables]1 [give]2 [strength]3.', { words: ['oepfu', 'rueebli'], illu: 'oepfu' }),
  p('k2-aesse-b', 3, '[Süesses]1 [nume]2 [mängisch]3.', '[Süsses]1 [nur]2 [manchmal]3.', '[Słodycze]1 [tylko]2 [czasami]3.', '[Sweets]1 [only]2 [sometimes]3.', { words: ['schoggi'], illu: 'schoggi' }),
  p('k2-aesse-c', 2, '[Wasser]1 [isch]2 [ds Beschte]3 [zum Trinke]4.', '[Wasser]1 [ist]2 [das Beste]3 [zum Trinken]4.', '[Woda]1 [jest]2 [najlepsza]3 [do picia]4.', '[Water]1 [is]2 [the best thing]3 [to drink]4.', { words: ['wasser'], illu: 'wasser' }),
  // ---------- 3. Klasse ----------
  p('k3-verb-intro', 3, '[Hüt]1 [lehre]2 [mir]3 [Verbe]4.', '[Heute]1 [lernen]2 [wir]3 [Verben]4.', '[Dziś]1 [uczymy się]2+3 [czasowników]4.', '[Today]1 [we]3 [learn]2 [verbs]4.', { illu: 'lehrerin' }),
  p('k3-verb-a', 2, '[Ig]1 [läse]2 [es Buech]3.', '[Ich]1 [lese]2 [ein Buch]3.', '[Czytam]1+2 [książkę]3.', '[I]1 [am reading]2 [a book]3.', { words: ['laese'], illu: 'pose-read', pose: 'read', tags: ['tpr'] }),
  p('k3-verb-b', 3, '[Du]1 [schrybsch]2 [e Brief]3.', '[Du]1 [schreibst]2 [einen Brief]3.', '[Piszesz]1+2 [list]3.', '[You]1 [are writing]2 [a letter]3.', { words: ['schrybe'], illu: 'pose-write', pose: 'write', tags: ['tpr'] }),
  p('k3-verb-c', 2, '[Mir]1 [male]2 [es Biud]3.', '[Wir]1 [malen]2 [ein Bild]3.', '[Malujemy]1+2 [obrazek]3.', '[We]1 [are painting]2 [a picture]3.', { illu: 'pose-paint', pose: 'paint', tags: ['tpr'] }),
  p('k3-verb-d', 3, '[Verbe]1 [säge]2, [was]3 [öpper]4 [macht]5.', '[Verben]1 [sagen]2, [was]3 [jemand]4 [tut]5.', '[Czasowniki]1 [mówią]2, [co]3 [ktoś]4 [robi]5.', '[Verbs]1 [tell]2 [what]3 [someone]4 [does]5.', { illu: 'buech' }),
  p('k3-uhr-intro', 3, '[Hüt]1 [lehre]2 [mir]3 [d Uhr]4 [läse]5.', '[Heute]1 [lernen]2 [wir]3 [die Uhr]4 [lesen]5.', '[Dziś]1 [uczymy się]2+3 [odczytywać]5 [zegar]4.', '[Today]1 [we]3 [learn]2 [to tell]5 [the time]4.', { illu: 'lehrerin' }),
  p('k3-uhr-a', 3, '[Es isch]1 [drü Uhr]2.', '[Es ist]1 [drei Uhr]2.', '[Jest]1 [trzecia]2.', '[It is]1 [three o’clock]2.', { words: ['uhr'], illu: 'uhr' }),
  p('k3-uhr-b', 2, '[E Stund]1 [het]2 [sächzg Minute]3.', '[Eine Stunde]1 [hat]2 [sechzig Minuten]3.', '[Godzina]1 [ma]2 [sześćdziesiąt minut]3.', '[An hour]1 [has]2 [sixty minutes]3.', { illu: 'uhr' }),
  p('k3-uhr-c', 2, '[Uf dr Uhr]1 [gsehsch]2 [d Stunde u d Minute]3.', '[Auf der Uhr]1 [siehst du]2 [die Stunden und die Minuten]3.', '[Na zegarze]1 [widzisz]2 [godziny i minuty]3.', '[On the clock]1 [you see]2 [the hours and the minutes]3.', { illu: 'uhr' }),
  p('k3-baern-intro', 3, '[Hüt]1 [entdecke]2 [mir]3 [Bärn]4!', '[Heute]1 [entdecken]2 [wir]3 [Bern]4!', '[Dziś]1 [odkrywamy]2+3 [Berno]4!', '[Today]1 [we]3 [explore]2 [Bern]4!', { illu: 'lehrerin' }),
  p('k3-baern-a', 2, '[Bärn]1 [isch]2 [d Bundesstadt]3.', '[Bern]1 [ist]2 [die Bundesstadt]3.', '[Berno]1 [jest]2 [miastem federalnym]3.', '[Bern]1 [is]2 [the federal city]3.', { words: ['fahne'], illu: 'fahne' }),
  p('k3-baern-b', 2, '[D Aare]1 [macht]2 [e Boge]3 [um d Autstadt]4.', '[Die Aare]1 [macht]2 [einen Bogen]3 [um die Altstadt]4.', '[Aare]1 [zakręca]2+3 [wokół starego miasta]4.', '[The Aare]1 [curves]2+3 [around the old town]4.', { words: ['bruegg'], illu: 'bruegg' }),
  p('k3-baern-c', 3, '[Dr Zytglogge]1 [isch]2 [en aute Turm]3 [mit ere Uhr]4.', '[Der Zytglogge]1 [ist]2 [ein alter Turm]3 [mit einer Uhr]4.', '[Zytglogge]1 [to]2 [stara wieża]3 [z zegarem]4.', '[The Zytglogge]1 [is]2 [an old tower]3 [with a clock]4.', { words: ['zytglogge'], illu: 'zytglogge' }),
  p('k3-baern-d', 3, '[Im Bärepark]1 [wohne]2 [Bäre]3.', '[Im Bärenpark]1 [wohnen]2 [Bären]3.', '[W parku niedźwiedzi]1 [mieszkają]2 [niedźwiedzie]3.', '[Bears]3 [live]2 [in the bear park]1.', { words: ['baer'], illu: 'baer' }),
  p('k3-pflanze-intro', 3, '[Hüt]1 [lehre]2 [mir]3, [wie]4 [Pflanze]5 [wachse]6.', '[Heute]1 [lernen]2 [wir]3, [wie]4 [Pflanzen]5 [wachsen]6.', '[Dziś]1 [uczymy się]2+3, [jak]4 [rosną]6 [rośliny]5.', '[Today]1 [we]3 [learn]2 [how]4 [plants]5 [grow]6.', { illu: 'lehrerin' }),
  p('k3-pflanze-a', 3, '[E Pflanze]1 [brucht]2 [Wasser, Liecht u Ärde]3.', '[Eine Pflanze]1 [braucht]2 [Wasser, Licht und Erde]3.', '[Roślina]1 [potrzebuje]2 [wody, światła i ziemi]3.', '[A plant]1 [needs]2 [water, light and soil]3.', { words: ['bluem'], illu: 'bluem' }),
  p('k3-pflanze-b', 3, '[Us emne Some]1 [wachst]2 [e Pflanze]3.', '[Aus einem Samen]1 [wächst]2 [eine Pflanze]3.', '[Z nasiona]1 [wyrasta]2 [roślina]3.', '[A plant]3 [grows]2 [from a seed]1.', { illu: 'gras' }),
  p('k3-pflanze-c', 3, '[D Wurzle]1 [trinke]2 [Wasser]3 [us dr Ärde]4.', '[Die Wurzeln]1 [trinken]2 [Wasser]3 [aus der Erde]4.', '[Korzenie]1 [piją]2 [wodę]3 [z ziemi]4.', '[The roots]1 [drink]2 [water]3 [from the soil]4.', { words: ['boum'], illu: 'boum' }),
  p('k3-fair-intro', 3, '[Hüt]1 [lehre]2 [mir]3 [Fairplay]4.', '[Heute]1 [lernen]2 [wir]3 [Fairplay]4.', '[Dziś]1 [uczymy się]2+3 [fair play]4.', '[Today]1 [we]3 [learn]2 [fair play]4.', { illu: 'lehrerin' }),
  p('k3-fair-a', 3, '[Im Spiu]1 [haute]2 [mir]3 [üs]2 [a d Regle]4.', '[Im Spiel]1 [halten]2 [wir]3 [uns]2 [an die Regeln]4.', '[W grze]1 [przestrzegamy]2+3 [zasad]4.', '[In a game]1 [we]3 [follow]2 [the rules]4.', { words: ['bau'], illu: 'bau' }),
  p('k3-fair-b', 2, '[Mir]1 [säge]2: [Guet gmacht]3!', '[Wir]1 [sagen]2: [Gut gemacht]3!', '[Mówimy]1+2: [dobra robota]3!', '[We]1 [say]2: [well done]3!', { pose: 'clap', illu: 'pose-clap', tags: ['tpr'] }),
  p('k3-fair-c', 2, '[Aui]1 [dörfe]2 [mitspile]3.', '[Alle]1 [dürfen]2 [mitspielen]3.', '[Wszyscy]1 [mogą]2 [grać razem]3.', '[Everyone]1 [can]2 [join in]3.', { illu: 'pose-hug', pose: 'hug' }),
]
export const SCHOOL_PHRASE_BY_ID: Record<string, Phrase> = Object.fromEntries(SCHOOL_PHRASES.map((x) => [x.id, x]))

type Tip = [pl: string, de: string, en: string]
interface LO {
  games: ActivityKind[]
  sort?: SortSpec
  count?: CountSpec
  math?: MathSpec
  order?: OrderSpec
  letters?: string
  tips: Tip[]
  off: [pl: string, de: string, en: string, phrase?: string]
  sticker: string
}
const bin = (be: string, de: string, pl: string, en: string, illu: string, words: string[]) => ({ label: { be, de, pl, en }, illu, words })

function lesson(id: string, stage: Stage, subject: Subject, title: [string, string, string, string], icon: string, words: string[], phrases: string[], o: LO): Topic & { school: SchoolInfo } {
  return {
    id: `sch-${id}`,
    level: STAGE_LEVEL[stage],
    place: stage.startsWith('kg') ? 'chindsgi' : 'school',
    title: { be: title[0], de: title[1], pl: title[2], en: title[3] },
    icon,
    words,
    phrases: phrases.map((x) => `sch-${x}`),
    games: o.games,
    sort: o.sort,
    count: o.count,
    parentTips: o.tips.map(([pl, de, en]) => ({ pl, de, en })),
    offscreen: { pl: o.off[0], de: o.off[1], en: o.off[2], phrase: o.off[3] ? `sch-${o.off[3]}` : undefined },
    sticker: o.sticker,
    school: {
      stage,
      subject,
      intro: `sch-${id}-intro`,
      math: o.math ? { ...o.math, prompt: `sch-${o.math.prompt}` } : undefined,
      order: o.order ? { ...o.order, prompt: `sch-${o.order.prompt}` } : undefined,
      letters: o.letters ? `sch-${o.letters}` : undefined,
    },
  }
}

export const SCHOOL_TOPICS: (Topic & { school: SchoolInfo })[] = [
  // ===================== Chindsgi 1 (4–5) =====================
  lesson('kg1-farbe', 'kg1', 'gestalten', ['Farbe mische', 'Farben mischen', 'Mieszamy kolory', 'Mixing colours'], 'violett', ['rot', 'blau', 'gaeub', 'grueen', 'orangsch', 'violett', 'farbstift'], ['kg1-farbe-a', 'kg1-farbe-b', 'kg1-farbe-c'], {
    games: ['whereIs', 'sort', 'memory'],
    sort: { bins: [bin('Warmi Farbe', 'Warme Farben', 'Ciepłe kolory', 'Warm colours', 'sunne', ['rot', 'orangsch', 'gaeub']), bin('Chauti Farbe', 'Kalte Farben', 'Zimne kolory', 'Cold colours', 'schnee', ['blau', 'grueen', 'violett'])] },
    tips: [['Mieszajcie farby wodne: czerwona + żółta. Co wyszło?', 'Mischt Wasserfarben: Rot + Gelb. Was entsteht?', 'Mix watercolours: red + yellow. What appears?']],
    off: ['Pomalujcie razem kartkę trzema kolorami podstawowymi.', 'Malt zusammen ein Blatt mit den drei Grundfarben.', 'Paint a sheet together with the three primary colours.', 'kg1-farbe-a'],
    sticker: 'farbstift',
  }),
  lesson('kg1-zelle', 'kg1', 'mathe', ['Pünkt u Finger', 'Punkte und Finger', 'Kropki i palce', 'Dots and fingers'], 'n5', ['n1', 'n2', 'n3', 'n4', 'n5'], ['kg1-zelle-a', 'kg1-zelle-b', 'kg1-zelle-c'], {
    games: ['math', 'whereIs', 'memory'],
    math: { mode: 'dots', max: 5, prompt: 'kg1-zelle-a' },
    tips: [['Liczcie palce: „eis, zwöi, drü, vier, füf”.', 'Zählt die Finger: «eis, zwöi, drü, vier, füf».', 'Count fingers: “eis, zwöi, drü, vier, füf”.']],
    off: ['Przy stole: „Ile łyżek leży na stole?”', 'Am Tisch: «Wie viele Löffel liegen auf dem Tisch?»', 'At the table: “How many spoons are on the table?”', 'kg1-zelle-a'],
    sticker: 'n5',
  }),
  lesson('kg1-gsund', 'kg1', 'nmg', ['Gsund blybe', 'Gesund bleiben', 'Zdrowe nawyki', 'Staying healthy'], 'seife', ['seife', 'zahbuerschte', 'handtuech', 'zahn', 'mueed'], ['kg1-gsund-a', 'kg1-gsund-b', 'kg1-gsund-c'], {
    games: ['whereIs', 'memory', 'speak'],
    tips: [['Śpiewajcie przy myciu rąk – 20 sekund mydła.', 'Beim Händewaschen singen – 20 Sekunden Seife.', 'Sing while washing hands – 20 seconds of soap.']],
    off: ['Wieczorem: „Zwöimau am Tag putze mir d Zähn.”', 'Am Abend: «Zwöimau am Tag putze mir d Zähn.»', 'In the evening: “Zwöimau am Tag putze mir d Zähn.”', 'kg1-gsund-b'],
    sticker: 'zahbuerschte',
  }),
  lesson('kg1-musig', 'kg1', 'musik', ['Lut u lysli', 'Laut und leise', 'Głośno i cicho', 'Loud and quiet'], 'trummle', ['trummle', 'lut', 'liisli', 'singe', 'klatsche'], ['kg1-musig-a', 'kg1-musig-b', 'kg1-musig-c'], {
    games: ['tpr', 'whereIs', 'memory'],
    tips: [['Grajcie na garnku: raz głośno, raz cicho.', 'Spielt auf einem Topf: einmal laut, einmal leise.', 'Play on a pot: once loud, once quiet.']],
    off: ['Klaszczcie razem rytm ulubionej piosenki.', 'Klatscht zusammen den Rhythmus eines Lieblingslieds.', 'Clap the rhythm of a favourite song together.', 'kg1-musig-c'],
    sticker: 'trummle',
  }),
  lesson('kg1-bewegig', 'kg1', 'sport', ['Bewegig', 'Bewegung', 'Ruch', 'Moving'], 'pose-jump', ['gumpe', 'loufe', 'stampfe', 'draeie', 'springe'], ['kg1-bewegig-a', 'kg1-bewegig-b', 'kg1-bewegig-c'], {
    games: ['tpr', 'memory'],
    tips: [['Bawcie się w zwierzęta: żaba skacze, słoń tupie.', 'Spielt Tiere: Frosch springt, Elefant stampft.', 'Play animals: the frog jumps, the elephant stomps.']],
    off: ['Na spacerze: „Gump wie ne Frosch!”', 'Beim Spaziergang: «Gump wie ne Frosch!»', 'On a walk: “Gump wie ne Frosch!”', 'kg1-bewegig-a'],
    sticker: 'frosch',
  }),
  // ===================== Chindsgi 2 / zerówka (5–6) =====================
  lesson('kg2-tag', 'kg2', 'deutsch', ['Mi Tag', 'Mein Tag', 'Mój dzień', 'My day'], 'zmorge', ['zmorge', 'zmittag', 'zvieri', 'znacht'], ['kg2-tag-a', 'kg2-tag-b', 'kg2-tag-c'], {
    games: ['order', 'whereIs', 'memory'],
    order: { items: ['zmorge', 'zmittag', 'zvieri', 'znacht'], prompt: 'kg2-reihe' },
    tips: [['Opowiadajcie dzień po kolei: rano, w południe, wieczorem.', 'Erzählt den Tag der Reihe nach: morgens, mittags, abends.', 'Tell the day in order: morning, noon, evening.']],
    off: ['Przy kolacji: „Was hesch hüt gmacht?”', 'Beim Abendessen: «Was hesch hüt gmacht?»', 'At dinner: “Was hesch hüt gmacht?”', 'kg2-tag-c'],
    sticker: 'zmittag',
  }),
  lesson('kg2-forme', 'kg2', 'mathe', ['Forme', 'Formen', 'Kształty', 'Shapes'], 'dreieck', ['kreis', 'dreieck', 'quadrat', 'haerz'], ['kg2-forme-a', 'kg2-forme-b', 'kg2-forme-c'], {
    games: ['whereIs', 'memory', 'speak'],
    tips: [['Szukajcie kształtów w domu: okno to kwadrat, talerz to koło.', 'Sucht Formen zu Hause: das Fenster ist ein Quadrat, der Teller ein Kreis.', 'Find shapes at home: the window is a square, the plate a circle.']],
    off: ['Ułóżcie trójkąt z trzech patyczków.', 'Legt ein Dreieck aus drei Stäbchen.', 'Make a triangle from three sticks.', 'kg2-forme-a'],
    sticker: 'quadrat',
  }),
  lesson('kg2-jahr', 'kg2', 'nmg', ['D Jahreszyte', 'Die Jahreszeiten', 'Pory roku', 'The seasons'], 'herbscht', ['fruehlig', 'summer', 'herbscht', 'winter', 'sunnebrueue', 'haendsche'], ['kg2-jahr-a', 'kg2-jahr-b', 'kg2-jahr-c'], {
    games: ['order', 'sort', 'memory'],
    order: { items: ['fruehlig', 'summer', 'herbscht', 'winter'], prompt: 'kg2-reihe' },
    sort: { bins: [bin('Summer', 'Sommer', 'Lato', 'Summer', 'summer', ['sunnebrueue']), bin('Winter', 'Winter', 'Zima', 'Winter', 'winter', ['haendsche'])] },
    tips: [['Zbierajcie liście jesienią i porównujcie kolory.', 'Sammelt im Herbst Blätter und vergleicht die Farben.', 'Collect leaves in autumn and compare the colours.']],
    off: ['Wybierzcie razem ubranie na dzisiejszą pogodę.', 'Wählt zusammen die Kleidung für das heutige Wetter.', 'Pick clothes for today’s weather together.', 'kg2-jahr-c'],
    sticker: 'fruehlig',
  }),
  lesson('kg2-baschtle', 'kg2', 'gestalten', ['Baschtle', 'Basteln', 'Majsterkowanie', 'Crafts'], 'schaeri', ['schaeri', 'lym', 'papier'], ['kg2-baschtle-a', 'kg2-baschtle-b', 'kg2-baschtle-c'], {
    games: ['whereIs', 'memory', 'speak'],
    tips: [['Pokażcie, jak bezpiecznie nosić nożyczki – ostrzem w dół.', 'Zeigt, wie man die Schere sicher trägt – Spitze nach unten.', 'Show how to carry scissors safely – point down.']],
    off: ['Wytnijcie i przyklejcie razem kolorowe koło.', 'Schneidet zusammen einen bunten Kreis aus und klebt ihn auf.', 'Cut out and glue a colourful circle together.', 'kg2-baschtle-c'],
    sticker: 'lym',
  }),
  lesson('kg2-tanz', 'kg2', 'musik', ['Tanze u stah blybe', 'Tanzen und stehen bleiben', 'Taniec i stop', 'Dance and freeze'], 'pose-dance', ['tanze', 'schnaeu', 'langsam'], ['kg2-tanz-a', 'kg2-tanz-b', 'kg2-tanz-c'], {
    games: ['tpr', 'memory'],
    tips: [['Zabawa „Stopptanz”: gdy muzyka cichnie, wszyscy stoją jak posągi.', 'Stopptanz: Wenn die Musik aufhört, stehen alle still.', 'Freeze dance: when the music stops, everybody freezes.']],
    off: ['Puszczajcie muzykę szybką i wolną – tańczcie odpowiednio.', 'Spielt schnelle und langsame Musik – tanzt passend dazu.', 'Play fast and slow music – dance to match.', 'kg2-tanz-c'],
    sticker: 'pose-dance',
  }),
  // ===================== 1. Klasse =====================
  lesson('k1-buechstabe', 'k1', 'deutsch', ['Buechstabe', 'Buchstaben', 'Litery', 'Letters'], 'buechstabe', ['banane', 'mond', 'tisch', 'igu', 'lampe', 'nase'], ['k1-buechstabe-a', 'k1-buechstabe-b', 'k1-buechstabe-c'], {
    games: ['letters', 'whereIs', 'memory'],
    letters: 'k1-buechstabe-b',
    tips: [['Szukajcie liter na szyldach na spacerze.', 'Sucht Buchstaben auf Schildern beim Spaziergang.', 'Look for letters on signs during a walk.']],
    off: ['Napiszcie razem imię dziecka dużymi literami.', 'Schreibt zusammen den Namen des Kindes in grossen Buchstaben.', 'Write the child’s name together in big letters.', 'k1-buechstabe-c'],
    sticker: 'buechstabe',
  }),
  lesson('k1-rechne', 'k1', 'mathe', ['Plus u minus', 'Plus und minus', 'Dodawanie i odejmowanie', 'Plus and minus'], 'zahl', ['zahl', 'n6', 'n7', 'n8', 'n9', 'n10'], ['k1-rechne-a', 'k1-rechne-b', 'k1-rechne-c'], {
    games: ['math', 'whereIs', 'memory'],
    math: { mode: 'add', max: 10, prompt: 'k1-rechne-c' },
    tips: [['Liczcie na palcach: 3 + 2 = 5.', 'Rechnet mit den Fingern: 3 + 2 = 5.', 'Count on fingers: 3 + 2 = 5.']],
    off: ['W sklepie: „Mamy 7 bułek, zjedliśmy 2 – ile zostało?”', 'Beim Einkaufen: «Wir haben 7 Brötchen, 2 gegessen – wie viele bleiben?»', 'Shopping: “We have 7 rolls, ate 2 – how many are left?”', 'k1-rechne-a'],
    sticker: 'zahl',
  }),
  lesson('k1-tier', 'k1', 'nmg', ['Wo d Tier wohne', 'Wo die Tiere wohnen', 'Gdzie mieszkają zwierzęta', 'Where animals live'], 'fuchs', ['fuchs', 'reh', 'eichhoernli', 'chue', 'schaf', 'geiss'], ['k1-tier-a', 'k1-tier-b', 'k1-tier-c'], {
    games: ['sort', 'whereIs', 'memory'],
    sort: { bins: [bin('Im Waud', 'Im Wald', 'W lesie', 'In the forest', 'waud', ['fuchs', 'reh', 'eichhoernli']), bin('Uf em Purehof', 'Auf dem Bauernhof', 'W gospodarstwie', 'On the farm', 'traktor', ['chue', 'schaf', 'geiss'])] },
    tips: [['Na spacerze w lesie szukajcie śladów zwierząt.', 'Sucht beim Waldspaziergang Tierspuren.', 'Look for animal tracks on a forest walk.']],
    off: ['Odwiedźcie gospodarstwo albo Tierpark Dählhölzli.', 'Besucht einen Bauernhof oder den Tierpark Dählhölzli.', 'Visit a farm or the Dählhölzli zoo.', 'k1-tier-a'],
    sticker: 'eichhoernli',
  }),
  lesson('k1-waeg', 'k1', 'nmg', ['Dr Schuewäg', 'Der Schulweg', 'Droga do szkoły', 'The way to school'], 'strass', ['strass', 'haltesteu', 'tram', 'velo'], ['k1-waeg-a', 'k1-waeg-b', 'k1-waeg-c'], {
    games: ['tpr', 'whereIs', 'memory'],
    tips: [['Przejdźcie razem drogę do szkoły i ćwiczcie „Warte, luege, lose, loufe”.', 'Geht zusammen den Schulweg und übt «Warte, luege, lose, laufe».', 'Walk the way to school together and practise “Warte, luege, lose, laufe”.']],
    off: ['Przy każdym przejściu: „Warte, luege, lose, loufe!”', 'Bei jedem Übergang: «Warte, luege, lose, loufe!»', 'At every crossing: “Warte, luege, lose, loufe!”', 'k1-waeg-a'],
    sticker: 'haltesteu',
  }),
  lesson('k1-gfueu', 'k1', 'nmg', ['Gfüeu', 'Gefühle', 'Uczucia', 'Feelings'], 'froehlech', ['froehlech', 'truurig', 'haessig', 'erchluepft', 'ueberrascht'], ['k1-gfueu-a', 'k1-gfueu-b', 'k1-gfueu-c'], {
    games: ['whereIs', 'memory', 'speak'],
    tips: [['Nazywajcie uczucia: „Widzę, że jesteś smutny”.', 'Benennt Gefühle: «Ich sehe, du bist traurig».', 'Name feelings: “I can see you are sad”.']],
    off: ['Gdy przyjdzie złość, oddychajcie razem głęboko 3 razy.', 'Wenn Wut kommt, atmet zusammen 3-mal tief.', 'When anger comes, breathe deeply together 3 times.', 'k1-gfueu-a'],
    sticker: 'lieb',
  }),
  // ===================== 2. Klasse =====================
  lesson('k2-gaegeteil', 'k2', 'deutsch', ['Schwär oder liecht?', 'Schwer oder leicht?', 'Ciężki czy lekki?', 'Heavy or light?'], 'schwaer', ['schwaer', 'liecht', 'hell', 'dunku', 'vou', 'laeaer'], ['k2-gaegeteil-a', 'k2-gaegeteil-b', 'k2-gaegeteil-c'], {
    games: ['whereIs', 'memory', 'speak'],
    tips: [['Grajcie w „Powiedz odwrotnie”: ciężki – lekki, pełny – pusty.', 'Spielt «Sag das Gegenteil»: schwer – leicht, voll – leer.', 'Play “Say the opposite”: heavy – light, full – empty.']],
    off: ['Ważcie razem przedmioty w dłoniach: co jest cięższe?', 'Wiegt zusammen Dinge in den Händen: was ist schwerer?', 'Weigh things in your hands together: which is heavier?', 'k2-gaegeteil-a'],
    sticker: 'liecht',
  }),
  lesson('k2-mau', 'k2', 'mathe', ['Mau rächne', 'Malrechnen', 'Mnożenie', 'Multiplying'], 'n20', ['n11', 'n12', 'n15', 'n18', 'n20'], ['k2-mau-a', 'k2-mau-b', 'k2-mau-c'], {
    games: ['math', 'memory'],
    math: { mode: 'mult', tables: [2, 5, 10], prompt: 'k2-mau-c' },
    tips: [['Liczcie co 2, co 5 i co 10 – na schodach albo przy klaskaniu.', 'Zählt in 2er-, 5er- und 10er-Schritten – auf der Treppe oder beim Klatschen.', 'Count in twos, fives and tens – on the stairs or while clapping.']],
    off: ['Liczcie pary skarpetek: 5 par to ile skarpetek?', 'Zählt Sockenpaare: 5 Paare sind wie viele Socken?', 'Count pairs of socks: 5 pairs are how many socks?', 'k2-mau-a'],
    sticker: 'n12',
  }),
  lesson('k2-wasser', 'k2', 'nmg', ['Dr Wasserchreislouf', 'Der Wasserkreislauf', 'Obieg wody', 'The water cycle'], 'raege', ['sunne', 'wouke', 'raege', 'fluss', 'see'], ['k2-wasser-a', 'k2-wasser-b', 'k2-wasser-c', 'k2-wasser-d'], {
    games: ['order', 'whereIs', 'memory'],
    order: { items: ['see', 'wouke', 'raege', 'fluss'], prompt: 'kg2-reihe' },
    tips: [['Doświadczenie: przykryjcie miskę gorącej wody folią – zobaczcie „deszcz”.', 'Versuch: Schüssel mit heissem Wasser mit Folie abdecken – seht den «Regen».', 'Experiment: cover a bowl of hot water with cling film – watch the “rain”.']],
    off: ['Po deszczu: dokąd płynie woda z kałuż?', 'Nach dem Regen: wohin fliesst das Wasser aus den Pfützen?', 'After rain: where does the puddle water go?', 'k2-wasser-c'],
    sticker: 'wouke',
  }),
  lesson('k2-zyt', 'k2', 'nmg', ['D Zyt', 'Die Zeit', 'Czas', 'Time'], 'mond', ['geschter', 'huet', 'morn', 'tag', 'nacht', 'morge', 'abe'], ['k2-zyt-a', 'k2-zyt-b', 'k2-zyt-c'], {
    games: ['order', 'whereIs', 'memory'],
    order: { items: ['geschter', 'huet', 'morn'], prompt: 'kg2-reihe' },
    tips: [['Powieście kalendarz i codziennie skreślajcie dzień.', 'Hängt einen Kalender auf und streicht jeden Tag einen Tag ab.', 'Hang up a calendar and cross off a day every day.']],
    off: ['Rano: „Hüt isch … Was mache mir morn?”', 'Am Morgen: «Hüt isch … Was mache mir morn?»', 'In the morning: “Hüt isch … Was mache mir morn?”', 'k2-zyt-a'],
    sticker: 'sunne',
  }),
  lesson('k2-aesse', 'k2', 'sport', ['Gsund ässe', 'Gesund essen', 'Zdrowe jedzenie', 'Healthy eating'], 'oepfu', ['oepfu', 'rueebli', 'brot', 'schoggi', 'guetzli', 'chueche', 'wasser'], ['k2-aesse-a', 'k2-aesse-b', 'k2-aesse-c'], {
    games: ['sort', 'whereIs', 'memory'],
    sort: { bins: [bin('Viu', 'Viel', 'Dużo', 'A lot', 'oepfu', ['oepfu', 'rueebli', 'brot']), bin('Mängisch', 'Manchmal', 'Czasami', 'Sometimes', 'schoggi', ['schoggi', 'guetzli', 'chueche'])] },
    tips: [['Na zakupach: dziecko wybiera jedno warzywo do kolacji.', 'Beim Einkaufen: das Kind wählt ein Gemüse fürs Abendessen.', 'Shopping: the child picks a vegetable for dinner.']],
    off: ['Ułóżcie razem kolorowy talerz warzyw.', 'Legt zusammen einen bunten Gemüseteller.', 'Make a colourful vegetable plate together.', 'k2-aesse-a'],
    sticker: 'rueebli',
  }),
  // ===================== 3. Klasse =====================
  lesson('k3-verb', 'k3', 'deutsch', ['Verbe', 'Verben', 'Czasowniki', 'Verbs'], 'pose-read', ['laese', 'schrybe', 'rede', 'zeige', 'lose'], ['k3-verb-a', 'k3-verb-b', 'k3-verb-c', 'k3-verb-d'], {
    games: ['tpr', 'whereIs', 'memory'],
    tips: [['Pantomima: jedna osoba pokazuje czynność, druga zgaduje czasownik.', 'Pantomime: eine Person zeigt eine Tätigkeit, die andere errät das Verb.', 'Mime: one person acts, the other guesses the verb.']],
    off: ['Przy kolacji: każdy mówi jedno zdanie z czasownikiem.', 'Beim Abendessen: jede Person sagt einen Satz mit einem Verb.', 'At dinner: everyone says one sentence with a verb.', 'k3-verb-d'],
    sticker: 'buech',
  }),
  lesson('k3-uhr', 'k3', 'mathe', ['D Uhr', 'Die Uhr', 'Zegar', 'The clock'], 'uhr', ['uhr', 'mittag'], ['k3-uhr-a', 'k3-uhr-b', 'k3-uhr-c'], {
    games: ['math', 'memory'],
    math: { mode: 'clock', prompt: 'k3-uhr-a' },
    tips: [['Pytajcie w ciągu dnia: „Wie spät isch es?” i patrzcie razem na zegar.', 'Fragt im Tagesverlauf: «Wie spät isch es?» und schaut zusammen auf die Uhr.', 'Ask during the day: “Wie spät isch es?” and look at the clock together.']],
    off: ['Ustawcie razem budzik na pełną godzinę.', 'Stellt zusammen einen Wecker auf eine volle Stunde.', 'Set an alarm clock to a full hour together.', 'k3-uhr-a'],
    sticker: 'uhr',
  }),
  lesson('k3-baern', 'k3', 'nmg', ['Üses Bärn', 'Unser Bern', 'Nasze Berno', 'Our Bern'], 'zytglogge', ['zytglogge', 'bruegg', 'baer', 'fahne'], ['k3-baern-a', 'k3-baern-b', 'k3-baern-c', 'k3-baern-d'], {
    games: ['whereIs', 'memory', 'speak'],
    tips: [['Wybierzcie się na Zytglogge o pełnej godzinie – figury się ruszają!', 'Geht zur vollen Stunde zum Zytglogge – die Figuren bewegen sich!', 'Visit the Zytglogge on the hour – the figures move!']],
    off: ['Spacer: Bärenpark, Aare i Bundeshaus.', 'Spaziergang: Bärenpark, Aare und Bundeshaus.', 'Walk: Bärenpark, the Aare and the Bundeshaus.', 'k3-baern-a'],
    sticker: 'baer',
  }),
  lesson('k3-pflanze', 'k3', 'nmg', ['Pflanze', 'Pflanzen', 'Rośliny', 'Plants'], 'bluem', ['bluem', 'boum', 'gras', 'blatt', 'tannzapfe'], ['k3-pflanze-a', 'k3-pflanze-b', 'k3-pflanze-c'], {
    games: ['whereIs', 'memory', 'speak'],
    tips: [['Posadźcie fasolę na wacie i codziennie mierzcie, ile urosła.', 'Pflanzt eine Bohne auf Watte und messt jeden Tag, wie viel sie gewachsen ist.', 'Plant a bean on cotton wool and measure every day how much it grew.']],
    off: ['Podlewajcie razem roślinę i obserwujcie ją przez tydzień.', 'Giesst zusammen eine Pflanze und beobachtet sie eine Woche lang.', 'Water a plant together and watch it for a week.', 'k3-pflanze-a'],
    sticker: 'boum',
  }),
  lesson('k3-fair', 'k3', 'sport', ['Fairplay', 'Fairplay', 'Fair play', 'Fair play'], 'bau', ['bau', 'spiuplatz', 'fruend'], ['k3-fair-a', 'k3-fair-b', 'k3-fair-c'], {
    games: ['tpr', 'memory', 'speak'],
    tips: [['Po grze planszowej: przegrany i zwycięzca podają sobie rękę.', 'Nach einem Brettspiel: Verlierer und Gewinner geben sich die Hand.', 'After a board game: the loser and the winner shake hands.']],
    off: ['Zagrajcie w grę i pogratulujcie zwycięzcy.', 'Spielt ein Spiel und gratuliert dem Gewinner.', 'Play a game and congratulate the winner.', 'k3-fair-b'],
    sticker: 'fruend',
  }),
]
export const SCHOOL_BY_ID: Record<string, Topic & { school: SchoolInfo }> = Object.fromEntries(SCHOOL_TOPICS.map((t) => [t.id, t]))
export const schoolLessons = (stage: Stage) => SCHOOL_TOPICS.filter((t) => t.school.stage === stage)
