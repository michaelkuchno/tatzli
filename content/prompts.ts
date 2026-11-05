import type { L4 } from './types'

/** Short spoken prompts used by the games (also pronounced in all four languages). */
export const UI_PROMPTS: { id: string; text: L4 }[] = [
  { id: 'where', text: { be: 'Wo isch …?', de: 'Wo ist …?', pl: 'Gdzie jest …?', en: 'Where is …?' } },
  { id: 'yes', text: { be: 'Jaa, genau!', de: 'Ja, genau!', pl: 'Tak, właśnie!', en: 'Yes, that’s it!' } },
  { id: 'super', text: { be: 'Super gmacht!', de: 'Super gemacht!', pl: 'Super!', en: 'Well done!' } },
  { id: 'look-here', text: { be: 'Lueg, da isch es!', de: 'Schau, da ist es!', pl: 'Popatrz, tutaj!', en: 'Look, here it is!' } },
  { id: 'try-again', text: { be: 'Fasch! Probier no mau.', de: 'Fast! Versuch es nochmal.', pl: 'Prawie! Spróbuj jeszcze raz.', en: 'Almost! Try again.' } },
  { id: 'count', text: { be: 'Mir zelle zäme!', de: 'Wir zählen zusammen!', pl: 'Liczymy razem!', en: 'Let’s count together!' } },
  { id: 'put-in', text: { be: 'Tue se i Chorb!', de: 'Leg sie in den Korb!', pl: 'Włóż do koszyka!', en: 'Put them in the basket!' } },
  { id: 'find-pair', text: { be: 'Fing ds Paar!', de: 'Finde das Paar!', pl: 'Znajdź parę!', en: 'Find the pair!' } },
  { id: 'sort', text: { be: 'Wo ghört das hi?', de: 'Wohin gehört das?', pl: 'Gdzie to pasuje?', en: 'Where does it go?' } },
  { id: 'do-it', text: { be: 'Mach mit!', de: 'Mach mit!', pl: 'Zrób to ze mną!', en: 'Do it with me!' } },
  { id: 'your-turn', text: { be: 'Jetz du!', de: 'Jetzt du!', pl: 'Teraz ty!', en: 'Now you!' } },
  { id: 'listen', text: { be: 'Los mau!', de: 'Hör mal!', pl: 'Posłuchaj!', en: 'Listen!' } },
  { id: 'sticker', text: { be: 'Es Chläberli für di!', de: 'Ein Sticker für dich!', pl: 'Naklejka dla ciebie!', en: 'A sticker for you!' } },
  { id: 'bye', text: { be: 'Tatzli geit go schlafe. Gueti Nacht!', de: 'Tatzli geht schlafen. Gute Nacht!', pl: 'Tatzli idzie spać. Dobranoc!', en: 'Tatzli is going to sleep. Good night!' } },
  { id: 'hello', text: { be: 'Sali! I bi dr Tatzli.', de: 'Hallo! Ich bin Tatzli.', pl: 'Cześć! Jestem Tatzli.', en: 'Hello! I am Tatzli.' } },
  { id: 'what-next', text: { be: 'Was wei mir mache?', de: 'Was wollen wir machen?', pl: 'Co robimy?', en: 'What shall we do?' } },
  { id: 'how-many', text: { be: 'Wie viu sy s?', de: 'Wie viele sind es?', pl: 'Ile ich jest?', en: 'How many are there?' } },
  { id: 'what-happens', text: { be: 'Was passiert jetz?', de: 'Was passiert jetzt?', pl: 'Co się teraz stanie?', en: 'What happens now?' } },
]
