import type { L4, PlaceId, Pose, Season, SceneSpec, Story } from './types'

// 20 original mini-stories (6 × level 1, 7 × level 2, 7 × level 3).
// Alignment notation: see types.ts (AlignedSource). Every content word sits inside a [chunk]N.
// Branching: a page with `choice` jumps to options[i].next; other pages continue with index+1;
// pages with `end: true` finish the story. Level 2: one choice → two short endings.
// Level 3: choice → branch page (with a second choice) → one of two endings.

const t = (be: string, de: string, pl: string, en: string): L4 => ({ be, de, pl, en })

type Item = SceneSpec['items'][number]
const it = (key: string, x: number, y: number, extra: { scale?: number; pose?: Pose; flip?: boolean } = {}): Item => ({ key, x, y, ...extra })
const sc = (place: PlaceId, items: Item[], season?: Season, time?: SceneSpec['time']): SceneSpec => ({
  place,
  items,
  ...(season ? { season } : {}),
  ...(time ? { time } : {}),
})

export const STORIES: Story[] = [
  // =====================================================================
  // LEVEL 1 – Chlyni Bärli (2–3): 3–4 pages, very concrete, no choices
  // =====================================================================
  {
    id: 'wo-isch-d-chatz',
    title: t('Wo isch d Chatz?', 'Wo ist die Katze?', 'Gdzie jest kot?', 'Where is the cat?'),
    level: 1,
    place: 'home',
    words: ['chatz', 'bett', 'stueu', 'sofa', 'baer', 'teddy', 'socke'],
    pages: [
      {
        scene: sc('home', [it('tatzli', 45, 78, { pose: 'look' }), it('sofa', 78, 74), it('stueu', 18, 76)]),
        text: t(
          '[Wo]1 [isch]2 [d Chatz]3? [Suech]4 [mit]5!',
          '[Wo]1 [ist]2 [die Katze]3? [Such]4 [mit]5!',
          '[Gdzie]1 [jest]2 [kot]3? [Szukaj]4 [z nami]5!',
          '[Where]1 [is]2 [the cat]3? [Look]4 [with us]5!',
        ),
      },
      {
        scene: sc('home', [it('bett', 60, 74, { scale: 1.3 }), it('teddy', 60, 64, { scale: 0.6 }), it('tatzli', 30, 78, { pose: 'look' })]),
        text: t(
          '[Im Bett]1? [Nei]2! [Das]3 [isch]4 [dr Teddy]5. [Brumm]6!',
          '[Im Bett]1? [Nein]2! [Das]3 [ist]4 [der Teddy]5. [Brumm]6!',
          '[W łóżku]1? [Nie]2! [To]3 [jest]4 [miś]5. [Mrrr]6!',
          '[In the bed]1? [No]2! [That]3 [is]4 [Teddy]5. [Grrr]6!',
        ),
      },
      {
        scene: sc('home', [it('stueu', 60, 76, { scale: 1.2 }), it('socke', 60, 64, { scale: 0.5 }), it('tatzli', 30, 78, { pose: 'laugh' })]),
        text: t(
          '[Uf em Stueu]1? [Nei]2! [Das]3 [isch]4 [e Socke]5. [Hihi]6!',
          '[Auf dem Stuhl]1? [Nein]2! [Das]3 [ist]4 [eine Socke]5. [Hihi]6!',
          '[Na krześle]1? [Nie]2! [To]3 [jest]4 [skarpetka]5. [Hihi]6!',
          '[On the chair]1? [No]2! [That]3 [is]4 [a sock]5. [Hee hee]6!',
        ),
      },
      {
        scene: sc('home', [it('sofa', 62, 74, { scale: 1.3 }), it('chatz', 64, 62), it('tatzli', 28, 78, { pose: 'point' }), it('heart-small', 46, 50)]),
        text: t(
          '[Uf em Sofa]1! [Da]2 [isch]3 [d Chatz]4! [Miau]5!',
          '[Auf dem Sofa]1! [Da]2 [ist]3 [die Katze]4! [Miau]5!',
          '[Na kanapie]1! [Tu]2 [jest]3 [kot]4! [Miau]5!',
          '[On the sofa]1! [There]2 [is]3 [the cat]4! [Meow]5!',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'zmorge-mit-mami',
    title: t('Zmorge mit Mami', 'Frühstück mit Mama', 'Śniadanie z mamą', 'Breakfast with Mummy'),
    level: 1,
    place: 'kitchen',
    words: ['zmorge', 'mami', 'miuch', 'brot', 'chaes', 'morge', 'buuch', 'luege'],
    pages: [
      {
        scene: sc('kitchen', [it('tatzli', 35, 78, { pose: 'wave' }), it('mami-baer', 65, 76)], undefined, 'day'),
        text: t(
          '[Guete Morge]1, [Tatzli]2! [Säg o]3: «[Guete Morge]4!»',
          '[Guten Morgen]1, [Tatzli]2! [Sag auch]3: «[Guten Morgen]4!»',
          '[Dzień dobry]1, [Tatzli]2! [Powiedz też]3: „[Dzień dobry]4!”',
          '[Good morning]1, [Tatzli]2! [You say it too]3: “[Good morning]4!”',
        ),
      },
      {
        scene: sc('kitchen', [it('tatzli', 30, 78, { pose: 'sit' }), it('tisch', 50, 80, { scale: 1.3 }), it('mami-baer', 72, 76, { pose: 'give' }), it('miuch', 58, 64, { scale: 0.6 })]),
        text: t(
          '[Tatzli]1 [het]2 [Hunger]3. [Dr Buuch]4 [macht]5: [Grrr]6! [Mami]7 [bringt]8 [Miuch]9.',
          '[Tatzli]1 [hat]2 [Hunger]3. [Der Bauch]4 [macht]5: [Grrr]6! [Mama]7 [bringt]8 [Milch]9.',
          '[Tatzli]1 [jest głodny]2+3. [Brzuszek]4 [robi]5: [burrr]6! [Mama]7 [przynosi]8 [mleko]9.',
          '[Tatzli]1 [is]2 [hungry]3. [His tummy]4 [goes]5: [grrr]6! [Mummy]7 [brings]8 [milk]9.',
        ),
      },
      {
        scene: sc('kitchen', [it('tatzli', 35, 78, { pose: 'laugh' }), it('tisch', 55, 80, { scale: 1.3 }), it('brot', 58, 64, { scale: 0.6 }), it('chaes', 38, 58, { scale: 0.6 })]),
        text: t(
          '[Brot]1 [und]2 [Chäs]3. [Tatzli]4 [luegt]5 [dür ds Chäsloch]6: [Kuckuck]7! [Mmh]8, [fein]9!',
          '[Brot]1 [und]2 [Käse]3. [Tatzli]4 [schaut]5 [durch das Käseloch]6: [Kuckuck]7! [Mmh]8, [lecker]9!',
          '[Chleb]1 [i]2 [ser]3. [Tatzli]4 [patrzy]5 [przez dziurkę w serze]6: [a kuku]7! [Mmm]8, [pyszne]9!',
          '[Bread]1 [and]2 [cheese]3. [Tatzli]4 [looks]5 [through the cheese hole]6: [peekaboo]7! [Mmm]8, [yummy]9!',
        ),
      },
      {
        scene: sc('kitchen', [it('tatzli', 30, 78, { pose: 'laugh' }), it('lotti', 50, 80), it('mami-baer', 72, 76), it('tisch', 50, 82, { scale: 1.4 }), it('heart-small', 50, 45)]),
        text: t(
          '[Lotti]1 [chunnt]2 [o]3. [E Guete]4!',
          '[Lotti]1 [kommt]2 [auch]3. [Guten Appetit]4!',
          '[Lotti]1 [też]3 [przychodzi]2. [Smacznego]4!',
          '[Lotti]1 [comes]2 [too]3. [Enjoy your breakfast]4!',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'tatzli-und-dr-bau',
    title: t('Tatzli und dr Bau', 'Tatzli und der Ball', 'Tatzli i piłka', 'Tatzli and the ball'),
    level: 1,
    place: 'playground',
    words: ['bau', 'rot', 'gumpe', 'sandchaschte', 'spile', 'spiuplatz'],
    pages: [
      {
        scene: sc('playground', [it('tatzli', 40, 78, { pose: 'take' }), it('bau', 55, 66, { scale: 0.6 })], 'summer'),
        text: t(
          '[Tatzli]1 [het]2 [e Bau]3. [Dr Bau]4 [isch]5 [rot]6.',
          '[Tatzli]1 [hat]2 [einen Ball]3. [Der Ball]4 [ist]5 [rot]6.',
          '[Tatzli]1 [ma]2 [piłkę]3. [Piłka]4 [jest]5 [czerwona]6.',
          '[Tatzli]1 [has]2 [a ball]3. [The ball]4 [is]5 [red]6.',
        ),
      },
      {
        scene: sc('playground', [it('tatzli', 30, 78, { pose: 'jump' }), it('bau', 60, 50, { scale: 0.6 }), it('sparkle', 66, 44, { scale: 0.5 })], 'summer'),
        text: t(
          '[Dr Bau]1 [gumpet]2: [hopp, hopp, hopp]3! [Gump]4 [mit]5!',
          '[Der Ball]1 [springt]2: [hopp, hopp, hopp]3! [Spring]4 [mit]5!',
          '[Piłka]1 [skacze]2: [hop, hop, hop]3! [Skacz]4 [razem]5!',
          '[The ball]1 [bounces]2: [boing, boing, boing]3! [Jump]4 [along]5!',
        ),
      },
      {
        scene: sc('playground', [it('tatzli', 25, 78, { pose: 'sit' }), it('sandchaschte', 65, 80, { scale: 1.4 }), it('bau', 65, 72, { scale: 0.5 })], 'summer'),
        text: t(
          '[Wo]1 [isch]2 [dr Bau]3? [Im Sandchaschte]4! [Tatzli]5 [gheit]6 [um]7. [Plumps]8!',
          '[Wo]1 [ist]2 [der Ball]3? [Im Sandkasten]4! [Tatzli]5 [fällt]6 [um]7. [Plumps]8!',
          '[Gdzie]1 [jest]2 [piłka]3? [W piaskownicy]4! [Tatzli]5 [się przewraca]6+7. [Bęc]8!',
          '[Where]1 [is]2 [the ball]3? [In the sandpit]4! [Tatzli]5 [falls]6 [over]7. [Bump]8!',
        ),
      },
      {
        scene: sc('playground', [it('lotti', 60, 80, { pose: 'give' }), it('bau', 52, 68, { scale: 0.5 }), it('tatzli', 35, 78, { pose: 'laugh' }), it('heart-small', 48, 45)], 'summer'),
        text: t(
          '[Lotti]1 [bringt]2 [dr Bau]3. [Merci]4, [Lotti]5! [Mir]6 [spile]7 [zäme]8.',
          '[Lotti]1 [bringt]2 [den Ball]3. [Danke]4, [Lotti]5! [Wir]6 [spielen]7 [zusammen]8.',
          '[Lotti]1 [przynosi]2 [piłkę]3. [Dziękuję]4, [Lotti]5! [Bawimy się]6+7 [razem]8.',
          '[Lotti]1 [brings]2 [the ball]3. [Thank you]4, [Lotti]5! [We]6 [play]7 [together]8.',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'gueti-nacht-tatzli',
    title: t('Gueti Nacht, Tatzli', 'Gute Nacht, Tatzli', 'Dobranoc, Tatzli', 'Good night, Tatzli'),
    level: 1,
    place: 'room',
    words: ['nacht', 'mond', 'pyjama', 'blau', 'teddy', 'umarme', 'mami', 'schlafe', 'bett', 'chopf', 'zeige', 'liisli'],
    pages: [
      {
        scene: sc('room', [it('mond', 80, 18, { scale: 0.7 }), it('staern', 65, 12, { scale: 0.4 }), it('tatzli', 40, 78, { pose: 'look' }), it('bett', 20, 76)], undefined, 'night'),
        text: t(
          '[Es]1 [isch]2 [Nacht]3. [Dr Mond]4 [schynt]5.',
          '[Es]1 [ist]2 [Nacht]3. [Der Mond]4 [scheint]5.',
          '[Jest]1+2 [noc]3. [Księżyc]4 [świeci]5.',
          '[It]1 [is]2 [night]3. [The moon]4 [is shining]5.',
        ),
      },
      {
        scene: sc('room', [it('tatzli', 45, 78, { pose: 'laugh' }), it('pyjama', 45, 50, { scale: 0.6 })], undefined, 'night'),
        text: t(
          '[Ds Pyschi]1 [isch]2 [blau]3. [Hoppla]4! [Ds Pyschi]5 [isch]6 [uf em Chopf]7!',
          '[Der Schlafanzug]1 [ist]2 [blau]3. [Hoppla]4! [Der Schlafanzug]5 [ist]6 [auf dem Kopf]7!',
          '[Piżama]1 [jest]2 [niebieska]3. [Ojej]4! [Piżama]5 [jest]6 [na głowie]7!',
          '[The pyjamas]1 [are]2 [blue]3. [Oops]4! [The pyjamas]5 [are]6 [on his head]7!',
        ),
      },
      {
        scene: sc('room', [it('bett', 50, 76, { scale: 1.4 }), it('chuessi', 40, 66, { scale: 0.6 }), it('teddy', 60, 66, { scale: 0.6 }), it('tatzli', 25, 78, { pose: 'hug' })], undefined, 'night'),
        text: t(
          '[Wo]1 [isch]2 [dr Teddy]3? [Zeig]4 [mau]5! [Da]6! [Tatzli]7 [ärfelet]8 [dr Teddy]9.',
          '[Wo]1 [ist]2 [der Teddy]3? [Zeig]4 [mal]5! [Da]6! [Tatzli]7 [umarmt]8 [den Teddy]9.',
          '[Gdzie]1 [jest]2 [miś]3? [Pokaż]4+5! [Tutaj]6! [Tatzli]7 [przytula]8 [misia]9.',
          '[Where]1 [is]2 [Teddy]3? [Show me]4+5! [There]6! [Tatzli]7 [hugs]8 [Teddy]9.',
        ),
      },
      {
        scene: sc('room', [it('bett', 50, 76, { scale: 1.4 }), it('tatzli', 48, 68, { pose: 'sleep' }), it('teddy', 58, 66, { scale: 0.5 }), it('mami-baer', 78, 76, { pose: 'wave' }), it('mond', 85, 15, { scale: 0.6 })], undefined, 'night'),
        text: t(
          '[Mami]1 [seit]2: «[Gueti Nacht]3, [Tatzli]4!» [Tatzli]5 [schlaft]6. [Psst]7, [lysli]8!',
          '[Mama]1 [sagt]2: «[Gute Nacht]3, [Tatzli]4!» [Tatzli]5 [schläft]6. [Psst]7, [leise]8!',
          '[Mama]1 [mówi]2: „[Dobranoc]3, [Tatzli]4!” [Tatzli]5 [śpi]6. [Ćśś]7, [cichutko]8!',
          '[Mummy]1 [says]2: “[Good night]3, [Tatzli]4!” [Tatzli]5 [sleeps]6. [Shh]7, [quietly]8!',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'schoeni-oschtere',
    title: t('Schöni Oschtere!', 'Frohe Ostern!', 'Wesołych Świąt!', 'Happy Easter!'),
    level: 1,
    place: 'garden',
    words: ['oschterhaas', 'oschterei', 'n1', 'n2', 'n3', 'rot', 'blau', 'gaeub', 'lache', 'huet', 'garte', 'zitrone', 'zelle'],
    pages: [
      {
        scene: sc('garden', [it('tatzli', 35, 78, { pose: 'armsUp' }), it('lotti', 60, 80), it('bluem', 82, 80, { scale: 0.6 })], 'spring'),
        text: t('[Hüt]1 [isch]2 [Oschtere]3!', '[Heute]1 [ist]2 [Ostern]3!', '[Dziś]1 [jest]2 [Wielkanoc]3!', '[Today]1 [is]2 [Easter]3!'),
      },
      {
        scene: sc('garden', [it('oschterhaas', 75, 76), it('boum', 88, 70, { scale: 1.4 }), it('tatzli', 30, 78, { pose: 'point' })], 'spring'),
        text: t(
          '[Lueg mau]1! [Dr Oschterhaas]2 [isch cho]3! [Wo]4 [sy]5 [d Eier]6?',
          '[Schau mal]1! [Der Osterhase]2 [ist gekommen]3! [Wo]4 [sind]5 [die Eier]6?',
          '[Patrz]1! [Zajączek]2 [przyszedł]3! [Gdzie]4 [są]5 [jajka]6?',
          '[Look]1! [The Easter bunny]2 [has come]3! [Where]4 [are]5 [the eggs]6?',
        ),
      },
      {
        scene: sc('garden', [it('tatzli', 25, 78, { pose: 'count' }), it('oschterei', 50, 82, { scale: 0.5 }), it('oschterei', 62, 80, { scale: 0.5 }), it('oschterei', 74, 82, { scale: 0.5 }), it('basket', 88, 80, { scale: 0.7 })], 'spring'),
        text: t(
          '[Zell]1 [mit]2: [eis]3, [zwöi]4, [drü]5 [Oschtereier]6! [Rot]7, [blau]8, [gäub]9!',
          '[Zähl]1 [mit]2: [eins]3, [zwei]4, [drei]5 [Ostereier]6! [Rot]7, [blau]8, [gelb]9!',
          '[Licz]1 [razem]2: [jedna]3, [dwie]4, [trzy]5 [pisanki]6! [Czerwona]7, [niebieska]8, [żółta]9!',
          '[Count]1 [along]2: [one]3, [two]4, [three]5 [Easter eggs]6! [Red]7, [blue]8, [yellow]9!',
        ),
      },
      {
        scene: sc('garden', [it('tatzli', 35, 78, { pose: 'laugh' }), it('lotti', 55, 80, { pose: 'laugh' }), it('basket', 45, 84, { scale: 0.7 }), it('zitrone', 45, 72, { scale: 0.4 }), it('oschterhaas', 80, 76, { pose: 'wave' }), it('heart-small', 45, 45)], 'spring'),
        text: t(
          '[Und]1 [das]2 [gäube Ei]3? [Nei]4, [das]5 [isch]6 [e Zitrone]7! [Aui]8 [lache]9. [Schöni Oschtere]10!',
          '[Und]1 [das]2 [gelbe Ei]3? [Nein]4, [das]5 [ist]6 [eine Zitrone]7! [Alle]8 [lachen]9. [Frohe Ostern]10!',
          '[A]1 [to]2 [żółte jajko]3? [Nie]4, [to]5 [jest]6 [cytryna]7! [Wszyscy]8 [się śmieją]9. [Wesołych Świąt]10!',
          '[And]1 [this]2 [yellow egg]3? [No]4, [it]5 [is]6 [a lemon]7! [Everyone]8 [laughs]9. [Happy Easter]10!',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'im-baerepark',
    title: t('Im Bärepark', 'Im Bärenpark', 'W parku niedźwiedzi', 'At the bear park'),
    level: 1,
    place: 'baerepark',
    words: ['baer', 'papi', 'gross', 'bire', 'winke', 'aesse', 'lache'],
    pages: [
      {
        scene: sc('baerepark', [it('tatzli', 35, 78, { pose: 'walk' }), it('papi-baer', 55, 76, { pose: 'walk' })]),
        text: t(
          '[Tatzli]1 [und]2 [Papi]3 [göh]4 [zum Bärepark]5.',
          '[Tatzli]1 [und]2 [Papa]3 [gehen]4 [zum Bärenpark]5.',
          '[Tatzli]1 [i]2 [tata]3 [idą]4 [do parku niedźwiedzi]5.',
          '[Tatzli]1 [and]2 [Daddy]3 [go]4 [to the bear park]5.',
        ),
      },
      {
        scene: sc('baerepark', [it('baer', 70, 72, { scale: 1.6 }), it('tatzli', 25, 78, { pose: 'point' }), it('papi-baer', 40, 76)]),
        text: t(
          '[Lueg mau]1! [E grosse Bär]2! [Wie macht]3 [dr Bär]4?',
          '[Schau mal]1! [Ein grosser Bär]2! [Wie macht]3 [der Bär]4?',
          '[Patrz]1! [Duży niedźwiedź]2! [Jak robi]3 [niedźwiedź]4?',
          '[Look]1! [A big bear]2! [What does the bear say]3+4?',
        ),
      },
      {
        scene: sc('baerepark', [it('baer', 65, 72, { scale: 1.6, pose: 'eat' }), it('bire', 58, 62, { scale: 0.5 }), it('tatzli', 25, 78, { pose: 'look' })]),
        text: t(
          '[Dr Bär]1 [isst]2 [e Bire]3. [Mmh]4!',
          '[Der Bär]1 [isst]2 [eine Birne]3. [Mmh]4!',
          '[Niedźwiedź]1 [je]2 [gruszkę]3. [Mmm]4!',
          '[The bear]1 [eats]2 [a pear]3. [Mmm]4!',
        ),
      },
      {
        scene: sc('baerepark', [it('baer', 68, 72, { scale: 1.6, pose: 'wave' }), it('tatzli', 28, 78, { pose: 'wave' }), it('papi-baer', 42, 76, { pose: 'laugh' }), it('heart-small', 50, 40)]),
        text: t(
          '[Tatzli]1 [winkt]2: «[Miau]3!» [Dr Bär]4 [seit]5: «[Nei]6! [Brumm brumm]7!» [Papi]8 [lacht]9.',
          '[Tatzli]1 [winkt]2: «[Miau]3!» [Der Bär]4 [sagt]5: «[Nein]6! [Brumm brumm]7!» [Papa]8 [lacht]9.',
          '[Tatzli]1 [macha]2: „[Miau]3!” [Niedźwiedź]4 [mówi]5: „[Nie]6! [Mrrr]7!” [Tata]8 [się śmieje]9.',
          '[Tatzli]1 [waves]2: “[Meow]3!” [The bear]4 [says]5: “[No]6! [Grrr]7!” [Daddy]8 [laughs]9.',
        ),
        end: true,
      },
    ],
  },

  // =====================================================================
  // LEVEL 2 – Chindsgi (4–5): 4–5 pages, exactly one choice with 2 options
  // =====================================================================
  {
    id: 'mit-em-bus-uf-baern',
    title: t('Mit em Bus uf Bärn', 'Mit dem Bus nach Bern', 'Autobusem do Berna', 'By bus to Bern'),
    level: 2,
    place: 'bus',
    words: ['bus', 'grosi', 'haltesteu', 'rot', 'faenschter', 'zytglogge', 'singe', 'hocke', 'fahre', 'nase', 'lut'],
    pages: [
      {
        scene: sc('bus', [it('grosi-baer', 40, 76), it('tatzli', 58, 78, { pose: 'look' }), it('haltesteu', 80, 72)]),
        text: t(
          '[Grosi]1 [und]2 [Tatzli]3 [warte]4 [bi dr Haltesteu]5.',
          '[Oma]1 [und]2 [Tatzli]3 [warten]4 [an der Haltestelle]5.',
          '[Babcia]1 [i]2 [Tatzli]3 [czekają]4 [na przystanku]5.',
          '[Granny]1 [and]2 [Tatzli]3 [wait]4 [at the bus stop]5.',
        ),
      },
      {
        scene: sc('bus', [it('bus', 65, 70, { scale: 2 }), it('tatzli', 25, 78, { pose: 'point' }), it('grosi-baer', 12, 76)]),
        text: t(
          '[Dr Bus]1 [chunnt]2! [Er]3 [isch]4 [rot]5. [Pschhh]6 – [d Türe]7 [göh uf]8! [Grosi]9 [seit]10: «[Ystyge]11!»',
          '[Der Bus]1 [kommt]2! [Er]3 [ist]4 [rot]5. [Pschhh]6 – [die Türen]7 [gehen auf]8! [Oma]9 [sagt]10: «[Einsteigen]11!»',
          '[Autobus]1 [jedzie]2! [Jest]3+4 [czerwony]5. [Pssst]6 – [drzwi]7 [się otwierają]8! [Babcia]9 [mówi]10: „[Wsiadamy]11!”',
          '[The bus]1 [is coming]2! [It]3 [is]4 [red]5. [Pssh]6 – [the doors]7 [open]8! [Granny]9 [says]10: “[All aboard]11!”',
        ),
      },
      {
        scene: sc('bus', [it('tatzli', 40, 78, { pose: 'stand' }), it('grosi-baer', 60, 76, { pose: 'sit' }), it('faenschter', 25, 45, { scale: 0.8 })]),
        text: t(
          '[Dr Bus]1 [fahrt]2. [Brumm, brumm]3! [Mach mit]4: [brumm, brumm]5!',
          '[Der Bus]1 [fährt]2. [Brumm, brumm]3! [Mach mit]4: [brumm, brumm]5!',
          '[Autobus]1 [rusza]2. [Brum, brum]3! [Ty też]4: [brum, brum]5!',
          '[The bus]1 [drives off]2. [Vroom, vroom]3! [Join in]4: [vroom, vroom]5!',
        ),
        choice: {
          prompt: t('[Wo]1 [hocket]2 [Tatzli]3?', '[Wo]1 [sitzt]2 [Tatzli]3?', '[Gdzie]1 [siedzi]2 [Tatzli]3?', '[Where]1 [does Tatzli]3 [sit]2?'),
          options: [
            { label: t('[Bim Fänschter]1', '[Am Fenster]1', '[Przy oknie]1', '[By the window]1'), illu: 'faenschter', next: 3 },
            { label: t('[Bim Grosi]1', '[Bei Oma]1', '[Przy babci]1', '[With Granny]1'), illu: 'grosi-baer', next: 4 },
          ],
        },
      },
      {
        scene: sc('bus', [it('tatzli', 35, 76, { pose: 'look' }), it('faenschter', 55, 45, { scale: 1.2 }), it('zytglogge', 58, 40, { scale: 0.6 }), it('sparkle', 70, 30, { scale: 0.5 })]),
        text: t(
          '[Tatzli]1 [drückt]2 [d Nase]3 [as Fänschter]4. [Lueg mau]5: [dr Zytglogge]6! [Juhui]7, [Bärn]8!',
          '[Tatzli]1 [drückt]2 [die Nase]3 [ans Fenster]4. [Schau mal]5: [der Zeitglockenturm]6! [Juhui]7, [Bern]8!',
          '[Tatzli]1 [przyciska]2 [nos]3 [do szyby]4. [Patrz]5: [wieża zegarowa]6! [Hurra]7, [Berno]8!',
          '[Tatzli]1 [presses]2 [his nose]3 [against the window]4. [Look]5: [the clock tower]6! [Hooray]7, [Bern]8!',
        ),
        end: true,
      },
      {
        scene: sc('bus', [it('grosi-baer', 55, 76, { pose: 'sing' }), it('tatzli', 38, 76, { pose: 'sing' }), it('heart-small', 47, 45)]),
        text: t(
          '[Grosi]1 [singt]2 [es Lied]3. [Tatzli]4 [singt]5 [mit]6 – [ganz lut]7! [Und scho]8 [sy si]9 [z Bärn]10!',
          '[Oma]1 [singt]2 [ein Lied]3. [Tatzli]4 [singt]5 [mit]6 – [ganz laut]7! [Und schon]8 [sind sie]9 [in Bern]10!',
          '[Babcia]1 [śpiewa]2 [piosenkę]3. [Tatzli]4 [śpiewa]5 [razem z nią]6 – [bardzo głośno]7! [I już]8 [są]9 [w Bernie]10!',
          '[Granny]1 [sings]2 [a song]3. [Tatzli]4 [sings]5 [along]6 – [very loudly]7! [And soon]8 [they are]9 [in Bern]10!',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'ds-znueni-im-chindsgi',
    title: t('Ds Znüni im Chindsgi', 'Der Znüni im Kindergarten', 'Drugie śniadanie w przedszkolu', 'Snack time at kindergarten'),
    level: 2,
    place: 'chindsgi',
    words: ['chindsgi', 'pouse', 'znueni', 'oepfu', 'rueebli', 'fruend', 'lache', 'buuch'],
    pages: [
      {
        scene: sc('chindsgi', [it('tatzli', 30, 78, { pose: 'wave' }), it('kasia', 55, 80, { pose: 'wave' }), it('freddie', 75, 78, { pose: 'wave' })]),
        text: t(
          '[Tatzli]1 [isch]2 [im Chindsgi]3. [Kasia]4 [und]5 [Freddie]6 [sy]7 [o]8 [da]9.',
          '[Tatzli]1 [ist]2 [im Kindergarten]3. [Kasia]4 [und]5 [Freddie]6 [sind]7 [auch]8 [da]9.',
          '[Tatzli]1 [jest]2 [w przedszkolu]3. [Kasia]4 [i]5 [Freddie]6 [też]8 [są]7 [tutaj]9.',
          '[Tatzli]1 [is]2 [at kindergarten]3. [Kasia]4 [and]5 [Freddie]6 [are]7 [here]9 [too]8.',
        ),
      },
      {
        scene: sc('chindsgi', [it('freddie', 65, 78, { pose: 'cry' }), it('tatzli', 35, 78, { pose: 'look' }), it('kasia', 85, 80)]),
        text: t(
          '[Es]1 [isch]2 [Pouse]3. [Oh nei]4! [Freddie]5 [het]6 [kes Znüni]7. [Dr Buuch]8 [macht]9: [Grrr]10!',
          '[Es]1 [ist]2 [Pause]3. [Oh nein]4! [Freddie]5 [hat]6 [keinen Znüni]7. [Der Bauch]8 [macht]9: [Grrr]10!',
          '[Jest]1+2 [przerwa]3. [O nie]4! [Freddie]5 [nie ma]6 [drugiego śniadania]7. [Brzuszek]8 [robi]9: [burrr]10!',
          '[It]1 [is]2 [break time]3. [Oh no]4! [Freddie]5 [has]6 [no snack]7. [His tummy]8 [goes]9: [grrr]10!',
        ),
      },
      {
        scene: sc('chindsgi', [it('tatzli', 40, 78, { pose: 'point' }), it('oepfu', 55, 62, { scale: 0.5 }), it('rueebli', 65, 62, { scale: 0.5 }), it('freddie', 82, 78)]),
        text: t(
          '[Tatzli]1 [het]2 [en Öpfu]3 [und]4 [es Rüebli]5. [Grrr]6! [Scho wider]7 [dr Buuch]8!',
          '[Tatzli]1 [hat]2 [einen Apfel]3 [und]4 [eine Karotte]5. [Grrr]6! [Schon wieder]7 [der Bauch]8!',
          '[Tatzli]1 [ma]2 [jabłko]3 [i]4 [marchewkę]5. [Burrr]6! [Znowu]7 [ten brzuszek]8!',
          '[Tatzli]1 [has]2 [an apple]3 [and]4 [a carrot]5. [Grrr]6! [That tummy]8 [again]7!',
        ),
        choice: {
          prompt: t('[Was]1 [teilt]2 [Tatzli]3?', '[Was]1 [teilt]2 [Tatzli]3?', '[Czym]1 [dzieli się]2 [Tatzli]3?', '[What]1 [does Tatzli]3 [share]2?'),
          options: [
            { label: t('[Dr Öpfu]1', '[Den Apfel]1', '[Jabłkiem]1', '[The apple]1'), illu: 'oepfu', next: 3 },
            { label: t('[Ds Rüebli]1', '[Die Karotte]1', '[Marchewką]1', '[The carrot]1'), illu: 'rueebli', next: 4 },
          ],
        },
      },
      {
        scene: sc('chindsgi', [it('tatzli', 35, 78, { pose: 'give' }), it('oepfu', 50, 64, { scale: 0.5 }), it('freddie', 62, 78, { pose: 'eat' }), it('kasia', 82, 80, { pose: 'clap' }), it('heart-small', 50, 42)]),
        text: t(
          '[Tatzli]1 [teilt]2 [dr Öpfu]3 [mit Freddie]4. [Mampf]5! [Freddie]6 [seit]7: «[Thank you]8!» [Kasia]9 [rüeft]10: «[Smacznego]11!»',
          '[Tatzli]1 [teilt]2 [den Apfel]3 [mit Freddie]4. [Mampf]5! [Freddie]6 [sagt]7: «[Thank you]8!» [Kasia]9 [ruft]10: «[Smacznego]11!»',
          '[Tatzli]1 [dzieli się]2 [jabłkiem]3 [z Freddiem]4. [Mniam]5! [Freddie]6 [mówi]7: „[Thank you]8!” [Kasia]9 [woła]10: „[Smacznego]11!”',
          '[Tatzli]1 [shares]2 [the apple]3 [with Freddie]4. [Munch]5! [Freddie]6 [says]7: “[Thank you]8!” [Kasia]9 [calls]10: “[Smacznego]11!”',
        ),
        end: true,
      },
      {
        scene: sc('chindsgi', [it('tatzli', 35, 78, { pose: 'give' }), it('rueebli', 50, 64, { scale: 0.5 }), it('freddie', 62, 78, { pose: 'laugh' }), it('kasia', 82, 80, { pose: 'clap' }), it('heart-small', 50, 42)]),
        text: t(
          '[Tatzli]1 [teilt]2 [ds Rüebli]3 [mit Freddie]4. [Chnack]5! [Freddie]6 [lacht]7: «[Lovely]8!» [Kasia]9 [rüeft]10: «[Smacznego]11!»',
          '[Tatzli]1 [teilt]2 [die Karotte]3 [mit Freddie]4. [Knack]5! [Freddie]6 [lacht]7: «[Lovely]8!» [Kasia]9 [ruft]10: «[Smacznego]11!»',
          '[Tatzli]1 [dzieli się]2 [marchewką]3 [z Freddiem]4. [Chrup]5! [Freddie]6 [się śmieje]7: „[Lovely]8!” [Kasia]9 [woła]10: „[Smacznego]11!”',
          '[Tatzli]1 [shares]2 [the carrot]3 [with Freddie]4. [Crunch]5! [Freddie]6 [laughs]7: “[Lovely]8!” [Kasia]9 [calls]10: “[Smacznego]11!”',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'dr-samichlous-chunnt',
    title: t('Dr Samichlous chunnt', 'Der Nikolaus kommt', 'Mikołaj przychodzi', 'Saint Nicholas is coming'),
    level: 2,
    place: 'home',
    words: ['samichlous', 'schnee', 'nuss', 'schoggi', 'guetzli', 'staern', 'singe', 'gae', 'gross', 'nase', 'lose'],
    pages: [
      {
        scene: sc('home', [it('tatzli', 35, 78, { pose: 'look' }), it('lotti', 55, 80), it('faenschter', 75, 40), it('schnee', 75, 35, { scale: 0.5 })], 'winter', 'evening'),
        text: t(
          '[Hüt]1 [isch]2 [dr 6. Dezämber]3. [Es schneit]4. [Psst]5, [los mau]6!',
          '[Heute]1 [ist]2 [der 6. Dezember]3. [Es schneit]4. [Psst]5, [hör mal]6!',
          '[Dziś]1 [jest]2 [6 grudnia]3. [Pada śnieg]4. [Ćśś]5, [posłuchaj]6!',
          '[Today]1 [is]2 [the 6th of December]3. [It is snowing]4. [Shh]5, [listen]6!',
        ),
      },
      {
        scene: sc('home', [it('samichlous', 70, 74, { scale: 1.4 }), it('box', 82, 80, { scale: 0.6 }), it('tatzli', 30, 78, { pose: 'listen' }), it('lotti', 45, 80), it('schnee', 66, 50, { scale: 0.3 })], 'winter', 'evening'),
        text: t(
          '[Tock, tock]1! [Wär]2 [isch]3 [da]4? [Dr Samichlous]5! [Er]6 [het]7 [e grosse Sack]8. [Hatschi]9! [Schnee]10 [uf dr Nase]11!',
          '[Klopf, klopf]1! [Wer]2 [ist]3 [da]4? [Der Nikolaus]5! [Er]6 [hat]7 [einen grossen Sack]8. [Hatschi]9! [Schnee]10 [auf der Nase]11!',
          '[Puk, puk]1! [Kto]2 [tam]4 [jest]3? [Święty Mikołaj]5! [Ma]6+7 [duży worek]8. [Apsik]9! [Śnieg]10 [na nosie]11!',
          '[Knock, knock]1! [Who]2 [is]3 [there]4? [Saint Nicholas]5! [He]6 [has]7 [a big sack]8. [Atishoo]9! [Snow]10 [on his nose]11!',
        ),
      },
      {
        scene: sc('home', [it('samichlous', 68, 74, { scale: 1.4, pose: 'wave' }), it('tatzli', 35, 78, { pose: 'idle' })], 'winter', 'evening'),
        text: t(
          '[Dr Samichlous]1 [seit]2: «[Grüessech]3, [Tatzli]4!»',
          '[Der Nikolaus]1 [sagt]2: «[Guten Abend]3, [Tatzli]4!»',
          '[Mikołaj]1 [mówi]2: „[Dobry wieczór]3, [Tatzli]4!”',
          '[Saint Nicholas]1 [says]2: “[Good evening]3, [Tatzli]4!”',
        ),
        choice: {
          prompt: t('[Was]1 [macht]2 [Tatzli]3?', '[Was]1 [macht]2 [Tatzli]3?', '[Co]1 [robi]2 [Tatzli]3?', '[What]1 [does Tatzli]3 [do]2?'),
          options: [
            { label: t('[Es Lied]1 [singe]2', '[Ein Lied]1 [singen]2', '[Zaśpiewać]2 [piosenkę]1', '[Sing]2 [a song]1'), illu: 'tatzli', next: 3 },
            { label: t('[E Zeichnig]1 [gä]2', '[Eine Zeichnung]1 [geben]2', '[Dać]2 [rysunek]1', '[Give]2 [a drawing]1'), illu: 'papier', next: 4 },
          ],
        },
      },
      {
        scene: sc('home', [it('tatzli', 35, 78, { pose: 'sing' }), it('lotti', 50, 80, { pose: 'clap' }), it('samichlous', 72, 74, { scale: 1.4, pose: 'laugh' }), it('nuss', 60, 86, { scale: 0.4 }), it('schoggi', 66, 86, { scale: 0.4 })], 'winter', 'evening'),
        text: t(
          '[Tatzli]1 [singt]2 [es Lied]3. [Dr Samichlous]4 [lacht]5: «[Bravo]6! [Hatschi]7!» [Im Sack]8: [Nüss]9, [Guetzli]10 [und]11 [Schoggi]12.',
          '[Tatzli]1 [singt]2 [ein Lied]3. [Der Nikolaus]4 [lacht]5: «[Bravo]6! [Hatschi]7!» [Im Sack]8: [Nüsse]9, [Kekse]10 [und]11 [Schokolade]12.',
          '[Tatzli]1 [śpiewa]2 [piosenkę]3. [Mikołaj]4 [się śmieje]5: „[Brawo]6! [Apsik]7!” [W worku]8: [orzechy]9, [ciasteczka]10 [i]11 [czekolada]12.',
          '[Tatzli]1 [sings]2 [a song]3. [Saint Nicholas]4 [laughs]5: “[Bravo]6! [Atishoo]7!” [In the sack]8: [nuts]9, [biscuits]10 [and]11 [chocolate]12.',
        ),
        end: true,
      },
      {
        scene: sc('home', [it('tatzli', 35, 78, { pose: 'give' }), it('papier', 50, 62, { scale: 0.5 }), it('staern', 50, 50, { scale: 0.3 }), it('samichlous', 70, 74, { scale: 1.4 }), it('nuss', 60, 86, { scale: 0.4 }), it('schoggi', 66, 86, { scale: 0.4 })], 'winter', 'evening'),
        text: t(
          '[Tatzli]1 [git]2 [e Zeichnig]3. [Das]4 [isch]5 [e Stärn]6. [Dr Samichlous]7 [seit]8: «[Merci viu mau]9! [Hatschi]10!» [Im Sack]11: [Nüss]12 [und]13 [Schoggi]14.',
          '[Tatzli]1 [gibt]2 [eine Zeichnung]3. [Das]4 [ist]5 [ein Stern]6. [Der Nikolaus]7 [sagt]8: «[Vielen Dank]9! [Hatschi]10!» [Im Sack]11: [Nüsse]12 [und]13 [Schokolade]14.',
          '[Tatzli]1 [daje]2 [rysunek]3. [To]4 [jest]5 [gwiazda]6. [Mikołaj]7 [mówi]8: „[Dziękuję bardzo]9! [Apsik]10!” [W worku]11: [orzechy]12 [i]13 [czekolada]14.',
          '[Tatzli]1 [gives]2 [a drawing]3. [It]4 [is]5 [a star]6. [Saint Nicholas]7 [says]8: “[Thank you very much]9! [Atishoo]10!” [In the sack]11: [nuts]12 [and]13 [chocolate]14.',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'fasnacht-z-baern',
    title: t('Fasnacht z Bärn', 'Fasnacht in Bern', 'Karnawał w Bernie', 'Carnival in Bern'),
    level: 2,
    place: 'zytglogge',
    words: ['fasnacht', 'maske', 'trummle', 'lut', 'loei', 'frosch', 'tanze', 'gumpe', 'zytglogge', 'lache', 'mami', 'ohr'],
    pages: [
      {
        scene: sc('zytglogge', [it('tatzli', 35, 78, { pose: 'armsUp' }), it('mami-baer', 55, 76), it('sparkle', 70, 30, { scale: 0.6 }), it('ballon', 85, 35, { scale: 0.6 })], 'winter'),
        text: t(
          '[Es]1 [isch]2 [Fasnacht]3! [Bärn]4 [isch]5 [ganz farbig]6.',
          '[Es]1 [ist]2 [Fasnacht]3! [Bern]4 [ist]5 [ganz bunt]6.',
          '[Jest]1+2 [karnawał]3! [Berno]4 [jest]5 [całe kolorowe]6.',
          '[It]1 [is]2 [carnival time]3! [Bern]4 [is]5 [full of colour]6.',
        ),
      },
      {
        scene: sc('zytglogge', [it('trummle', 65, 76, { scale: 1.2 }), it('tatzli', 30, 78, { pose: 'listen' }), it('lotti', 45, 80, { pose: 'laugh' })], 'winter'),
        text: t(
          '[D Trummle]1 [macht]2: [Bum, bum, bum]3! [Das]4 [isch]5 [lut]6! [Tatzli]7 [hebt sech]8 [d Ohre]9 [zue]10. [Mach o so]11!',
          '[Die Trommel]1 [macht]2: [Bum, bum, bum]3! [Das]4 [ist]5 [laut]6! [Tatzli]7 [hält sich]8 [die Ohren]9 [zu]10. [Mach es auch so]11!',
          '[Bęben]1 [robi]2: [bum, bum, bum]3! [To]4 [jest]5 [głośne]6! [Tatzli]7 [zatyka]8+10 [uszy]9. [Zrób tak samo]11!',
          '[The drum]1 [goes]2: [boom, boom, boom]3! [That]4 [is]5 [loud]6! [Tatzli]7 [covers]8+10 [his ears]9. [You do it too]11!',
        ),
      },
      {
        scene: sc('zytglogge', [it('mami-baer', 60, 76, { pose: 'give' }), it('maske', 48, 60, { scale: 0.5 }), it('tatzli', 30, 78, { pose: 'look' })], 'winter'),
        text: t('[Mami]1 [bringt]2 [Maske]3.', '[Mama]1 [bringt]2 [Masken]3.', '[Mama]1 [przynosi]2 [maski]3.', '[Mummy]1 [brings]2 [masks]3.'),
        choice: {
          prompt: t('[Weli Maske]1 [wott]2 [Tatzli]3?', '[Welche Maske]1 [will]2 [Tatzli]3?', '[Którą maskę]1 [chce]2 [Tatzli]3?', '[Which mask]1 [does Tatzli]3 [want]2?'),
          options: [
            { label: t('[D Löi-Maske]1', '[Die Löwenmaske]1', '[Maskę lwa]1', '[The lion mask]1'), illu: 'loei', next: 3 },
            { label: t('[D Frosch-Maske]1', '[Die Froschmaske]1', '[Maskę żaby]1', '[The frog mask]1'), illu: 'frosch', next: 4 },
          ],
        },
      },
      {
        scene: sc('zytglogge', [it('tatzli', 40, 78, { pose: 'dance' }), it('loei', 40, 58, { scale: 0.5 }), it('lotti', 60, 80, { pose: 'laugh' }), it('zytglogge', 82, 55, { scale: 1.2 })], 'winter'),
        text: t(
          '[Tatzli]1 [isch]2 [e Löi]3! [Mach o]4: «[Roaar]5!» [Lotti]6 [lacht]7. [Tatzli]8 [tanzt]9 [bim Zytglogge]10.',
          '[Tatzli]1 [ist]2 [ein Löwe]3! [Mach auch]4: «[Roaar]5!» [Lotti]6 [lacht]7. [Tatzli]8 [tanzt]9 [beim Zeitglockenturm]10.',
          '[Tatzli]1 [jest]2 [lwem]3! [Ty też]4: „[Wrrr]5!” [Lotti]6 [się śmieje]7. [Tatzli]8 [tańczy]9 [przy wieży zegarowej]10.',
          '[Tatzli]1 [is]2 [a lion]3! [You too]4: “[Roar]5!” [Lotti]6 [laughs]7. [Tatzli]8 [dances]9 [by the clock tower]10.',
        ),
        end: true,
      },
      {
        scene: sc('zytglogge', [it('tatzli', 40, 74, { pose: 'jump' }), it('frosch', 40, 54, { scale: 0.5 }), it('lotti', 60, 80, { pose: 'laugh' }), it('zytglogge', 82, 55, { scale: 1.2 })], 'winter'),
        text: t(
          '[Tatzli]1 [isch]2 [e Frosch]3! [Mach o]4: «[Quaak]5!» [Lotti]6 [lacht]7. [Tatzli]8 [gumpet]9 [bim Zytglogge]10.',
          '[Tatzli]1 [ist]2 [ein Frosch]3! [Mach auch]4: «[Quak]5!» [Lotti]6 [lacht]7. [Tatzli]8 [hüpft]9 [beim Zeitglockenturm]10.',
          '[Tatzli]1 [jest]2 [żabą]3! [Ty też]4: „[Rech rech]5!” [Lotti]6 [się śmieje]7. [Tatzli]8 [skacze]9 [przy wieży zegarowej]10.',
          '[Tatzli]1 [is]2 [a frog]3! [You too]4: “[Ribbit]5!” [Lotti]6 [laughs]7. [Tatzli]8 [hops]9 [by the clock tower]10.',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'im-zoo',
    title: t('Im Zoo', 'Im Zoo', 'W zoo', 'At the zoo'),
    level: 2,
    place: 'zoo',
    words: ['elefant', 'pinguin', 'aff', 'gross', 'chly', 'chlaettere', 'schwuemme', 'loufe', 'grossaetti', 'lache', 'luege'],
    pages: [
      {
        scene: sc('zoo', [it('tatzli', 35, 78, { pose: 'walk' }), it('grossaetti-baer', 55, 76, { pose: 'walk' })], 'summer'),
        text: t(
          '[Tatzli]1 [und]2 [Grosspapi]3 [sy]4 [im Zoo]5.',
          '[Tatzli]1 [und]2 [Opa]3 [sind]4 [im Zoo]5.',
          '[Tatzli]1 [i]2 [dziadek]3 [są]4 [w zoo]5.',
          '[Tatzli]1 [and]2 [Grandpa]3 [are]4 [at the zoo]5.',
        ),
      },
      {
        scene: sc('zoo', [it('elefant', 70, 70, { scale: 1.6 }), it('pinguin', 30, 80, { scale: 0.6 }), it('tatzli', 15, 78, { pose: 'point' })], 'summer'),
        text: t(
          '[Lueg mau]1! [Dr Elefant]2 [isch]3 [gross]4: [Töröö]5! [Dr Pinguin]6 [isch]7 [chly]8. [Mach di]9 [gross]10! [Mach di]11 [chly]12!',
          '[Schau mal]1! [Der Elefant]2 [ist]3 [gross]4: [Törööö]5! [Der Pinguin]6 [ist]7 [klein]8. [Mach dich]9 [gross]10! [Mach dich]11 [klein]12!',
          '[Patrz]1! [Słoń]2 [jest]3 [duży]4: [Tru-tu-tu]5! [Pingwin]6 [jest]7 [mały]8. [Zrób się]9 [duży]10! [Zrób się]11 [mały]12!',
          '[Look]1! [The elephant]2 [is]3 [big]4: [Toot]5! [The penguin]6 [is]7 [small]8. [Make yourself]9 [big]10! [Make yourself]11 [small]12!',
        ),
      },
      {
        scene: sc('zoo', [it('grossaetti-baer', 60, 76, { pose: 'point' }), it('tatzli', 38, 78, { pose: 'listen' })], 'summer'),
        text: t(
          '[Grosspapi]1 [fragt]2: «[Wohi]3 [göh]4 [mir]5 [jitz]6?»',
          '[Opa]1 [fragt]2: «[Wohin]3 [gehen]4 [wir]5 [jetzt]6?»',
          '[Dziadek]1 [pyta]2: „[Dokąd]3 [teraz]6 [idziemy]4+5?”',
          '[Grandpa]1 [asks]2: “[Where]3 [do we go]4+5 [now]6?”',
        ),
        choice: {
          prompt: t('[Was]1 [wottsch]2 [gseh]3?', '[Was]1 [willst du]2 [sehen]3?', '[Co]1 [chcesz]2 [zobaczyć]3?', '[What]1 [do you want]2 [to see]3?'),
          options: [
            { label: t('[D Affe]1', '[Die Affen]1', '[Małpy]1', '[The monkeys]1'), illu: 'aff', next: 3 },
            { label: t('[D Pinguine]1', '[Die Pinguine]1', '[Pingwiny]1', '[The penguins]1'), illu: 'pinguin', next: 4 },
          ],
        },
      },
      {
        scene: sc('zoo', [it('aff', 70, 45, { pose: 'climb' }), it('boum', 72, 65, { scale: 1.6 }), it('tatzli', 35, 78, { pose: 'climb' }), it('grossaetti-baer', 18, 76, { pose: 'laugh' })], 'summer'),
        text: t(
          '[D Affe]1 [chlättere]2: [U-u-a-a]3! [Tatzli]4 [macht]5 [o]6 [dr Aff]7. [Mach mit]8: [U-u-a-a]9! [Grosspapi]10 [lacht]11.',
          '[Die Affen]1 [klettern]2: [U-u-a-a]3! [Tatzli]4 [spielt]5 [auch]6 [Affe]7. [Mach mit]8: [U-u-a-a]9! [Opa]10 [lacht]11.',
          '[Małpy]1 [się wspinają]2: [U-u-a-a]3! [Tatzli]4 [też]6 [udaje]5 [małpę]7. [Ty też]8: [U-u-a-a]9! [Dziadek]10 [się śmieje]11.',
          '[The monkeys]1 [climb]2: [Ooh-ooh aah]3! [Tatzli]4 [plays]5 [monkey]7 [too]6. [Join in]8: [Ooh-ooh aah]9! [Grandpa]10 [laughs]11.',
        ),
        end: true,
      },
      {
        scene: sc('zoo', [it('pinguin', 70, 78, { pose: 'swim' }), it('wasser', 75, 85, { scale: 1.2 }), it('tatzli', 40, 78, { pose: 'walk' }), it('grossaetti-baer', 18, 76, { pose: 'laugh' })], 'summer'),
        text: t(
          '[D Pinguine]1 [schwümme]2: [Platsch]3! [Tatzli]4 [louft]5 [wie ne Pinguin]6: [wackel, wackel]7. [Mach mit]8! [Grosspapi]9 [lacht]10.',
          '[Die Pinguine]1 [schwimmen]2: [Platsch]3! [Tatzli]4 [läuft]5 [wie ein Pinguin]6: [wackel, wackel]7. [Mach mit]8! [Opa]9 [lacht]10.',
          '[Pingwiny]1 [pływają]2: [Plusk]3! [Tatzli]4 [chodzi]5 [jak pingwin]6: [kiwu, kiwu]7. [Ty też]8! [Dziadek]9 [się śmieje]10.',
          '[The penguins]1 [swim]2: [Splash]3! [Tatzli]4 [walks]5 [like a penguin]6: [waddle, waddle]7. [Join in]8! [Grandpa]9 [laughs]10.',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'wiehnachte-mit-kasia',
    title: t('Wienachte mit Kasia', 'Weihnachten mit Kasia', 'Wigilia z Kasią', 'Christmas with Kasia'),
    level: 2,
    place: 'kitchen',
    words: ['wiehnachtsboum', 'staern', 'tisch', 'taeller', 'gable', 'loeffu', 'faenschter', 'himu', 'nacht', 'luege', 'chatz', 'chopf'],
    pages: [
      {
        scene: sc('kitchen', [it('tatzli', 30, 78, { pose: 'wave' }), it('kasia', 55, 80, { pose: 'wave' }), it('wiehnachtsboum', 82, 70, { scale: 1.4 })], 'winter', 'evening'),
        text: t(
          '[Es]1 [isch]2 [Wienachte]3. [Kasia]4 [chunnt]5 [zu Bsuech]6.',
          '[Es]1 [ist]2 [Weihnachten]3. [Kasia]4 [kommt]5 [zu Besuch]6.',
          '[Są]1+2 [Święta]3. [Kasia]4 [przychodzi]5 [w odwiedziny]6.',
          '[It]1 [is]2 [Christmas]3. [Kasia]4 [comes]5 [to visit]6.',
        ),
      },
      {
        scene: sc('kitchen', [it('kasia', 45, 80, { pose: 'point' }), it('tatzli', 25, 78, { pose: 'listen' }), it('tisch', 70, 80, { scale: 1.3 })], 'winter', 'evening'),
        text: t(
          '[Kasia]1 [seit]2: «[Bi üs]3 [heisst]4 [das]5 [Wigilia]6.»',
          '[Kasia]1 [sagt]2: «[Bei uns]3 [heisst]4 [das]5 [Wigilia]6.»',
          '[Kasia]1 [mówi]2: „[U nas]3 [to]5 [się nazywa]4 [Wigilia]6.”',
          '[Kasia]1 [says]2: “[At home]3 [we call]4 [it]5 [Wigilia]6.”',
        ),
      },
      {
        scene: sc('kitchen', [it('faenschter', 50, 40, { scale: 1.3 }), it('tatzli', 35, 78, { pose: 'look' }), it('kasia', 60, 80, { pose: 'look' })], 'winter', 'evening'),
        text: t(
          '[Mir]1 [luege]2 [zum Fänschter use]3. [Wo]4 [isch]5 [dr erscht Stärn]6? [Suech]7 [mit]8!',
          '[Wir]1 [schauen]2 [aus dem Fenster]3. [Wo]4 [ist]5 [der erste Stern]6? [Such]7 [mit]8!',
          '[Patrzymy]1+2 [przez okno]3. [Gdzie]4 [jest]5 [pierwsza gwiazdka]6? [Szukaj]7 [z nami]8!',
          '[We]1 [look]2 [out of the window]3. [Where]4 [is]5 [the first star]6? [Look]7 [with us]8!',
        ),
        choice: {
          prompt: t('[Was]1 [macht]2 [Tatzli]3 [bis dert]4?', '[Was]1 [macht]2 [Tatzli]3 [bis dahin]4?', '[Co]1 [robi]2 [Tatzli]3 [do tego czasu]4?', '[What]1 [does Tatzli]3 [do]2 [until then]4?'),
          options: [
            { label: t('[Dr Tisch]1 [decke]2', '[Den Tisch]1 [decken]2', '[Nakryć]2 [do stołu]1', '[Lay]2 [the table]1'), illu: 'tisch', next: 3 },
            { label: t('[Dr Boum]1 [schmücke]2', '[Den Baum]1 [schmücken]2', '[Ubrać]2 [choinkę]1', '[Decorate]2 [the tree]1'), illu: 'wiehnachtsboum', next: 4 },
          ],
        },
      },
      {
        scene: sc('kitchen', [it('tisch', 55, 80, { scale: 1.5 }), it('taeller', 44, 68, { scale: 0.4 }), it('gable', 50, 68, { scale: 0.3 }), it('taeller', 62, 68, { scale: 0.4 }), it('loeffu', 68, 68, { scale: 0.3 }), it('chatz', 62, 60, { scale: 0.7 }), it('tatzli', 30, 78, { pose: 'laugh' }), it('kasia', 80, 80, { pose: 'laugh' }), it('staern', 70, 15, { scale: 0.5 })], 'winter', 'night'),
        text: t(
          '[Tatzli]1 [deckt]2 [dr Tisch]3. [Kasia]4 [seit]5: «[No e Täller]6 [für e Gascht]7!» [Miau]8! [D Chatz]9 [isch]10 [dr Gascht]11! [Und]12 [am Himu]13: [dr erscht Stärn]14! [Schöni Wienachte]15!',
          '[Tatzli]1 [deckt]2 [den Tisch]3. [Kasia]4 [sagt]5: «[Noch ein Teller]6 [für einen Gast]7!» [Miau]8! [Die Katze]9 [ist]10 [der Gast]11! [Und]12 [am Himmel]13: [der erste Stern]14! [Frohe Weihnachten]15!',
          '[Tatzli]1 [nakrywa]2 [do stołu]3. [Kasia]4 [mówi]5: „[Jeszcze jeden talerz]6 [dla gościa]7!” [Miau]8! [Kot]9 [jest]10 [gościem]11! [A]12 [na niebie]13: [pierwsza gwiazdka]14! [Wesołych Świąt]15!',
          '[Tatzli]1 [lays]2 [the table]3. [Kasia]4 [says]5: “[One more plate]6 [for a guest]7!” [Meow]8! [The cat]9 [is]10 [the guest]11! [And]12 [in the sky]13: [the first star]14! [Merry Christmas]15!',
        ),
        end: true,
      },
      {
        scene: sc('kitchen', [it('wiehnachtsboum', 55, 70, { scale: 1.6 }), it('staern', 30, 56, { scale: 0.4 }), it('tatzli', 30, 78, { pose: 'laugh' }), it('kasia', 78, 80, { pose: 'laugh' }), it('staern', 85, 12, { scale: 0.5 })], 'winter', 'night'),
        text: t(
          '[Tatzli]1 [schmückt]2 [dr Boum]3. [Hoppla]4! [Tatzli]5 [het]6 [dr Stärn]7 [uf em Chopf]8! [Kasia]9 [lacht]10: «[Ślicznie]11!» [Und]12 [am Himu]13: [dr erscht Stärn]14! [Schöni Wienachte]15!',
          '[Tatzli]1 [schmückt]2 [den Baum]3. [Hoppla]4! [Tatzli]5 [hat]6 [den Stern]7 [auf dem Kopf]8! [Kasia]9 [lacht]10: «[Ślicznie]11!» [Und]12 [am Himmel]13: [der erste Stern]14! [Frohe Weihnachten]15!',
          '[Tatzli]1 [ubiera]2 [choinkę]3. [Ojej]4! [Tatzli]5 [ma]6 [gwiazdę]7 [na głowie]8! [Kasia]9 [się śmieje]10: „[Ślicznie]11!” [A]12 [na niebie]13: [pierwsza gwiazdka]14! [Wesołych Świąt]15!',
          '[Tatzli]1 [decorates]2 [the tree]3. [Oops]4! [Tatzli]5 [has]6 [the star]7 [on his head]8! [Kasia]9 [laughs]10: “[Ślicznie]11!” [And]12 [in the sky]13: [the first star]14! [Merry Christmas]15!',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'dr-stei-turm',
    title: t('Dr Stei-Turm', 'Der Steinturm', 'Wieża z kamieni', 'The stone tower'),
    level: 2,
    place: 'quarry',
    words: ['stei', 'grossaetti', 'boue', 'n1', 'n2', 'n3', 'n4', 'gross', 'chly', 'schwaer', 'lache', 'stah', 'zelle'],
    pages: [
      {
        scene: sc('quarry', [it('tatzli', 35, 78, { pose: 'walk' }), it('grossaetti-baer', 55, 76, { pose: 'walk' }), it('stei', 75, 82, { scale: 0.7 }), it('stei', 85, 84, { scale: 0.5 })], 'autumn'),
        text: t(
          '[Tatzli]1 [und]2 [Grosspapi]3 [sy]4 [im Steibruch]5. [Da]6 [het es]7 [viu Stei]8.',
          '[Tatzli]1 [und]2 [Opa]3 [sind]4 [im Steinbruch]5. [Hier]6 [gibt es]7 [viele Steine]8.',
          '[Tatzli]1 [i]2 [dziadek]3 [są]4 [w kamieniołomie]5. [Tu]6 [jest]7 [dużo kamieni]8.',
          '[Tatzli]1 [and]2 [Grandpa]3 [are]4 [at the quarry]5. [Here]6 [there are]7 [lots of stones]8.',
        ),
      },
      {
        scene: sc('quarry', [it('tatzli', 35, 78, { pose: 'build' }), it('stei', 55, 82, { scale: 0.6 }), it('stei', 55, 72, { scale: 0.5 }), it('stei', 55, 64, { scale: 0.4 }), it('grossaetti-baer', 75, 76, { pose: 'count' })], 'autumn'),
        text: t(
          '[Mir]1 [boue]2 [e Turm]3! [Zell]4 [mit]5: [eis]6, [zwöi]7, [drü]8, [vier]9.',
          '[Wir]1 [bauen]2 [einen Turm]3! [Zähl]4 [mit]5: [eins]6, [zwei]7, [drei]8, [vier]9.',
          '[Budujemy]1+2 [wieżę]3! [Licz]4 [razem]5: [jeden]6, [dwa]7, [trzy]8, [cztery]9.',
          '[We]1 [build]2 [a tower]3! [Count]4 [along]5: [one]6, [two]7, [three]8, [four]9.',
        ),
      },
      {
        scene: sc('quarry', [it('stei', 50, 82, { scale: 0.6 }), it('stei', 50, 72, { scale: 0.5 }), it('stei', 50, 64, { scale: 0.4 }), it('stei', 50, 57, { scale: 0.35 }), it('tatzli', 30, 78, { pose: 'look' }), it('grossaetti-baer', 75, 76)], 'autumn'),
        text: t(
          '[Dr Turm]1 [isch]2 [scho]3 [höch]4. [Wackel, wackel]5 …',
          '[Der Turm]1 [ist]2 [schon]3 [hoch]4. [Wackel, wackel]5 …',
          '[Wieża]1 [jest]2 [już]3 [wysoka]4. [Chwiej, chwiej]5 …',
          '[The tower]1 [is]2 [already]3 [tall]4. [Wobble, wobble]5 …',
        ),
        choice: {
          prompt: t('[Wele Stei]1 [nimmt]2 [Tatzli]3?', '[Welchen Stein]1 [nimmt]2 [Tatzli]3?', '[Który kamień]1 [bierze]2 [Tatzli]3?', '[Which stone]1 [does Tatzli]3 [take]2?'),
          options: [
            { label: t('[Dr gross Stei]1', '[Den grossen Stein]1', '[Duży kamień]1', '[The big stone]1'), illu: 'gross', next: 3 },
            { label: t('[Dr chly Stei]1', '[Den kleinen Stein]1', '[Mały kamień]1', '[The small stone]1'), illu: 'chly', next: 4 },
          ],
        },
      },
      {
        scene: sc('quarry', [it('stei', 45, 84, { scale: 0.6 }), it('stei', 55, 84, { scale: 0.5 }), it('stei', 62, 85, { scale: 0.4 }), it('tatzli', 30, 78, { pose: 'laugh' }), it('grossaetti-baer', 75, 76, { pose: 'laugh' }), it('sparkle', 52, 70, { scale: 0.5 })], 'autumn'),
        text: t(
          '[Dr gross Stei]1 [isch]2 [schwär]3. [Wackel, wackel]4 … [Bumm]5! [Dr Turm]6 [gheit um]7. [Tatzli]8 [und]9 [Grosspapi]10 [lache]11. [Nomau]12!',
          '[Der grosse Stein]1 [ist]2 [schwer]3. [Wackel, wackel]4 … [Bumm]5! [Der Turm]6 [fällt um]7. [Tatzli]8 [und]9 [Opa]10 [lachen]11. [Nochmal]12!',
          '[Duży kamień]1 [jest]2 [ciężki]3. [Chwiej, chwiej]4 … [Bum]5! [Wieża]6 [się przewraca]7. [Tatzli]8 [i]9 [dziadek]10 [się śmieją]11. [Jeszcze raz]12!',
          '[The big stone]1 [is]2 [heavy]3. [Wobble, wobble]4 … [Bump]5! [The tower]6 [falls down]7. [Tatzli]8 [and]9 [Grandpa]10 [laugh]11. [Again]12!',
        ),
        end: true,
      },
      {
        scene: sc('quarry', [it('stei', 50, 82, { scale: 0.6 }), it('stei', 50, 72, { scale: 0.5 }), it('stei', 50, 64, { scale: 0.4 }), it('stei', 50, 57, { scale: 0.35 }), it('stei', 50, 51, { scale: 0.25 }), it('tatzli', 30, 78, { pose: 'armsUp' }), it('grossaetti-baer', 75, 76, { pose: 'clap' }), it('sticker-star', 50, 35, { scale: 0.5 })], 'autumn'),
        text: t(
          '[Dr chly Stei]1 [passt]2. [Dr Turm]3 [steit]4! [Grosspapi]5 [seit]6: «[Bravo]7, [Tatzli]8!»',
          '[Der kleine Stein]1 [passt]2. [Der Turm]3 [steht]4! [Opa]5 [sagt]6: «[Bravo]7, [Tatzli]8!»',
          '[Mały kamień]1 [pasuje]2. [Wieża]3 [stoi]4! [Dziadek]5 [mówi]6: „[Brawo]7, [Tatzli]8!”',
          '[The small stone]1 [fits]2. [The tower]3 [stands]4! [Grandpa]5 [says]6: “[Well done]7, [Tatzli]8!”',
        ),
        end: true,
      },
    ],
  },

  // =====================================================================
  // LEVEL 3 – Schueu (6–7): 7 pages, two choices per path, comprehension questions
  // Shape: 0 → 1 (question) → 2 (choice → 3|4) → 3|4 (choice → 5|6) → 5|6 end
  // =====================================================================
  {
    id: 'am-zibelemaerit',
    title: t('Am Zibelemärit', 'Am Zwiebelmarkt', 'Na targu cebulowym', 'At the onion market'),
    level: 3,
    place: 'market',
    words: ['zibelemaerit', 'zibele', 'maerit', 'chueche', 'grosi', 'bus', 'zytglogge', 'rot', 'gaeub', 'blau', 'haar', 'tee', 'huet', 'haus', 'schau', 'nase'],
    pages: [
      {
        scene: sc('market', [it('grosi-baer', 40, 76, { pose: 'walk' }), it('tatzli', 58, 78, { pose: 'walk' }), it('bus', 85, 70, { scale: 1.4 })], 'autumn'),
        text: t(
          '[Hüt]1 [isch]2 [Zibelemärit]3! [Grosi]4 [und]5 [Tatzli]6 [fahre]7 [mit em Bus]8 [uf Bärn]9.',
          '[Heute]1 [ist]2 [Zwiebelmarkt]3! [Oma]4 [und]5 [Tatzli]6 [fahren]7 [mit dem Bus]8 [nach Bern]9.',
          '[Dziś]1 [jest]2 [targ cebulowy]3! [Babcia]4 [i]5 [Tatzli]6 [jadą]7 [autobusem]8 [do Berna]9.',
          '[Today]1 [is]2 [the onion market]3! [Granny]4 [and]5 [Tatzli]6 [go]7 [by bus]8 [to Bern]9.',
        ),
      },
      {
        scene: sc('market', [it('zibele', 35, 70, { scale: 0.8 }), it('zibele', 48, 70, { scale: 0.8 }), it('zibele', 61, 70, { scale: 0.8 }), it('tatzli', 20, 78, { pose: 'look' }), it('sparkle', 75, 35, { scale: 0.6 }), it('grosi-baer', 82, 76)], 'autumn'),
        text: t(
          '[Überau]1 [het es]2 [Zibele]3: [Zibelezöpf]4 [und]5 [Zibelechränz]6. [Und]7 [lueg]8: [Konfetti]9!',
          '[Überall]1 [gibt es]2 [Zwiebeln]3: [Zwiebelzöpfe]4 [und]5 [Zwiebelkränze]6. [Und]7 [schau]8: [Konfetti]9!',
          '[Wszędzie]1 [są]2 [cebule]3: [warkocze z cebuli]4 [i]5 [wianki z cebuli]6. [I]7 [patrz]8: [konfetti]9!',
          '[Everywhere]1 [there are]2 [onions]3: [onion plaits]4 [and]5 [onion wreaths]6. [And]7 [look]8: [confetti]9!',
        ),
        question: {
          prompt: t('[Was]1 [git es]2 [am Zibelemärit]3?', '[Was]1 [gibt es]2 [am Zwiebelmarkt]3?', '[Co]1 [jest]2 [na targu cebulowym]3?', '[What]1 [is there]2 [at the onion market]3?'),
          options: [
            { illu: 'zibele', label: t('Zibele', 'Zwiebeln', 'Cebule', 'Onions') },
            { illu: 'bau', label: t('Bäu', 'Bälle', 'Piłki', 'Balls') },
            { illu: 'glace', label: t('Glace', 'Eis', 'Lody', 'Ice cream') },
          ],
          answer: 0,
        },
      },
      {
        scene: sc('market', [it('grosi-baer', 60, 76, { pose: 'point' }), it('tatzli', 40, 78, { pose: 'listen' }), it('basket', 72, 82, { scale: 0.7 })], 'autumn'),
        text: t(
          '[Grosi]1 [fragt]2: «[Was]3 [wei]4 [mir]5 [choufe]6?»',
          '[Oma]1 [fragt]2: «[Was]3 [wollen]4 [wir]5 [kaufen]6?»',
          '[Babcia]1 [pyta]2: „[Co]3 [kupimy]4+5+6?”',
          '[Granny]1 [asks]2: “[What]3 [shall]4 [we]5 [buy]6?”',
        ),
        choice: {
          prompt: t('[Was]1 [choufe]2 [si]3?', '[Was]1 [kaufen]2 [sie]3?', '[Co]1 [kupują]2+3?', '[What]1 [do they]3 [buy]2?'),
          options: [
            { label: t('[E Zibelezopf]1', '[Einen Zwiebelzopf]1', '[Warkocz z cebuli]1', '[An onion plait]1'), illu: 'zibele', next: 3 },
            { label: t('[E Zibelechueche]1', '[Einen Zwiebelkuchen]1', '[Placek z cebulą]1', '[An onion tart]1'), illu: 'chueche', next: 4 },
          ],
        },
      },
      {
        scene: sc('market', [it('tatzli', 40, 78, { pose: 'laugh' }), it('zibele', 40, 62, { scale: 0.6 }), it('grosi-baer', 65, 76, { pose: 'laugh' })], 'autumn'),
        text: t(
          '[Grosi]1 [chouft]2 [e Zibelezopf]3. [Tatzli]4 [treit]5 [ne]6 [wie ne Chetti]7! [Är]8 [schmöckt]9 [starch]10! [Hatschi]11!',
          '[Oma]1 [kauft]2 [einen Zwiebelzopf]3. [Tatzli]4 [trägt]5 [ihn]6 [wie eine Kette]7! [Er]8 [riecht]9 [stark]10! [Hatschi]11!',
          '[Babcia]1 [kupuje]2 [warkocz z cebuli]3. [Tatzli]4 [nosi]5 [go]6 [jak naszyjnik]7! [Mocno]10 [pachnie]8+9! [Apsik]11!',
          '[Granny]1 [buys]2 [an onion plait]3. [Tatzli]4 [wears]5 [it]6 [like a necklace]7! [It]8 [smells]9 [strong]10! [Atishoo]11!',
        ),
        choice: {
          prompt: t('[Wohi]1 [jitz]2?', '[Wohin]1 [jetzt]2?', '[Dokąd]1 [teraz]2?', '[Where]1 [now]2?'),
          options: [
            { label: t('[Zum Konfetti]1', '[Zum Konfetti]1', '[Do konfetti]1', '[To the confetti]1'), illu: 'sparkle', next: 5 },
            { label: t('[Hei]1', '[Nach Hause]1', '[Do domu]1', '[Home]1'), illu: 'huus', next: 6 },
          ],
        },
      },
      {
        scene: sc('market', [it('tatzli', 40, 78, { pose: 'eat' }), it('chueche', 52, 62, { scale: 0.5 }), it('grosi-baer', 65, 76)], 'autumn'),
        text: t(
          '[Grosi]1 [chouft]2 [e Zibelechueche]3. [Är]4 [isch]5 [no]6 [warm]7. [Mmh]8! [Tatzli]9 [het]10 [Chueche]11 [uf dr Nase]12!',
          '[Oma]1 [kauft]2 [einen Zwiebelkuchen]3. [Er]4 [ist]5 [noch]6 [warm]7. [Mmh]8! [Tatzli]9 [hat]10 [Kuchen]11 [auf der Nase]12!',
          '[Babcia]1 [kupuje]2 [placek z cebulą]3. [Jest]4+5 [jeszcze]6 [ciepły]7. [Mmm]8! [Tatzli]9 [ma]10 [placek]11 [na nosie]12!',
          '[Granny]1 [buys]2 [an onion tart]3. [It]4 [is]5 [still]6 [warm]7. [Mmm]8! [Tatzli]9 [has]10 [tart]11 [on his nose]12!',
        ),
        choice: {
          prompt: t('[Wohi]1 [jitz]2?', '[Wohin]1 [jetzt]2?', '[Dokąd]1 [teraz]2?', '[Where]1 [now]2?'),
          options: [
            { label: t('[Zum Konfetti]1', '[Zum Konfetti]1', '[Do konfetti]1', '[To the confetti]1'), illu: 'sparkle', next: 5 },
            { label: t('[Hei]1', '[Nach Hause]1', '[Do domu]1', '[Home]1'), illu: 'huus', next: 6 },
          ],
        },
      },
      {
        scene: sc('zytglogge', [it('zytglogge', 80, 55, { scale: 1.3 }), it('tatzli', 40, 78, { pose: 'dance' }), it('grosi-baer', 58, 76, { pose: 'laugh' }), it('sparkle', 35, 40), it('sparkle', 55, 30)], 'autumn'),
        text: t(
          '[Bim Zytglogge]1 [flügt]2 [Konfetti]3. [Rot]4, [gäub]5, [blau]6! [Tatzli]7 [het]8 [Konfetti]9 [i de Haar]10 – [und]11 [uf dr Nase]12. [Hatschi]13!',
          '[Beim Zeitglockenturm]1 [fliegt]2 [Konfetti]3. [Rot]4, [gelb]5, [blau]6! [Tatzli]7 [hat]8 [Konfetti]9 [in den Haaren]10 – [und]11 [auf der Nase]12. [Hatschi]13!',
          '[Przy wieży zegarowej]1 [fruwa]2 [konfetti]3. [Czerwone]4, [żółte]5, [niebieskie]6! [Tatzli]7 [ma]8 [konfetti]9 [we włosach]10 – [i]11 [na nosie]12. [Apsik]13!',
          '[By the clock tower]1 [confetti]3 [flies]2. [Red]4, [yellow]5, [blue]6! [Tatzli]7 [has]8 [confetti]9 [in his fur]10 – [and]11 [on his nose]12. [Atishoo]13!',
        ),
        question: {
          prompt: t('[Wär]1 [isch]2 [mit Tatzli]3 [am Märit]4?', '[Wer]1 [ist]2 [mit Tatzli]3 [auf dem Markt]4?', '[Kto]1 [jest]2 [z Tatzlim]3 [na targu]4?', '[Who]1 [is]2 [with Tatzli]3 [at the market]4?'),
          options: [
            { illu: 'grosi-baer', label: t('Grosi', 'Oma', 'Babcia', 'Granny') },
            { illu: 'papi-baer', label: t('Papi', 'Papa', 'Tata', 'Daddy') },
            { illu: 'freddie', label: t('Freddie', 'Freddie', 'Freddie', 'Freddie') },
          ],
          answer: 0,
        },
        end: true,
      },
      {
        scene: sc('kitchen', [it('grosi-baer', 60, 76, { pose: 'drink' }), it('tatzli', 40, 78, { pose: 'drink' }), it('tisch', 50, 82, { scale: 1.4 }), it('tee', 50, 66, { scale: 0.4 }), it('heart-small', 50, 40)], 'autumn', 'evening'),
        text: t(
          '[Dihei]1 [trinke]2 [Grosi und Tatzli]3 [e warme Tee]4. [Grosi]5 [seit]6: «[Das]7 [isch]8 [e schöne Tag]9!»',
          '[Zu Hause]1 [trinken]2 [Oma und Tatzli]3 [einen warmen Tee]4. [Oma]5 [sagt]6: «[Das]7 [ist]8 [ein schöner Tag]9!»',
          '[W domu]1 [babcia i Tatzli]3 [piją]2 [ciepłą herbatę]4. [Babcia]5 [mówi]6: „[To]7 [jest]8 [piękny dzień]9!”',
          '[At home]1 [Granny and Tatzli]3 [drink]2 [a cup of warm tea]4. [Granny]5 [says]6: “[This]7 [is]8 [a lovely day]9!”',
        ),
        question: {
          prompt: t('[Wär]1 [isch]2 [mit Tatzli]3 [am Märit]4?', '[Wer]1 [ist]2 [mit Tatzli]3 [auf dem Markt]4?', '[Kto]1 [jest]2 [z Tatzlim]3 [na targu]4?', '[Who]1 [is]2 [with Tatzli]3 [at the market]4?'),
          options: [
            { illu: 'grosi-baer', label: t('Grosi', 'Oma', 'Babcia', 'Granny') },
            { illu: 'papi-baer', label: t('Papi', 'Papa', 'Tata', 'Daddy') },
            { illu: 'freddie', label: t('Freddie', 'Freddie', 'Freddie', 'Freddie') },
          ],
          answer: 0,
        },
        end: true,
      },
    ],
  },
  {
    id: 'mir-goeh-go-schwuemme',
    title: t('Mir göh go schwümme', 'Wir gehen schwimmen', 'Idziemy pływać', 'Off for a swim'),
    level: 3,
    place: 'aare',
    words: ['fluss', 'wasser', 'heiss', 'chaut', 'schnaeu', 'schwuemme', 'papi', 'mami', 'fisch', 'glace', 'handtuech', 'troche', 'n1', 'n2', 'hand', 'summer', 'buuch', 'hund', 'nass', 'muu'],
    pages: [
      {
        scene: sc('aare', [it('sunne', 85, 15, { scale: 0.7 }), it('papi-baer', 55, 76), it('tatzli', 35, 78, { pose: 'jump' })], 'summer'),
        text: t(
          '[Es]1 [isch]2 [heiss]3. [Papi]4 [seit]5: «[Mir]6 [göh]7 [go schwümme]8!»',
          '[Es]1 [ist]2 [heiss]3. [Papa]4 [sagt]5: «[Wir]6 [gehen]7 [schwimmen]8!»',
          '[Jest]1+2 [gorąco]3. [Tata]4 [mówi]5: „[Idziemy]6+7 [popływać]8!”',
          '[It]1 [is]2 [hot]3. [Daddy]4 [says]5: “[We]6 [are going]7 [swimming]8!”',
        ),
      },
      {
        scene: sc('aare', [it('papi-baer', 55, 76, { pose: 'point' }), it('tatzli', 35, 78, { pose: 'listen' }), it('wasser', 80, 85, { scale: 1.4 })], 'summer'),
        text: t(
          '[D Aare]1 [isch]2 [schnäu]3 [und]4 [chaut]5. [Papi]6 [seit]7: «[Nie]8 [elei]9 [is Wasser]10! [Nume]11 [mit de Grosse]12.»',
          '[Die Aare]1 [ist]2 [schnell]3 [und]4 [kalt]5. [Papa]6 [sagt]7: «[Nie]8 [allein]9 [ins Wasser]10! [Nur]11 [mit den Grossen]12.»',
          '[Aare]1 [jest]2 [szybka]3 [i]4 [zimna]5. [Tata]6 [mówi]7: „[Nigdy]8 [sam]9 [do wody]10! [Tylko]11 [z dorosłymi]12.”',
          '[The Aare]1 [is]2 [fast]3 [and]4 [cold]5. [Daddy]6 [says]7: “[Never]8 [into the water]10 [alone]9! [Only]11 [with grown-ups]12.”',
        ),
        question: {
          prompt: t('[Wär]1 [geit]2 [mit Tatzli]3 [is Wasser]4?', '[Wer]1 [geht]2 [mit Tatzli]3 [ins Wasser]4?', '[Kto]1 [idzie]2 [z Tatzlim]3 [do wody]4?', '[Who]1 [goes]2 [into the water]4 [with Tatzli]3?'),
          options: [
            { illu: 'papi-baer', label: t('Papi', 'Papa', 'Tata', 'Daddy') },
            { illu: 'lotti', label: t('Lotti', 'Lotti', 'Lotti', 'Lotti') },
            { illu: 'chatz', label: t('D Chatz', 'Die Katze', 'Kot', 'The cat') },
          ],
          answer: 0,
        },
      },
      {
        scene: sc('aare', [it('tatzli', 40, 78, { pose: 'armsUp' }), it('papi-baer', 58, 76, { pose: 'hug' }), it('wasser', 82, 85, { scale: 1.4 })], 'summer'),
        text: t(
          '[Zersch]1: [d Schwimmflügeli]2! [Eis]3, [zwöi]4 – [fertig]5! [Papi]6 [hebt]7 [Tatzli]8 [a dr Hand]9.',
          '[Zuerst]1: [die Schwimmflügel]2! [Eins]3, [zwei]4 – [fertig]5! [Papa]6 [hält]7 [Tatzli]8 [an der Hand]9.',
          '[Najpierw]1: [rękawki]2! [Raz]3, [dwa]4 – [gotowe]5! [Tata]6 [trzyma]7 [Tatzliego]8 [za rękę]9.',
          '[First]1: [the armbands]2! [One]3, [two]4 – [done]5! [Daddy]6 [holds]7 [Tatzli]8 [by the hand]9.',
        ),
        choice: {
          prompt: t('[Was]1 [mache]2 [si]3 [im Wasser]4?', '[Was]1 [machen]2 [sie]3 [im Wasser]4?', '[Co]1 [robią]2+3 [w wodzie]4?', '[What]1 [do they]3 [do]2 [in the water]4?'),
          options: [
            { label: t('[Plätschere]1', '[Planschen]1', '[Pluskać się]1', '[Splash about]1'), illu: 'wasser', next: 3 },
            { label: t('[Fischli luege]1', '[Fische anschauen]1', '[Oglądać rybki]1', '[Look at fish]1'), illu: 'fisch', next: 4 },
          ],
        },
      },
      {
        scene: sc('aare', [it('tatzli', 45, 80, { pose: 'swim' }), it('papi-baer', 60, 78, { pose: 'swim' }), it('sparkle', 50, 65, { scale: 0.6 })], 'summer'),
        text: t(
          '[Platsch]1! [Tatzli]2 [und]3 [Papi]4 [plätschere]5 [am Rand]6. [Ds Wasser]7 [isch]8 [chaut]9! [Brrr]10!',
          '[Platsch]1! [Tatzli]2 [und]3 [Papa]4 [planschen]5 [am Ufer]6. [Das Wasser]7 [ist]8 [kalt]9! [Brrr]10!',
          '[Plusk]1! [Tatzli]2 [i]3 [tata]4 [pluskają się]5 [przy brzegu]6. [Woda]7 [jest]8 [zimna]9! [Brrr]10!',
          '[Splash]1! [Tatzli]2 [and]3 [Daddy]4 [splash about]5 [by the edge]6. [The water]7 [is]8 [cold]9! [Brrr]10!',
        ),
        choice: {
          prompt: t('[Und]1 [nachhär]2?', '[Und]1 [danach]2?', '[A]1 [potem]2?', '[And]1 [then]2?'),
          options: [
            { label: t('[E Glace]1', '[Ein Eis]1', '[Lody]1', '[An ice cream]1'), illu: 'glace', next: 5 },
            { label: t('[Abtröchne]1', '[Abtrocknen]1', '[Wytrzeć się]1', '[Dry off]1'), illu: 'handtuech', next: 6 },
          ],
        },
      },
      {
        scene: sc('aare', [it('tatzli', 40, 80, { pose: 'look' }), it('papi-baer', 58, 78), it('fisch', 72, 86, { scale: 0.5 })], 'summer'),
        text: t(
          '[Tatzli]1 [und]2 [Papi]3 [luege]4 [is Wasser]5. [Es Fischli]6 [schwümmt]7 [verby]8! [Blubb]9! [Mach]10 [es Fischmuu]11: [blubb, blubb]12!',
          '[Tatzli]1 [und]2 [Papa]3 [schauen]4 [ins Wasser]5. [Ein Fischlein]6 [schwimmt]7 [vorbei]8! [Blubb]9! [Mach]10 [einen Fischmund]11: [blubb, blubb]12!',
          '[Tatzli]1 [i]2 [tata]3 [patrzą]4 [do wody]5. [Rybka]6 [przepływa]7+8! [Bul bul]9! [Zrób]10 [rybią buzię]11: [bul, bul]12!',
          '[Tatzli]1 [and]2 [Daddy]3 [look]4 [into the water]5. [A little fish]6 [swims]7 [past]8! [Blub]9! [Make]10 [a fish face]11: [blub, blub]12!',
        ),
        choice: {
          prompt: t('[Und]1 [nachhär]2?', '[Und]1 [danach]2?', '[A]1 [potem]2?', '[And]1 [then]2?'),
          options: [
            { label: t('[E Glace]1', '[Ein Eis]1', '[Lody]1', '[An ice cream]1'), illu: 'glace', next: 5 },
            { label: t('[Abtröchne]1', '[Abtrocknen]1', '[Wytrzeć się]1', '[Dry off]1'), illu: 'handtuech', next: 6 },
          ],
        },
      },
      {
        scene: sc('aare', [it('picnic-blanket', 50, 85, { scale: 1.4 }), it('tatzli', 42, 78, { pose: 'eat' }), it('glace', 50, 66, { scale: 0.4 }), it('mami-baer', 65, 76), it('papi-baer', 80, 76), it('heart-small', 55, 40)], 'summer'),
        text: t(
          '[Mami]1 [bringt]2 [e Glace]3. [Tatzli]4 [schleckt]5 [und]6 [schleckt]7 – [platsch]8! [D Glace]9 [isch]10 [uf em Buuch]11! [Aui]12 [lache]13.',
          '[Mama]1 [bringt]2 [ein Eis]3. [Tatzli]4 [schleckt]5 [und]6 [schleckt]7 – [platsch]8! [Das Eis]9 [ist]10 [auf dem Bauch]11! [Alle]12 [lachen]13.',
          '[Mama]1 [przynosi]2 [lody]3. [Tatzli]4 [liże]5 [i]6 [liże]7 – [plask]8! [Lody]9 [są]10 [na brzuchu]11! [Wszyscy]12 [się śmieją]13.',
          '[Mummy]1 [brings]2 [an ice cream]3. [Tatzli]4 [licks]5 [and]6 [licks]7 – [splat]8! [The ice cream]9 [is]10 [on his tummy]11! [Everyone]12 [laughs]13.',
        ),
        end: true,
      },
      {
        scene: sc('aare', [it('handtuech', 42, 72, { scale: 0.8 }), it('tatzli', 42, 78, { pose: 'hug' }), it('mami-baer', 62, 76, { pose: 'hug' }), it('papi-baer', 80, 76, { pose: 'laugh' }), it('heart-small', 52, 40)], 'summer'),
        text: t(
          '[Tatzli]1 [schüttlet sech]2 [wie ne Hund]3: [Brrr]4! [Jitz]5 [isch]6 [Papi]7 [nass]8! [Mami]9 [bringt]10 [ds Handtuech]11. [Tatzli]12 [isch]13 [wider]14 [troche]15 [und]16 [warm]17.',
          '[Tatzli]1 [schüttelt sich]2 [wie ein Hund]3: [Brrr]4! [Jetzt]5 [ist]6 [Papa]7 [nass]8! [Mama]9 [bringt]10 [das Handtuch]11. [Tatzli]12 [ist]13 [wieder]14 [trocken]15 [und]16 [warm]17.',
          '[Tatzli]1 [otrzepuje się]2 [jak pies]3: [Brrr]4! [Teraz]5 [tata]7 [jest]6 [mokry]8! [Mama]9 [przynosi]10 [ręcznik]11. [Tatzli]12 [jest]13 [znowu]14 [suchy]15 [i]16 [ciepły]17.',
          '[Tatzli]1 [shakes himself]2 [like a dog]3: [Brrr]4! [Now]5 [Daddy]7 [is]6 [wet]8! [Mummy]9 [brings]10 [the towel]11. [Tatzli]12 [is]13 [dry]15 [and]16 [warm]17 [again]14.',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'dr-1-ougschte-uf-em-gurte',
    title: t('Dr 1. Ougschte uf em Gurte', 'Der 1. August auf dem Gurten', '1 sierpnia na Gurtenie', 'The 1st of August on the Gurten'),
    level: 3,
    place: 'gurten',
    words: ['lampion', 'fahne', 'fuerwaerch', 'liisli', 'staern', 'himu', 'dunku', 'rot', 'wyss', 'gaeub', 'blau', 'brot', 'wurscht', 'chaes', 'familie', 'n1', 'n2', 'n3', 'mueed', 'geburtstag'],
    pages: [
      {
        scene: sc('gurten', [it('fahne', 70, 55, { scale: 1.2 }), it('tatzli', 35, 78, { pose: 'wave' })], 'summer', 'evening'),
        text: t(
          '[Hüt]1 [isch]2 [dr 1. Ougschte]3. [Das]4 [isch]5 [dr Geburtstag]6 [vo dr Schwyz]7!',
          '[Heute]1 [ist]2 [der 1. August]3. [Das]4 [ist]5 [der Geburtstag]6 [der Schweiz]7!',
          '[Dziś]1 [jest]2 [1 sierpnia]3. [To]4 [są]5 [urodziny]6 [Szwajcarii]7!',
          '[Today]1 [is]2 [the 1st of August]3. [It]4 [is]5 [Switzerland\'s]7 [birthday]6!',
        ),
      },
      {
        scene: sc('gurten', [it('papi-baer', 25, 76, { pose: 'walk' }), it('mami-baer', 42, 76, { pose: 'walk' }), it('lotti', 56, 80, { pose: 'walk' }), it('tatzli', 70, 78, { pose: 'walk' }), it('lampion', 76, 60, { scale: 0.5 })], 'summer', 'evening'),
        text: t(
          '[D ganzi Familie]1 [geit]2 [uf e Gurte]3. [Tatzli]4 [treit]5 [e Lampion]6. «[Isch es]7 [scho]8 [dunku]9?» [Papi]10 [lacht]11: «[No nid]12!»',
          '[Die ganze Familie]1 [geht]2 [auf den Gurten]3. [Tatzli]4 [trägt]5 [einen Lampion]6. «[Ist es]7 [schon]8 [dunkel]9?» [Papa]10 [lacht]11: «[Noch nicht]12!»',
          '[Cała rodzina]1 [idzie]2 [na Gurten]3. [Tatzli]4 [niesie]5 [lampion]6. „[Czy jest]7 [już]8 [ciemno]9?” [Tata]10 [się śmieje]11: „[Jeszcze nie]12!”',
          '[The whole family]1 [goes]2 [up the Gurten]3. [Tatzli]4 [carries]5 [a lantern]6. “[Is it]7 [dark]9 [yet]8?” [Daddy]10 [laughs]11: “[Not yet]12!”',
        ),
        question: {
          prompt: t('[Was]1 [treit]2 [Tatzli]3?', '[Was]1 [trägt]2 [Tatzli]3?', '[Co]1 [niesie]2 [Tatzli]3?', '[What]1 [does Tatzli]3 [carry]2?'),
          options: [
            { illu: 'ballon', label: t('E Ballon', 'Einen Ballon', 'Balon', 'A balloon') },
            { illu: 'lampion', label: t('E Lampion', 'Einen Lampion', 'Lampion', 'A lantern') },
            { illu: 'bau', label: t('E Bau', 'Einen Ball', 'Piłkę', 'A ball') },
          ],
          answer: 1,
        },
      },
      {
        scene: sc('gurten', [it('tatzli', 30, 78, { pose: 'look' }), it('lotti', 45, 80, { pose: 'look' }), it('zytglogge', 75, 62, { scale: 0.5 })], 'summer', 'evening'),
        text: t(
          '[Obe]1 [uf em Gurte]2 [gseht]3 [me]4 [ganz Bärn]5.',
          '[Oben]1 [auf dem Gurten]2 [sieht]3 [man]4 [ganz Bern]5.',
          '[Na górze]1, [na Gurtenie]2, [widać]3+4 [całe Berno]5.',
          '[Up]1 [on the Gurten]2 [you]4 [can see]3 [all of Bern]5.',
        ),
        choice: {
          prompt: t('[Was]1 [mache]2 [mir]3 [zersch]4?', '[Was]1 [machen]2 [wir]3 [zuerst]4?', '[Co]1 [robimy]2+3 [najpierw]4?', '[What]1 [do we]3 [do]2 [first]4?'),
          options: [
            { label: t('[Es Picknick]1', '[Ein Picknick]1', '[Piknik]1', '[A picnic]1'), illu: 'picnic-blanket', next: 3 },
            { label: t('[Fahne schwänke]1', '[Fahnen schwenken]1', '[Machać flagami]1', '[Wave flags]1'), illu: 'fahne', next: 4 },
          ],
        },
      },
      {
        scene: sc('gurten', [it('picnic-blanket', 50, 84, { scale: 1.6 }), it('brot', 42, 80, { scale: 0.4 }), it('wurscht', 52, 80, { scale: 0.4 }), it('chaes', 62, 80, { scale: 0.4 }), it('tatzli', 30, 78, { pose: 'eat' }), it('mami-baer', 75, 76)], 'summer', 'evening'),
        text: t(
          '[Uf dr Decki]1 [git es]2 [Brot]3, [Wurscht]4 [und]5 [Chäs]6. [E Guete]7! «[Isch es]8 [scho]9 [dunku]10?» [Mami]11 [lacht]12: «[No nid]13!»',
          '[Auf der Decke]1 [gibt es]2 [Brot]3, [Wurst]4 [und]5 [Käse]6. [Guten Appetit]7! «[Ist es]8 [schon]9 [dunkel]10?» [Mama]11 [lacht]12: «[Noch nicht]13!»',
          '[Na kocu]1 [jest]2 [chleb]3, [kiełbasa]4 [i]5 [ser]6. [Smacznego]7! „[Czy jest]8 [już]9 [ciemno]10?” [Mama]11 [się śmieje]12: „[Jeszcze nie]13!”',
          '[On the blanket]1 [there is]2 [bread]3, [sausage]4 [and]5 [cheese]6. [Enjoy your meal]7! “[Is it]8 [dark]10 [yet]9?” [Mummy]11 [laughs]12: “[Not yet]13!”',
        ),
        choice: {
          prompt: t('[Es wird]1 [dunku]2. [Was]3 [jitz]4?', '[Es wird]1 [dunkel]2. [Was]3 [jetzt]4?', '[Robi się]1 [ciemno]2. [Co]3 [teraz]4?', '[It is getting]1 [dark]2. [What]3 [now]4?'),
          options: [
            { label: t('[D Lampions]1', '[Die Lampions]1', '[Lampiony]1', '[The lanterns]1'), illu: 'lampion', next: 5 },
            { label: t('[D Stärne]1', '[Die Sterne]1', '[Gwiazdy]1', '[The stars]1'), illu: 'staern', next: 6 },
          ],
        },
      },
      {
        scene: sc('gurten', [it('tatzli', 35, 80, { pose: 'sit' }), it('fahne', 38, 58, { scale: 0.6 }), it('lotti', 58, 80, { pose: 'laugh' }), it('fahne', 60, 60, { scale: 0.5 })], 'summer', 'evening'),
        text: t(
          '[Tatzli]1 [und]2 [Lotti]3 [schwänke]4 [d Fahne]5. [Rot]6 [und]7 [wyss]8! [Hoppla]9 – [Tatzli]10 [schwänkt]11 [so fescht]12, [er]13 [gheit um]14!',
          '[Tatzli]1 [und]2 [Lotti]3 [schwenken]4 [die Fahnen]5. [Rot]6 [und]7 [weiss]8! [Hoppla]9 – [Tatzli]10 [schwenkt]11 [so fest]12, [er]13 [fällt um]14!',
          '[Tatzli]1 [i]2 [Lotti]3 [machają]4 [flagami]5. [Czerwone]6 [i]7 [białe]8! [Ojej]9 – [Tatzli]10 [macha]11 [tak mocno]12, [że się przewraca]13+14!',
          '[Tatzli]1 [and]2 [Lotti]3 [wave]4 [the flags]5. [Red]6 [and]7 [white]8! [Oops]9 – [Tatzli]10 [waves]11 [so hard]12 [he]13 [falls over]14!',
        ),
        choice: {
          prompt: t('[Es wird]1 [dunku]2. [Was]3 [jitz]4?', '[Es wird]1 [dunkel]2. [Was]3 [jetzt]4?', '[Robi się]1 [ciemno]2. [Co]3 [teraz]4?', '[It is getting]1 [dark]2. [What]3 [now]4?'),
          options: [
            { label: t('[D Lampions]1', '[Die Lampions]1', '[Lampiony]1', '[The lanterns]1'), illu: 'lampion', next: 5 },
            { label: t('[D Stärne]1', '[Die Sterne]1', '[Gwiazdy]1', '[The stars]1'), illu: 'staern', next: 6 },
          ],
        },
      },
      {
        scene: sc('gurten', [it('lampion', 30, 55, { scale: 0.5 }), it('lampion', 50, 50, { scale: 0.5 }), it('lampion', 70, 55, { scale: 0.5 }), it('tatzli', 45, 78, { pose: 'hug' }), it('mami-baer', 60, 76, { pose: 'hug' }), it('sparkle', 85, 20, { scale: 0.4 })], 'summer', 'night'),
        text: t(
          '[D Lampions]1 [lüüchte]2 [rot]3, [gäub]4 [und]5 [blau]6. [Wyt wäg]7 [macht]8 [ds Füürwärch]9 [lysli]10: [Puff]11! [Tatzli]12 [hocket]13 [bim Mami]14.',
          '[Die Lampions]1 [leuchten]2 [rot]3, [gelb]4 [und]5 [blau]6. [Weit weg]7 [macht]8 [das Feuerwerk]9 [leise]10: [Puff]11! [Tatzli]12 [sitzt]13 [bei Mama]14.',
          '[Lampiony]1 [świecą]2 [na czerwono]3, [żółto]4 [i]5 [niebiesko]6. [Daleko]7 [fajerwerki]9 [robią]8 [cichutko]10: [puf]11! [Tatzli]12 [siedzi]13 [przy mamie]14.',
          '[The lanterns]1 [glow]2 [red]3, [yellow]4 [and]5 [blue]6. [Far away]7 [the fireworks]9 [go]8 [softly]10: [pop]11! [Tatzli]12 [sits]13 [with Mummy]14.',
        ),
        end: true,
      },
      {
        scene: sc('gurten', [it('staern', 25, 15, { scale: 0.4 }), it('staern', 50, 10, { scale: 0.4 }), it('staern', 75, 18, { scale: 0.4 }), it('tatzli', 40, 78, { pose: 'count' }), it('papi-baer', 60, 76), it('sparkle', 88, 25, { scale: 0.3 })], 'summer', 'night'),
        text: t(
          '[Dr Himu]1 [isch]2 [dunku]3. [Tatzli]4 [zellt]5 [d Stärne]6: [eis]7, [zwöi]8, [drü]9 … [Wyt wäg]10 [macht]11 [ds Füürwärch]12 [lysli]13: [Puff]14! [Tatzli]15 [isch]16 [müed]17 [u]18 [glücklech]19.',
          '[Der Himmel]1 [ist]2 [dunkel]3. [Tatzli]4 [zählt]5 [die Sterne]6: [eins]7, [zwei]8, [drei]9 … [Weit weg]10 [macht]11 [das Feuerwerk]12 [leise]13: [Puff]14! [Tatzli]15 [ist]16 [müde]17 [und]18 [glücklich]19.',
          '[Niebo]1 [jest]2 [ciemne]3. [Tatzli]4 [liczy]5 [gwiazdy]6: [jedna]7, [dwie]8, [trzy]9 … [Daleko]10 [fajerwerki]12 [robią]11 [cichutko]13: [puf]14! [Tatzli]15 [jest]16 [zmęczony]17 [i]18 [szczęśliwy]19.',
          '[The sky]1 [is]2 [dark]3. [Tatzli]4 [counts]5 [the stars]6: [one]7, [two]8, [three]9 … [Far away]10 [the fireworks]12 [go]11 [softly]13: [pop]14! [Tatzli]15 [is]16 [tired]17 [and]18 [happy]19.',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'dr-erscht-schueutag',
    title: t('Dr erscht Schueutag', 'Der erste Schultag', 'Pierwszy dzień szkoły', 'The first day of school'),
    level: 3,
    place: 'school',
    words: ['schueu', 'thek', 'lehrerin', 'buechstabe', 'bleistift', 'zahl', 'n1', 'n2', 'n3', 'n4', 'n5', 'pouse', 'rutschbahn', 'rytti', 'schrybe', 'zelle', 'winke', 'mittag', 'oepfu', 'noei'],
    pages: [
      {
        scene: sc('school', [it('tatzli', 40, 78, { pose: 'stand' }), it('thek', 52, 68, { scale: 0.5 }), it('mami-baer', 65, 76)], 'autumn'),
        text: t(
          '[Hüt]1 [isch]2 [dr erscht Schueutag]3. [Tatzli]4 [het]5 [e nöie Thek]6. [Dä]7 [isch]8 [fasch]9 [so gross]10 [wie Tatzli]11!',
          '[Heute]1 [ist]2 [der erste Schultag]3. [Tatzli]4 [hat]5 [einen neuen Schulranzen]6. [Der]7 [ist]8 [fast]9 [so gross]10 [wie Tatzli]11!',
          '[Dziś]1 [jest]2 [pierwszy dzień szkoły]3. [Tatzli]4 [ma]5 [nowy tornister]6. [Jest]7+8 [prawie]9 [tak duży]10 [jak Tatzli]11!',
          '[Today]1 [is]2 [the first day of school]3. [Tatzli]4 [has]5 [a new school bag]6. [It]7 [is]8 [almost]9 [as big]10 [as Tatzli]11!',
        ),
      },
      {
        scene: sc('school', [it('lotti', 20, 80, { pose: 'wave' }), it('tatzli', 45, 78, { pose: 'wave' }), it('uele', 75, 70, { scale: 1.1 }), it('wandtafele', 75, 40, { scale: 0.8 })], 'autumn'),
        text: t(
          '[Lotti]1 [winkt]2: «[Tschou]3, [Tatzli]4!» [D Lehrerin]5 [seit]6: «[Grüessech]7 [mitenand]8!» [Säg o]9: «[Grüessech]10!»',
          '[Lotti]1 [winkt]2: «[Tschüss]3, [Tatzli]4!» [Die Lehrerin]5 [sagt]6: «[Guten Morgen]7 [zusammen]8!» [Sag auch]9: «[Guten Morgen]10!»',
          '[Lotti]1 [macha]2: „[Pa pa]3, [Tatzli]4!” [Pani nauczycielka]5 [mówi]6: „[Dzień dobry]7 [wszystkim]8!” [Powiedz też]9: „[Dzień dobry]10!”',
          '[Lotti]1 [waves]2: “[Bye]3, [Tatzli]4!” [The teacher]5 [says]6: “[Good morning]7, [everyone]8!” [You say it too]9: “[Good morning]10!”',
        ),
        question: {
          prompt: t('[Was]1 [het]2 [Tatzli]3 [Nöis]4?', '[Was]1 [hat]2 [Tatzli]3 [Neues]4?', '[Co]1 [nowego]4 [ma]2 [Tatzli]3?', '[What]1 [new thing]4 [does Tatzli]3 [have]2?'),
          options: [
            { illu: 'velo', label: t('Es Velo', 'Ein Fahrrad', 'Rower', 'A bike') },
            { illu: 'teddy', label: t('E Teddy', 'Einen Teddy', 'Misia', 'A teddy') },
            { illu: 'thek', label: t('E Thek', 'Einen Schulranzen', 'Tornister', 'A school bag') },
          ],
          answer: 2,
        },
      },
      {
        scene: sc('school', [it('tatzli', 35, 78, { pose: 'sit' }), it('freddie', 55, 78, { pose: 'sit' }), it('uele', 80, 70, { scale: 1.1, pose: 'point' }), it('wandtafele', 70, 38, { scale: 0.8 })], 'autumn'),
        text: t(
          '[Tatzli]1 [hocket]2 [näbe Freddie]3. [D Lehrerin]4 [fragt]5: «[Was]6 [wei]7 [mir]8 [mache]9?»',
          '[Tatzli]1 [sitzt]2 [neben Freddie]3. [Die Lehrerin]4 [fragt]5: «[Was]6 [wollen]7 [wir]8 [machen]9?»',
          '[Tatzli]1 [siedzi]2 [obok Freddiego]3. [Pani nauczycielka]4 [pyta]5: „[Co]6 [będziemy]7+8 [robić]9?”',
          '[Tatzli]1 [sits]2 [next to Freddie]3. [The teacher]4 [asks]5: “[What]6 [shall]7 [we]8 [do]9?”',
        ),
        choice: {
          prompt: t('[Was]1 [wählt]2 [Tatzli]3?', '[Was]1 [wählt]2 [Tatzli]3?', '[Co]1 [wybiera]2 [Tatzli]3?', '[What]1 [does Tatzli]3 [choose]2?'),
          options: [
            { label: t('[Schrybe]1', '[Schreiben]1', '[Pisać]1', '[Writing]1'), illu: 'bleistift', next: 3 },
            { label: t('[Zelle]1', '[Zählen]1', '[Liczyć]1', '[Counting]1'), illu: 'zahl', next: 4 },
          ],
        },
      },
      {
        scene: sc('school', [it('tatzli', 35, 78, { pose: 'write' }), it('bleistift', 45, 66, { scale: 0.4 }), it('buechstabe', 70, 38, { scale: 0.8 }), it('freddie', 55, 78, { pose: 'write' })], 'autumn'),
        text: t(
          '[Tatzli]1 [schrybt]2 [es T]3. [T]4 [wie Tatzli]5! [Freddie]6 [schrybt]7 [es F]8. [F]9 [wie Freddie]10! [Und du]11? [Wele Buechstabe]12 [hesch]13 [du]14?',
          '[Tatzli]1 [schreibt]2 [ein T]3. [T]4 [wie Tatzli]5! [Freddie]6 [schreibt]7 [ein F]8. [F]9 [wie Freddie]10! [Und du]11? [Welchen Buchstaben]12 [hast]13 [du]14?',
          '[Tatzli]1 [pisze]2 [literę T]3. [T]4 [jak Tatzli]5! [Freddie]6 [pisze]7 [literę F]8. [F]9 [jak Freddie]10! [A ty]11? [Jaką literę]12 [masz]13+14?',
          '[Tatzli]1 [writes]2 [a T]3. [T]4 [for Tatzli]5! [Freddie]6 [writes]7 [an F]8. [F]9 [for Freddie]10! [And you]11? [Which letter]12 [do you]14 [have]13?',
        ),
        choice: {
          prompt: t('[Jitz]1 [isch]2 [Pouse]3! [Wohi]4?', '[Jetzt]1 [ist]2 [Pause]3! [Wohin]4?', '[Teraz]1 [jest]2 [przerwa]3! [Dokąd]4?', '[Now]1 [it is]2 [break time]3! [Where to]4?'),
          options: [
            { label: t('[Uf d Rutschbahn]1', '[Zur Rutsche]1', '[Na zjeżdżalnię]1', '[To the slide]1'), illu: 'rutschbahn', next: 5 },
            { label: t('[Uf d Ryti]1', '[Zur Schaukel]1', '[Na huśtawkę]1', '[To the swing]1'), illu: 'rytti', next: 6 },
          ],
        },
      },
      {
        scene: sc('school', [it('tatzli', 35, 78, { pose: 'count' }), it('oepfu', 55, 60, { scale: 0.35 }), it('oepfu', 62, 60, { scale: 0.35 }), it('oepfu', 69, 60, { scale: 0.35 }), it('oepfu', 76, 60, { scale: 0.35 }), it('oepfu', 83, 60, { scale: 0.35 }), it('uele', 85, 74, { pose: 'clap' })], 'autumn'),
        text: t(
          '[Tatzli]1 [zellt]2 [d Öpfu]3. [Zell]4 [mit]5: [eis]6, [zwöi]7, [drü]8, [vier]9, [füf]10! [D Lehrerin]11 [seit]12: «[Super]13!»',
          '[Tatzli]1 [zählt]2 [die Äpfel]3. [Zähl]4 [mit]5: [eins]6, [zwei]7, [drei]8, [vier]9, [fünf]10! [Die Lehrerin]11 [sagt]12: «[Super]13!»',
          '[Tatzli]1 [liczy]2 [jabłka]3. [Licz]4 [razem]5: [jeden]6, [dwa]7, [trzy]8, [cztery]9, [pięć]10! [Pani nauczycielka]11 [mówi]12: „[Super]13!”',
          '[Tatzli]1 [counts]2 [the apples]3. [Count]4 [along]5: [one]6, [two]7, [three]8, [four]9, [five]10! [The teacher]11 [says]12: “[Super]13!”',
        ),
        choice: {
          prompt: t('[Jitz]1 [isch]2 [Pouse]3! [Wohi]4?', '[Jetzt]1 [ist]2 [Pause]3! [Wohin]4?', '[Teraz]1 [jest]2 [przerwa]3! [Dokąd]4?', '[Now]1 [it is]2 [break time]3! [Where to]4?'),
          options: [
            { label: t('[Uf d Rutschbahn]1', '[Zur Rutsche]1', '[Na zjeżdżalnię]1', '[To the slide]1'), illu: 'rutschbahn', next: 5 },
            { label: t('[Uf d Ryti]1', '[Zur Schaukel]1', '[Na huśtawkę]1', '[To the swing]1'), illu: 'rytti', next: 6 },
          ],
        },
      },
      {
        scene: sc('school', [it('rutschbahn', 50, 72, { scale: 1.5 }), it('tatzli', 45, 70, { pose: 'laugh' }), it('freddie', 70, 78, { pose: 'laugh' }), it('mami-baer', 88, 76, { pose: 'wave' })], 'autumn'),
        text: t(
          '[Tatzli]1 [und]2 [Freddie]3 [rutsche]4. [Hui]5! [Am Mittag]6 [chunnt]7 [Mami]8. [Tatzli]9 [seit]10: «[D Schueu]11 [isch]12 [schön]13!»',
          '[Tatzli]1 [und]2 [Freddie]3 [rutschen]4. [Hui]5! [Am Mittag]6 [kommt]7 [Mama]8. [Tatzli]9 [sagt]10: «[Die Schule]11 [ist]12 [schön]13!»',
          '[Tatzli]1 [i]2 [Freddie]3 [zjeżdżają]4. [Hura]5! [W południe]6 [przychodzi]7 [mama]8. [Tatzli]9 [mówi]10: „[Szkoła]11 [jest]12 [fajna]13!”',
          '[Tatzli]1 [and]2 [Freddie]3 [slide]4. [Wheee]5! [At lunchtime]6 [Mummy]8 [comes]7. [Tatzli]9 [says]10: “[School]11 [is]12 [lovely]13!”',
        ),
        end: true,
      },
      {
        scene: sc('school', [it('rytti', 50, 80, { scale: 1.6 }), it('tatzli', 35, 72, { pose: 'laugh' }), it('freddie', 65, 76, { pose: 'laugh' }), it('mami-baer', 88, 76, { pose: 'wave' })], 'autumn'),
        text: t(
          '[Tatzli]1 [und]2 [Freddie]3 [gygampfe]4. [Uf]5 [und]6 [ab]7! [Am Mittag]8 [chunnt]9 [Mami]10. [Tatzli]11 [seit]12: «[D Schueu]13 [isch]14 [schön]15!»',
          '[Tatzli]1 [und]2 [Freddie]3 [schaukeln]4. [Hoch]5 [und]6 [runter]7! [Am Mittag]8 [kommt]9 [Mama]10. [Tatzli]11 [sagt]12: «[Die Schule]13 [ist]14 [schön]15!»',
          '[Tatzli]1 [i]2 [Freddie]3 [bujają się]4. [W górę]5 [i]6 [w dół]7! [W południe]8 [przychodzi]9 [mama]10. [Tatzli]11 [mówi]12: „[Szkoła]13 [jest]14 [fajna]15!”',
          '[Tatzli]1 [and]2 [Freddie]3 [swing]4. [Up]5 [and]6 [down]7! [At lunchtime]8 [Mummy]10 [comes]9. [Tatzli]11 [says]12: “[School]13 [is]14 [lovely]15!”',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'd-zytglogge-schlaht-zwoeuf',
    title: t('Dr Zytglogge schlaht zwöufi', 'Der Zeitglockenturm schlägt zwölf', 'Wieża zegarowa wybija dwunastą', 'The clock tower strikes twelve'),
    level: 3,
    place: 'zytglogge',
    words: ['zytglogge', 'uhr', 'gueggu', 'baer', 'n1', 'n2', 'n3', 'n12', 'glace', 'tanze', 'zelle', 'winke', 'uele', 'kreis'],
    pages: [
      {
        scene: sc('zytglogge', [it('zytglogge', 70, 50, { scale: 1.8 }), it('tatzli', 25, 78, { pose: 'look' }), it('tante-ottilie', 40, 74)]),
        text: t(
          '[Tatzli]1 [und]2 [Tante Ottilie]3 [stöh]4 [vor em Zytglogge]5. [D Uhr]6 [isch]7 [riesig]8!',
          '[Tatzli]1 [und]2 [Tante Ottilie]3 [stehen]4 [vor dem Zeitglockenturm]5. [Die Uhr]6 [ist]7 [riesig]8!',
          '[Tatzli]1 [i]2 [ciocia Ottilie]3 [stoją]4 [przed wieżą zegarową]5. [Zegar]6 [jest]7 [ogromny]8!',
          '[Tatzli]1 [and]2 [Aunt Ottilie]3 [stand]4 [in front of the clock tower]5. [The clock]6 [is]7 [huge]8!',
        ),
      },
      {
        scene: sc('zytglogge', [it('zytglogge', 70, 50, { scale: 1.8 }), it('tante-ottilie', 40, 74, { pose: 'point' }), it('tatzli', 25, 78, { pose: 'listen' })]),
        text: t(
          '[Tante Ottilie]1 [seit]2: «[Gleich]3 [ist es]4 [zwölf Uhr]5!» [Aui Lüt]6 [luege]7 [ufe]8.',
          '[Tante Ottilie]1 [sagt]2: «[Gleich]3 [ist es]4 [zwölf Uhr]5!» [Alle Leute]6 [schauen]7 [hinauf]8.',
          '[Ciocia Ottilie]1 [mówi]2: „[Zaraz]3 [będzie]4 [dwunasta]5!” [Wszyscy ludzie]6 [patrzą]7 [w górę]8.',
          '[Aunt Ottilie]1 [says]2: “[Soon]3 [it will be]4 [twelve o\'clock]5!” [All the people]6 [look]7 [up]8.',
        ),
        question: {
          prompt: t('[Wär]1 [isch]2 [mit Tatzli]3 [bim Zytglogge]4?', '[Wer]1 [ist]2 [mit Tatzli]3 [beim Zeitglockenturm]4?', '[Kto]1 [jest]2 [z Tatzlim]3 [przy wieży zegarowej]4?', '[Who]1 [is]2 [with Tatzli]3 [at the clock tower]4?'),
          options: [
            { illu: 'kasia', label: t('Kasia', 'Kasia', 'Kasia', 'Kasia') },
            { illu: 'grosi-baer', label: t('Grosi', 'Oma', 'Babcia', 'Granny') },
            { illu: 'tante-ottilie', label: t('Tante Ottilie', 'Tante Ottilie', 'Ciocia Ottilie', 'Aunt Ottilie') },
          ],
          answer: 2,
        },
      },
      {
        scene: sc('zytglogge', [it('zytglogge', 70, 50, { scale: 1.8 }), it('gueggu', 78, 25, { scale: 0.5 }), it('baer', 60, 40, { scale: 0.3 }), it('baer', 66, 40, { scale: 0.3 }), it('tatzli', 25, 78, { pose: 'point' })]),
        text: t(
          '[Dr Güggu]1 [rüeft]2: «[Kikeriki]3!» [Tatzli]4 [rüeft]5 [o]6: «[Kikeriki]7!» [Aui Lüt]8 [lache]9. [D Bäre]10 [tanze]11 [im Chreis]12.',
          '[Der Hahn]1 [ruft]2: «[Kikeriki]3!» [Tatzli]4 [ruft]5 [auch]6: «[Kikeriki]7!» [Alle Leute]8 [lachen]9. [Die Bären]10 [tanzen]11 [im Kreis]12.',
          '[Kogut]1 [woła]2: „[Kukuryku]3!” [Tatzli]4 [też]6 [woła]5: „[Kukuryku]7!” [Wszyscy ludzie]8 [się śmieją]9. [Niedźwiadki]10 [tańczą]11 [w kółko]12.',
          '[The rooster]1 [calls]2: “[Cock-a-doodle-doo]3!” [Tatzli]4 [calls]5 [too]6: “[Cock-a-doodle-doo]7!” [All the people]8 [laugh]9. [The bears]10 [dance]11 [in a circle]12.',
        ),
        choice: {
          prompt: t('[Was]1 [macht]2 [Tatzli]3?', '[Was]1 [macht]2 [Tatzli]3?', '[Co]1 [robi]2 [Tatzli]3?', '[What]1 [does Tatzli]3 [do]2?'),
          options: [
            { label: t('[Mittanze]1', '[Mittanzen]1', '[Tańczyć razem]1', '[Dance along]1'), illu: 'tatzli', next: 3 },
            { label: t('[Mitzelle]1', '[Mitzählen]1', '[Liczyć razem]1', '[Count along]1'), illu: 'zahl', next: 4 },
          ],
        },
      },
      {
        scene: sc('zytglogge', [it('zytglogge', 75, 50, { scale: 1.6 }), it('tatzli', 35, 78, { pose: 'dance' }), it('tante-ottilie', 55, 74, { pose: 'clap' })]),
        text: t(
          '[Tatzli]1 [tanzt]2 [wie d Bäre]3. [Rundum, rundum]4! [Tante Ottilie]5 [rüeft]6: «[Wunderbar]7!»',
          '[Tatzli]1 [tanzt]2 [wie die Bären]3. [Rundherum, rundherum]4! [Tante Ottilie]5 [ruft]6: «[Wunderbar]7!»',
          '[Tatzli]1 [tańczy]2 [jak niedźwiadki]3. [W kółko, w kółko]4! [Ciocia Ottilie]5 [woła]6: „[Cudownie]7!”',
          '[Tatzli]1 [dances]2 [like the bears]3. [Round and round]4! [Aunt Ottilie]5 [calls]6: “[Wonderful]7!”',
        ),
        choice: {
          prompt: t('[D Glogge]1 [isch]2 [fertig]3. [Und]4 [jitz]5?', '[Die Glocke]1 [ist]2 [fertig]3. [Und]4 [jetzt]5?', '[Dzwon]1 [skończył]2+3. [A]4 [teraz]5?', '[The bell]1 [is]2 [finished]3. [And]4 [now]5?'),
          options: [
            { label: t('[E Glace]1', '[Ein Eis]1', '[Lody]1', '[An ice cream]1'), illu: 'glace', next: 5 },
            { label: t('[Zum Bärepark]1', '[Zum Bärenpark]1', '[Do parku niedźwiedzi]1', '[To the bear park]1'), illu: 'baer', next: 6 },
          ],
        },
      },
      {
        scene: sc('zytglogge', [it('zytglogge', 75, 50, { scale: 1.6 }), it('tatzli', 35, 78, { pose: 'count' }), it('tante-ottilie', 55, 74, { pose: 'clap' }), it('sparkle', 75, 20, { scale: 0.5 })]),
        text: t(
          '[Bong]1! [Bong]2! [Tatzli]3 [zellt]4 [mit]5: [eis]6, [zwöi]7, [drü]8 … [zwöuf]9! [Tante Ottilie]10 [rüeft]11: «[Ausgezeichnet]12!»',
          '[Bong]1! [Bong]2! [Tatzli]3 [zählt]4 [mit]5: [eins]6, [zwei]7, [drei]8 … [zwölf]9! [Tante Ottilie]10 [ruft]11: «[Ausgezeichnet]12!»',
          '[Bim]1! [Bom]2! [Tatzli]3 [liczy]4 [razem]5: [jeden]6, [dwa]7, [trzy]8 … [dwanaście]9! [Ciocia Ottilie]10 [woła]11: „[Doskonale]12!”',
          '[Bong]1! [Bong]2! [Tatzli]3 [counts]4 [along]5: [one]6, [two]7, [three]8 … [twelve]9! [Aunt Ottilie]10 [calls]11: “[Excellent]12!”',
        ),
        choice: {
          prompt: t('[D Glogge]1 [isch]2 [fertig]3. [Und]4 [jitz]5?', '[Die Glocke]1 [ist]2 [fertig]3. [Und]4 [jetzt]5?', '[Dzwon]1 [skończył]2+3. [A]4 [teraz]5?', '[The bell]1 [is]2 [finished]3. [And]4 [now]5?'),
          options: [
            { label: t('[E Glace]1', '[Ein Eis]1', '[Lody]1', '[An ice cream]1'), illu: 'glace', next: 5 },
            { label: t('[Zum Bärepark]1', '[Zum Bärenpark]1', '[Do parku niedźwiedzi]1', '[To the bear park]1'), illu: 'baer', next: 6 },
          ],
        },
      },
      {
        scene: sc('zytglogge', [it('tatzli', 38, 78, { pose: 'eat' }), it('glace', 46, 64, { scale: 0.4 }), it('tante-ottilie', 58, 74, { pose: 'eat' }), it('glace', 64, 60, { scale: 0.4 }), it('heart-small', 50, 40)], 'summer'),
        text: t(
          '[Tante Ottilie]1 [chouft]2 [zwöi Glace]3. [Eis]4 [für Tatzli]5, [eis]6 [für sich]7. [Mmh]8, [chaut]9!',
          '[Tante Ottilie]1 [kauft]2 [zwei Eis]3. [Eins]4 [für Tatzli]5, [eins]6 [für sich]7. [Mmh]8, [kalt]9!',
          '[Ciocia Ottilie]1 [kupuje]2 [dwa lody]3. [Jedne]4 [dla Tatzliego]5, [jedne]6 [dla siebie]7. [Mmm]8, [zimne]9!',
          '[Aunt Ottilie]1 [buys]2 [two ice creams]3. [One]4 [for Tatzli]5, [one]6 [for herself]7. [Mmm]8, [cold]9!',
        ),
        end: true,
      },
      {
        scene: sc('baerepark', [it('baer', 70, 72, { scale: 1.5, pose: 'wave' }), it('tatzli', 30, 78, { pose: 'wave' }), it('tante-ottilie', 45, 74, { pose: 'laugh' }), it('heart-small', 52, 40)]),
        text: t(
          '[Im Bärepark]1 [winke]2 [d Bäre]3. [Tatzli]4 [winkt]5 [zrügg]6. [Tante Ottilie]7 [lacht]8: «[Hu-hu]9!»',
          '[Im Bärenpark]1 [winken]2 [die Bären]3. [Tatzli]4 [winkt]5 [zurück]6. [Tante Ottilie]7 [lacht]8: «[Hu-hu]9!»',
          '[W parku niedźwiedzi]1 [niedźwiedzie]3 [machają]2. [Tatzli]4 [macha]5 [w odpowiedzi]6. [Ciocia Ottilie]7 [się śmieje]8: „[Hu-hu]9!”',
          '[In the bear park]1 [the bears]3 [wave]2. [Tatzli]4 [waves]5 [back]6. [Aunt Ottilie]7 [laughs]8: “[Hoo-hoo]9!”',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'kasia-und-d-nuess',
    title: t('Kasia und d Nüss', 'Kasia und die Nüsse', 'Kasia i orzechy', 'Kasia and the nuts'),
    level: 3,
    place: 'garden',
    words: ['herbscht', 'blatt', 'rot', 'gaeub', 'nuss', 'wind', 'boum', 'gras', 'igu', 'chuerbis', 'schnaegg', 'muus', 'bruun', 'liisli', 'n1', 'n2', 'n3', 'winter', 'eichhoernli'],
    pages: [
      {
        scene: sc('garden', [it('boum', 75, 65, { scale: 1.8 }), it('blatt', 30, 40, { scale: 0.4 }), it('blatt', 50, 30, { scale: 0.4 }), it('tatzli', 35, 78, { pose: 'look' })], 'autumn'),
        text: t(
          '[Es]1 [isch]2 [Herbscht]3. [D Bletter]4 [sy]5 [rot]6 [und]7 [gäub]8.',
          '[Es]1 [ist]2 [Herbst]3. [Die Blätter]4 [sind]5 [rot]6 [und]7 [gelb]8.',
          '[Jest]1+2 [jesień]3. [Liście]4 [są]5 [czerwone]6 [i]7 [żółte]8.',
          '[It]1 [is]2 [autumn]3. [The leaves]4 [are]5 [red]6 [and]7 [yellow]8.',
        ),
      },
      {
        scene: sc('garden', [it('kasia', 55, 80, { pose: 'count' }), it('nuss', 65, 86, { scale: 0.3 }), it('nuss', 70, 86, { scale: 0.3 }), it('nuss', 75, 86, { scale: 0.3 }), it('basket', 82, 84, { scale: 0.6 }), it('tatzli', 30, 78, { pose: 'look' })], 'autumn'),
        text: t(
          '[Kasia]1 [sammlet]2 [Nüss]3 [für e Winter]4. [Eis]5, [zwöi]6, [drü]7 … «[Orzechy]8!»',
          '[Kasia]1 [sammelt]2 [Nüsse]3 [für den Winter]4. [Eins]5, [zwei]6, [drei]7 … «[Orzechy]8!»',
          '[Kasia]1 [zbiera]2 [orzechy]3 [na zimę]4. [Jeden]5, [dwa]6, [trzy]7 … „[Orzechy]8!”',
          '[Kasia]1 [collects]2 [nuts]3 [for the winter]4. [One]5, [two]6, [three]7 … “[Orzechy]8!”',
        ),
        question: {
          prompt: t('[Was]1 [sammlet]2 [Kasia]3?', '[Was]1 [sammelt]2 [Kasia]3?', '[Co]1 [zbiera]2 [Kasia]3?', '[What]1 [does Kasia]3 [collect]2?'),
          options: [
            { illu: 'stei', label: t('Stei', 'Steine', 'Kamienie', 'Stones') },
            { illu: 'nuss', label: t('Nüss', 'Nüsse', 'Orzechy', 'Nuts') },
            { illu: 'oepfu', label: t('Öpfu', 'Äpfel', 'Jabłka', 'Apples') },
          ],
          answer: 1,
        },
      },
      {
        scene: sc('garden', [it('kasia', 50, 80, { pose: 'cry' }), it('basket', 62, 84, { scale: 0.6 }), it('tatzli', 30, 78, { pose: 'look' }), it('blatt', 70, 30, { scale: 0.4 }), it('blatt', 80, 40, { scale: 0.4 }), it('blatt', 88, 25, { scale: 0.4 })], 'autumn'),
        text: t(
          '[Hui]1! [E starche Wind]2! [D Nüss]3 [sy]4 [wäg]5!',
          '[Hui]1! [Ein starker Wind]2! [Die Nüsse]3 [sind]4 [weg]5!',
          '[Hu]1! [Silny wiatr]2! [Orzechów]3 [nie ma]4+5!',
          '[Whoosh]1! [A strong wind]2! [The nuts]3 [are]4 [gone]5!',
        ),
        choice: {
          prompt: t('[Wo]1 [sueche]2 [si]3?', '[Wo]1 [suchen]2 [sie]3?', '[Gdzie]1 [szukają]2+3?', '[Where]1 [do they]3 [look]2?'),
          options: [
            { label: t('[Bim Boum]1', '[Beim Baum]1', '[Przy drzewie]1', '[By the tree]1'), illu: 'boum', next: 3 },
            { label: t('[Im Gras]1', '[Im Gras]1', '[W trawie]1', '[In the grass]1'), illu: 'gras', next: 4 },
          ],
        },
      },
      {
        scene: sc('garden', [it('boum', 70, 65, { scale: 1.8 }), it('freddie', 62, 80, { pose: 'give' }), it('nuss', 52, 72, { scale: 0.3 }), it('kasia', 40, 80, { pose: 'take' }), it('tatzli', 25, 78)], 'autumn'),
        text: t(
          '[Bim Boum]1 [hocket]2 [Freddie]3. [Er]4 [het]5 [zwöi Nüss]6! «[Here you are]7!»',
          '[Beim Baum]1 [sitzt]2 [Freddie]3. [Er]4 [hat]5 [zwei Nüsse]6! «[Here you are]7!»',
          '[Przy drzewie]1 [siedzi]2 [Freddie]3. [Ma]4+5 [dwa orzechy]6! „[Here you are]7!”',
          '[By the tree]1 [sits]2 [Freddie]3. [He]4 [has]5 [two nuts]6! “[Here you are]7!”',
        ),
        choice: {
          prompt: t('[Wo]1 [isch]2 [di letscht Nuss]3?', '[Wo]1 [ist]2 [die letzte Nuss]3?', '[Gdzie]1 [jest]2 [ostatni orzech]3?', '[Where]1 [is]2 [the last nut]3?'),
          options: [
            { label: t('[Bim Igu]1', '[Beim Igel]1', '[Przy jeżu]1', '[By the hedgehog]1'), illu: 'igu', next: 5 },
            { label: t('[Im Chürbis]1', '[Im Kürbis]1', '[W dyni]1', '[In the pumpkin]1'), illu: 'chuerbis', next: 6 },
          ],
        },
      },
      {
        scene: sc('garden', [it('gras', 55, 85, { scale: 1.4 }), it('schnaegg', 60, 82, { scale: 0.5 }), it('nuss', 72, 85, { scale: 0.3 }), it('kasia', 40, 80, { pose: 'laugh' }), it('tatzli', 25, 78, { pose: 'point' })], 'autumn'),
        text: t(
          '[Im Gras]1 [isch]2 [öppis]3 [Bruuns]4. [E Nuss]5? [Nei]6, [e Schnägg]7! [Hallo]8, [Schnägg]9!',
          '[Im Gras]1 [ist]2 [etwas]3 [Braunes]4. [Eine Nuss]5? [Nein]6, [eine Schnecke]7! [Hallo]8, [Schnecke]9!',
          '[W trawie]1 [jest]2 [coś]3 [brązowego]4. [Orzech]5? [Nie]6, [ślimak]7! [Cześć]8, [ślimaku]9!',
          '[In the grass]1 [there is]2 [something]3 [brown]4. [A nut]5? [No]6, [a snail]7! [Hello]8, [snail]9!',
        ),
        choice: {
          prompt: t('[Wo]1 [isch]2 [di letscht Nuss]3?', '[Wo]1 [ist]2 [die letzte Nuss]3?', '[Gdzie]1 [jest]2 [ostatni orzech]3?', '[Where]1 [is]2 [the last nut]3?'),
          options: [
            { label: t('[Bim Igu]1', '[Beim Igel]1', '[Przy jeżu]1', '[By the hedgehog]1'), illu: 'igu', next: 5 },
            { label: t('[Im Chürbis]1', '[Im Kürbis]1', '[W dyni]1', '[In the pumpkin]1'), illu: 'chuerbis', next: 6 },
          ],
        },
      },
      {
        scene: sc('garden', [it('igu', 55, 84, { pose: 'sleep' }), it('blatt', 50, 86, { scale: 0.4 }), it('nuss', 66, 86, { scale: 0.3 }), it('kasia', 35, 80, { pose: 'take' }), it('tatzli', 20, 78), it('heart-small', 45, 45)], 'autumn'),
        text: t(
          '[Dr Igu]1 [schlaft]2 [i de Bletter]3. [Näbedra]4 [lyt]5 [d Nuss]6. [Psst]7, [lysli]8! [Jitz]9 [het]10 [Kasia]11 [aui Nüss]12. «[Dziękuję]13!»',
          '[Der Igel]1 [schläft]2 [in den Blättern]3. [Daneben]4 [liegt]5 [die Nuss]6. [Psst]7, [leise]8! [Jetzt]9 [hat]10 [Kasia]11 [alle Nüsse]12. «[Dziękuję]13!»',
          '[Jeż]1 [śpi]2 [w liściach]3. [Obok]4 [leży]5 [orzech]6. [Ćśś]7, [cicho]8! [Teraz]9 [Kasia]11 [ma]10 [wszystkie orzechy]12. „[Dziękuję]13!”',
          '[The hedgehog]1 [sleeps]2 [in the leaves]3. [Next to him]4 [lies]5 [the nut]6. [Shh]7, [quietly]8! [Now]9 [Kasia]11 [has]10 [all the nuts]12. “[Dziękuję]13!”',
        ),
        end: true,
      },
      {
        scene: sc('garden', [it('chuerbis', 60, 82, { scale: 1.2 }), it('muus', 62, 72, { scale: 0.4 }), it('nuss', 55, 74, { scale: 0.3 }), it('kasia', 38, 80, { pose: 'laugh' }), it('tatzli', 22, 78, { pose: 'laugh' }), it('heart-small', 48, 45)], 'autumn'),
        text: t(
          '[Im Chürbis]1? [Ja]2! [D Muus]3 [het]4 [d Nuss]5. [Si]6 [git]7 [d Nuss]8 [zrügg]9. [Jitz]10 [het]11 [Kasia]12 [aui Nüss]13. «[Dziękuję]14!»',
          '[Im Kürbis]1? [Ja]2! [Die Maus]3 [hat]4 [die Nuss]5. [Sie]6 [gibt]7 [die Nuss]8 [zurück]9. [Jetzt]10 [hat]11 [Kasia]12 [alle Nüsse]13. «[Dziękuję]14!»',
          '[W dyni]1? [Tak]2! [Mysz]3 [ma]4 [orzech]5. [Oddaje]6+7+9 [orzech]8. [Teraz]10 [Kasia]12 [ma]11 [wszystkie orzechy]13. „[Dziękuję]14!”',
          '[In the pumpkin]1? [Yes]2! [The mouse]3 [has]4 [the nut]5. [She]6 [gives]7 [the nut]8 [back]9. [Now]10 [Kasia]12 [has]11 [all the nuts]13. “[Dziękuję]14!”',
        ),
        end: true,
      },
    ],
  },
  {
    id: 'd-huette-im-zimmer',
    title: t('D Hütte im Zimmer', 'Die Hütte im Zimmer', 'Domek w pokoju', 'The den in the room'),
    level: 3,
    place: 'room',
    words: ['raege', 'zimmer', 'decki', 'chuessi', 'stueu', 'lampe', 'teddy', 'buech', 'chatz', 'dunku', 'hell', 'boue', 'laese', 'faenschter'],
    pages: [
      {
        scene: sc('room', [it('faenschter', 70, 38, { scale: 1.2 }), it('raege', 70, 30, { scale: 0.6 }), it('tatzli', 30, 78, { pose: 'sit' }), it('lotti', 48, 80, { pose: 'sit' })], 'autumn'),
        text: t(
          '[Es rägnet]1. [Tatzli]2 [und]3 [Lotti]4 [sy]5 [im Zimmer]6. [Langwylig]7!',
          '[Es regnet]1. [Tatzli]2 [und]3 [Lotti]4 [sind]5 [im Zimmer]6. [Langweilig]7!',
          '[Pada deszcz]1. [Tatzli]2 [i]3 [Lotti]4 [są]5 [w pokoju]6. [Nudno]7!',
          '[It is raining]1. [Tatzli]2 [and]3 [Lotti]4 [are]5 [in their room]6. [Boring]7!',
        ),
      },
      {
        scene: sc('room', [it('tatzli', 35, 78, { pose: 'armsUp' }), it('decki', 55, 80, { scale: 0.8 }), it('chuessi', 68, 82, { scale: 0.6 }), it('stueu', 82, 76), it('lotti', 20, 80, { pose: 'listen' }), it('sparkle', 35, 45, { scale: 0.5 })], 'autumn'),
        text: t(
          '[Tatzli]1 [het]2 [e Idee]3: «[Mir]4 [boue]5 [e Hütte]6!» [Mit]7 [ere Decki]8, [Chüssi]9 [u]10 [Stüeu]11.',
          '[Tatzli]1 [hat]2 [eine Idee]3: «[Wir]4 [bauen]5 [eine Hütte]6!» [Mit]7 [einer Decke]8, [Kissen]9 [und]10 [Stühlen]11.',
          '[Tatzli]1 [ma]2 [pomysł]3: „[Budujemy]4+5 [domek]6!” [Z]7 [koca]8, [poduszek]9 [i]10 [krzeseł]11.',
          '[Tatzli]1 [has]2 [an idea]3: “[Let\'s]4 [build]5 [a den]6!” [With]7 [a blanket]8, [cushions]9 [and]10 [chairs]11.',
        ),
        question: {
          prompt: t('[Was]1 [boue]2 [Tatzli und Lotti]3?', '[Was]1 [bauen]2 [Tatzli und Lotti]3?', '[Co]1 [budują]2 [Tatzli i Lotti]3?', '[What]1 [do Tatzli and Lotti]3 [build]2?'),
          options: [
            { illu: 'schneema', label: t('E Schneema', 'Einen Schneemann', 'Bałwana', 'A snowman') },
            { illu: 'sandcastle', label: t('E Sandburg', 'Eine Sandburg', 'Zamek z piasku', 'A sandcastle') },
            { illu: 'decki', label: t('E Hütte', 'Eine Hütte', 'Domek', 'A den') },
          ],
          answer: 2,
        },
      },
      {
        scene: sc('room', [it('stueu', 35, 76), it('stueu', 70, 76), it('decki', 52, 66, { scale: 1.6 }), it('tatzli', 52, 80, { pose: 'look' })], 'autumn'),
        text: t(
          '[D Hütte]1 [isch]2 [fertig]3! [Drinne]4 [isch es]5 [dunku]6. [Tatzli]7 [luegt]8 [use]9: [Kuckuck]10!',
          '[Die Hütte]1 [ist]2 [fertig]3! [Drinnen]4 [ist es]5 [dunkel]6. [Tatzli]7 [schaut]8 [heraus]9: [Kuckuck]10!',
          '[Domek]1 [jest]2 [gotowy]3! [W środku]4 [jest]5 [ciemno]6. [Tatzli]7 [wygląda]8+9: [a kuku]10!',
          '[The den]1 [is]2 [ready]3! [Inside]4 [it is]5 [dark]6. [Tatzli]7 [peeks]8 [out]9: [peekaboo]10!',
        ),
        choice: {
          prompt: t('[Was]1 [hole]2 [si]3?', '[Was]1 [holen]2 [sie]3?', '[Co]1 [przynoszą]2+3?', '[What]1 [do they]3 [fetch]2?'),
          options: [
            { label: t('[E Lampe]1', '[Eine Lampe]1', '[Lampkę]1', '[A lamp]1'), illu: 'lampe', next: 3 },
            { label: t('[Dr Teddy]1', '[Den Teddy]1', '[Misia]1', '[Teddy]1'), illu: 'teddy', next: 4 },
          ],
        },
      },
      {
        scene: sc('room', [it('stueu', 35, 76), it('stueu', 70, 76), it('decki', 52, 66, { scale: 1.6 }), it('lampe', 45, 78, { scale: 0.5 }), it('tatzli', 55, 80, { pose: 'laugh' }), it('sparkle', 45, 65, { scale: 0.5 })], 'autumn'),
        text: t(
          '[Tatzli]1 [holt]2 [e Lampe]3. [Klick]4: [häll]5! [Klick]6: [dunku]7! [Klick]8: [häll]9! [Mach mit]10!',
          '[Tatzli]1 [holt]2 [eine Lampe]3. [Klick]4: [hell]5! [Klick]6: [dunkel]7! [Klick]8: [hell]9! [Mach mit]10!',
          '[Tatzli]1 [przynosi]2 [lampkę]3. [Klik]4: [jasno]5! [Klik]6: [ciemno]7! [Klik]8: [jasno]9! [Ty też]10!',
          '[Tatzli]1 [fetches]2 [a lamp]3. [Click]4: [light]5! [Click]6: [dark]7! [Click]8: [light]9! [Join in]10!',
        ),
        choice: {
          prompt: t('[Tock, tock]1! [Wär]2 [chunnt]3?', '[Klopf, klopf]1! [Wer]2 [kommt]3?', '[Puk, puk]1! [Kto]2 [przychodzi]3?', '[Knock, knock]1! [Who]2 [is coming]3?'),
          options: [
            { label: t('[Tante Ottilie]1', '[Tante Ottilie]1', '[Ciocia Ottilie]1', '[Aunt Ottilie]1'), illu: 'tante-ottilie', next: 5 },
            { label: t('[D Chatz]1', '[Die Katze]1', '[Kot]1', '[The cat]1'), illu: 'chatz', next: 6 },
          ],
        },
      },
      {
        scene: sc('room', [it('stueu', 35, 76), it('stueu', 70, 76), it('decki', 52, 66, { scale: 1.6 }), it('lotti', 45, 80, { pose: 'hug' }), it('teddy', 52, 76, { scale: 0.5 }), it('tatzli', 62, 80, { pose: 'laugh' })], 'autumn'),
        text: t(
          '[Lotti]1 [holt]2 [dr Teddy]3. [Dr Teddy]4 [wott]5 [o]6 [i d Hütte]7. [Kuckuck]8, [Teddy]9!',
          '[Lotti]1 [holt]2 [den Teddy]3. [Der Teddy]4 [will]5 [auch]6 [in die Hütte]7. [Kuckuck]8, [Teddy]9!',
          '[Lotti]1 [przynosi]2 [misia]3. [Miś]4 [też]6 [chce]5 [do domku]7. [A kuku]8, [misiu]9!',
          '[Lotti]1 [fetches]2 [Teddy]3. [Teddy]4 [wants]5 [to come into the den]7 [too]6. [Peekaboo]8, [Teddy]9!',
        ),
        choice: {
          prompt: t('[Tock, tock]1! [Wär]2 [chunnt]3?', '[Klopf, klopf]1! [Wer]2 [kommt]3?', '[Puk, puk]1! [Kto]2 [przychodzi]3?', '[Knock, knock]1! [Who]2 [is coming]3?'),
          options: [
            { label: t('[Tante Ottilie]1', '[Tante Ottilie]1', '[Ciocia Ottilie]1', '[Aunt Ottilie]1'), illu: 'tante-ottilie', next: 5 },
            { label: t('[D Chatz]1', '[Die Katze]1', '[Kot]1', '[The cat]1'), illu: 'chatz', next: 6 },
          ],
        },
      },
      {
        scene: sc('room', [it('decki', 52, 66, { scale: 1.6 }), it('tante-ottilie', 52, 76, { pose: 'read' }), it('buech', 52, 70, { scale: 0.4 }), it('tatzli', 35, 80, { pose: 'listen' }), it('lotti', 68, 80, { pose: 'listen' }), it('heart-small', 52, 40)], 'autumn'),
        text: t(
          '[Tante Ottilie]1 [bringt]2 [es Buech]3. [Si]4 [list]5: «[Es war einmal]6 …» [I dr Hütte]7 [isch es]8 [warm]9 [und]10 [gmüetlech]11.',
          '[Tante Ottilie]1 [bringt]2 [ein Buch]3. [Sie]4 [liest]5: «[Es war einmal]6 …» [In der Hütte]7 [ist es]8 [warm]9 [und]10 [gemütlich]11.',
          '[Ciocia Ottilie]1 [przynosi]2 [książkę]3. [Czyta]4+5: „[Dawno, dawno temu]6 …” [W domku]7 [jest]8 [ciepło]9 [i]10 [przytulnie]11.',
          '[Aunt Ottilie]1 [brings]2 [a book]3. [She]4 [reads]5: “[Once upon a time]6 …” [In the den]7 [it is]8 [warm]9 [and]10 [cosy]11.',
        ),
        end: true,
      },
      {
        scene: sc('room', [it('decki', 52, 66, { scale: 1.6 }), it('chatz', 52, 80, { pose: 'sleep' }), it('tatzli', 35, 80, { pose: 'laugh' }), it('lotti', 68, 80, { pose: 'hug' }), it('heart-small', 52, 40)], 'autumn'),
        text: t(
          '[D Chatz]1 [chunnt]2 [o]3 [i d Hütte]4. [Si]5 [schnurrt]6: [Rrrr]7. [I dr Hütte]8 [isch es]9 [warm]10 [und]11 [gmüetlech]12.',
          '[Die Katze]1 [kommt]2 [auch]3 [in die Hütte]4. [Sie]5 [schnurrt]6: [Rrrr]7. [In der Hütte]8 [ist es]9 [warm]10 [und]11 [gemütlich]12.',
          '[Kot]1 [też]3 [przychodzi]2 [do domku]4. [Mruczy]5+6: [mrrr]7. [W domku]8 [jest]9 [ciepło]10 [i]11 [przytulnie]12.',
          '[The cat]1 [comes]2 [into the den]4 [too]3. [She]5 [purrs]6: [purrr]7. [In the den]8 [it is]9 [warm]10 [and]11 [cosy]12.',
        ),
        end: true,
      },
    ],
  },
]
