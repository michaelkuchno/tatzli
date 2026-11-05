import type { L4, Level, Song, SongLine } from './types'

// 10 original songs / rhymes – lyrics and melodies written for Tatzli (no existing tunes reused).
// Melody notation per line: space-separated tokens "n" (semitones from C4).
//   suffix "_" = half beat, no suffix = 1 beat, "=" = 2 beats; "r" = rest.
// Each line's `beats` is computed from its notes, so melody total == sum of line beats.

const t = (be: string, de: string, pl: string, en: string): L4 => ({ be, de, pl, en })

type Note = { n: number | null; d: number }

function parseNotes(src: string): Note[] {
  return src
    .trim()
    .split(/\s+/)
    .map((tok) => {
      let d = 1
      let core = tok
      if (tok.endsWith('_')) {
        d = 0.5
        core = tok.slice(0, -1)
      } else if (tok.endsWith('=')) {
        d = 2
        core = tok.slice(0, -1)
      }
      return { n: core === 'r' ? null : Number(core), d }
    })
}

function song(id: string, title: L4, level: Level, bpm: number, illu: string, lines: [L4, string][]): Song {
  const melody: Note[] = []
  const out: SongLine[] = []
  for (const [src, notes] of lines) {
    const ns = parseNotes(notes)
    melody.push(...ns)
    out.push({ src, beats: ns.reduce((s, x) => s + x.d, 0) })
  }
  return { id, title, level, melody, bpm, lines: out, illu, origin: 'original' }
}

