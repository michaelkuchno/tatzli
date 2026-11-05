import type { Level, Phrase, PhraseTag, Pose } from './types'

type Opt = { words?: string[]; pose?: Pose; illu?: string; tags?: PhraseTag[] }
function p(id: string, level: Level, be: string, de: string, pl: string, en: string, o: Opt = {}): Phrase {
  return { id, level, src: { be, de, pl, en }, words: o.words, pose: o.pose, illu: o.illu, tags: o.tags }
}

export const PHRASES: Phrase[] = [
  // ---------- greetings & social ----------
  p('hallo', 1, '[Hallo]1!', '[Hallo]1!', '[Cześć]1!', '[Hello]1!', { tags: ['greeting'], illu: 'pose-wave' }),
  p('grueessech', 2, '[Grüessech]1!', '[Guten Tag]1!', '[Dzień dobry]1!', '[Good day]1!', { tags: ['greeting'], illu: 'pose-wave' }),
  p('tschou', 1, '[Tschou]1!', '[Tschüss]1!', '[Pa pa]1!', '[Bye]1!', { tags: ['greeting'], illu: 'pose-wave' }),
  p('guete-morge', 1, '[Guete Morge]1!', '[Guten Morgen]1!', '[Dzień dobry]1!', '[Good morning]1!', { tags: ['greeting'], words: ['morge'], illu: 'morge' }),
  p('gueti-nacht', 1, '[Gueti Nacht]1!', '[Gute Nacht]1!', '[Dobranoc]1!', '[Good night]1!', { tags: ['greeting'], words: ['nacht'], illu: 'sleeping-tatzli' }),
  p('merci', 1, '[Merci]1!', '[Danke]1!', '[Dziękuję]1!', '[Thank you]1!', { tags: ['greeting'], illu: 'heart-small' }),
  p('merci-viu-mau', 2, '[Merci]1 [viu mau]2!', '[Vielen]2 [Dank]1!', '[Dziękuję]1 [bardzo]2!', '[Thank you]1 [very much]2!', { tags: ['greeting', 'shop'], illu: 'heart-small' }),
  p('bitte', 1, '[Bitte]1!', '[Bitte]1!', '[Proszę]1!', '[Please]1!', { tags: ['greeting'], illu: 'heart-small' }),
  p('en-guete', 1, '[En Guete]1!', '[Guten Appetit]1!', '[Smacznego]1!', '[Enjoy your meal]1!', { tags: ['home'], illu: 'zmittag' }),
  p('wie-geits', 2, '[Wie]1 [geit]2 [s dir]3?', '[Wie]1 [geht]2 [es dir]3?', '[Jak]1 [się]3 [masz]2+3?', '[How]1 [are]2 [you]3?', { tags: ['greeting', 'question'], illu: 'freddie' }),
  p('mir-geits-guet', 2, '[Mir]1 [geit s]2 [guet]3.', '[Mir]1 [geht es]2 [gut]3.', '[Mam się]1+2 [dobrze]3.', '[I am]1+2 [fine]3.', { tags: ['greeting', 'feelings'], illu: 'froehlech' }),
  p('i-heisse', 2, '[I]1 [heisse]2 [Tatzli]3.', '[Ich]1 [heisse]2 [Tatzli]3.', '[Nazywam się]1+2 [Tatzli]3.', '[My name is]1+2 [Tatzli]3.', { tags: ['greeting'], illu: 'tatzli' }),
  p('wie-heissisch', 2, '[Wie]1 [heissisch]2+3 [du]3?', '[Wie]1 [heisst]2 [du]3?', '[Jak]1 [masz na imię]2+3?', '[What is]1+2 [your name]3?', { tags: ['greeting', 'question'], illu: 'kasia' }),
  p('i-ha-di-gaern', 1, '[I]1 [ha di]2+3 [gärn]4.', '[Ich]1 [hab dich]2+3 [lieb]4.', '[Kocham]1+2+4 [cię]3.', '[I]1 [love]2+4 [you]3.', { tags: ['feelings', 'home'], illu: 'lieb' }),

  // ---------- TPR commands ----------
  p('gump', 1, '[Gump]1!', '[Spring]1!', '[Skacz]1!', '[Jump]1!', { tags: ['tpr'], pose: 'jump', words: ['gumpe'] }),
  p('klatsch', 1, '[Klatsch]1 [i d Händ]2!', '[Klatsch]1 [in die Hände]2!', '[Klaśnij]1 [w dłonie]2!', '[Clap]1 [your hands]2!', { tags: ['tpr'], pose: 'clap', words: ['klatsche', 'hand'] }),
  p('zeig-nase', 1, '[Zeig mer]1 [d Nase]2!', '[Zeig mir]1 [die Nase]2!', '[Pokaż]1 [nosek]2!', '[Show me]1 [your nose]2!', { tags: ['tpr'], pose: 'nose', words: ['zeige', 'nase'] }),
  p('winke', 1, '[Wink]1!', '[Wink]1!', '[Pomachaj]1!', '[Wave]1!', { tags: ['tpr'], pose: 'wave', words: ['winke'] }),
  p('draei-di', 2, '[Dräi di]1 [im Kreis]2!', '[Dreh dich]1 [im Kreis]2!', '[Obróć się]1 [w kółko]2!', '[Turn around]1 [in a circle]2!', { tags: ['tpr'], pose: 'turn', words: ['draeie', 'kreis'] }),
  p('hock-ab', 1, '[Hock ab]1!', '[Setz dich]1!', '[Usiądź]1!', '[Sit down]1!', { tags: ['tpr', 'chindsgi'], pose: 'sit', words: ['hocke'] }),
  p('stah-uf', 1, '[Stand uf]1!', '[Steh auf]1!', '[Wstań]1!', '[Stand up]1!', { tags: ['tpr'], pose: 'stand', words: ['stah'] }),
  p('stampf', 2, '[Stampf]1 [mit de Füess]2!', '[Stampf]1 [mit den Füssen]2!', '[Tupnij]1 [nogami]2!', '[Stomp]1 [your feet]2!', { tags: ['tpr'], pose: 'stomp', words: ['stampfe', 'fuess'] }),
  p('arme-ufe', 1, '[D Arme]1 [ufe]2!', '[Die Arme]1 [hoch]2!', '[Ręce]1 [do góry]2!', '[Arms]1 [up]2!', { tags: ['tpr'], pose: 'armsUp', words: ['arm'] }),
  p('mach-di-gross', 1, '[Mach di]1 [gross]2!', '[Mach dich]1 [gross]2!', '[Zrób się]1 [duży]2!', '[Make yourself]1 [big]2!', { tags: ['tpr'], pose: 'big', words: ['gross'] }),
  p('mach-di-chly', 1, '[Mach di]1 [chly]2!', '[Mach dich]1 [klein]2!', '[Zrób się]1 [mały]2!', '[Make yourself]1 [small]2!', { tags: ['tpr'], pose: 'small', words: ['chly'] }),
  p('tanz', 1, '[Tanz]1 [mit mir]2!', '[Tanz]1 [mit mir]2!', '[Zatańcz]1 [ze mną]2!', '[Dance]1 [with me]2!', { tags: ['tpr'], pose: 'dance', words: ['tanze'] }),
  p('flueg', 2, '[Flüg]1 [wie ne Vogu]2!', '[Flieg]1 [wie ein Vogel]2!', '[Leć]1 [jak ptak]2!', '[Fly]1 [like a bird]2!', { tags: ['tpr'], pose: 'fly', words: ['fluege', 'vogu'] }),
  p('schlaf-wie-baer', 1, '[Schlaf]1 [wie ne Bär]2!', '[Schlaf]1 [wie ein Bär]2!', '[Śpij]1 [jak niedźwiedź]2!', '[Sleep]1 [like a bear]2!', { tags: ['tpr'], pose: 'sleep', words: ['schlafe', 'baer'] }),
  p('schwuemm', 2, '[Schwümm]1 [wie ne Fisch]2!', '[Schwimm]1 [wie ein Fisch]2!', '[Płyń]1 [jak ryba]2!', '[Swim]1 [like a fish]2!', { tags: ['tpr'], pose: 'swim', words: ['schwuemme', 'fisch'] }),
  p('spring-schnaeu', 2, '[Spring]1 [schnäu]2!', '[Renn]1 [schnell]2!', '[Biegnij]1 [szybko]2!', '[Run]1 [fast]2!', { tags: ['tpr'], pose: 'run', words: ['springe', 'schnaeu'] }),
  p('louf-langsam', 2, '[Louf]1 [ganz langsam]2!', '[Geh]1 [ganz langsam]2!', '[Idź]1 [bardzo wolno]2!', '[Walk]1 [very slowly]2!', { tags: ['tpr'], pose: 'walk', words: ['loufe', 'langsam'] }),
  p('lueg', 2, '[Lueg]1 [obe]2!', '[Schau]1 [nach oben]2!', '[Popatrz]1 [w górę]2!', '[Look]1 [up]2!', { tags: ['tpr'], pose: 'look', words: ['luege', 'obe'] }),
  p('los-guet', 2, '[Los]1 [guet zue]2!', '[Hör]1 [gut zu]2!', '[Posłuchaj]1+2!', '[Listen]1+2 [carefully]2!', { tags: ['tpr', 'chindsgi'], pose: 'listen', words: ['lose'] }),
  p('zeig-ohr', 1, '[Zeig mer]1 [d Ohre]2!', '[Zeig mir]1 [die Ohren]2!', '[Pokaż]1 [uszy]2!', '[Show me]1 [your ears]2!', { tags: ['tpr'], pose: 'listen', words: ['zeige', 'ohr'] }),
  p('buuch-rybe', 2, '[Ryb]1 [dr Buuch]2!', '[Reib]1 [den Bauch]2!', '[Pogłaszcz]1 [brzuszek]2!', '[Rub]1 [your tummy]2!', { tags: ['tpr'], pose: 'eat', words: ['buuch'] }),
  p('umarm', 1, '[Ärfel]1 [dr Teddy]2!', '[Umarm]1 [den Teddy]2!', '[Przytul]1 [misia]2!', '[Hug]1 [the teddy]2!', { tags: ['tpr'], pose: 'hug', words: ['umarme', 'teddy'] }),
  p('chlaetter', 2, '[Chlätter]1 [ufe Bärg]2!', '[Kletter]1 [auf den Berg]2!', '[Wespnij się]1 [na górę]2!', '[Climb]1 [up the mountain]2!', { tags: ['tpr'], pose: 'climb', words: ['chlaettere', 'baerg'] }),
  p('zell-mit', 2, '[Zell]1 [mit mir]2!', '[Zähl]1 [mit mir]2!', '[Policz]1 [ze mną]2!', '[Count]1 [with me]2!', { tags: ['tpr'], pose: 'count', words: ['zelle'] }),

  // ---------- Wo isch / Das isch ----------
  p('wo-isch', 1, '[Wo]1 [isch]2 …?', '[Wo]1 [ist]2 …?', '[Gdzie]1 [jest]2 …?', '[Where]1 [is]2 …?', { tags: ['question'] }),
  p('wo-isch-baer', 1, '[Wo]1 [isch]2 [dr Bär]3?', '[Wo]1 [ist]2 [der Bär]3?', '[Gdzie]1 [jest]2 [niedźwiedź]3?', '[Where]1 [is]2 [the bear]3?', { tags: ['question'], words: ['baer'], illu: 'baer' }),
  p('da-isch-er', 1, '[Da]1 [isch]2 [er]3!', '[Da]1 [ist]2 [er]3!', '[Tu]1 [jest]2+3!', '[There]1 [he is]2+3!', { tags: ['question'], illu: 'sparkle' }),
  p('das-isch-chatz', 1, '[Das]1 [isch]2 [d Chatz]3.', '[Das]1 [ist]2 [die Katze]3.', '[To]1 [jest]2 [kot]3.', '[This]1 [is]2 [the cat]3.', { words: ['chatz'], illu: 'chatz' }),
  p('was-isch-das', 2, '[Was]1 [isch]2 [das]3?', '[Was]1 [ist]2 [das]3?', '[Co]1 [to]3 [jest]2?', '[What]1 [is]2 [this]3?', { tags: ['question'], illu: 'sparkle' }),
  p('lueg-mau', 1, '[Lueg mau]1!', '[Schau mal]1!', '[Popatrz]1!', '[Look]1!', { tags: ['question'], illu: 'pose-look' }),
  p('chumm', 1, '[Chumm]1!', '[Komm]1!', '[Chodź]1!', '[Come]1!', { illu: 'pose-wave' }),
  p('no-mau', 1, '[No mau]1!', '[Nochmal]1!', '[Jeszcze raz]1!', '[Again]1!', { tags: ['praise'], illu: 'sparkle' }),
  p('super', 1, '[Super]1!', '[Super]1!', '[Super]1!', '[Great]1!', { tags: ['praise'], illu: 'sticker-star' }),
  p('bravo', 1, '[Bravo]1, [guet gmacht]2!', '[Bravo]1, [gut gemacht]2!', '[Brawo]1, [świetnie]2!', '[Bravo]1, [well done]2!', { tags: ['praise'], illu: 'sticker-star' }),
  p('probier-no-mau', 2, '[Probier]1 [no mau]2!', '[Versuch es]1 [nochmal]2!', '[Spróbuj]1 [jeszcze raz]2!', '[Try]1 [again]2!', { tags: ['praise'], illu: 'sparkle' }),
  p('fertig', 2, '[Mir sy]1 [fertig]2!', '[Wir sind]1 [fertig]2!', '[Skończyliśmy]1+2!', '[We are]1 [finished]2!', { tags: ['chindsgi'], illu: 'sticker-star' }),

  // ---------- home ----------
  p('i-ha-hunger', 1, '[I]1 [ha]2 [Hunger]3.', '[Ich]1 [habe]2 [Hunger]3.', '[Jestem]1+2 [głodny]3.', '[I am]1+2 [hungry]3.', { tags: ['home', 'feelings'], words: ['hungrig'], illu: 'hungrig' }),
  p('i-ha-durscht', 1, '[I]1 [ha]2 [Durscht]3.', '[Ich]1 [habe]2 [Durst]3.', '[Chce mi się]1+2 [pić]3.', '[I am]1+2 [thirsty]3.', { tags: ['home', 'chindsgi'], words: ['duerschtig'], illu: 'duerschtig' }),
  p('i-bi-mueed', 2, '[I]1 [bi]2 [müed]3.', '[Ich]1 [bin]2 [müde]3.', '[Jestem]1+2 [zmęczony]3.', '[I am]1+2 [tired]3.', { tags: ['home', 'feelings'], words: ['mueed'], illu: 'mueed' }),
  p('i-wott-miuch', 1, '[I]1 [wott]2 [Miuch]3.', '[Ich]1 [möchte]2 [Milch]3.', '[Chcę]1+2 [mleka]3.', '[I]1 [want]2 [milk]3.', { tags: ['home'], words: ['miuch'], illu: 'miuch' }),
  p('mami-choche', 2, '[Mami]1 [chochet]2 [Suppe]3.', '[Mama]1 [kocht]2 [Suppe]3.', '[Mama]1 [gotuje]2 [zupę]3.', '[Mum]1 [is cooking]2 [soup]3.', { tags: ['home'], words: ['mami', 'choche', 'suppe'], illu: 'suppe' }),
  p('papi-laest', 2, '[Papi]1 [list]2 [es Buech]3.', '[Papa]1 [liest]2 [ein Buch]3.', '[Tata]1 [czyta]2 [książkę]3.', '[Dad]1 [is reading]2 [a book]3.', { tags: ['home'], words: ['papi', 'laese', 'buech'], illu: 'pose-read' }),
  p('grosi-chunnt', 2, '[Ds Grosi]1 [chunnt]2 [hüt]3.', '[Oma]1 [kommt]2 [heute]3.', '[Babcia]1 [przyjdzie]2 [dziś]3.', '[Grandma]1 [is coming]2 [today]3.', { tags: ['home'], words: ['grosi', 'huet'], illu: 'grosi-baer' }),
  p('zaehn-putze', 2, '[Mir]1 [putze]2 [d Zähn]3.', '[Wir]1 [putzen]2 [die Zähne]3.', '[Myjemy]1+2 [zęby]3.', '[We]1 [brush]2 [our teeth]3.', { tags: ['home'], words: ['putze', 'zahn'], illu: 'zahbuerschte' }),
  p('haend-waesche', 1, '[Händ]1 [wäsche]2!', '[Hände]1 [waschen]2!', '[Myjemy]2 [rączki]1!', '[Wash]2 [your hands]1!', { tags: ['home', 'chindsgi'], words: ['hand', 'waesche'], illu: 'seife' }),
  p('ufruume', 2, '[Mir]1 [ruume]2 [uf]2!', '[Wir]1 [räumen]2 [auf]2!', '[Sprzątamy]1+2!', '[We]1 [tidy up]2!', { tags: ['home', 'chindsgi'], words: ['ufruume'], illu: 'pose-tidy' }),
  p('is-bett', 1, '[Ab]1 [is Bett]2!', '[Ab]1 [ins Bett]2!', '[Hop]1 [do łóżka]2!', '[Off]1 [to bed]2!', { tags: ['home'], words: ['bett'], illu: 'bett' }),
  p('wo-isch-schue', 2, '[Wo]1 [sy]2 [mini Schue]3?', '[Wo]1 [sind]2 [meine Schuhe]3?', '[Gdzie]1 [są]2 [moje buty]3?', '[Where]1 [are]2 [my shoes]3?', { tags: ['home', 'question'], words: ['schue'], illu: 'schue' }),
  p('aalege', 2, '[Mir]1 [lege]2 [d Jagge]3 [a]2.', '[Wir]1 [ziehen]2 [die Jacke]3 [an]2.', '[Zakładamy]1+2 [kurtkę]3.', '[We]1 [put on]2 [our jacket]3.', { tags: ['home'], words: ['jagge'], illu: 'jagge' }),

  // ---------- Chindsgi ----------
  p('i-gange-chindsgi', 2, '[I]1 [gange]2 [id Chindsgi]3.', '[Ich]1 [gehe]2 [in den Kindergarten]3.', '[Idę]1+2 [do przedszkola]3.', '[I]1 [go]2 [to kindergarten]3.', { tags: ['chindsgi'], words: ['chindsgi'], illu: 'chindsgi' }),
  p('darf-i-wc', 2, '[Darf]1 [i]2 [ufs WC]3?', '[Darf]1 [ich]2 [auf die Toilette]3?', '[Czy mogę]1+2 [do toalety]3?', '[May]1 [I]2 [go to the toilet]3?', { tags: ['chindsgi', 'question'], illu: 'tuer' }),
  p('chasch-mer-haeufe', 2, '[Chasch]1 [mer]2 [häufe]3?', '[Kannst]1 [du mir]2 [helfen]3?', '[Możesz]1 [mi]2 [pomóc]3?', '[Can]1 [you]1 [help me]2+3?', { tags: ['chindsgi', 'question'], words: ['haeufe'], illu: 'pose-give' }),
  p('wo-isch-jagge', 2, '[Wo]1 [isch]2 [mini Jagge]3?', '[Wo]1 [ist]2 [meine Jacke]3?', '[Gdzie]1 [jest]2 [moja kurtka]3?', '[Where]1 [is]2 [my jacket]3?', { tags: ['chindsgi', 'question'], words: ['jagge'], illu: 'garderobe' }),
  p('kreis', 2, '[Mir]1 [mache]2 [e Kreis]3.', '[Wir]1 [machen]2 [einen Kreis]3.', '[Robimy]1+2 [kółko]3.', '[We]1 [make]2 [a circle]3.', { tags: ['chindsgi'], words: ['kreis'], illu: 'kreis' }),
  p('znueni', 2, '[Jetz]1 [git s]2 [Znüni]3.', '[Jetzt]1 [gibt es]2 [Znüni]3.', '[Teraz]1 [jest]2 [drugie śniadanie]3.', '[Now]1 [it is]2 [snack time]3.', { tags: ['chindsgi'], words: ['znueni'], illu: 'znueni' }),
  p('mir-spile-dusse', 2, '[Mir]1 [spile]2 [dusse]3.', '[Wir]1 [spielen]2 [draussen]3.', '[Bawimy się]1+2 [na dworze]3.', '[We]1 [play]2 [outside]3.', { tags: ['chindsgi', 'playground'], words: ['spile'], illu: 'spiuplatz' }),
  p('chasch-mitspile', 2, '[Darf]1 [i]2 [mitspile]3?', '[Darf]1 [ich]2 [mitspielen]3?', '[Czy mogę]1+2 [się pobawić]3?', '[Can]1 [I]2 [play too]3?', { tags: ['chindsgi', 'playground', 'question'], words: ['spile'], illu: 'gspaenli' }),
  p('i-mole', 2, '[I]1 [mole]2 [e Sunne]3.', '[Ich]1 [male]2 [eine Sonne]3.', '[Maluję]1+2 [słońce]3.', '[I am]1 [painting]2 [a sun]3.', { tags: ['chindsgi'], words: ['mole', 'sunne'], illu: 'pose-paint' }),
  p('pouse', 2, '[Jetz]1 [isch]2 [Pouse]3.', '[Jetzt]1 [ist]2 [Pause]3.', '[Teraz]1 [jest]2 [przerwa]3.', '[Now]1 [it is]2 [break time]3.', { tags: ['chindsgi'], words: ['pouse'], illu: 'pouse' }),
  p('i-gange-schueu', 3, '[I]1 [gange]2 [id Schueu]3.', '[Ich]1 [gehe]2 [in die Schule]3.', '[Idę]1+2 [do szkoły]3.', '[I]1 [go]2 [to school]3.', { tags: ['chindsgi'], words: ['schueu'], illu: 'schueu' }),
  p('i-cha-zelle', 3, '[I]1 [cha]2 [bis zäh]3 [zelle]4.', '[Ich]1 [kann]2 [bis zehn]3 [zählen]4.', '[Umiem]1+2 [liczyć]4 [do dziesięciu]3.', '[I]1 [can]2 [count]4 [to ten]3.', { tags: ['chindsgi'], words: ['zelle', 'n10'], illu: 'pose-count' }),

  // ---------- shop / market ----------
  p('i-haett-gaern-oepfu', 2, '[I]1 [hätt gärn]2 [drü Öpfu]3.', '[Ich]1 [hätte gern]2 [drei Äpfel]3.', '[Poproszę]1+2 [trzy jabłka]3.', '[I would like]1+2 [three apples]3.', { tags: ['shop'], words: ['n3', 'oepfu'], illu: 'oepfu' }),
  p('was-choschtet', 3, '[Was]1 [choschtet]2 [das]3?', '[Was]1 [kostet]2 [das]3?', '[Ile]1 [to]3 [kosztuje]2?', '[How much]1 [is]2 [this]3?', { tags: ['shop', 'question'], illu: 'maerit' }),
  p('rueebli-sy-orange', 2, '[D Rüebli]1 [sy]2 [orange]3.', '[Die Karotten]1 [sind]2 [orange]3.', '[Marchewki]1 [są]2 [pomarańczowe]3.', '[The carrots]1 [are]2 [orange]3.', { tags: ['shop'], words: ['rueebli', 'orangsch'], illu: 'rueebli' }),
  p('oepfu-isch-rot', 1, '[Dr Öpfu]1 [isch]2 [rot]3.', '[Der Apfel]1 [ist]2 [rot]3.', '[Jabłko]1 [jest]2 [czerwone]3.', '[The apple]1 [is]2 [red]3.', { tags: ['shop'], words: ['oepfu', 'rot'], illu: 'oepfu' }),
  p('banane-gaeub', 1, '[D Banane]1 [isch]2 [gäub]3.', '[Die Banane]1 [ist]2 [gelb]3.', '[Banan]1 [jest]2 [żółty]3.', '[The banana]1 [is]2 [yellow]3.', { tags: ['shop'], words: ['banane', 'gaeub'], illu: 'banane' }),
  p('i-zaehle-oepfu', 2, '[Eis]1, [zwöi]2, [drü]3 [Öpfu]4!', '[Eins]1, [zwei]2, [drei]3 [Äpfel]4!', '[Jedno]1, [dwa]2, [trzy]3 [jabłka]4!', '[One]1, [two]2, [three]3 [apples]4!', { tags: ['shop'], words: ['n1', 'n2', 'n3', 'oepfu'], illu: 'oepfu' }),
  p('i-zahle', 3, '[I]1 [zahle]2 [mit Gäud]3.', '[Ich]1 [bezahle]2 [mit Geld]3.', '[Płacę]1+2 [pieniędzmi]3.', '[I]1 [pay]2 [with money]3.', { tags: ['shop'], illu: 'lade' }),
  p('es-sackli', 3, '[Bruche]1 [Si]2 [es Säckli]3?', '[Brauchen]1 [Sie]2 [eine Tüte]3?', '[Czy potrzebuje Pan/Pani]1+2 [torebki]3?', '[Do you]2 [need]1 [a bag]3?', { tags: ['shop', 'question'], illu: 'basket' }),

  // ---------- bus / city ----------
  p('mir-fahre-bus', 2, '[Mir]1 [fahre]2 [mit em Bus]3.', '[Wir]1 [fahren]2 [mit dem Bus]3.', '[Jedziemy]1+2 [autobusem]3.', '[We]1 [go]2 [by bus]3.', { tags: ['bus'], words: ['fahre', 'bus'], illu: 'bus' }),
  p('uf-bus-warte', 2, '[Mir]1 [warte]2 [uf e Bus]3.', '[Wir]1 [warten]2 [auf den Bus]3.', '[Czekamy]1+2 [na autobus]3.', '[We]1 [are waiting]2 [for the bus]3.', { tags: ['bus'], words: ['bus'], illu: 'haltesteu' }),
  p('drueck-knopf', 3, '[Drück]1 [dr Chnopf]2!', '[Drück]1 [den Knopf]2!', '[Naciśnij]1 [guzik]2!', '[Press]1 [the button]2!', { tags: ['bus'], illu: 'bus' }),
  p('mir-sy-z-bern', 2, '[Mir]1 [sy]2 [z Bärn]3!', '[Wir]1 [sind]2 [in Bern]3!', '[Jesteśmy]1+2 [w Bernie]3!', '[We]1 [are]2 [in Bern]3!', { tags: ['bus'], illu: 'zytglogge' }),
  p('s-tram-chunnt', 2, '[Ds Tram]1 [chunnt]2!', '[Die Strassenbahn]1 [kommt]2!', '[Tramwaj]1 [jedzie]2!', '[The tram]1 [is coming]2!', { tags: ['bus'], words: ['tram'], illu: 'tram' }),
  p('wie-spaet', 3, '[Wie spät]1 [isch]2 [es]3?', '[Wie spät]1 [ist]2 [es]3?', '[Która]1 [jest]2 [godzina]1+3?', '[What time]1 [is]2 [it]3?', { tags: ['question'], words: ['uhr'], illu: 'zytglogge' }),
  p('d-uhr-schlaat', 3, '[D Zytglogge]1 [schlaat]2 [drü]3.', '[Die Zytglogge]1 [schlägt]2 [drei]3.', '[Zytglogge]1 [wybija]2 [trzecią]3.', '[The Zytglogge]1 [strikes]2 [three]3.', { words: ['zytglogge', 'n3'], illu: 'zytglogge' }),

  // ---------- playground ----------
  p('i-rutsche', 2, '[I]1 [rutsche]2 [abe]3!', '[Ich]1 [rutsche]2 [runter]3!', '[Zjeżdżam]1+2 [w dół]3!', '[I]1 [slide]2 [down]3!', { tags: ['playground'], words: ['rutschbahn'], illu: 'rutschbahn' }),
  p('stoss-mi-a', 2, '[Gisch mer]1 [e Schupf]2?', '[Gibst du mir]1 [einen Schubs]2?', '[Popchniesz]1+2 [mnie]1?', '[Can you give me]1 [a push]2?', { tags: ['playground', 'question'], words: ['rytti'], illu: 'rytti' }),
  p('ig-bi-dra', 2, '[Jetz]1 [bi]2 [ig]3 [dra]4!', '[Jetzt]1 [bin]2 [ich]3 [dran]4!', '[Teraz]1 [moja]3 [kolej]2+4!', '[Now]1 [it is]2 [my]3 [turn]4!', { tags: ['playground'], illu: 'rytti' }),
  p('mir-boue-sandburg', 2, '[Mir]1 [boue]2 [e Sandburg]3.', '[Wir]1 [bauen]2 [eine Sandburg]3.', '[Budujemy]1+2 [zamek z piasku]3.', '[We]1 [build]2 [a sandcastle]3.', { tags: ['playground'], words: ['boue', 'sandchaschte'], illu: 'sandcastle' }),
  p('rueer-dr-bau', 1, '[Rüer]1 [dr Bau]2!', '[Wirf]1 [den Ball]2!', '[Rzuć]1 [piłkę]2!', '[Throw]1 [the ball]2!', { tags: ['playground', 'tpr'], words: ['bau'], pose: 'give' }),
  p('obe-unde', 2, '[D Ryti]1 [geit]2 [ufe]3 [u abe]4.', '[Die Schaukel]1 [geht]2 [hoch]3 [und runter]4.', '[Huśtawka]1 [idzie]2 [w górę]3 [i w dół]4.', '[The swing]1 [goes]2 [up]3 [and down]4.', { tags: ['playground'], words: ['rytti', 'obe', 'unde'], illu: 'rytti' }),

  // ---------- nature / seasons / weather ----------
  p('d-sunne-schynt', 1, '[D Sunne]1 [schynt]2.', '[Die Sonne]1 [scheint]2.', '[Słońce]1 [świeci]2.', '[The sun]1 [is shining]2.', { tags: ['season'], words: ['sunne'], illu: 'sunne' }),
  p('es-raegnet', 1, '[Es rägnet]1.', '[Es regnet]1.', '[Pada deszcz]1.', '[It is raining]1.', { tags: ['season'], words: ['raege'], illu: 'raege' }),
  p('es-schneit', 1, '[Es schneit]1!', '[Es schneit]1!', '[Pada śnieg]1!', '[It is snowing]1!', { tags: ['season'], words: ['schnee'], illu: 'schnee' }),
  p('schneema-boue', 2, '[Mir]1 [boue]2 [e Schneema]3.', '[Wir]1 [bauen]2 [einen Schneemann]3.', '[Lepimy]1+2 [bałwana]3.', '[We]1 [build]2 [a snowman]3.', { tags: ['season'], words: ['boue', 'schneema'], illu: 'schneema' }),
  p('d-blaetter-faue', 2, '[D Blätter]1 [faue]2 [abe]3.', '[Die Blätter]1 [fallen]2 [herunter]3.', '[Liście]1 [spadają]2+3.', '[The leaves]1 [are falling]2 [down]3.', { tags: ['season'], words: ['blatt', 'herbscht'], illu: 'herbscht' }),
  p('es-isch-chaut', 2, '[Es isch]1 [chaut]2!', '[Es ist]1 [kalt]2!', '[Jest]1 [zimno]2!', '[It is]1 [cold]2!', { tags: ['season'], words: ['chaut'], illu: 'chaut' }),
  p('es-isch-heiss', 2, '[Es isch]1 [heiss]2!', '[Es ist]1 [heiss]2!', '[Jest]1 [gorąco]2!', '[It is]1 [hot]2!', { tags: ['season'], words: ['heiss'], illu: 'heiss' }),
  p('d-blueme-bluee', 2, '[D Blueme]1 [blüe]2.', '[Die Blumen]1 [blühen]2.', '[Kwiaty]1 [kwitną]2.', '[The flowers]1 [are blooming]2.', { tags: ['season'], words: ['bluem', 'fruehlig'], illu: 'fruehlig' }),
  p('aare-nume-mit', 3, '[Id Aare]1 [nume]2 [mit eme Erwachsnige]3!', '[In die Aare]1 [nur]2 [mit einem Erwachsenen]3!', '[Do Aare]1 [tylko]2 [z dorosłym]3!', '[Into the Aare]1 [only]2 [with a grown-up]3!', { tags: ['season'], words: ['fluss'], illu: 'fluss' }),
  p('vogu-singt', 2, '[Dr Vogu]1 [singt]2 [im Boum]3.', '[Der Vogel]1 [singt]2 [im Baum]3.', '[Ptak]1 [śpiewa]2 [na drzewie]3.', '[The bird]1 [sings]2 [in the tree]3.', { words: ['vogu', 'singe', 'boum'], illu: 'vogu' }),
  p('chatz-schlaft', 1, '[D Chatz]1 [schlaft]2.', '[Die Katze]1 [schläft]2.', '[Kot]1 [śpi]2.', '[The cat]1 [is sleeping]2.', { words: ['chatz', 'schlafe'], illu: 'chatz' }),
  p('hund-springt', 2, '[Dr Hund]1 [springt]2 [schnäu]3.', '[Der Hund]1 [rennt]2 [schnell]3.', '[Pies]1 [biegnie]2 [szybko]3.', '[The dog]1 [runs]2 [fast]3.', { words: ['hund', 'springe', 'schnaeu'], illu: 'hund' }),
  p('baer-im-baerepark', 2, '[D Bäre]1 [wohne]2 [im Bärepark]3.', '[Die Bären]1 [wohnen]2 [im Bärenpark]3.', '[Niedźwiedzie]1 [mieszkają]2 [w parku niedźwiedzi]3.', '[The bears]1 [live]2 [in the bear park]3.', { words: ['baer'], illu: 'baer' }),
  p('uf-em-gurte', 3, '[Uf em Gurte]1 [mache]2 [mir]3 [es Picknick]4.', '[Auf dem Gurten]1 [machen]2 [wir]3 [ein Picknick]4.', '[Na Gurten]1 [robimy]2+3 [piknik]4.', '[On the Gurten]1 [we]3 [have]2 [a picnic]4.', { illu: 'picnic-blanket' }),
  p('i-gseh-steibock', 3, '[I]1 [gseh]2 [e Steibock]3!', '[Ich]1 [sehe]2 [einen Steinbock]3!', '[Widzę]1+2 [koziorożca]3!', '[I]1 [see]2 [an ibex]3!', { words: ['steibock'], illu: 'steibock' }),

  // ---------- feelings ----------
  p('i-bi-froehlech', 2, '[I]1 [bi]2 [fröhlech]3.', '[Ich]1 [bin]2 [fröhlich]3.', '[Jestem]1+2 [wesoły]3.', '[I am]1+2 [happy]3.', { tags: ['feelings'], words: ['froehlech'], illu: 'froehlech' }),
  p('i-bi-truurig', 2, '[I]1 [bi]2 [truurig]3.', '[Ich]1 [bin]2 [traurig]3.', '[Jestem]1+2 [smutny]3.', '[I am]1+2 [sad]3.', { tags: ['feelings'], words: ['truurig'], illu: 'truurig' }),
  p('troeschte', 2, '[Chumm]1, [i]2 [tröschte]3 [di]4.', '[Komm]1, [ich]2 [tröste]3 [dich]4.', '[Chodź]1, [pocieszę]2+3 [cię]4.', '[Come]1, [I]2 [will comfort]3 [you]4.', { tags: ['feelings'], words: ['umarme'], illu: 'pose-hug' }),

  // ---------- seasons & holidays ----------
  p('samichlous-chunnt', 2, '[Dr Samichlous]1 [chunnt]2!', '[Der Nikolaus]1 [kommt]2!', '[Mikołaj]1 [przychodzi]2!', '[Saint Nicholas]1 [is coming]2!', { tags: ['season'], words: ['samichlous'], illu: 'samichlous' }),
  p('es-vaersli', 3, '[I]1 [säge]2 [es Värsli]3.', '[Ich]1 [sage]2 [ein Gedicht auf]3.', '[Mówię]1+2 [wierszyk]3.', '[I]1 [say]2 [a little poem]3.', { tags: ['season'], illu: 'samichlous' }),
  p('froehlechi-wiehnachte', 2, '[Schöni]1 [Wienachte]2!', '[Frohe]1 [Weihnachten]2!', '[Wesołych]1 [Świąt]2!', '[Merry]1 [Christmas]2!', { tags: ['season'], words: ['wiehnachtsboum'], illu: 'wiehnachtsboum' }),
  p('schoeni-oschtere', 2, '[Schöni]1 [Oschtere]2!', '[Frohe]1 [Ostern]2!', '[Wesołych]1 [Świąt Wielkanocnych]2!', '[Happy]1 [Easter]2!', { tags: ['season'], words: ['oschterei'], illu: 'oschterhaas' }),
  p('aes-gschaenk', 1, '[Es Gschänk]1 [für di]2!', '[Ein Geschenk]1 [für dich]2!', '[Prezent]1 [dla ciebie]2!', '[A present]1 [for you]2!', { tags: ['season'], words: ['gschaenk'], illu: 'gschaenk' }),
  p('aes-isch-geburi', 2, '[Hüt]1 [isch]2 [mi Geburtstag]3!', '[Heute]1 [ist]2 [mein Geburtstag]3!', '[Dziś]1 [są]2 [moje urodziny]3!', '[Today]1 [is]2 [my birthday]3!', { tags: ['season'], words: ['huet', 'geburtstag'], illu: 'geburtstag' }),
  p('erschte-august', 3, '[Am erschte August]1 [hei]2 [mir]3 [Lampion]4.', '[Am ersten August]1 [haben]2 [wir]3 [Lampions]4.', '[Pierwszego sierpnia]1 [mamy]2+3 [lampiony]4.', '[On the first of August]1 [we]3 [have]2 [lanterns]4.', { tags: ['season'], words: ['lampion'], illu: 'lampion' }),
  p('zibelemaerit-phrase', 3, '[Am Zibelemärit]1 [git s]2 [viu Zibele]3.', '[Am Zwiebelmarkt]1 [gibt es]2 [viele Zwiebeln]3.', '[Na targu cebulowym]1 [jest]2 [dużo cebuli]3.', '[At the onion market]1 [there are]2 [lots of onions]3.', { tags: ['season'], words: ['zibelemaerit', 'zibele'], illu: 'zibelemaerit' }),

  // ---------- end ritual ----------
  p('tatzli-geit-go-schlafe', 1, '[Tatzli]1 [geit]2 [go schlafe]3.', '[Tatzli]1 [geht]2 [schlafen]3.', '[Tatzli]1 [idzie]2 [spać]3.', '[Tatzli]1 [is going]2 [to sleep]3.', { words: ['schlafe'], illu: 'sleeping-tatzli' }),
  p('bis-morn', 1, '[Bis]1 [morn]2!', '[Bis]1 [morgen]2!', '[Do]1 [jutra]2!', '[See you]1 [tomorrow]2!', { tags: ['greeting'], words: ['morn'], illu: 'pose-wave' }),
]

export const PHRASE_BY_ID: Record<string, Phrase> = Object.fromEntries(PHRASES.map((x) => [x.id, x]))