export const SONGS: Song[] = [
  song('guete-morge', t('Guete Morge', 'Guten Morgen', 'Dzień dobry', 'Good morning'), 1, 104, 'sunne', [
    [t('[Guete Morge]1, [guete Morge]2!', '[Guten Morgen]1, [guten Morgen]2!', '[Dzień dobry]1, [dzień dobry]2!', '[Good morning]1, [good morning]2!'), '7_ 4_ 7_ 4_ 9_ 7_ 5_ 4_'],
    [t('[D Sunne]1 [lachet]2 [übers Huus]3.', '[Die Sonne]1 [lacht]2 [übers Haus]3.', '[Słońce]1 [się śmieje]2 [nad domem]3.', '[The sun]1 [smiles]2 [over the house]3.'), '0_ 2_ 4_ 4_ 5_ 4_ 2'],
    [t('[Tatzli]1 [gumpet]2 [us em Bett]3,', '[Tatzli]1 [hüpft]2 [aus dem Bett]3,', '[Tatzli]1 [wyskakuje]2 [z łóżka]3,', '[Tatzli]1 [jumps]2 [out of bed]3,'), '7_ 4_ 7_ 4_ 9_ 7_ 4'],
    [t('[juhui]1, [mir]2 [göh]3 [use]4!', '[juhui]1, [wir]2 [gehen]3 [raus]4!', '[hurra]1, [wychodzimy]2+3 [na dwór]4!', '[hooray]1, [we]2 [go]3 [out]4!'), '2_ 4_ 5 4_ 2_ 0'],
  ]),

  song('wie-mache-d-tier', t('Wie mache d Tier?', 'Wie machen die Tiere?', 'Jak robią zwierzęta?', 'What do the animals say?'), 1, 108, 'chue', [
    [t('[D Chatz]1 [macht]2 [Miau, miau]3,', '[Die Katze]1 [macht]2 [Miau, miau]3,', '[Kot]1 [robi]2 [miau, miau]3,', '[The cat]1 [says]2 [meow, meow]3,'), '0 0 4_ 2_ 4_ 0_'],
    [t('[dr Hund]1 [macht]2 [Wau, wau]3,', '[der Hund]1 [macht]2 [Wau, wau]3,', '[pies]1 [robi]2 [hau, hau]3,', '[the dog]1 [says]2 [woof, woof]3,'), '2_ 2_ 2 5 4'],
    [t('[d Chue]1 [macht]2 [Muuh]3 [im Stau]4,', '[die Kuh]1 [macht]2 [Muh]3 [im Stall]4,', '[krowa]1 [robi]2 [muuu]3 [w oborze]4,', '[the cow]1 [says]2 [moo]3 [in the barn]4,'), '4 4 9 7_ 5_'],
    [t('[und]1 [Tatzli]2 [macht]3: [Brumm, brumm, brumm]4!', '[und]1 [Tatzli]2 [macht]3: [Brumm, brumm, brumm]4!', '[a]1 [Tatzli]2 [robi]3: [mrrr, mrrr, mrrr]4!', '[and]1 [Tatzli]2 [says]3: [grrr, grrr, grrr]4!'), '7_ 7_ 9_ 7_ 4_ 2_ 0'],
    [t('[Mir]1 [mache]2 [aui]3 [mit]4!', '[Wir]1 [machen]2 [alle]3 [mit]4!', '[Wszyscy]3 [razem]4 [robimy]1+2!', '[We]1 [all]3 [join]2 [in]4!'), '0_ 2_ 4_ 5_ 4 0'],
  ]),

  song('wo-isch-d-nase', t('Wo isch d Nase?', 'Wo ist die Nase?', 'Gdzie jest nosek?', 'Where is your nose?'), 1, 100, 'nase', [
    [t('[Wo]1 [isch]2 [d Nase]3? [Da]4 [isch]5 [d Nase]6!', '[Wo]1 [ist]2 [die Nase]3? [Da]4 [ist]5 [die Nase]6!', '[Gdzie]1 [jest]2 [nosek]3? [Tu]4 [jest]5 [nosek]6!', '[Where]1 [is]2 [your nose]3? [Here]4 [is]5 [your nose]6!'), '7_ 7_ 4_ 4_ 9_ 9_ 7'],
    [t('[Wo]1 [sy]2 [d Ohre]3? [Da]4 [sy]5 [d Ohre]6!', '[Wo]1 [sind]2 [die Ohren]3? [Da]4 [sind]5 [die Ohren]6!', '[Gdzie]1 [są]2 [uszy]3? [Tu]4 [są]5 [uszy]6!', '[Where]1 [are]2 [your ears]3? [Here]4 [are]5 [your ears]6!'), '7_ 7_ 4_ 4_ 5_ 5_ 2'],
    [t('[Chopf]1 [und]2 [Buuch]3 [und]4 [Fuess]5 [und]6 [Hand]7,', '[Kopf]1 [und]2 [Bauch]3 [und]4 [Fuss]5 [und]6 [Hand]7,', '[Głowa]1, [i]2 [brzuch]3, [i]4 [stopa]5, [i]6 [ręka]7,', '[Head]1 [and]2 [tummy]3, [and]4 [foot]5 [and]6 [hand]7,'), '0_ 0_ 4_ 4_ 7_ 7_ 9'],
    [t('[mir]1 [tanze]2 [dür ds ganze Land]3!', '[wir]1 [tanzen]2 [durch das ganze Land]3!', '[tańczymy]1+2 [przez cały kraj]3!', '[we]1 [dance]2 [across the land]3!'), '7_ 5_ 4_ 2_ 4_ 2_ 0'],
  ]),

  song('zelle-bis-fuef', t('Zelle bis füf', 'Zählen bis fünf', 'Liczymy do pięciu', 'Counting to five'), 1, 96, 'hand', [
    [t('[Eis]1, [zwöi]2, [drü]3, [vier]4,', '[Eins]1, [zwei]2, [drei]3, [vier]4,', '[Raz]1, [dwa]2, [trzy]3, [cztery]4,', '[One]1, [two]2, [three]3, [four]4,'), '0 2 4 5'],
    [t('[chumm]1 [und]2 [zell]3 [mit mir]4!', '[komm]1 [und]2 [zähl]3 [mit mir]4!', '[chodź]1 [i]2 [licz]3 [ze mną]4!', '[come]1 [and]2 [count]3 [with me]4!'), '7_ 7_ 5 4 2'],
    [t('[Füf]1 [Finger]2 [a dr Hand]3,', '[Fünf]1 [Finger]2 [an der Hand]3,', '[Pięć]1 [palców]2 [u ręki]3,', '[Five]1 [fingers]2 [on my hand]3,'), '4_ 4_ 5_ 5_ 7 7'],
    [t('[füf]1 [Steine]2 [im Sand]3!', '[fünf]1 [Steine]2 [im Sand]3!', '[pięć]1 [kamieni]2 [w piasku]3!', '[five]1 [stones]2 [in the sand]3!'), '9 7_ 5_ 4 2'],
    [t('[Eis]1, [zwöi]2, [drü]3, [vier]4, [füf]5 – [juhui]6!', '[Eins]1, [zwei]2, [drei]3, [vier]4, [fünf]5 – [juhui]6!', '[Raz]1, [dwa]2, [trzy]3, [cztery]4, [pięć]5 – [hurra]6!', '[One]1, [two]2, [three]3, [four]4, [five]5 – [hooray]6!'), '0_ 2_ 4_ 5_ 7_ 9_ 12'],
  ]),

  song('zaeh-staerne', t('Zäh Stärne', 'Zehn Sterne', 'Dziesięć gwiazd', 'Ten stars'), 2, 100, 'staern', [
    [t('[Eis]1, [zwöi]2, [drü]3, [vier]4, [füf]5,', '[Eins]1, [zwei]2, [drei]3, [vier]4, [fünf]5,', '[Raz]1, [dwa]2, [trzy]3, [cztery]4, [pięć]5,', '[One]1, [two]2, [three]3, [four]4, [five]5,'), '0_ 2_ 4_ 5_ 7='],
    [t('[füf Stärne]1 [chan i]2+3 [gseh]4!', '[fünf Sterne]1 [kann]2 [ich]3 [sehen]4!', '[pięć gwiazd]1 [mogę]2+3 [zobaczyć]4!', '[five stars]1 [I]3 [can]2 [see]4!'), '9_ 9_ 7_ 7_ 5 4'],
    [t('[sächs]1, [sibe]2, [acht]3, [nün]4, [zäh]5,', '[sechs]1, [sieben]2, [acht]3, [neun]4, [zehn]5,', '[sześć]1, [siedem]2, [osiem]3, [dziewięć]4, [dziesięć]5,', '[six]1, [seven]2, [eight]3, [nine]4, [ten]5,'), '7_ 9_ 7_ 5_ 4 2'],
    [t('[zäh Stärne]1 [chan i]2+3 [gseh]4!', '[zehn Sterne]1 [kann]2 [ich]3 [sehen]4!', '[dziesięć gwiazd]1 [mogę]2+3 [zobaczyć]4!', '[ten stars]1 [I]3 [can]2 [see]4!'), '9_ 9_ 7_ 7_ 2 0'],
    [t('[Gueti Nacht]1, [liebi Stärne]2!', '[Gute Nacht]1, [liebe Sterne]2!', '[Dobranoc]1, [kochane gwiazdki]2!', '[Good night]1, [dear stars]2!'), '4_ 5_ 7 9_ 7_ 0'],
  ]),

  song('dr-bus-fahrt-uf-baern', t('Dr Bus fahrt uf Bärn', 'Der Bus fährt nach Bern', 'Autobus jedzie do Berna', 'The bus goes to Bern'), 2, 112, 'bus', [
    [t('[Dr Bus]1 [fahrt]2 [uf Bärn]3, [uf Bärn]4,', '[Der Bus]1 [fährt]2 [nach Bern]3, [nach Bern]4,', '[Autobus]1 [jedzie]2 [do Berna]3, [do Berna]4,', '[The bus]1 [goes]2 [to Bern]3, [to Bern]4,'), '0_ 0_ 4_ 4_ 7 5_ 4_'],
    [t('[Tatzli]1 [fahrt]2 [so gärn]3!', '[Tatzli]1 [fährt]2 [so gern]3!', '[Tatzli]1 [jeździ]2 [tak chętnie]3!', '[Tatzli]1 [loves]3 [the ride]2!'), '2_ 2_ 4 2 0'],
    [t('[D Türe]1 [göh]2 [uf]3 – [pschhh]4,', '[Die Türen]1 [gehen]2 [auf]3 – [pschhh]4,', '[Drzwi]1 [się otwierają]2+3 – [pssst]4,', '[The doors]1 [open]2+3 – [pssh]4,'), '7_ 7_ 9 7 4'],
    [t('[Ystyge]1, [bitte]2 – [juhu]3!', '[Einsteigen]1, [bitte]2 – [juhu]3!', '[Wsiadamy]1, [proszę]2 – [juhu]3!', '[All aboard]1, [please]2 – [yoo-hoo]3!'), '5_ 5_ 5_ 4_ 2_ 2_ 0'],
    [t('[Dr Bus]1 [fahrt]2 [uf Bärn]3, [uf Bärn]4,', '[Der Bus]1 [fährt]2 [nach Bern]3, [nach Bern]4,', '[Autobus]1 [jedzie]2 [do Berna]3, [do Berna]4,', '[The bus]1 [goes]2 [to Bern]3, [to Bern]4,'), '0_ 0_ 4_ 4_ 7 5_ 4_'],
    [t('[Tatzli]1 [fahrt]2 [so gärn]3!', '[Tatzli]1 [fährt]2 [so gern]3!', '[Tatzli]1 [jeździ]2 [tak chętnie]3!', '[Tatzli]1 [loves]3 [the ride]2!'), '2_ 2_ 4 2 0='],
  ]),

  song('d-jahreszyte', t('D Jahreszyte', 'Die Jahreszeiten', 'Pory roku', 'The seasons'), 2, 96, 'raegeboge', [
    [t('[Im Früelig]1 [isch]2 [ds Gras]3 [so grüen]4,', '[Im Frühling]1 [ist]2 [das Gras]3 [so grün]4,', '[Wiosną]1 [trawa]3 [jest]2 [taka zielona]4,', '[In spring]1 [the grass]3 [is]2 [so green]4,'), '0_ 2_ 4_ 4_ 5_ 5_ 7'],
    [t('[im Summer]1 [isch]2 [d Aare]3 [blau]4,', '[im Sommer]1 [ist]2 [die Aare]3 [blau]4,', '[latem]1 [Aare]3 [jest]2 [niebieska]4,', '[in summer]1 [the Aare]3 [is]2 [blue]4,'), '9_ 9_ 7_ 7_ 5_ 4_ 2'],
    [t('[im Herbscht]1 [sy]2 [d Bletter]3 [rot]4,', '[im Herbst]1 [sind]2 [die Blätter]3 [rot]4,', '[jesienią]1 [liście]3 [są]2 [czerwone]4,', '[in autumn]1 [the leaves]3 [are]2 [red]4,'), '0_ 2_ 4 4_ 5_ 7'],
    [t('[im Winter]1 [isch]2 [dr Himu]3 [grau]4.', '[im Winter]1 [ist]2 [der Himmel]3 [grau]4.', '[zimą]1 [niebo]3 [jest]2 [szare]4.', '[in winter]1 [the sky]3 [is]2 [grey]4.'), '9_ 7_ 5_ 4_ 2_ 4_ 0'],
    [t('[Räge]1, [Sunne]2, [Wind]3 [und]4 [Schnee]5 –', '[Regen]1, [Sonne]2, [Wind]3 [und]4 [Schnee]5 –', '[Deszcz]1, [słońce]2, [wiatr]3 [i]4 [śnieg]5 –', '[Rain]1, [sun]2, [wind]3 [and]4 [snow]5 –'), '7_ 7_ 9_ 9_ 7_ 5_ 4'],
    [t('[Tatzli]1 [het]2 [aui]3 [gärn]4, [juhee]5!', '[Tatzli]1 [mag]2+4 [sie alle]3, [juhe]5!', '[Tatzli]1 [lubi]2+4 [je wszystkie]3, [hej]5!', '[Tatzli]1 [loves]2+4 [them all]3, [hooray]5!'), '5_ 5_ 4_ 4_ 2_ 4_ 0='],
  ]),

  song('samichlous-chumm', t('Samichlous, chumm!', 'Nikolaus, komm!', 'Mikołaju, przyjdź!', 'Saint Nicholas, come!'), 2, 92, 'samichlous', [
    [t('[Samichlous]1, [Samichlous]2,', '[Nikolaus]1, [Nikolaus]2,', '[Mikołaju]1, [Mikołaju]2,', '[Saint Nicholas]1, [Saint Nicholas]2,'), '7_ 4_ 7 7_ 4_ 7'],
    [t('[chumm]1 [zu üs]2 [is Huus]3!', '[komm]1 [zu uns]2 [ins Haus]3!', '[przyjdź]1 [do nas]2 [do domu]3!', '[come]1 [to us]2, [to our house]3!'), '9_ 9_ 7 5 4'],
    [t('[Dr Esu]1 [treit]2 [dr schwär Sack]3,', '[Der Esel]1 [trägt]2 [den schweren Sack]3,', '[Osiołek]1 [niesie]2 [ciężki worek]3,', '[The donkey]1 [carries]2 [the heavy sack]3,'), '0_ 0_ 2_ 4_ 5_ 4_ 2_ 0_'],
    [t('[tripp, trapp, tripp, trapp]1, [tick, tack]2!', '[tripp, trapp, tripp, trapp]1, [tick, tack]2!', '[tup, tup, tup, tup]1, [tik, tak]2!', '[clip, clop, clip, clop]1, [clickety-clack]2!'), '7_ 5_ 7_ 5_ 4 0'],
    [t('[Mir]1 [säge]2 [lut]3: [Merci viu mau]4,', '[Wir]1 [sagen]2 [laut]3: [Vielen Dank]4,', '[Mówimy]1+2 [głośno]3: [dziękujemy]4,', '[We]1 [say]2 [out loud]3: [thank you so]4,'), '4_ 4_ 5_ 7_ 9_ 9_ 7'],
    [t('[Samichlous]1, [chumm]2 [nomau]3!', '[Nikolaus]1, [komm]2 [wieder]3!', '[Mikołaju]1, [przyjdź]2 [znowu]3!', '[Saint Nicholas]1, [come]2 [again]3!'), '7_ 4_ 7 5_ 2_ 0='],
  ]),

  song('plitsch-platsch', t('Plitsch, platsch – Händ wäsche!', 'Plitsch, platsch – Hände waschen!', 'Plum, plusk – myjemy ręce!', 'Splish, splash – wash your hands!'), 1, 108, 'seife', [
    [t('[Händ]1 [is Wasser]2, [plitsch, platsch]3,', '[Hände]1 [ins Wasser]2, [plitsch, platsch]3,', '[Ręce]1 [do wody]2, [plum, plusk]3,', '[Hands]1 [in the water]2, [splish, splash]3,'), '4_ 4_ 2_ 2_ 0 0'],
    [t('[mit Seife]1 [rybe]2 – [ritsch, ratsch]3!', '[mit Seife]1 [reiben]2 – [ritsch, ratsch]3!', '[mydłem]1 [trzemy]2 – [szur, szur]3!', '[rub]2 [with soap]1 – [scritch, scratch]3!'), '5_ 5_ 4_ 4_ 2_ 2_ 0'],
    [t('[Ds Handtuech]1 [macht]2 [aues]3 [troche]4,', '[Das Handtuch]1 [macht]2 [alles]3 [trocken]4,', '[Ręcznik]1 [robi]2 [wszystko]3 [suche]4,', '[The towel]1 [makes]2 [it all]3 [dry]4,'), '7_ 7_ 9_ 7_ 5_ 4_ 5_ 7_'],
    [t('[jitz]1 [chöi]2 [mir]3 [mit Mami]4 [choche]5!', '[jetzt]1 [können]2 [wir]3 [mit Mama]4 [kochen]5!', '[teraz]1 [możemy]2+3 [z mamą]4 [gotować]5!', '[now]1 [we]3 [can]2 [cook]5 [with Mummy]4!'), '9_ 7_ 5_ 4_ 4_ 2_ 2_ 0_'],
    [t('[Ufruume]1, [ufruume]2, [jede Tag]3,', '[Aufräumen]1, [aufräumen]2, [jeden Tag]3,', '[Sprzątamy]1, [sprzątamy]2, [każdego dnia]3,', '[Tidy up]1, [tidy up]2, [every day]3,'), '0_ 2_ 4_ 0_ 2_ 4_ 5_ 4_'],
    [t('[d Chlötzli]1 [göh]2 [is Bett]3 – [das]4 [mag]5 [i]6!', '[die Klötze]1 [gehen]2 [ins Bett]3 – [das]4 [mag]5 [ich]6!', '[klocki]1 [idą]2 [spać]3 – [to]4 [lubię]5+6!', '[the blocks]1 [go]2 [to bed]3 – [I]6 [like]5 [that]4!'), '7_ 7_ 5_ 4_ 2_ 4_ 2_ 0_ 0='],
  ]),

  song('tatzli-geit-go-schlafe', t('Tatzli geit go schlafe', 'Tatzli geht schlafen', 'Tatzli idzie spać', 'Tatzli goes to sleep'), 1, 90, 'mond', [
    [t('[Tatzli]1 [geit]2 [go schlafe]3,', '[Tatzli]1 [geht]2 [schlafen]3,', '[Tatzli]1 [idzie]2 [spać]3,', '[Tatzli]1 [goes]2 [to sleep]3,'), '4_ 2_ 0 2_ 4_ 4'],
    [t('[dr Mond]1 [isch]2 [scho]3 [da]4,', '[der Mond]1 [ist]2 [schon]3 [da]4,', '[księżyc]1 [już]3 [jest]2 [tu]4,', '[the moon]1 [is]2 [already]3 [here]4,'), '5_ 4_ 2 2 0'],
    [t('[d Stärne]1 [lüüchte]2 [liisli]3,', '[die Sterne]1 [leuchten]2 [leise]3,', '[gwiazdki]1 [świecą]2 [cichutko]3,', '[the stars]1 [shine]2 [softly]3,'), '7_ 7_ 5_ 5_ 4_ 4_ 2'],
    [t('[Mami]1 [singt]2 [la-la]3.', '[Mama]1 [singt]2 [la-la]3.', '[mama]1 [śpiewa]2 [la-la]3.', '[Mummy]1 [sings]2 [la-la]3.'), '4_ 2_ 0 -1 0'],
    [t('[Gueti Nacht]1, [Tatzli]2, [schlaf]3 [guet]4 [und]5 [warm]6,', '[Gute Nacht]1, [Tatzli]2, [schlaf]3 [gut]4 [und]5 [warm]6,', '[Dobranoc]1, [Tatzli]2, [śpij]3 [dobrze]4 [i]5 [ciepło]6,', '[Good night]1, [Tatzli]2, [sleep]3 [tight]4 [and]5 [warm]6,'), '4_ 5_ 7 5_ 4_ 2_ 4_ 2='],
    [t('[dr Teddy]1 [i dym Arm]2.', '[den Teddy]1 [im Arm]2.', '[z misiem]1 [w ramionach]2.', '[with Teddy]1 [in your arm]2.'), '0_ 0_ 2_ 4_ 2 0='],
  ]),
]
